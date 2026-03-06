const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Protect all routes below
router.use(authMiddleware.protect);

router.post('/', upload.single('file'), orderController.createOrder);
router.get('/available', orderController.getAvailableOrders);

router.patch('/:id/accept', orderController.acceptOrder);
router.patch('/:id/complete', orderController.completeOrder);

router.get('/my-requests', orderController.getMyRequests);
router.get('/my-deliveries', orderController.getMyDeliveries);

module.exports = router;
