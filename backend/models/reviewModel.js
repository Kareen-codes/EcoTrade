const mongoose = require('mongoose');

/**
 * Reviews — ported from MarketX-backend `review/` module.
 * One review per completed order; updates the listing's aggregate rating.
 */
const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

// A buyer can review a given order only once
reviewSchema.index({ order: 1 }, { unique: true });
reviewSchema.index({ seller: 1, createdAt: -1 });
reviewSchema.index({ listing: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
