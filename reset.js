import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './api/models/User.js';

const MONGODB_URI = 'mongodb+srv://coastalshaadi_db_user:***REMOVED***@cluster0.jwwbkbc.mongodb.net/coastalshaadi?retryWrites=true&w=majority&appName=Cluster0';

async function resetPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const emailsToReset = ['sanjayak581212@gmail.com', 'sanjay@clevercrow.in', 'Rahul2026@gmail.com', 'andreamelissappc@gmail.com'];
    await User.updateMany({ email: { $in: emailsToReset } }, { password: hashedPassword, memberType: 'Elite' });
    
    console.log('Successfully reset passwords for manually created accounts to "password123"');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();
