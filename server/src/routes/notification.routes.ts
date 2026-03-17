import { Router, Response } from 'express';
import { Notification } from '../models/Notification';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all notifications for the logged-in user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await Notification.find({ userId: req.user?.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mark a notification as read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user?.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mark all as read
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        await Notification.updateMany(
            { userId: req.user?.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
