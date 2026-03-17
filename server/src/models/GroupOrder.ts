import { Schema, model, Document, Types } from 'mongoose';

export interface IGroupOrder extends Document {
    host: Types.ObjectId;
    vendor: Types.ObjectId;
    participants: {
        user: Types.ObjectId;
        items: {
            name: string;
            quantity: number;
            price: number;
        }[];
        paid: boolean;
        totalAmount: number;
    }[];
    status: 'open' | 'locked' | 'ordered' | 'delivered' | 'cancelled';
    deliveryFee: number;
    totalAmount: number;
    shareCode: string;
    createdAt: Date;
    updatedAt: Date;
}

const groupOrderSchema = new Schema<IGroupOrder>({
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: [{
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }],
        paid: { type: Boolean, default: false },
        totalAmount: { type: Number, default: 0 }
    }],
    status: {
        type: String,
        enum: ['open', 'locked', 'ordered', 'delivered', 'cancelled'],
        default: 'open'
    },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    shareCode: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// FIX #11: Add indexes for frequently queried fields
groupOrderSchema.index({ shareCode: 1 });       // lookup by share code
groupOrderSchema.index({ status: 1 });           // filter by open/locked
groupOrderSchema.index({ host: 1 });             // host's orders
groupOrderSchema.index({ 'participants.user': 1 }); // participant's orders

export const GroupOrder = model<IGroupOrder>('GroupOrder', groupOrderSchema);
