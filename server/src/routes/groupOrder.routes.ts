import express, { Response } from 'express';
import { GroupOrder } from '../models/GroupOrder';
import { Vendor } from '../models/Vendor';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { emitGroupUpdate } from '../socket';
import crypto from 'crypto';

const router = express.Router();

// Create Group Order (Host)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId, deliveryFee } = req.body;
        const shareCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const groupOrder = new GroupOrder({
            host: req.user?.id,
            vendor: vendorId,
            participants: [{
                user: req.user?.id,
                items: [],
                paid: false,
                totalAmount: 0
            }],
            deliveryFee,
            shareCode,
            status: 'open'
        });

        await groupOrder.save();
        res.status(201).json(groupOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Group Order by Share Code
router.get('/code/:code', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const code = req.params.code as string;
        const groupOrder = await GroupOrder.findOne({ shareCode: code.toUpperCase() })
            .populate('host vendor participants.user');

        if (!groupOrder) {
            return res.status(404).json({ message: 'Group order not found' });
        }
        res.json(groupOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Join Group Order
// FIX #3: Require shareCode in body — ID alone is not sufficient
// FIX #7: Max 10 participants per group
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { shareCode } = req.body;
        if (!shareCode) return res.status(400).json({ message: 'Share code is required to join a group order' });

        const groupOrder = await GroupOrder.findById(req.params.id);
        if (!groupOrder) return res.status(404).json({ message: 'Group order not found' });
        if (groupOrder.shareCode !== (shareCode as string).toUpperCase()) {
            return res.status(403).json({ message: 'Invalid share code' });
        }
        if (groupOrder.status !== 'open') return res.status(400).json({ message: 'Order is no longer accepting participants' });

        const MAX_PARTICIPANTS = 10;
        if (groupOrder.participants.length >= MAX_PARTICIPANTS) {
            return res.status(400).json({ message: `Group is full (max ${MAX_PARTICIPANTS} participants)` });
        }

        const isAlreadyIn = groupOrder.participants.some((p: any) => p.user.toString() === req.user?.id);
        if (isAlreadyIn) return res.status(400).json({ message: 'You have already joined this group order' });

        groupOrder.participants.push({
            user: req.user?.id as any,
            items: [],
            paid: false,
            totalAmount: 0
        });

        await groupOrder.save();
        emitGroupUpdate(groupOrder);
        res.json(groupOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update Participant Items
// FIX #5: Validate that item prices and quantities are positive numbers
router.post('/:id/items', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) return res.status(400).json({ message: 'Items must be an array' });

        const groupOrder = await GroupOrder.findById(req.params.id);
        if (!groupOrder) return res.status(404).json({ message: 'Group order not found' });
        if (groupOrder.status !== 'open') return res.status(400).json({ message: 'Order is locked and cannot be modified' });

        const participantIndex = groupOrder.participants.findIndex((p: any) => p.user.toString() === req.user?.id);
        if (participantIndex === -1) return res.status(403).json({ message: 'You are not a participant in this group order' });

        // Loophole 1 Fix: Verify item prices against the Vendor's database menu
        const vendorDoc = await Vendor.findById(groupOrder.vendor);
        if (!vendorDoc) return res.status(404).json({ message: 'Vendor for this group order not found' });

        let itemsTotal = 0;
        const verifiedItems = [];

        // Validate each item
        for (const item of items) {
            if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
                return res.status(400).json({ message: 'Each item must have a valid name' });
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                return res.status(400).json({ message: `Item "${item.name}" has an invalid quantity. Must be a whole number >= 1.` });
            }

            const menuItem = vendorDoc.menu.find((m: any) => m.name === item.name);
            if (!menuItem) {
                return res.status(400).json({ message: `Menu item not found: ${item.name}` });
            }
            if (!menuItem.isAvailable) {
                return res.status(400).json({ message: `Menu item "${item.name}" is currently unavailable` });
            }

            itemsTotal += menuItem.price * item.quantity;
            verifiedItems.push({
                name: item.name,
                quantity: item.quantity,
                price: menuItem.price // Use correct server-side price
            });
        }

        groupOrder.participants[participantIndex].items = verifiedItems;
        groupOrder.participants[participantIndex].totalAmount = itemsTotal;

        // Recalculate total from all participants
        groupOrder.totalAmount = groupOrder.participants.reduce((sum: number, p: any) => sum + p.totalAmount, 0) + groupOrder.deliveryFee;

        await groupOrder.save();
        emitGroupUpdate(groupOrder);
        res.json(groupOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Lock Group Order (Host Only)
// FIX #6: Prevent locking when all participants have empty carts
router.post('/:id/lock', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const groupOrder = await GroupOrder.findById(req.params.id);
        if (!groupOrder) return res.status(404).json({ message: 'Group order not found' });
        if (groupOrder.host.toString() !== req.user?.id) return res.status(403).json({ message: 'Only the host can lock the order' });

        const anyoneHasItems = groupOrder.participants.some((p: any) => p.items.length > 0);
        if (!anyoneHasItems) {
            return res.status(400).json({ message: 'Cannot lock the order — no participants have added any items yet' });
        }

        groupOrder.status = 'locked';
        await groupOrder.save();
        emitGroupUpdate(groupOrder);
        res.json(groupOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Group Order Details
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const groupOrder = await GroupOrder.findById(req.params.id)
            .populate('host vendor participants.user');
        if (!groupOrder) return res.status(404).json({ message: 'Group order not found' });
        res.json(groupOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
