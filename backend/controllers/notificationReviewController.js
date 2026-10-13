const Notification = require('../models/notificationModel');
const Review = require('../models/reviewModel');
const Listing = require('../models/listingModel');
const Order = require('../models/orderModel');
const { createNotification } = require('../services/notificationService');

/**
 * Notifications inbox + Reviews — ported from MarketX-backend
 * `notifications/` and `review/` modules.
 */

// ---- Notifications ----

// GET /api/notifications?unreadOnly=true
const getMyNotifications = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.unreadOnly === 'true') filter.read = false;

    const [items, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);
    res.json({ items, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications.', error: error.message });
  }
};

// POST /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications.', error: error.message });
  }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification.', error: error.message });
  }
};

// ---- Reviews ----

// POST /api/reviews — only the buyer of a completed order can review
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || !rating) {
      return res.status(400).json({ message: 'orderId and rating are required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the buyer can review this order.' });
    }
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'You can review once the order is completed.' });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      seller: order.seller,
      listing: order.listing,
      order: order._id,
      rating: Math.min(Math.max(Number(rating), 1), 5),
      comment: comment || '',
    });

    // Recompute listing aggregate rating (MarketX averageRating pattern)
    const stats = await Review.aggregate([
      { $match: { listing: order.listing } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Listing.findByIdAndUpdate(order.listing, {
        averageRating: Number(stats[0].avg.toFixed(2)),
        totalReviews: stats[0].count,
      });
    }

    await createNotification(order.seller, 'review', 'New review ⭐', `You received a ${review.rating}-star review.`, { listingId: order.listing, rating: review.rating });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already reviewed this order.' });
    }
    res.status(500).json({ message: 'Error creating review.', error: error.message });
  }
};

// GET /api/reviews/seller/:sellerId
const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('reviewer', 'name profileImage')
      .populate('listing', 'title images');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews.', error: error.message });
  }
};

// GET /api/reviews/listing/:listingId
const getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('reviewer', 'name profileImage');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews.', error: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAllRead,
  markRead,
  createReview,
  getSellerReviews,
  getListingReviews,
};
