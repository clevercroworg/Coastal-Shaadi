import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './api/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected to create admin');

    const email = 'costalshaadi@gmail.com';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error('Set ADMIN_PASSWORD in .env');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = 'admin';
      admin.status = 'approved';
      admin.password = hashedPassword;
      await admin.save();
      console.log('Existing user updated to admin successfully.');
    } else {
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email,
        phone: '+91 0000000000',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        memberId: 'CS-ADMIN-' + Math.floor(1000 + Math.random() * 9000),
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
