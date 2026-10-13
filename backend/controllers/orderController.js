const Order = require('../models/orderModel');
const Listing = require('../models/listingModel');
const User = require('../models/userModel');
const { createNotification } = require('../services/notificationService');
const { recordImpact } = require('../services/marketplaceService');

/**
 * Orders + escrow lifecycle — ported from MarketX-backend
 * `orders/orders.service.ts` and `escrow/escrow.service.ts`:
 *
 *   pay        → escrow held (paymentStatus=paid, escrow.status=held)
 *   ship       → seller ships (tracking number)
 *   deliver    → buyer confirms → escrow RELEASED to seller wallet,
 *                impact stats recorded for the seller
 *   cancel     → escrow refunded, inventory restored
 */

// GET /api/orders?role=buyer|seller&status=paid&page=1
const getMyOrders = async (req, res) => {
  try {
    const { role = 'buyer', status } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const filter = { [role === 'seller' ? 'seller' : 'buyer']: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(role === 'seller' ? 'buyer' : 'seller', 'name profileImage state')
        .populate('listing', 'title images saleType'),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders.', error: error.message });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name profileImage email state')
      .populate('seller', 'name profileImage email state')
      .populate('listing', 'title images category saleType');

    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (![order.buyer._id.toString(), order.seller._id.toString()].includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order.', error: error.message });
  }
};

// POST /api/orders/:id/pay — buyer pays → escrow held
const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.buyer.toString() !== req.user.id) return res.status(403).json({ message: 'Only the buyer can pay.' });
    if (order.status !== 'pending') return res.status(400).json({ message: `Order is already ${order.status}.` });

    order.status = 'paid';
    order.paymentStatus = 'paid';
    order.escrow = {
      status: 'held',
      heldAt: new Date(),
      releasedAt: null,
      reference: req.body.paymentReference || `manual-${Date.now()}`,
    };
    order.timeline.push({ status: 'paid', note: 'Payment received — held in escrow', by: req.user.id });

    await order.save();
    await createNotification(order.seller, 'order', 'Payment in escrow 💰', `Buyer paid for "${order.itemSnapshot.title}". Ship to release funds.`, { orderId: order._id });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment.', error: error.message });
  }
};

// POST /api/orders/:id/ship — seller ships
const shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.seller.toString() !== req.user.id) return res.status(403).json({ message: 'Only the seller can ship.' });
    if (order.status !== 'paid') return res.status(400).json({ message: `Order is ${order.status}; must be paid first.` });

    order.status = 'shipped';
    order.trackingNumber = req.body.trackingNumber || null;
    order.timeline.push({ status: 'shipped', note: 'Item shipped', by: req.user.id });

    await order.save();
    await createNotification(order.buyer, 'order', 'Order shipped 🚚', `Your order "${order.itemSnapshot.title}" is on its way.`, { orderId: order._id });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error shipping order.', error: error.message });
  }
};

// POST /api/orders/:id/deliver — buyer confirms → escrow released to seller
const confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.buyer.toString() !== req.user.id) return res.status(403).json({ message: 'Only the buyer can confirm delivery.' });
    if (!['shipped', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: `Order is ${order.status}; cannot confirm delivery.` });
    }

    order.status = 'completed';
    order.escrow.status = 'released';
    order.escrow.releasedAt = new Date();
    order.timeline.push({ status: 'completed', note: 'Delivered — escrow released to seller', by: req.user.id });

    await order.save();

    // Credit seller wallet + record seller impact (escrow release, MarketX wallet pattern)
    const weight = (order.itemSnapshot.weightKg || 0) * order.quantity;
    await User.findByIdAndUpdate(order.seller, { $inc: { walletBalance: order.totalAmount } });
    await recordImpact(order.seller, order.itemSnapshot.category, weight, order.quantity);

    await createNotification(order.seller, 'sale', 'Escrow released 🎉', `₦${order.totalAmount.toLocaleString()} from "${order.itemSnapshot.title}" was added to your wallet.`, { orderId: order._id, amount: order.totalAmount });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error confirming delivery.', error: error.message });
  }
};

// POST /api/orders/:id/cancel — buyer (pending) or seller (paid) → refund
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const isBuyer = order.buyer.toString() === req.user.id;
    const isSeller = order.seller.toString() === req.user.id;
    if (!isBuyer && !isSeller) return res.status(403).json({ message: 'Not authorized.' });

    if (isBuyer && order.status !== 'pending') {
      return res.status(400).json({ message: 'Buyers can only cancel before payment.' });
    }
    if (isSeller && !['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: 'Sellers can only cancel before shipping.' });
    }

    order.status = 'cancelled';
    order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'unpaid';
    if (order.escrow.status === 'held') order.escrow.status = 'refunded';
    order.cancellationReason = req.body.reason || '';
    order.timeline.push({ status: 'cancelled', note: req.body.reason || 'Order cancelled', by: req.user.id });

    await order.save();

    // Restore inventory
    const listing = await Listing.findById(order.listing);
    if (listing && ['active', 'sold'].includes(listing.status)) {
      listing.available += order.quantity;
      if (listing.status === 'sold' && listing.available > 0) listing.status = 'active';
      await listing.save();
    }

    const other = isBuyer ? order.seller : order.buyer;
    await createNotification(other, 'order', 'Order cancelled', `"${order.itemSnapshot.title}" was cancelled.`, { orderId: order._id });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order.', error: error.message });
  }
};

module.exports = { getMyOrders, getOrder, payOrder, shipOrder, confirmDelivery, cancelOrder };
