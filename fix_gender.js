import mongoose from 'mongoose';
import User from './api/models/User.js';
const MONGODB_URI = 'mongodb+srv://coastalshaadi_db_user:***REMOVED***@cluster0.jwwbkbc.mongodb.net/coastalshaadi?retryWrites=true&w=majority&appName=Cluster0';

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
