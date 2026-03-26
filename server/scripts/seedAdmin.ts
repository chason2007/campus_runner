import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User';

async function seedAdmin() {
    await mongoose.connect(process.env.MONGODB_URI!);
    const existing = await User.findOne({ email: 'admin@campusrunner.com' });
    if (existing) {
        console.log('Admin already exists.');
        await mongoose.disconnect();
        return;
    }
    const admin = new User({
        name: 'Super Admin',
        email: 'admin@campusrunner.com',
        password: 'adminadmin',
        role: 'admin',
        isApproved: true,
        isActive: true,
    });
    await admin.save();
    console.log('✅ Admin created: admin@campusrunner.com / adminadmin');
    await mongoose.disconnect();
}

seedAdmin().catch(console.error);
