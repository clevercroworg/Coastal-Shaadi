import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './api/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://coastalshaadi_db_user:***REMOVED***@cluster0.jwwbkbc.mongodb.net/coastalshaadi?retryWrites=true&w=majority&appName=Cluster0';

const femaleMembers = [
  {
    firstName: 'Sneha',
    lastName: 'Shetty',
    email: 'sneha.shetty@example.com',
    religion: 'Hindu',
    caste: 'Bunt',
    subCaste: 'Nadava',
    language: 'Tulu',
    age: 26,
    height: '5.4',
    maritalStatus: 'Never Married',
    profession: 'Software Developer',
    city: 'Mangalore',
    state: 'Karnataka',
    country: 'India',
    location: 'Mangalore, India'
  },
  {
    firstName: 'Pooja',
    lastName: 'Kini',
    email: 'pooja.kini@example.com',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    subCaste: 'Saraswat',
    language: 'Konkani',
    age: 28,
    height: '5.2',
    maritalStatus: 'Never Married',
    profession: 'Bank Manager',
    city: 'Udupi',
    state: 'Karnataka',
    country: 'India',
    location: 'Udupi, India'
  },
  {
    firstName: 'Michelle',
    lastName: 'Dsilva',
    email: 'michelle.dsilva@example.com',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    age: 27,
    height: '5.5',
    maritalStatus: 'Never Married',
    profession: 'HR Executive',
    city: 'Mangalore',
    state: 'Karnataka',
    country: 'India',
    location: 'Mangalore, India'
  },
  {
    firstName: 'Riya',
    lastName: 'Fernandes',
    email: 'riya.fern@example.com',
    religion: 'Christian',
    caste: 'Syrian Catholic',
    subCaste: '-',
    language: 'English',
    age: 29,
    height: '5.6',
    maritalStatus: 'Never Married',
    profession: 'Nurse',
    city: 'Manipal',
    state: 'Karnataka',
    country: 'India',
    location: 'Manipal, India'
  }
];

async function addFemaleProfiles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (const member of femaleMembers) {
      const existingUser = await User.findOne({ email: member.email });
      if (!existingUser) {
        const newUser = new User({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: '+91 ' + Math.floor(1000000000 + Math.random() * 9000000000),
          password: hashedPassword,
          gender: 'Female',
          role: 'user',
          status: 'approved',
          dob: '',
          onBehalf: 'Self',
          religion: member.religion,
          caste: member.caste,
          memberId: 'CS-F-' + Math.floor(1000 + Math.random() * 9000),
          image: null,
          profileData: {
            age: member.age,
            height: member.height,
            subCaste: member.subCaste,
            motherTongue: member.language,
            maritalStatus: member.maritalStatus,
            profession: member.profession,
            country: member.country,
            state: member.state,
            city: member.city,
            location: member.location,
            aboutMe: 'This is a demo female profile.',
            diet: 'Non-Vegetarian'
          }
        });
        
        await newUser.save();
        console.log(`Created approved female user: ${member.firstName} ${member.lastName}`);
      } else {
        console.log(`User already exists: ${member.firstName} ${member.lastName}`);
      }
    }

    console.log('Added female profiles successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error adding profiles:', err);
    process.exit(1);
  }
}

addFemaleProfiles();
