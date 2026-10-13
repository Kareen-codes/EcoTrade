const Dispute = require('../models/disputeModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const { createNotification } = require('../services/notificationService');

/**
 * Disputes — ported from MarketX-backend `dispute/disputes.service.ts`.
 * Buyer or seller raises a dispute on a paid/shipped order; an admin
 * resolves it with REFUND_TO_BUYER or RELEASE_TO_SELLER, which moves the
 * embedded escrow state and notifies both parties.
 */

// POST /api/disputes — raise a dispute on an order
const raiseDispute = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason?.trim()) {
      return res.status(400).json({ message: 'orderId and reason are required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const isBuyer = order.buyer.toString() === req.user.id;
    const isSeller = order.seller.toString() === req.user.id;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Only the buyer or seller can raise a dispute.' });
    }
    if (!['paid', 'shipped'].includes(order.status)) {
      return res.status(400).json({ message: 'Disputes can only be raised on paid or shipped orders.' });
    }

    const existing = await Dispute.findOne({ order: order._id });
    if (existing) return res.status(409).json({ message: 'A dispute already exists for this order.' });

    const dispute = await Dispute.create({ order: order._id, raisedBy: req.user.id, reason: reason.trim() });

    // Notify the counterparty
    const counterparty = isBuyer ? order.seller : order.buyer;
    await createNotification(counterparty, 'order', 'Dispute opened ⚠️', `A dispute was raised on "${order.itemSnapshot.title}".`, { orderId: order._id, disputeId: dispute._id });

    res.status(201).json(dispute);
  } catch (error) {
    res.status(500).json({ message: 'Error raising dispute.', error: error.message });
  }
};

// GET /api/disputes/mine — disputes on orders I'm part of
const getMyDisputes = async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ buyer: req.user.id }, { seller: req.user.id }] }).select('_id');
    const disputes = await Dispute.find({ order: { $in: orders.map((o) => o._id) } })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber itemSnapshot totalAmount status')
      .populate('raisedBy', 'name');
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disputes.', error: error.message });
  }
};

// PATCH /api/disputes/:id/resolve — admin only (MarketX resolution actions)
const resolveDispute = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can resolve disputes.' });
    }
    const { resolutionAction, resolution } = req.body;
    if (!['REFUND_TO_BUYER', 'RELEASE_TO_SELLER'].includes(resolutionAction)) {
      return res.status(400).json({ message: "resolutionAction must be REFUND_TO_BUYER or RELEASE_TO_SELLER." });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found.' });
    if (dispute.status === 'RESOLVED') return res.status(400).json({ message: 'Dispute already resolved.' });

    const order = await Order.findById(dispute.order);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    dispute.status = 'RESOLVED';
    dispute.resolution = resolution || resolutionAction;
    dispute.resolutionAction = resolutionAction;

    if (resolutionAction === 'RELEASE_TO_SELLER') {
      order.status = 'completed';
      order.escrow.status = 'released';
      order.escrow.releasedAt = new Date();
      order.timeline.push({ status: 'completed', note: 'Dispute resolved — escrow released to seller', by: req.user.id });
      await User.findByIdAndUpdate(order.seller, { $inc: { walletBalance: order.totalAmount } });
      await createNotification(order.seller, 'sale', 'Dispute resolved in your favor ⚖️', `₦${order.totalAmount.toLocaleString()} from "${order.itemSnapshot.title}" was released to your wallet.`, { orderId: order._id });
      await createNotification(order.buyer, 'order', 'Dispute resolved', `The dispute on "${order.itemSnapshot.title}" was resolved: funds released to the seller.`, { orderId: order._id });
    } else {
      order.status = 'refunded';
      order.paymentStatus = 'refunded';
      order.escrow.status = 'refunded';
      order.timeline.push({ status: 'refunded', note: 'Dispute resolved — buyer refunded', by: req.user.id });
      // Restore inventory for the buyer's refund
      const listing = await require('../models/listingModel').findById(order.listing);
      if (listing && ['active', 'sold'].includes(listing.status)) {
        listing.available += order.quantity;
        if (listing.status === 'sold' && listing.available > 0) listing.status = 'active';
        await listing.save();
      }
      await createNotification(order.buyer, 'order', 'Refund issued 💸', `Your payment for "${order.itemSnapshot.title}" was refunded.`, { orderId: order._id });
      await createNotification(order.seller, 'order', 'Dispute resolved', `The dispute on "${order.itemSnapshot.title}" was resolved: buyer refunded.`, { orderId: order._id });
    }

    await order.save();
    await dispute.save();
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving dispute.', error: error.message });
  }
};

module.exports = { raiseDispute, getMyDisputes, resolveDispute };
