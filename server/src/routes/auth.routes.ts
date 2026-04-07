import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { body, validationResult } from 'express-validator';

const router = express.Router();
// FIX #1: Crash hard if JWT_SECRET is not set — never silently use a fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set.');

// Register
// FIX #6: Validate inputs at the route level
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['student', 'runner', 'vendor']).withMessage('Invalid role'),
];

router.post('/register', registerValidation, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, role, campusId } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Loophole 6 Fix: Automatically approve students during registration
        const isApprovedStatus = role === 'student' ? true : false;

        const user = new User({ name, email, password, role, campusId, isApproved: isApprovedStatus });
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role, isActive: user.isActive, isApproved: user.isApproved },
            JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role, campusId: user.campusId },
            token
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login
// FIX #3: Uniform error message to prevent user enumeration
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // FIX #3: Do NOT reveal that the email doesn't exist
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // New check: Is the account suspended?
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
        }

        // Approval Check
        // Loophole 6 Fix: Bypass server-side approval lockdown for the Student role specifically
        if (user.role !== 'admin' && user.role !== 'student' && user.isApproved === false) {
            return res.status(403).json({ 
                status: 'pending_approval', 
                message: 'Your account is pending admin approval. You will be notified once you can access the platform.' 
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, isActive: user.isActive, isApproved: user.isApproved },
            JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role, campusId: user.campusId },
            token
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Login failed' });
    }
});

import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

// Update Profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { name, campusId } = req.body;
        const user = await User.findById(req.user?.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (campusId) user.campusId = campusId;

        await user.save();

        res.json({
            message: 'Profile updated',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                campusId: user.campusId
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Verify Current User (Fix #2: Client-side role spoofing mitigation)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json({
            id: user._id, name: user.name, email: user.email, role: user.role, campusId: user.campusId
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
