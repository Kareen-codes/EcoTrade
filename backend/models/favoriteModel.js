const mongoose = require('mongoose');

/**
 * Favorites — ported from MarketX-backend `favorites/` module.
 * One row per (user, listing); keeps Listing.favoritesCount in sync.
 */
const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, listing: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
