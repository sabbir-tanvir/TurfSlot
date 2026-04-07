import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Turf from '../models/Turf.js';
import Product from '../models/Product.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Turf.deleteMany();
    await Product.deleteMany();

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      full_name: 'Local Admin',
      email: 'admin@turfslot.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create Sample Turfs
    const turfs = await Turf.create([
      {
        name: 'Wembley Arena',
        type: '5-a-side',
        size: '40x20m',
        location: 'Gulshan, Dhaka',
        base_price: 2000,
        peak_price: 3000,
        night_price: 2500,
        status: 'active',
        amenities: ['Changing Room', 'Parking', 'Mineral Water']
      },
      {
        name: 'Camp Nou Ground',
        type: '7-a-side',
        size: '50x30m',
        location: 'Banani, Dhaka',
        base_price: 3500,
        peak_price: 5000,
        night_price: 4000,
        status: 'active',
        amenities: ['Parking', 'Shower']
      }
    ]);

    // Create Sample Products
    await Product.create([
      {
        name: 'Mineral Water 500ml',
        category: 'beverage',
        price: 20,
        cost_price: 15,
        stock: 100,
        status: 'active'
      },
      {
        name: 'Energy Drink',
        category: 'beverage',
        price: 100,
        cost_price: 80,
        stock: 50,
        status: 'active'
      }
    ]);

    console.log('✅ Data Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
