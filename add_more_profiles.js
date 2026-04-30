import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './api/models/User.js';

const newMales = [
  {
    firstName: 'Pranav',
    lastName: 'Shetty',
    email: 'pranav.shetty@example.com',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Bunt',
    profileData: {
      age: 30,
      height: '5.11',
      subCaste: 'Nadava',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Business Analyst',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      location: 'Bangalore, India',
      aboutMe: 'Business analyst at a multinational firm. Originally from Puttur, now settled in Bangalore. I enjoy cricket, travelling, and Tulu cinema. Looking for a well-educated partner from a good family.',
      diet: 'Non-Vegetarian',
      education: 'MBA - Christ University Bangalore',
      annualIncome: '15-20 LPA'
    }
  },
  {
    firstName: 'Vineeth',
    lastName: 'Kudva',
    email: 'vineeth.kudva@example.com',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    profileData: {
      age: 33,
      height: '5.9',
      subCaste: 'Saraswat',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Senior Software Engineer',
      country: 'United States',
      state: 'California',
      city: 'San Jose',
      location: 'San Jose, USA',
      aboutMe: 'GSB Konkani boy working as a senior software engineer in Silicon Valley. Rooted in Udupi traditions despite living abroad. Looking for a homely and educated life partner.',
      diet: 'Vegetarian',
      education: 'M.S. Computer Science - San Jose State University',
      annualIncome: '60-80 LPA'
    }
  },
  {
    firstName: 'Royston',
    lastName: 'Dsouza',
    email: 'royston.dsouza@example.com',
    gender: 'Male',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 29,
      height: '5.10',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Merchant Navy Officer',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Third officer in the merchant navy. From Bondel, Mangalore. Active in parish youth activities when ashore. Seeking a God-fearing Mangalorean Catholic bride.',
      diet: 'Non-Vegetarian',
      education: 'B.Sc Nautical Science - IMU Chennai',
      annualIncome: '20-30 LPA'
    }
  },
  {
    firstName: 'Harshith',
    lastName: 'Gowda',
    email: 'harshith.gowda@example.com',
    gender: 'Male',
    religion: 'Hindu',
    caste: 'Mogaveera',
    profileData: {
      age: 28,
      height: '5.8',
      subCaste: '-',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Bank Manager',
      country: 'India',
      state: 'Karnataka',
      city: 'Kundapura',
      location: 'Kundapura, India',
      aboutMe: 'Working as a branch manager at a nationalized bank in Kundapura. I come from a well-respected Mogaveera family. Enjoy fishing, gardening, and community festivals.',
      diet: 'Non-Vegetarian',
      education: 'M.Com - Mangalore University',
      annualIncome: '10-15 LPA'
    }
  },
  {
    firstName: 'Alwyn',
    lastName: 'Menezes',
    email: 'alwyn.menezes@example.com',
    gender: 'Male',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 31,
      height: '6.1',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Dentist',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Practising dentist with my own clinic in Hampankatta, Mangalore. From Kulshekar parish. Music lover, choir member, and an avid reader. Seeking a loving and caring partner.',
      diet: 'Non-Vegetarian',
      education: 'BDS - AJ Institute of Dental Sciences',
      annualIncome: '15-25 LPA'
    }
  }
];

const newFemales = [
  {
    firstName: 'Swathi',
    lastName: 'Nayak',
    email: 'swathi.nayak@example.com',
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Bunt',
    profileData: {
      age: 27,
      height: '5.5',
      subCaste: 'Nadava',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Fashion Designer',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Fashion designer running my own boutique in Mangalore. Born and brought up in Surathkal. I love traditional Tulu culture, Yakshagana, and travelling. Seeking a well-settled groom.',
      diet: 'Non-Vegetarian',
      education: 'B.Des Fashion - NIFT Bangalore',
      annualIncome: '10-15 LPA'
    }
  },
  {
    firstName: 'Flavia',
    lastName: 'Pereira',
    email: 'flavia.pereira@example.com',
    gender: 'Female',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 26,
      height: '5.4',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Chartered Accountant',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      location: 'Bangalore, India',
      aboutMe: 'CA working at a Big 4 firm in Bangalore. From Cordel parish, Mangalore. I enjoy baking, singing in the choir, and volunteering. Looking for a responsible and family-oriented partner.',
      diet: 'Non-Vegetarian',
      education: 'CA, B.Com - St. Aloysius College Mangalore',
      annualIncome: '18-25 LPA'
    }
  },
  {
    firstName: 'Raksha',
    lastName: 'Kamath',
    email: 'raksha.kamath@example.com',
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    profileData: {
      age: 28,
      height: '5.3',
      subCaste: 'Shivalli',
      motherTongue: 'Kannada',
      maritalStatus: 'Never Married',
      profession: 'Data Scientist',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      location: 'Bangalore, India',
      aboutMe: 'Data scientist at a top analytics firm. From a traditional GSB family in Udupi. I practice yoga daily, love cooking Udupi cuisine, and enjoy classical Carnatic music. Seeking a compatible partner.',
      diet: 'Vegetarian',
      education: 'M.Tech Data Science - IISc Bangalore',
      annualIncome: '20-30 LPA'
    }
  },
  {
    firstName: 'Janice',
    lastName: 'Fernandes',
    email: 'janice.fernandes@example.com',
    gender: 'Female',
    religion: 'Christian',
    caste: 'Roman Catholic',
    profileData: {
      age: 29,
      height: '5.6',
      subCaste: 'Mangalorean',
      motherTongue: 'Konkani',
      maritalStatus: 'Never Married',
      profession: 'Architect',
      country: 'UAE',
      state: 'Dubai',
      city: 'Dubai',
      location: 'Dubai, UAE',
      aboutMe: 'Licensed architect working at a leading firm in Dubai. From Bejai, Mangalore. Active member of the Konkani community in UAE. Looking for a mature, well-settled partner.',
      diet: 'Non-Vegetarian',
      education: 'B.Arch - Manipal Institute of Technology',
      annualIncome: '30-40 LPA'
    }
  },
  {
    firstName: 'Ananya',
    lastName: 'Bangera',
    email: 'ananya.bangera@example.com',
    gender: 'Female',
    religion: 'Hindu',
    caste: 'Billava',
    profileData: {
      age: 25,
      height: '5.4',
      subCaste: '-',
      motherTongue: 'Tulu',
      maritalStatus: 'Never Married',
      profession: 'Doctor (MBBS)',
      country: 'India',
      state: 'Karnataka',
      city: 'Mangalore',
      location: 'Mangalore, India',
      aboutMe: 'Junior resident doctor at a government hospital. From a well-educated Billava family in Mulki. I believe in simple living and high thinking. Looking for a kind and supportive life partner.',
      diet: 'Non-Vegetarian',
      education: 'MBBS - KMC Mangalore',
      annualIncome: '8-12 LPA'
    }
  }
];

async function addProfiles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('👤 Adding 5 new male profiles...\n');
    for (const m of newMales) {
      const exists = await User.findOne({ email: m.email });
      if (exists) { console.log(`  ⏭️  Already exists: ${m.firstName} ${m.lastName}`); continue; }
      const dob = getRandomDOB(m.profileData.age);
      await User.create({
        firstName: m.firstName, lastName: m.lastName, email: m.email,
        phone: '+91 ' + Math.floor(7000000000 + Math.random() * 3000000000),
        password: hashedPassword, gender: m.gender, dob, onBehalf: 'Self',
        religion: m.religion, caste: m.caste,
        memberId: 'CS-M-' + Math.floor(10000 + Math.random() * 90000),
        image: null, role: 'user', status: 'approved', memberType: 'Free',
        profileData: m.profileData
      });
      console.log(`  ✅ ${m.firstName} ${m.lastName} — ${m.religion} / ${m.caste} / ${m.profileData.profession}`);
    }

    console.log('\n👩 Adding 5 new female profiles...\n');
    for (const f of newFemales) {
      const exists = await User.findOne({ email: f.email });
      if (exists) { console.log(`  ⏭️  Already exists: ${f.firstName} ${f.lastName}`); continue; }
      const dob = getRandomDOB(f.profileData.age);
      await User.create({
        firstName: f.firstName, lastName: f.lastName, email: f.email,
        phone: '+91 ' + Math.floor(7000000000 + Math.random() * 3000000000),
        password: hashedPassword, gender: f.gender, dob, onBehalf: 'Self',
        religion: f.religion, caste: f.caste,
        memberId: 'CS-F-' + Math.floor(10000 + Math.random() * 90000),
        image: null, role: 'user', status: 'approved', memberType: 'Free',
        profileData: f.profileData
      });
      console.log(`  ✅ ${f.firstName} ${f.lastName} — ${f.religion} / ${f.caste} / ${f.profileData.profession}`);
    }

    const total = await User.countDocuments();
    const males = await User.countDocuments({ gender: 'Male' });
    const females = await User.countDocuments({ gender: 'Female' });
    console.log(`\n📊 Total Users: ${total} | Male: ${males} | Female: ${females}`);
    console.log('✅ Done!');
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

addProfiles();
