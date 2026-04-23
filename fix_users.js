import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './api/models/User.js';

dotenv.config();

const fixLegacyUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Update all users who don't have the role field
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user', status: 'pending' } }
    );
    
    console.log(`Updated ${result.modifiedCount} legacy users with default role and status.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixLegacyUsers();
