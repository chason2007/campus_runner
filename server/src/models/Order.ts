import { Schema, model, Document, Types } from 'mongoose';

export interface IOrder extends Document {
    student: Types.ObjectId;
    runner?: Types.ObjectId;
    vendor?: Types.ObjectId;
    title: string;
    description: string;
    type: 'food' | 'printout' | 'favour';
    status: 'pending' | 'preparing' | 'accepted' | 'in-progress' | 'picked_up' | 'delivered' | 'cancelled';
    items?: {
        name: string;
        quantity: number;
        price: number;
    }[];
    paymentInfo?: {
        stripeSessionId?: string;
        status: 'pending' | 'paid' | 'refunded' | 'failed';
    };
    price: number;
    deliveryFee: number;
    totalAmount: number;
    location: string;
    isRated: boolean;
    dispute?: {
        isDisputed: boolean;
        reason: string;
        status: 'pending' | 'resolved' | 'refunded';
        adminResponse?: string;
        createdAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    runner: { type: Schema.Types.ObjectId, ref: 'User' },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['food', 'printout', 'favour'], required: true },
    status: { type: String, enum: ['pending', 'preparing', 'accepted', 'in-progress', 'picked_up', 'delivered', 'cancelled'], default: 'pending' },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    paymentInfo: {
        stripeSessionId: { type: String },
        status: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
    },
    price: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    location: { type: String, required: true },
    isRated: { type: Boolean, default: false },
    dispute: {
        isDisputed: { type: Boolean, default: false },
        reason: { type: String },
        status: { type: String, enum: ['pending', 'resolved', 'refunded'], default: 'pending' },
        adminResponse: { type: String },
        createdAt: { type: Date }
    },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
});

// Production Indices for Dashboard Performance
orderSchema.index({ student: 1, createdAt: -1 });
orderSchema.index({ runner: 1, status: 1 });
orderSchema.index({ vendor: 1, status: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });


export const Order = model<IOrder>('Order', orderSchema);
