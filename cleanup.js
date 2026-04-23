import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './api/models/User.js';
import Connection from './api/models/Connection.js';
import Conversation from './api/models/Conversation.js';
import Message from './api/models/Message.js';

dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete all non-admin users
    const users = await User.find({ role: { $ne: 'admin' } });
    console.log(`Found ${users.length} non-admin user(s) to delete:`);
    for (const u of users) {
      console.log(`  - ${u.email} (${u.firstName} ${u.lastName})`);
    }

    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Deleted all non-admin users.');

    // Clean up all connections, conversations, and messages
    const connDel = await Connection.deleteMany({});
    const convDel = await Conversation.deleteMany({});
    const msgDel = await Message.deleteMany({});
    console.log(`Deleted ${connDel.deletedCount} connections, ${convDel.deletedCount} conversations, ${msgDel.deletedCount} messages.`);

    // Show remaining users
    const remaining = await User.find({});
    console.log(`\nRemaining users (${remaining.length}):`);
    for (const u of remaining) {
      console.log(`  - ${u.email} (role: ${u.role})`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanup();
