const mongoose = require('mongoose');
require('dotenv').config();

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
    
    // 1. Find the admin user
    const adminUser = await db.collection('users').findOne({ email: 'admin@renthub.com' });
    
    if (!adminUser) {
      console.error('Admin user (admin@renthub.com) not found. Please create it first.');
      process.exit(1);
    }

    console.log(`Found Admin: ${adminUser._id}`);

    // 2. Delete all other users
    const deleteResult = await db.collection('users').deleteMany({ email: { $ne: 'admin@renthub.com' } });
    console.log(`Deleted ${deleteResult.deletedCount} non-admin users.`);

    // 3. Re-assign all items to the admin
    const updateResult = await db.collection('items').updateMany({}, { $set: { owner: adminUser._id } });
    console.log(`Re-assigned ${updateResult.modifiedCount} items to Admin.`);

    process.exit(0);
  } catch (err) {
    console.error('Database Cleanup Error:', err);
    process.exit(1);
  }
};

dbCleanup();
