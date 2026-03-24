const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedAdmin = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ isAdmin: true });

    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit();
    }

    // Create admin user
    await User.create({
      fullName: 'Admin',
      email: 'admin@renthub.com',
      phoneNumber: '0000000000',
      address: 'Admin HQ',
      bankName: 'Admin Bank',
      accountHolderName: 'Admin',
      accountNumber: '00000',
      ifscCode: '00000',
      password: 'admin123',
      isAdmin: true
    });

    console.log('Admin user seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
