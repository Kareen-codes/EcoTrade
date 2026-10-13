const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createReview,
  getSellerReviews,
  getListingReviews,
} = require('../controllers/notificationReviewController');

const router = express.Router();

// Public reads
router.get('/seller/:sellerId', getSellerReviews);
router.get('/listing/:listingId', getListingReviews);

// Authenticated write
router.post('/', verifyToken, createReview);

module.exports = router;
