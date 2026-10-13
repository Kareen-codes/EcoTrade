const mongoose = require('mongoose');

/**
 * In-app notifications — ported from MarketX-backend
 * `notifications/` module: per-user inbox, typed events, read tracking.
 * EcoMate event types cover bids, orders, messages, challenges, reviews.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['bid', 'order', 'sale', 'message', 'challenge', 'review', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    // Flexible payload: { orderId, listingId, challengeId, amount, ... }
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
