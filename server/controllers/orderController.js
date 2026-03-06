const Order = require('../models/Order');
const User = require('../models/User');

// Create a new order (Buyers only)
exports.createOrder = async (req, res) => {
    try {
        const newOrder = await Order.create({
            ...req.body,
            buyerId: req.user._id // from protect middleware
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', newOrder); // Alert all runners
        }

        res.status(201).json({
            status: 'success',
            data: { order: newOrder }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Get all available pending orders (Runners only)
exports.getAvailableOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Pending' })
            .populate('buyerId', 'name email');

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Accept an order (Runners only)
exports.acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ status: 'fail', message: 'Order is no longer available' });
        }

        order.status = 'Accepted';
        order.runnerId = req.user._id;
        await order.save();

        const io = req.app.get('io');
        if (io) {
            io.to(order.buyerId.toString()).emit('order_update', {
                message: 'Your order was accepted by a runner!',
                order
            });
        }

        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Complete an order (Runners only)
exports.completeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ status: 'fail', message: 'Order not found' });
        }

        if (order.status !== 'Accepted') {
            return res.status(400).json({ status: 'fail', message: 'Order cannot be completed from current status' });
        }

        // Verify it's the correct runner
        if (order.runnerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You are not the assigned runner for this order' });
        }

        order.status = 'Delivered';
        await order.save();

        // Balance transfer
        // 1) Find Buyer and Runner
        const buyer = await User.findById(order.buyerId);
        const runner = await User.findById(req.user._id);

        // 2) Deduct/Add balances (in reality, stripe/payment processor is used. Here we just update numbers)
        // Assuming buyers preload balance or we allow negative balances for MVP
        buyer.balance -= order.deliveryFee;
        runner.balance += order.deliveryFee;

        await buyer.save({ validateBeforeSave: false });
        await runner.save({ validateBeforeSave: false });

        const io = req.app.get('io');
        if (io) {
            io.to(order.buyerId.toString()).emit('order_update', {
                message: 'Your order has been delivered!',
                order
            });
        }

        res.status(200).json({
            status: 'success',
            data: { order }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Get orders requested by the user
exports.getMyRequests = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user._id })
            .populate('runnerId', 'name');

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// Get orders being delivered by the user
exports.getMyDeliveries = async (req, res) => {
    try {
        const orders = await Order.find({ runnerId: req.user._id })
            .populate('buyerId', 'name');

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
