import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
  console.log('--- DB Connection Test ---');
  console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'UNDEFINED');
  try {
    await mongoose.connect(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ SUCCESS: Connected to MongoDB');
  } catch (err: any) {
    console.error('❌ FAILURE:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('---------------------------');
    process.exit(0);
  }
}
test();
