import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testConn = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI?.split('@')[1]);
        await mongoose.connect(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected successfully!');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
};

testConn();
