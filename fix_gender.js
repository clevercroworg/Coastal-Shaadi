import mongoose from 'mongoose';
import User from './api/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  const femaleNames = ['Rashmi', 'Kanyakumari'];
  
  const users = await User.find({});
  for (const u of users) {
    let gender = 'Male';
    if (femaleNames.some(n => u.firstName.includes(n))) {
      gender = 'Female';
    }
    
    // Also clear out unsplash images so our new defaults kick in
    let image = u.image;
    if (image && image.includes('unsplash')) {
      image = null;
    }

    await User.findByIdAndUpdate(u._id, { gender, image });
  }
  console.log('Fixed genders and cleared unsplash images.');
  process.exit(0);
}
run();
