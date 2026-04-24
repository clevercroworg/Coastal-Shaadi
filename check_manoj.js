import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './api/models/User.js';
import Connection from './api/models/Connection.js';
import Conversation from './api/models/Conversation.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const manoj = await User.findOne({ firstName: /manoj/i, lastName: /vg/i });
  if (!manoj) {
    console.log('Manoj VG not found');
    process.exit(0);
  }
  console.log('Manoj:', manoj.memberId, manoj._id);
  
  const connections = await Connection.find({ $or: [{ senderId: manoj._id }, { receiverId: manoj._id }] }).populate('senderId receiverId', 'firstName lastName');
  console.log('Connections:', JSON.stringify(connections, null, 2));
  
  const conversations = await Conversation.find({ participants: manoj._id });
  console.log('Conversations:', JSON.stringify(conversations, null, 2));
  
  process.exit(0);
}
run();
