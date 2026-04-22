import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './api/models/User.js';

const MONGODB_URI = 'mongodb+srv://coastalshaadi_db_user:***REMOVED***@cluster0.jwwbkbc.mongodb.net/coastalshaadi?retryWrites=true&w=majority&appName=Cluster0';

const initialMembers = [
  {
    id: '2068045659',
    name: 'Malcolm Pinto',
    type: 'Free',
    age: 31,
    height: '5.9',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Software Engineer',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangalore',
    location: 'Mangalore, India',
    image: null
  },
  {
    id: '2068045660',
    name: 'Lloyd Dmello',
    type: 'Free',
    age: 31,
    height: '5.8',
    religion: 'Christian',
    caste: 'Syrian Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Banker',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    location: 'Mumbai, India',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: '2068045661',
    name: 'Neil Coelho',
    type: 'Free',
    age: 29,
    height: '6.0',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Goan',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Architect',
    country: 'UAE',
    state: 'Dubai',
    city: 'Dubai',
    location: 'Dubai, UAE',
    image: null
  },
  {
    id: '2068045662',
    name: 'Criston Dsouza',
    type: 'Premium',
    age: 27,
    height: '5.10',
    religion: 'Christian',
    caste: 'Protestant',
    subCaste: '-',
    language: 'English',
    maritalStatus: 'Never Married',
    profession: 'Business Owner',
    country: 'India',
    state: 'Karnataka',
    city: 'Udupi',
    location: 'Udupi, India',
    image: null
  },
  {
    id: '2068045663',
    name: 'Russel Martis',
    type: 'Free',
    age: 34,
    height: '5.7',
    religion: 'Hindu',
    caste: 'Bunt',
    subCaste: 'Nadava',
    language: 'Tulu',
    maritalStatus: 'Divorced',
    profession: 'Marketing Lead',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    location: 'Bangalore, India',
    image: null
  },
  {
    id: '2068045664',
    name: 'Allan Lloyd Fernandes',
    type: 'Premium',
    age: 31,
    height: '6.0',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Doctor',
    country: 'United Kingdom',
    state: 'England',
    city: 'London',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: '2068045670',
    name: 'Preetham Rofuf Dsouza',
    type: 'Premium',
    age: 33,
    height: '5.9',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Goan',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Chef',
    country: 'India',
    state: 'Goa',
    city: 'Panaji',
    location: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80'
  },
  {
    id: '2068045671',
    name: 'Sachin Shenoy',
    type: 'Free',
    age: 28,
    height: '5.6',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    subCaste: 'Shivalli',
    language: 'Tulu',
    maritalStatus: 'Never Married',
    profession: 'Civil Engineer',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangalore',
    location: 'Mangalore, India',
    image: null
  },
  {
    id: '2068045672',
    name: 'Rohan Hegde',
    type: 'Premium',
    age: 30,
    height: '5.11',
    religion: 'Hindu',
    caste: 'Bunt',
    subCaste: 'Havyaka',
    language: 'Kannada',
    maritalStatus: 'Never Married',
    profession: 'Data Scientist',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    location: 'Bangalore, India',
    image: null
  },
  {
    id: '2068045673',
    name: 'Ravi Kumar',
    type: 'Free',
    age: 26,
    height: '5.8',
    religion: 'Hindu',
    caste: 'Billava',
    subCaste: '-',
    language: 'Tulu',
    maritalStatus: 'Never Married',
    profession: 'Teacher',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangalore',
    location: 'Mangalore, India',
    image: null
  },
  {
    id: '2068045674',
    name: 'Vivek Kamath',
    type: 'Free',
    age: 35,
    height: '5.7',
    religion: 'Hindu',
    caste: 'Brahmin (GSB)',
    subCaste: 'Saraswat',
    language: 'Konkani',
    maritalStatus: 'Widowed',
    profession: 'Chartered Accountant',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    location: 'Pune, India',
    image: null
  },
  {
    id: '2068045675',
    name: 'Derek Lobo',
    type: 'Premium',
    age: 29,
    height: '6.1',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: 'Mangalorean',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Pilot',
    country: 'UAE',
    state: 'Abu Dhabi',
    city: 'Abu Dhabi',
    location: 'Abu Dhabi, UAE',
    image: null
  },
  {
    id: '2068045676',
    name: 'Rashmi S Mogaveera',
    type: 'Free',
    age: 28,
    height: '5.2',
    religion: 'Hindu',
    caste: 'Mogaveera',
    subCaste: '-',
    language: 'Kannada',
    maritalStatus: 'Never Married',
    profession: 'Law Firm Employee',
    country: 'India',
    state: 'Karnataka',
    city: 'Kundapura',
    location: 'Kundapura, India',
    image: null
  },
  {
    id: '2068045677',
    name: 'Kanyakumari',
    type: 'Premium',
    age: 30,
    height: '5.3',
    religion: 'Hindu',
    caste: 'Mogaveera',
    subCaste: '-',
    language: 'Kannada',
    maritalStatus: 'Never Married',
    profession: 'MA Graduate',
    country: 'India',
    state: 'Karnataka',
    city: 'Kundapura',
    location: 'Kundapura, India',
    image: null
  },
  {
    id: '2068045678',
    name: 'Hitesh A Bangera',
    type: 'Premium',
    age: 29,
    height: '5.9',
    religion: 'Hindu',
    caste: 'Billava',
    subCaste: '-',
    language: 'Tulu',
    maritalStatus: 'Never Married',
    profession: 'Tech Specialist',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    location: 'Mumbai, India',
    image: null
  },
  {
    id: '2068045679',
    name: 'Joel Fernandes',
    type: 'Premium',
    age: 40,
    height: '5.5',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: '-',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Professional',
    country: 'India',
    state: 'Karnataka',
    city: 'Karkala',
    location: 'Karkala, India',
    image: null
  },
  {
    id: '2068045680',
    name: 'Joyson Madtha',
    type: 'Free',
    age: 18,
    height: '5.6',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: '-',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Student',
    country: 'India',
    state: 'Karnataka',
    city: 'Mangaluru',
    location: 'Mangaluru, India',
    image: null
  },
  {
    id: '2068045681',
    name: 'Rohan Dsouza',
    type: 'Premium',
    age: 30,
    height: '5.9',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: '-',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Professional',
    country: 'United States',
    state: '-',
    city: '-',
    location: 'United States',
    image: null
  },
  {
    id: '2068045682',
    name: 'Elwin Fernandes',
    type: 'Free',
    age: 28,
    height: '5.7',
    religion: 'Christian',
    caste: 'Roman Catholic',
    subCaste: '-',
    language: 'Konkani',
    maritalStatus: 'Never Married',
    profession: 'Professional',
    country: 'India',
    state: '-',
    city: '-',
    location: 'India',
    image: null
  }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected to seed data');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (let i = 0; i < initialMembers.length; i++) {
      const member = initialMembers[i];
      const names = member.name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '-';
      
      const email = `${firstName.toLowerCase()}.${member.id}@example.com`;
      const phone = `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const newUser = new User({
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          gender: 'Male', // Just default
          dob: '',
          onBehalf: 'Self',
          religion: member.religion,
          caste: member.caste,
          memberId: 'CS-' + member.id,
          image: member.image,
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
            aboutMe: 'This is a test profile created from dummy data.',
            diet: 'Non-Vegetarian'
          }
        });
        
        await newUser.save();
        console.log(`Created user: ${member.name}`);
      } else {
        console.log(`User already exists: ${member.name}`);
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
}

seedDB();
