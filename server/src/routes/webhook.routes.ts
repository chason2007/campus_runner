import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { emitOrderUpdate } from '../socket';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
});

router.post('/', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
            // FIX #7: Wrap DB operations in try/catch — uncaught errors prevent Stripe ACK
            try {
                const order = await Order.findById(orderId);
                if (order) {
                    order.paymentInfo = { ...order.paymentInfo, status: 'paid' };
                    await order.save();
                    emitOrderUpdate(order);
                    console.log(`✅ Payment confirmed for order ${orderId}`);
                } else {
                    console.warn(`⚠️  Webhook: Order ${orderId} not found in DB`);
                }
            } catch (dbErr: any) {
                console.error(`❌ Webhook DB error for order ${orderId}:`, dbErr.message);
                // Still return 200 so Stripe doesn't retry — log and investigate manually
            }
        }
    }

    res.json({ received: true });
});

export default router;
