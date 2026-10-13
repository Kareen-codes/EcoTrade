const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getMyImpact } = require('../controllers/feedImpactController');

const router = express.Router();

router.get('/me', verifyToken, getMyImpact);

module.exports = router;
