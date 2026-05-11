import mongoose from 'mongoose';
import User from './api/models/User.js';

const MONGODB_URI = 'mongodb+srv://coastalshaadi_db_user:***REMOVED***@cluster0.jwwbkbc.mongodb.net/coastalshaadi?retryWrites=true&w=majority&appName=Cluster0';

/**
 * This script removes all stock/fake profile images from users.
 * Only Cloudinary-uploaded images (real user uploads) are preserved.
 * 
 * Images removed:
 * - Unsplash stock photos
 * - Local /images/ placeholders
 * - Any non-Cloudinary URL
 * 
 * Images kept:
 * - Cloudinary uploads (res.cloudinary.com) — these are real user uploads
 */
async function removeStockImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users who have an image set
    const usersWithImages = await User.find({ image: { $ne: null, $exists: true, $ne: '' } });
    console.log(`\nFound ${usersWithImages.length} users with images.\n`);

    let removedCount = 0;
    let keptCount = 0;

    for (const user of usersWithImages) {
      const img = user.image;

      // Keep only Cloudinary-uploaded images (real user uploads)
      const isRealUpload = img && img.includes('cloudinary.com');

      if (isRealUpload) {
        console.log(`✅ KEPT (real upload): ${user.firstName} ${user.lastName} [${user.memberId}] → ${img.substring(0, 60)}...`);
        keptCount++;
      } else {
        // Remove stock/unsplash/local placeholder images
        await User.updateOne({ _id: user._id }, { $set: { image: null } });
        console.log(`🗑️  REMOVED: ${user.firstName} ${user.lastName} [${user.memberId}] → ${img.substring(0, 60)}...`);
        removedCount++;
      }
    }

    console.log(`\n========== SUMMARY ==========`);
    console.log(`Total users with images: ${usersWithImages.length}`);
    console.log(`Stock images removed: ${removedCount}`);
    console.log(`Real uploads kept: ${keptCount}`);
    console.log(`==============================\n`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

removeStockImages();
