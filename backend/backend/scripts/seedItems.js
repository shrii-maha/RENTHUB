const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Item = require('../models/Item');
const User = require('../models/User');

const seedItems = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not found in environment');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    // 1. Find the Admin user (ssm47@gmail.com is based on earlier mockData/cleanup config)
    // We'll check for 'admin@renthub.com' first as it's the cleaner system admin
    let admin = await User.findOne({ email: 'admin@renthub.com' });
    
    // If not found, fall back to the ssm47 account
    if (!admin) {
      admin = await User.findOne({ email: 'ssm47@gmail.com' });
    }

    if (!admin) {
      console.error('No admin user found to own the items. Please run cleanup_db.js first.');
      process.exit(1);
    }

    console.log(`Assigning items to Admin: ${admin.fullName} (${admin._id})`);

    // 2. Load products from JSON
    const dataPath = path.join(__dirname, '../data/products.json');
    const items = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // 3. Clear existing items from these curated names (optional - we'll just insert)
    // Actually, let's clear all items to ensure a clean manual state as requested
    console.log('Clearing existing items...');
    await Item.deleteMany({});
    console.log('Database cleared.');

    // 4. Map owner ID to items
    const itemsWithOwner = items.map(item => ({
      ...item,
      owner: admin._id
    }));

    // 5. Insert items
    console.log(`Seeding ${itemsWithOwner.length} items...`);
    await Item.insertMany(itemsWithOwner);
    console.log('Seeding Successful!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedItems();
