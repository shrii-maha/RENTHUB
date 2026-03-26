/**
 * wipeAllItems.js
 * Deletes ALL items from MongoDB + removes their images from Cloudinary.
 * Run once: node scripts/wipeAllItems.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const cloudinary = require('cloudinary').v2;
const Item = require('../models/Item');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!\n');

    const items = await Item.find({});
    console.log(`Found ${items.length} items to delete.\n`);

    let cloudinaryDeleted = 0;
    let dbDeleted = 0;

    for (const item of items) {
      // Delete Cloudinary image if it's a Cloudinary URL
      if (item.imageFilename && item.imageFilename.includes('cloudinary.com')) {
        try {
          const urlParts = item.imageFilename.split('/');
          const fileWithExt = urlParts[urlParts.length - 1];
          const publicId = 'renthub/' + fileWithExt.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
          cloudinaryDeleted++;
          console.log(`  ☁️  Deleted from Cloudinary: ${publicId}`);
        } catch (e) {
          console.warn(`  ⚠️  Cloudinary delete failed for ${item.name}: ${e.message}`);
        }
      }

      await item.deleteOne();
      dbDeleted++;
      console.log(`  🗑️  Deleted from DB: ${item.name}`);
    }

    console.log(`\n✅ Done!`);
    console.log(`   DB items deleted:        ${dbDeleted}`);
    console.log(`   Cloudinary imgs deleted: ${cloudinaryDeleted}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
