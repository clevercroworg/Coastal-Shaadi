import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './api/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI;

// ─── 5 NEW MALE PROFILES (Hindu + Christian, South Indian Karnataka) ─────────
const newMales = [
  {
    firstName: 'Adarsh',
    lastName: 'Nayak',
    email: 'adarsh.nayak@example.com',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Bunt',
    profileData: {
      age: 29,
      height: '5.10',
      subCaste: 'Nadava',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Product Manager',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'I am a product manager working in a leading tech company. Passionate about innovation, fitness, and family values. Looking for a partner who shares similar cultural roots.',
      diet: 'Non-Vegetarian',
      education: 'MBA - IIM Bangalore',
      annualIncome: '18-25 LPA'
    }
  },
  {
    firstName: 'Karthik',
    lastName: 'Bhat',
    email: 'karthik.bhat@example.com',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    profileData: {
      age: 31,
      height: '5.8',
      subCaste: 'Shivalli',
      motherTongue: 'Kannada',
      maritalStatus: 'Never Married',
      profession: 'Chartered Accountant',
      country: 'India',
      state: 'Karnataka',
      city: 'Udupi',
      location: 'Udupi, India',
      aboutMe: 'A practicing CA based in Udupi with deep-rooted values. I enjoy reading, temple visits, and cooking traditional Udupi cuisine. Seeking a life partner who values tradition and education.',
      diet: 'Vegetarian',
      education: 'CA, B.Com - SDM College Mangalore',
      annualIncome: '12-18 LPA'
    }
  },
  {
    firstName: 'Melwin',
    lastName: 'Rodrigues',
    email: 'melwin.rodrigues@example.com',
    gender: 'Male',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 28,
      height: '5.11',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Civil Engineer',
      country: 'UAE',
      state: 'Dubai',
      city: 'Dubai',
      location: 'Dubai, UAE',
      aboutMe: 'Mangalorean Catholic working as a civil engineer in Dubai. Family-oriented, active parish member, and love playing football on weekends. Looking for a God-fearing life partner.',
      diet: 'Non-Vegetarian',
      education: 'B.E. Civil - NMAMIT Nitte',
      annualIncome: '25-35 LPA'
    }
  },
  {
    firstName: 'Sumanth',
    lastName: 'Poojary',
    email: 'sumanth.poojary@example.com',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Billava',
    profileData: {
      age: 27,
      height: '5.9',
      subCaste: '-',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Mechanical Engineer',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Working as a mechanical engineer in an automobile firm. I come from a well-educated family in Bantwal. My hobbies include trekking in the Western Ghats and photography.',
      diet: 'Non-Vegetarian',
      education: 'B.E. Mechanical - Canara Engineering College',
      annualIncome: '8-12 LPA'
    }
  },
  {
    firstName: 'Ashwin',
    lastName: 'Mascarenhas',
    email: 'ashwin.mascarenhas@example.com',
    gender: 'Male',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 32,
      height: '6.0',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Doctor (MBBS, MD)',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      location: 'Bangalore, India',
      aboutMe: 'I am a physician working at a reputed hospital in Bangalore. Originally from Mangalore, I maintain close ties with my family and community. Looking for a kind-hearted and educated partner.',
      diet: 'Non-Vegetarian',
      education: 'MBBS, MD - Kasturba Medical College Mangalore',
      annualIncome: '25-40 LPA'
    }
  }
];

// ─── 5 NEW FEMALE PROFILES (Hindu + Christian, South Indian Karnataka) ───────
const newFemales = [
  {
    firstName: 'Akshatha',
    lastName: 'Rai',
    email: 'akshatha.rai@example.com',
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Bunt',
    profileData: {
      age: 26,
      height: '5.4',
      subCaste: 'Nadava',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Software Engineer',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      location: 'Bangalore, India',
      aboutMe: 'Software engineer at a top IT firm. Born and raised in Mangalore, currently in Bangalore. I enjoy bharatanatyam, cooking, and spending time with family. Seeking a well-settled partner.',
      diet: 'Non-Vegetarian',
      education: 'B.E. Computer Science - NITK Surathkal',
      annualIncome: '12-18 LPA'
    }
  },
  {
    firstName: 'Lavita',
    lastName: 'Pinto',
    email: 'lavita.pinto@example.com',
    gender: 'Female',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 27,
      height: '5.5',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Nurse',
      country: 'United Kingdom',
      state: 'England',
      city: 'London',
      location: 'London, UK',
      aboutMe: 'Mangalorean Catholic nurse working in London. Active in the Konkani community abroad. Looking for a partner who values faith, family, and cultural heritage.',
      diet: 'Non-Vegetarian',
      education: 'B.Sc Nursing - Father Muller Mangalore',
      annualIncome: '30-40 LPA'
    }
  },
  {
    firstName: 'Deepika',
    lastName: 'Hegde',
    email: 'deepika.hegde@example.com',
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    profileData: {
      age: 25,
      height: '5.3',
      subCaste: 'Havyaka',
      motherTongue: 'Kannada',
      maritalStatus: 'Never Married',
      profession: 'Teacher',
      country: 'India',
      state: 'Karnataka',
      city: 'Udupi',
      location: 'Udupi, India',
      aboutMe: 'I teach at a reputed school in Udupi. I come from a traditional Havyaka Brahmin family. My hobbies include rangoli, classical music, and yoga. Looking for a well-educated groom.',
      diet: 'Vegetarian',
      education: 'M.A. English - Mangalore University',
      annualIncome: '5-8 LPA'
    }
  },
  {
    firstName: 'Preethi',
    lastName: 'Lobo',
    email: 'preethi.lobo@example.com',
    gender: 'Female',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 28,
      height: '5.6',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Interior Designer',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Freelance interior designer based in Mangalore. I love art, travel, and community service at our parish. Seeking a caring and family-oriented partner.',
      diet: 'Non-Vegetarian',
      education: 'B.Des Interior Design - Srishti Bangalore',
      annualIncome: '10-15 LPA'
    }
  },
  {
    firstName: 'Chaitra',
    lastName: 'Shenoy',
    email: 'chaitra.shenoy@example.com',
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    profileData: {
      age: 26,
      height: '5.4',
      subCaste: 'Saraswat',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Pharmacist',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Pharmacist working at a well-known hospital in Mangalore. Raised in a traditional GSB family. I enjoy cooking, reading, and visiting temples. Looking for a compatible life partner.',
      diet: 'Vegetarian',
      education: 'Pharm.D - Manipal College of Pharmaceutical Sciences',
      annualIncome: '8-12 LPA'
    }
  }
];

async function cleanupAndSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ─── STEP 1: Delete non-example, non-admin users ──────────────────────────
    console.log('🗑️  Removing test/manual users (keeping @example.com & admin)...\n');

    const usersToDelete = await User.find({
      email: { $not: /@example\.com$/ },
      role: { $ne: 'admin' }
    }).select('firstName lastName email').lean();

    if (usersToDelete.length > 0) {
      for (const u of usersToDelete) {
        console.log(`  ❌ Deleting: ${u.firstName} ${u.lastName} (${u.email})`);
      }
      await User.deleteMany({
        email: { $not: /@example\.com$/ },
        role: { $ne: 'admin' }
      });
      console.log(`\n  Deleted ${usersToDelete.length} users.\n`);
    } else {
      console.log('  No users to delete.\n');
    }

    // ─── STEP 2: Add new male + female profiles ──────────────────────────────
    console.log('👤 Adding new male profiles...\n');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (const member of newMales) {
      const existing = await User.findOne({ email: member.email });
      if (existing) {
        console.log(`  ⏭️  Already exists: ${member.firstName} ${member.lastName}`);
        continue;
      }
      const memberId = 'CS-M-' + Math.floor(10000 + Math.random() * 90000);
      const phone = '+91 ' + Math.floor(7000000000 + Math.random() * 3000000000);
      const dob = getRandomDOB(member.profileData.age);

      await User.create({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone,
        password: hashedPassword,
        gender: member.gender,
        dob,
        onBehalf: 'Self',
        religion: member.religion,
        caste: member.caste,
        memberId,
        image: null,
        role: 'user',
        status: 'approved',
        memberType: 'Free',
        profileData: member.profileData
      });
      console.log(`  ✅ Created: ${member.firstName} ${member.lastName} (${member.religion} - ${member.caste})`);
    }

    console.log('\n👩 Adding new female profiles...\n');

    for (const member of newFemales) {
      const existing = await User.findOne({ email: member.email });
      if (existing) {
        console.log(`  ⏭️  Already exists: ${member.firstName} ${member.lastName}`);
        continue;
      }
      const memberId = 'CS-F-' + Math.floor(10000 + Math.random() * 90000);
      const phone = '+91 ' + Math.floor(7000000000 + Math.random() * 3000000000);
      const dob = getRandomDOB(member.profileData.age);

      await User.create({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone,
        password: hashedPassword,
        gender: member.gender,
        dob,
        onBehalf: 'Self',
        religion: member.religion,
        caste: member.caste,
        memberId,
        image: null,
        role: 'user',
        status: 'approved',
        memberType: 'Free',
        profileData: member.profileData
      });
      console.log(`  ✅ Created: ${member.firstName} ${member.lastName} (${member.religion} - ${member.caste})`);
    }

    // ─── STEP 3: Final summary ────────────────────────────────────────────────
    const totalUsers = await User.countDocuments();
    const males = await User.countDocuments({ gender: 'Male' });
    const females = await User.countDocuments({ gender: 'Female' });
    const hindus = await User.countDocuments({ religion: 'Hindu' });
    const christians = await User.countDocuments({ religion: 'Christian' });

    console.log('\n' + '='.join ? '=' : '═'.repeat(60));
    console.log(`\n📊 Final Database Summary:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Male: ${males} | Female: ${females}`);
    console.log(`   Hindu: ${hindus} | Christian: ${christians}`);
    console.log(`\n✅ Cleanup & seeding complete!`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

function getRandomDOB(age) {
  const year = new Date().getFullYear() - age;
  const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const day = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

cleanupAndSeed();
