import { Schema, model, Document, Types } from 'mongoose';

export interface IVendor extends Document {
    owner: Types.ObjectId;
    name: string;
    description: string;
    category: string;
    image?: string;
    location: string;
    rating: number;
    isOpen: boolean;
    menu: {
        name: string;
        description: string;
        price: number;
        image?: string;
        isAvailable: boolean;
    }[];
    createdAt: Date;
}

const vendorSchema = new Schema<IVendor>({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    menu: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        isAvailable: { type: Boolean, default: true },
    }],
    createdAt: { type: Date, default: Date.now },
});

export const Vendor = model<IVendor>('Vendor', vendorSchema);
