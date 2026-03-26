const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const createUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // The user to create / ensure exists
    const email = 'srimanta.m@somaiya.edu';
    const password = '123456';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User already exists: ${email}`);
      console.log('Resetting password to: 123456');
      existing.password = password;
      await existing.save();
      console.log('Password reset done.');
    } else {
      const user = await User.create({
        fullName: 'Srimanta Maharana',
        email,
        phoneNumber: '8097831527',
        address: 'Sandesh Nagar, Bail Bazar, Kurla West, Mumbai - 400070',
        password,
        isVerified: true,
        isAdmin: false
      });
      console.log(`Created user: ${user.email} (ID: ${user._id})`);
    }

    console.log('---');
    console.log('You can now log in with:');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('---');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

createUser();
