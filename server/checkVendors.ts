import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Vendor } from './src/models/Vendor';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkVendors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        const count = await Vendor.countDocuments();
        const vendors = await Vendor.find().select('name isOpen');
        console.log(`Total Vendors: ${count}`);
        console.log('Vendors:', vendors);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkVendors();
