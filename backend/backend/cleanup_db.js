const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbCleanup = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not found in environment');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    const db = mongoose.connection.db;
    
    // 1. Check for the admin user
    let adminUser = await db.collection('users').findOne({ email: 'admin@renthub.com' });
    
    if (!adminUser) {
      console.log('Admin user not found. Creating a fresh admin user now...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = {
        fullName: 'RentHub Admin',
        email: 'admin@renthub.com',
        phoneNumber: '0000000000',
        address: 'Admin Headquarters',
        password: hashedPassword,
        isAdmin: true,
        isVerified: true,
        isBlocked: false,
        bankName: 'RentHub Bank',
        accountHolderName: 'RentHub Admin',
        accountNumber: '9999999999',
        ifscCode: 'RHUB0001',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await db.collection('users').insertOne(newAdmin);
      adminUser = { _id: insertResult.insertedId };
      console.log('Successfully created Admin Account (admin@renthub.com / admin123)');
    } else {
      console.log(`Found Existing Admin: ${adminUser._id}`);
    }

    // 2. Delete all other users
    const deleteResult = await db.collection('users').deleteMany({ email: { $ne: 'admin@renthub.com' } });
    console.log(`Deleted ${deleteResult.deletedCount} non-admin users.`);

    // 3. Re-assign all items to the admin
    const updateResult = await db.collection('items').updateMany({}, { $set: { owner: adminUser._id } });
    console.log(`Re-assigned ${updateResult.modifiedCount} items to Admin.`);

    console.log('--- DATABASE CLEANUP COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Database Cleanup Error:', err);
    process.exit(1);
  }
};

dbCleanup();
