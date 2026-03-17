import express, { Response } from 'express';
import { Rating } from '../models/Rating';
import { Order } from '../models/Order';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Create Rating
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, score, comment } = req.body;

        // Check if order exists and belongs to student
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.student.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({ message: 'Can only rate delivered orders' });
        }

        const rating = new Rating({
            order: orderId,
            student: req.user!.id,
            runner: order.runner,
            vendor: order.vendor,
            score,
            comment
        });

        await rating.save();

        // Update order isRated flag
        order.isRated = true;
        await order.save();

        res.status(201).json(rating);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Order already rated' });
        }
        res.status(500).json({ message: error.message });
    }
});

// Get Ratings for a Runner
router.get('/runner/:runnerId', async (req: express.Request, res: express.Response) => {
    try {
        const ratings = await Rating.find({ runner: req.params.runnerId })
            .populate('student', 'name profileImage')
            .sort({ createdAt: -1 });
        res.json(ratings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Ratings for a Vendor
router.get('/vendor/:vendorId', async (req: express.Request, res: express.Response) => {
    try {
        const ratings = await Rating.find({ vendor: req.params.vendorId })
            .populate('student', 'name profileImage')
            .sort({ createdAt: -1 });
        res.json(ratings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
