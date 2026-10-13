const mongoose = require('mongoose');

/**
 * Community Feed — social posts about recycling moments, challenges and
 * listings. Likes/bookmarks/comments with the EcoMate rule: you cannot
 * like or save your own post (enforced in the controller).
 */
const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const feedPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    text: { type: String, required: true, trim: true },
    images: [{ type: String }],
    tags: [{ type: String }],

    // Optional cross-links to other EcoMate entities
    listingRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
    challengeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', default: null },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],

    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },

    status: { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' },
  },
  { timestamps: true }
);

feedPostSchema.index({ status: 1, createdAt: -1 });
feedPostSchema.index({ author: 1, createdAt: -1 });

const FeedPost = mongoose.model('FeedPost', feedPostSchema);
module.exports = FeedPost;
