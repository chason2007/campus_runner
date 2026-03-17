import express, { Response } from 'express';
import { Vendor } from '../models/Vendor';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Create/Update Vendor Info (Requires Vendor Role)
router.post('/', authMiddleware, roleMiddleware(['vendor']), async (req: AuthRequest, res: Response) => {
    try {
        const vendorData = {
            ...req.body,
            owner: req.user?.id
        };

        // Check if vendor already exists for this owner
        let vendor = await Vendor.findOne({ owner: req.user?.id });

        if (vendor) {
            // Update existing
            vendor = await Vendor.findOneAndUpdate(
                { owner: req.user?.id },
                { $set: req.body },
                { new: true }
            );
        } else {
            // Create new
            vendor = new Vendor(vendorData);
            await vendor.save();
        }

        res.status(201).json(vendor);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Vendors (Public)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const vendors = await Vendor.find({ isOpen: true }).populate('owner', 'name email');
        res.json(vendors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get My Vendor Profile (Requires Vendor Role)
router.get('/me', authMiddleware, roleMiddleware(['vendor']), async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findOne({ owner: req.user?.id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }
        res.json(vendor);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle Menu Item Availability
router.patch('/menu/availability', authMiddleware, roleMiddleware(['vendor']), async (req: AuthRequest, res: Response) => {
    try {
        const { itemName, isAvailable } = req.body;
        const vendor = await Vendor.findOne({ owner: req.user?.id });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const menuItem = vendor.menu.find(m => m.name === itemName);
        if (!menuItem) return res.status(404).json({ message: 'Item not found' });

        menuItem.isAvailable = isAvailable;
        await vendor.save();

        res.json(vendor);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Vendor by ID (Public)
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const vendor = await Vendor.findById(req.params.id).populate('owner', 'name email');
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
