import { Router, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth.middleware';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

// All routes here require admin role
router.use(authMiddleware, roleMiddleware(['admin']));

// Get all orders with filtering
router.get('/orders', async (req: AuthRequest, res: Response) => {
    try {
        const { status, type, dispute } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (type) query.type = type;
        if (dispute === 'true') query['dispute.isDisputed'] = true;

        const orders = await Order.find(query)
            .populate('student', 'name email')
            .populate('runner', 'name email')
            .populate('vendor', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users (students and runners)
router.get('/users', async (req: AuthRequest, res: Response) => {
    try {
        const { role, search } = req.query;
        let query: any = { role: { $in: ['student', 'runner'] } };

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update user status (active/banned)
router.patch('/users/:id/status', async (req: AuthRequest, res: Response) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a user
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // If user was a vendor, delete vendor profile too
        if (user.role === 'vendor') {
            await Vendor.findOneAndDelete({ owner: user._id });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get all vendors
router.get('/vendors', async (req: AuthRequest, res: Response) => {
    try {
        const vendors = await Vendor.find().populate('owner', 'name email isActive');
        res.json(vendors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update vendor information
router.patch('/vendors/:id', async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
        res.json(vendor);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get system-wide stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalOrders,
            totalUsers,
            totalVendors,
            revenueData,
            disputedOrders
        ] = await Promise.all([
            Order.countDocuments(),
            User.countDocuments(),
            Vendor.countDocuments(),
            Order.aggregate([
                { $match: { 'paymentInfo.status': 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments({ 'dispute.isDisputed': true, 'dispute.status': 'pending' })
        ]);

        res.json({
            totalOrders,
            totalUsers,
            totalVendors,
            totalRevenue: revenueData[0]?.total || 0,
            pendingDisputes: disputedOrders
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Refund an order via Stripe
router.post('/orders/:id/refund', async (req: AuthRequest, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.paymentInfo?.status !== 'paid') {
            return res.status(400).json({ message: 'Only paid orders can be refunded' });
        }

        if (!order.paymentInfo.stripeSessionId) {
            return res.status(400).json({ message: 'No Stripe session found for this order' });
        }

        // To refund, we need the PaymentIntent ID from the session
        const session = await stripe.checkout.sessions.retrieve(order.paymentInfo.stripeSessionId);
        const paymentIntentId = session.payment_intent as string;

        if (!paymentIntentId) {
            return res.status(400).json({ message: 'No payment intent found' });
        }

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
        });

        order.paymentInfo.status = 'refunded';
        if (order.dispute) {
            order.dispute.status = 'refunded';
            order.dispute.adminResponse = req.body.adminResponse || 'Refunded by administrator';
        }
        order.status = 'cancelled';
        await order.save();

        res.json({ message: 'Order refunded successfully', refund });
    } catch (error: any) {
        console.error('Refund Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Resolve a dispute without refund
router.patch('/orders/:id/resolve', async (req: AuthRequest, res: Response) => {
    try {
        const { adminResponse } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order || !order.dispute) return res.status(404).json({ message: 'Order or dispute not found' });

        order.dispute.status = 'resolved';
        order.dispute.adminResponse = adminResponse;
        await order.save();

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
