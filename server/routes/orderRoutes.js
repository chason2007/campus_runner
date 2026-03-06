const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes below
router.use(authMiddleware.protect);

router.post('/', authMiddleware.restrictTo('Buyer'), orderController.createOrder);
router.get('/available', authMiddleware.restrictTo('Runner'), orderController.getAvailableOrders);

router.patch('/:id/accept', authMiddleware.restrictTo('Runner'), orderController.acceptOrder);
router.patch('/:id/complete', authMiddleware.restrictTo('Runner'), orderController.completeOrder);

router.get('/my-orders', orderController.getMyOrders);

module.exports = router;
