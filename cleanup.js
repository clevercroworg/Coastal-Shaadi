import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './api/models/User.js';
import Connection from './api/models/Connection.js';
import Conversation from './api/models/Conversation.js';
import Message from './api/models/Message.js';

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const conversations = await Conversation.find();
  let deletedCount = 0;
  
  for (let conv of conversations) {
    if (conv.participants.length < 2) continue;
    const p1 = conv.participants[0];
    const p2 = conv.participants[1];
    
    // Check if there's an accepted connection
    const connection = await Connection.findOne({
      $or: [
        { senderId: p1, receiverId: p2, status: 'accepted' },
        { senderId: p2, receiverId: p1, status: 'accepted' }
      ]
    });
    
    if (!connection) {
      console.log(`Deleting invalid conversation ${conv._id} between ${p1} and ${p2}`);
      await Message.deleteMany({ conversationId: conv._id });
      await Conversation.findByIdAndDelete(conv._id);
      deletedCount++;
    }
  }
  
  console.log(`Cleanup complete. Deleted ${deletedCount} invalid conversations.`);
  process.exit(0);
}
cleanup();
