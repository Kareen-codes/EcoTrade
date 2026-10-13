const FeedPost = require('../models/feedPostModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

/**
 * Community Feed + Impact Dashboard — EcoMate-specific modules.
 * Feed rule enforced here: you cannot like or bookmark your own post.
 */

// ---- Feed ----

// GET /api/feed?page=1&limit=10&tag=zerowaste
const getFeed = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const filter = { status: 'active' };
    if (req.query.tag) filter.tags = req.query.tag;

    const [posts, total] = await Promise.all([
      FeedPost.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name profileImage impact'),
      FeedPost.countDocuments(filter),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed.', error: error.message });
  }
};

// POST /api/feed
const createPost = async (req, res) => {
  try {
    const { text, images, tags, listingRef, challengeRef } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Post text is required.' });

    const post = await FeedPost.create({
      author: req.user.id,
      text: text.trim(),
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags : [],
      listingRef: listingRef || null,
      challengeRef: challengeRef || null,
    });

    const populated = await post.populate('author', 'name profileImage impact');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post.', error: error.message });
  }
};

// POST /api/feed/:id/like — toggle; cannot like your own post
const toggleLike = async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post || post.status !== 'active') return res.status(404).json({ message: 'Post not found.' });
    if (post.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot like your own post.' });
    }

    const liked = post.likes.some((u) => u.toString() === req.user.id);
    if (liked) {
      post.likes.pull(req.user.id);
      post.likeCount = Math.max(post.likeCount - 1, 0);
    } else {
      post.likes.push(req.user.id);
      post.likeCount += 1;
    }
    await post.save();
    res.json({ liked: !liked, likeCount: post.likeCount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating like.', error: error.message });
  }
};

// POST /api/feed/:id/bookmark — toggle; cannot save your own post
const toggleBookmark = async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post || post.status !== 'active') return res.status(404).json({ message: 'Post not found.' });
    if (post.author.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot save your own post.' });
    }

    const saved = post.bookmarks.some((u) => u.toString() === req.user.id);
    if (saved) {
      post.bookmarks.pull(req.user.id);
      post.bookmarkCount = Math.max(post.bookmarkCount - 1, 0);
    } else {
      post.bookmarks.push(req.user.id);
      post.bookmarkCount += 1;
    }
    await post.save();
    res.json({ bookmarked: !saved, bookmarkCount: post.bookmarkCount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bookmark.', error: error.message });
  }
};

// POST /api/feed/:id/comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text is required.' });

    const post = await FeedPost.findById(req.params.id);
    if (!post || post.status !== 'active') return res.status(404).json({ message: 'Post not found.' });

    post.comments.push({ author: req.user.id, text: text.trim() });
    post.commentCount += 1;
    await post.save();

    const comment = post.comments[post.comments.length - 1];
    await comment.populate('author', 'name profileImage');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment.', error: error.message });
  }
};

// DELETE /api/feed/:id — author or admin; soft delete
const deletePost = async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    post.status = 'deleted';
    await post.save();
    res.json({ message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post.', error: error.message });
  }
};

// ---- Impact Dashboard ----

// GET /api/impact/me — live stats + community rank percentile
const getMyImpact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name walletBalance impact badges');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Community rank: percentile by total weight recycled
    const rank = await User.aggregate([
      { $group: { _id: '$_id', total: { $sum: '$impact.totalWeightKg' } } },
      { $sort: { total: -1 } },
    ]);
    let rankPercentile = 100;
    const myIndex = rank.findIndex((r) => r._id.toString() === req.user.id);
    if (myIndex >= 0 && rank.length > 1) {
      rankPercentile = Math.round((myIndex / rank.length) * 100);
      await User.findByIdAndUpdate(req.user.id, { 'impact.rankPercentile': 100 - rankPercentile });
    }

    // Earnings: completed sales + current wallet
    const completedSales = await Order.aggregate([
      { $match: { seller: user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      stats: {
        itemsRecycled: user.impact.itemsRecycled,
        totalWeightKg: user.impact.totalWeightKg,
        co2SavedKg: user.impact.co2SavedKg,
      },
      earnings: {
        walletBalance: user.walletBalance,
        lifetimeEarnings: completedSales[0]?.total || 0,
        completedSales: completedSales[0]?.count || 0,
      },
      community: {
        rankPercentile: 100 - rankPercentile,
        totalUsers: rank.length,
      },
      badges: user.badges,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing impact.', error: error.message });
  }
};

module.exports = {
  getFeed,
  createPost,
  toggleLike,
  toggleBookmark,
  addComment,
  deletePost,
  getMyImpact,
};
