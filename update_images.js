import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './api/models/User.js';

// Male stock photos (professional headshots from Unsplash)
const maleImages = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1548449112-96a38a643324?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1596075780750-81249df16d19?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1578176603894-57973e38890f?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&h=400&q=80',
];

// Female stock photos (professional headshots from Unsplash)
const femaleImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&h=400&q=80',
];

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users without images (excluding admin)
    const males = await User.find({ gender: 'Male', role: { $ne: 'admin' }, $or: [{ image: null }, { image: '' }, { image: { $exists: false } }] });
    const females = await User.find({ gender: 'Female', $or: [{ image: null }, { image: '' }, { image: { $exists: false } }] });

    // Also update males who already have images (to ensure all have good ones)
    const allMales = await User.find({ gender: 'Male', role: { $ne: 'admin' } });
    const allFemales = await User.find({ gender: 'Female' });

    console.log(`👤 Updating ${allMales.length} male profiles with images...\n`);
    for (let i = 0; i < allMales.length; i++) {
      const img = maleImages[i % maleImages.length];
      await User.updateOne({ _id: allMales[i]._id }, { $set: { image: img } });
      console.log(`  ✅ ${allMales[i].firstName} ${allMales[i].lastName} → image set`);
    }

    console.log(`\n👩 Updating ${allFemales.length} female profiles with images...\n`);
    for (let i = 0; i < allFemales.length; i++) {
      const img = femaleImages[i % femaleImages.length];
      await User.updateOne({ _id: allFemales[i]._id }, { $set: { image: img } });
      console.log(`  ✅ ${allFemales[i].firstName} ${allFemales[i].lastName} → image set`);
    }

    const totalUpdated = allMales.length + allFemales.length;
    console.log(`\n📊 Updated ${totalUpdated} profiles with images.`);
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateImages();
