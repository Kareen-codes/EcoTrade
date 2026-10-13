const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  markAllRead,
  markRead,
} = require('../controllers/notificationReviewController');

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyNotifications);
router.post('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
