const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getFeed,
  createPost,
  toggleLike,
  toggleBookmark,
  addComment,
  deletePost,
} = require('../controllers/feedImpactController');

const router = express.Router();

// Public read
router.get('/', getFeed);

// Authenticated writes
router.post('/', verifyToken, createPost);
router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/bookmark', verifyToken, toggleBookmark);
router.post('/:id/comments', verifyToken, addComment);
router.delete('/:id', verifyToken, deletePost);

module.exports = router;
