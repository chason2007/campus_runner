import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User';

async function checkUsers() {
  if (!process.env.MONGODB_URI) {
    fs.appendFileSync('results.txt', '❌ MONGODB_URI is not defined in .env\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const runners = await User.countDocuments({ role: 'runner' });
    fs.writeFileSync('results.txt', `Total users: ${count}\nStudents: ${students}\nRunners: ${runners}\n`);
  } catch (error) {
    fs.appendFileSync('results.txt', `❌ Error checking users: ${error}\n`);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
