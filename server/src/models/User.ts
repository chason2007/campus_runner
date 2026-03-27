import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'runner' | 'vendor' | 'admin';
    profileImage?: string;
    campusId?: string;
    isActive: boolean;
    isApproved: boolean;
    approvedBy?: string;
    createdAt: Date;
    comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'runner', 'vendor', 'admin'], required: true },
    profileImage: { type: String },
    campusId: { type: String },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now, index: true },
});

// Production Indices
userSchema.index({ email: 1 });
userSchema.index({ campusId: 1 }, { sparse: true });
userSchema.index({ role: 1, isActive: 1 });


// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (this: IUser, password: string) {
    return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', userSchema);
