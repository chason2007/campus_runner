import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User';

const dummyUsers = [
  // STUDENTS
  {
    name: 'Alice Johnson',
    email: 'alice.student@dummy.com',
    password: 'password123',
    role: 'student',
    profileImage: '/dummy/student_1_profile.png',
    campusId: 'STU1001',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Bob Smith',
    email: 'bob.student@dummy.com',
    password: 'password123',
    role: 'student',
    profileImage: '/dummy/student_2_profile.png',
    campusId: 'STU1002',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Charlie Davis',
    email: 'charlie.student@dummy.com',
    password: 'password123',
    role: 'student',
    profileImage: '/dummy/student_3_profile.png',
    campusId: 'STU1003',
    isActive: true,
    isApproved: true
  },
  // RUNNERS
  {
    name: 'Diana Martinez',
    email: 'diana.runner@dummy.com',
    password: 'password123',
    role: 'runner',
    profileImage: '/dummy/runner_1_profile.png',
    campusId: 'RUN2001',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Evan Wright',
    email: 'evan.runner@dummy.com',
    password: 'password123',
    role: 'runner',
    profileImage: '/dummy/runner_2_profile.png',
    campusId: 'RUN2002',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Fiona Lee',
    email: 'fiona.runner@dummy.com',
    password: 'password123',
    role: 'runner',
    profileImage: '/dummy/runner_2_profile.png',
    campusId: 'RUN2003',
    isActive: true,
    isApproved: true
  }
];

async function seedUsers() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const data of dummyUsers) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = new User({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          profileImage: data.profileImage,
          campusId: data.campusId,
          isActive: data.isActive,
          isApproved: data.isApproved
        });
        await user.save();
        console.log(`👤 Created ${data.role}: ${user.name} (${user.email})`);
      } else {
        console.log(`👤 User already exists: ${user.email}. Skipping...`);
      }
    }

    console.log('\n🎉 Successfully seeded all dummy students and runners!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  }
}

seedUsers();
