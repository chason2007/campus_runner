import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User';

async function checkUsers() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const runners = await User.countDocuments({ role: 'runner' });
    console.log(`Total users: ${count}`);
    console.log(`Students: ${students}`);
    console.log(`Runners: ${runners}`);
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
