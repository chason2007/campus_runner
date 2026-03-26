import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Vendor } from '../src/models/Vendor';

const dummyData = [
  {
    vendorEmail: 'burgerjoint@dummy.com',
    vendorName: 'Burger Joint',
    description: 'The best classic burgers and fries on campus!',
    category: 'Fast Food',
    image: '/dummy/burger_joint_storefront.png',
    location: 'North Campus Food Court',
    menu: [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce and tomato on a toasted bun.',
        price: 8.99,
        image: '/dummy/classic_burger_image.png',
        isAvailable: true
      },
      {
        name: 'Cheeseburger',
        description: 'Our classic burger with a slice of melted cheddar.',
        price: 9.99,
        image: '/dummy/cheeseburger_image.png',
        isAvailable: true
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries served hot.',
        price: 4.50,
        image: '/dummy/french_fries_image.png',
        isAvailable: true
      }
    ]
  },
  {
    vendorEmail: 'healthybites@dummy.com',
    vendorName: 'Healthy Bites',
    description: 'Fresh salads, health bowls, and detox smoothies.',
    category: 'Healthy',
    image: '/dummy/healthy_bites_storefront.png',
    location: 'Student Union Building',
    menu: [
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine, grilled chicken, croutons, and parmesan.',
        price: 10.50,
        image: '/dummy/caesar_salad_image.png',
        isAvailable: true
      },
      {
        name: 'Green Smoothie',
        description: 'A refreshing blend of spinach, kale, apple, and mint.',
        price: 6.99,
        image: '/dummy/green_smoothie_image.png',
        isAvailable: true
      },
      {
        name: 'Quinoa Bowl',
        description: 'Nutritious quinoa with roasted veggies and avocado.',
        price: 12.00,
        image: '/dummy/quinoa_bowl_image.png',
        isAvailable: true
      }
    ]
  },
  {
    vendorEmail: 'pizzaparadise@dummy.com',
    vendorName: 'Pizza Paradise',
    description: 'Authentic NY style pizza by the slice.',
    category: 'Pizza',
    image: '/dummy/pizza_paradise_storefront.png',
    location: 'South Campus Plaza',
    menu: [
      {
        name: 'Margherita Slice',
        description: 'Classic cheese and tomato sauce with fresh basil.',
        price: 4.00,
        image: '/dummy/margherita_slice_image.png',
        isAvailable: true
      },
      {
        name: 'Pepperoni Slice',
        description: 'NY style slice loaded with crispy pepperoni.',
        price: 4.50,
        image: '/dummy/pepperoni_slice_image.png',
        isAvailable: true
      },
      {
        name: 'Garlic Bread',
        description: 'Warm, buttery toasted garlic bread slices.',
        price: 3.50,
        image: '/dummy/garlic_bread_image.png',
        isAvailable: true
      }
    ]
  }
];

async function seedVendors() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const data of dummyData) {
      // Create or find user
      let user = await User.findOne({ email: data.vendorEmail });
      if (!user) {
        user = new User({
          name: `${data.vendorName} Owner`,
          email: data.vendorEmail,
          password: 'password123',
          role: 'vendor',
          isApproved: true,
          isActive: true
        });
        await user.save();
        console.log(`👤 Created user: ${user.email}`);
      } else {
        console.log(`👤 User already exists: ${user.email}`);
      }

      // Check if vendor already exists
      let vendor = await Vendor.findOne({ owner: user._id });
      if (!vendor) {
        vendor = new Vendor({
          owner: user._id,
          name: data.vendorName,
          description: data.description,
          category: data.category,
          image: data.image,
          location: data.location,
          rating: 4.8,
          isOpen: true,
          menu: data.menu
        });
        await vendor.save();
        console.log(`🏪 Created vendor: ${vendor.name}`);
      } else {
        console.log(`🏪 Vendor already exists: ${vendor.name}. Skipping... To reset, delete them manually first.`);
      }
    }

    console.log('\n🎉 Successfully seeded all dummy vendors and products!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  }
}

seedVendors();
