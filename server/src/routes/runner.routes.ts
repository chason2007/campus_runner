import express, { Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get Runner Leaderboard
router.get('/leaderboard', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const leaderboard = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: '$runner',
                    completedDeliveries: { $sum: 1 },
                    totalEarnings: { $sum: '$deliveryFee' }
                }
            },
            { $sort: { completedDeliveries: -1, totalEarnings: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'runnerInfo'
                }
            },
            { $unwind: '$runnerInfo' },
            {
                $project: {
                    _id: 1,
                    completedDeliveries: 1,
                    totalEarnings: 1,
                    name: '$runnerInfo.name',
                    avatar: '$runnerInfo.profileImage'
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Runner Stats (Personal)
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'runner') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const stats = await Order.aggregate([
            { $match: { runner: new (require('mongoose').Types.ObjectId)(req.user.id), status: 'delivered' } },
            {
                $group: {
                    _id: '$runner',
                    completedDeliveries: { $sum: 1 },
                    totalEarnings: { $sum: '$deliveryFee' }
                }
            }
        ]);

        res.json(stats[0] || { completedDeliveries: 0, totalEarnings: 0 });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
