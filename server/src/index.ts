import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import { initSocket } from './socket';
import rateLimit from 'express-rate-limit';

// Import Routes
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import vendorRoutes from './routes/vendor.routes';
import runnerRoutes from './routes/runner.routes';
import ratingRoutes from './routes/rating.routes';
import webhookRoutes from './routes/webhook.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import groupOrderRoutes from './routes/groupOrder.routes';
import { errorMiddleware } from './middleware/error.middleware';

// FIX #10: Validate required environment variables at startup
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI', 'STRIPE_SECRET_KEY'];
const missingVars = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingVars.length) {
    console.error(`\n❌ FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file and restart the server.\n');
    process.exit(1);
}

const app: Express = express();
const server = createServer(app);
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI!;

// Initialize Socket.io
initSocket(server);

// FIX #10: Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many auth attempts, please wait before trying again.' }
});

// Middleware
app.use(helmet());
// FIX #4: CORS for Production and Localhost
const allowedOrigins = [
    'https://campusrunner.vercel.app',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        // Log origin for debugging on Render
        if (origin) console.log(`[CORS]: Request from origin ${origin}`);

        if (!origin || allowedOrigins.includes(origin) || (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)) {
            callback(null, true);
        } else {
            console.warn(`[CORS]: Blocked request from origin ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(morgan('dev'));
app.use(mongoSanitize()); // FIX #12: Prevent NoSQL injection via body fields
app.use(globalLimiter);

// Stripe Webhook (Must be before express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json());

// Disable Mongoose buffering to prevent hanging when DB is disconnected
mongoose.set('bufferCommands', false);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/runners', runnerRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/group-orders', groupOrderRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        message: 'Campus Runner API is healthy',
        timestamp: new Date().toISOString(),
    });
});

app.use(errorMiddleware);

// Database Connection and Server Startup
const startServer = async () => {
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅[database]: Connected to MongoDB');

        // Auto-seed Admin if not exists
        try {
            const { User } = await import('./models/User');
            const adminEmail = 'admin@campusrunner.edu';
            const existingAdmin = await User.findOne({ email: adminEmail });
            if (!existingAdmin) {
                // FIX #2: Admin password from env var — never hardcoded
                const adminPassword = process.env.ADMIN_SEED_PASSWORD;
                if (!adminPassword) {
                    console.warn('⚠️  [database]: ADMIN_SEED_PASSWORD not set — skipping admin seed.');
                } else {
                    const admin = new User({
                        name: 'Super Admin',
                        email: adminEmail,
                        password: adminPassword,
                        role: 'admin'
                    });
                    await admin.save();
                    console.log('🚀[database]: Super Admin account created');
                }
            }
        } catch (seedErr) {
            console.error('❌[database]: Error seeding admin:', seedErr);
        }

        // Start Server
        server.listen(port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error('❌[database]: MongoDB connection error:', err);
        process.exit(1);
    }
};

startServer();
