const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { raiseDispute, getMyDisputes, resolveDispute } = require('../controllers/disputeController');

const router = express.Router();

router.use(verifyToken);

router.post('/', raiseDispute);
router.get('/mine', getMyDisputes);
router.patch('/:id/resolve', resolveDispute);

module.exports = router;
