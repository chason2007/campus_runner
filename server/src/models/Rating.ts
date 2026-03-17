import { Schema, model, Document } from 'mongoose';

export interface IRating extends Document {
    order: Schema.Types.ObjectId;
    student: Schema.Types.ObjectId;
    runner?: Schema.Types.ObjectId;
    vendor?: Schema.Types.ObjectId;
    score: number; // 1-5
    comment?: string;
    createdAt: Date;
}

const ratingSchema = new Schema<IRating>({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    runner: { type: Schema.Types.ObjectId, ref: 'User' },
    vendor: { type: Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export const Rating = model<IRating>('Rating', ratingSchema);
