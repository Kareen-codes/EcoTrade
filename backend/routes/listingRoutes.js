const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  buyNow,
  placeBid,
  closeAuction,
  toggleFavorite,
  getMyFavorites,
} = require('../controllers/listingController');

const router = express.Router();

// Public reads
router.get('/', getListings);
router.get('/favorites', verifyToken, getMyFavorites);
router.get('/:id', getListing);

// Authenticated writes
router.post('/', verifyToken, createListing);
router.put('/:id', verifyToken, updateListing);
router.delete('/:id', verifyToken, deleteListing);
router.post('/:id/buy', verifyToken, buyNow);
router.post('/:id/bid', verifyToken, placeBid);
router.post('/:id/close-auction', verifyToken, closeAuction);
router.post('/:id/favorite', verifyToken, toggleFavorite);

module.exports = router;
