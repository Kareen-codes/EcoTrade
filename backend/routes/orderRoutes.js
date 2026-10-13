const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMyOrders,
  getOrder,
  payOrder,
  shipOrder,
  confirmDelivery,
  cancelOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyOrders);
router.get('/:id', getOrder);

// Escrow lifecycle
router.post('/:id/pay', payOrder);
router.post('/:id/ship', shipOrder);
router.post('/:id/deliver', confirmDelivery);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
