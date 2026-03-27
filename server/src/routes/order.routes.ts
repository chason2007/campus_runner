import express, { Response } from 'express';
import { Order } from '../models/Order';
import { Vendor } from '../models/Vendor';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { emitOrderUpdate } from '../socket';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
});

const router = express.Router();

// Create Order (Requires Auth)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, type, vendor, items, deliveryFee, location } = req.body;

        // Loophole 1 Fix: Verify item prices against the database
        let validatedItems = items;
        let calculatedPrice = Number(req.body.price || 0);

        if (type === 'food' && vendor && items && items.length > 0) {
            const vendorDoc = await Vendor.findById(vendor);
            if (!vendorDoc) return res.status(404).json({ message: 'Vendor not found' });

            calculatedPrice = 0;
            validatedItems = [];
            for (const clientItem of items) {
                const menuItem = vendorDoc.menu.find((m: any) => m.name === clientItem.name);
                if (!menuItem) return res.status(400).json({ message: `Menu item not found: ${clientItem.name}` });
                if (!Number.isInteger(clientItem.quantity) || clientItem.quantity < 1) {
                    return res.status(400).json({ message: `Invalid quantity for ${clientItem.name}` });
                }
                
                calculatedPrice += menuItem.price * clientItem.quantity;
                validatedItems.push({
                    name: clientItem.name,
                    quantity: clientItem.quantity,
                    price: menuItem.price // Store the correct server-side price
                });
            }
        }

        const calculatedDeliveryFee = Number(deliveryFee || 0);
        const calculatedTotalAmount = calculatedPrice + calculatedDeliveryFee;

        const orderData = {
            title,
            description,
            type,
            vendor,
            items: validatedItems,
            price: calculatedPrice,
            deliveryFee: calculatedDeliveryFee,
            totalAmount: calculatedTotalAmount,
            location,
            student: req.user?.id,
            status: 'pending',
            paymentInfo: { status: 'pending' }
        };
        const order = new Order(orderData);
        await order.save();

        // Emit socket event
        emitOrderUpdate(order);

        res.status(201).json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Create Stripe Checkout Session
// FIX #2: Server-side total recalculation — never trust client-supplied price
router.post('/:id/create-checkout-session', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.student.toString() !== req.user?.id) return res.status(403).json({ message: 'Unauthorized' });

        // Recalculate server-side to prevent price manipulation
        const itemsTotal = (order.items || []).reduce(
            (sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity || 1)),
            0
        );
        const serverTotal = itemsTotal + Number(order.deliveryFee || 0);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'aed',
                        product_data: {
                            name: `Order: ${order.title}`,
                            description: order.description,
                        },
                        unit_amount: Math.round(serverTotal * 100), // Stripe expects fils (100ths of AED)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment_failed=true`,
            metadata: {
                orderId: order._id.toString(),
            },
        });

        order.paymentInfo = {
            ...order.paymentInfo,
            stripeSessionId: session.id,
            status: 'pending'
        };
        order.totalAmount = serverTotal; // sync DB with recalculated total
        await order.save();

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get User's Orders (Requires Auth)
// FIX #8: Paginated results — use ?page=1&limit=20
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;

        const query = req.user?.role === 'student'
            ? { student: req.user.id }
            : req.user?.role === 'runner'
                ? { runner: req.user.id }
                : { vendor: req.user?.id };

        const [orders, total] = await Promise.all([
            Order.find(query).populate('student runner vendor').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(query)
        ]);

        res.json({ orders, total, page, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get All Available Orders (for Runners)
// FIX #8: Paginated
router.get('/available', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'runner') {
            return res.status(403).json({ message: 'Only runners can view available orders' });
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ status: { $in: ['pending', 'preparing'] } })
                .populate('student vendor')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ status: { $in: ['pending', 'preparing'] } })
        ]);

        res.json({ orders, total, page, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch available orders' });
    }
});

// Update Order Status
// FIX #1: Role-gated status transitions — enforce who can do what
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const role = req.user?.role;
        const userId = req.user?.id;

        const allowedTransitions: Record<string, string[]> = {
            vendor: ['preparing', 'rejected'],
            runner: ['in-progress', 'delivered', 'cancelled'],
            student: ['cancelled'],
            admin: ['pending', 'preparing', 'in-progress', 'delivered', 'cancelled', 'rejected']
        };

        const allowed = allowedTransitions[role || ''] || [];
        if (!allowed.includes(status)) {
            return res.status(403).json({ message: `Your role cannot set status to "${status}"` });
        }

        // Runners can only pick up orders assigned to them or unclaimed ones
        if (role === 'runner' && order.runner && order.runner.toString() !== userId) {
            return res.status(403).json({ message: 'This order belongs to another runner' });
        }

        // Vendors can only update their own orders
        if (role === 'vendor' && order.vendor && order.vendor.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Students can only cancel their own orders
        if (role === 'student' && order.student.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        order.status = status;
        if (status === 'in-progress' && !order.runner) {
            order.runner = userId as any;
        }

        order.updatedAt = new Date();
        await order.save();
        emitOrderUpdate(order);

        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Report a dispute
// FIX #9: Both students AND runners can file disputes
router.post('/:id/dispute', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const userId = req.user?.id;
        const isStudent = order.student.toString() === userId;
        const isRunner = order.runner?.toString() === userId;

        if (!isStudent && !isRunner) {
            return res.status(403).json({ message: 'Only the student or assigned runner can file a dispute' });
        }

        order.dispute = {
            isDisputed: true,
            reason,
            status: 'pending',
            createdAt: new Date()
        };

        await order.save();
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
