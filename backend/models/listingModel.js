const mongoose = require('mongoose');

/**
 * EcoMate marketplace listing — covers BOTH the Recycling Marketplace
 * (materials) and the Art Gallery (upcycled artwork).
 *
 * Domain logic ported from MarketX-backend `products/product.entity.ts`
 * (Kareen-codes/MarketX-backend): status/condition enums, available vs
 * quantity, favoritesCount, averageRating — adapted to MongoDB and the
 * Nigeria market (NGN). Auction fields follow the MarketX bidding model
 * and this repo's existing auctionModel.
 */
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 'material' → Recycling Marketplace · 'artwork' → Art Gallery
    type: { type: String, enum: ['material', 'artwork'], default: 'material' },

    category: {
      type: String,
      enum: ['plastic', 'metal', 'e-waste', 'glass', 'rubber', 'paper', 'furniture', 'artwork', 'other'],
      required: true,
      index: true,
    },

    // 'fixed' → buy now · 'auction' → competitive bidding (Art Gallery live auctions)
    saleType: { type: String, enum: ['fixed', 'auction'], default: 'fixed' },

    // Fixed price, or opening bid when saleType === 'auction'
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NGN' },

    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      default: 'good',
    },

    quantity: { type: Number, default: 1, min: 0 },
    available: { type: Number, default: 1, min: 0 },

    // Drives the Impact Dashboard (weight recycled → CO₂ saved)
    weightKg: { type: Number, default: 0, min: 0 },

    images: [{ type: String }],
    tags: [{ type: String }],
    location: { type: String, default: '' }, // Nigerian state / city

    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'closed', 'cancelled'],
      default: 'active',
      index: true,
    },

    // ---- Auction state (saleType === 'auction') ----
    auctionEndsAt: { type: Date, default: null },
    currentBid: { type: Number, default: 0, min: 0 },
    currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bids: [
      {
        bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // ---- MarketX counters ----
    views: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ seller: 1, createdAt: -1 });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text', 'tags': 'text' });

/** MarketX "computed property" equivalent. */
listingSchema.virtual('isAvailable').get(function () {
  return this.status === 'active' && this.available > 0;
});

listingSchema.set('toJSON', { virtuals: true });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
