import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import Connection from './models/Connection.js';

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

// Debug: log which env vars are present (not values, just true/false)
console.log('ENV CHECK:', {
  MONGODB_URI: !!MONGODB_URI,
  JWT_SECRET: !!JWT_SECRET,
  CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME
});

// Connect to MongoDB with error handling
let dbConnected = false;
mongoose.connect(MONGODB_URI || '')
  .then(() => { dbConnected = true; console.log('MongoDB Connected'); })
  .catch(err => console.error('MongoDB Connection Error:', err.message));

// Health check endpoint for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected,
    mongoState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting
    envVars: {
      MONGODB_URI: !!MONGODB_URI,
      JWT_SECRET: !!JWT_SECRET,
      CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET,
      CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
      CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME
    }
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, gender, dob, onBehalf, religion, caste } = req.body;
    
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique member ID
    const memberId = 'CS-' + Math.floor(10000000 + Math.random() * 90000000);

    user = new User({
      firstName, lastName, email, phone, password: hashedPassword,
      gender, dob, onBehalf, religion, caste, memberId
    });

    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, firstName, lastName, email, religion, caste, memberId } });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, religion: user.religion, caste: user.caste, memberId: user.memberId, profileData: user.profileData, image: user.image } });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const { userId, profileData, image } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ memberId: userId });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {};
    if (profileData) {
      updateData.profileData = { ...user.profileData, ...profileData };
    }
    if (image !== undefined) updateData.image = image;

    const updatedUser = await User.findOneAndUpdate({ _id: user._id }, updateData, { new: true });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id).select('-password');
    } else {
      user = await User.findOne({ memberId: req.params.id }).select('-password');
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

import crypto from 'crypto';

app.get('/api/cloudinary-signature', (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = CLOUDINARY_API_SECRET;
  const { public_id } = req.query;
  
  let signatureStr = '';
  if (public_id) {
    signatureStr = `invalidate=true&public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
  } else {
    signatureStr = `timestamp=${timestamp}${apiSecret}`;
  }
  
  const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
  res.json({ timestamp, signature, apiKey: CLOUDINARY_API_KEY, cloudName: CLOUDINARY_CLOUD_NAME });
});

app.get('/api/members', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    console.log(`\n\n=== PASSWORD RESET OTP FOR ${email}: ${otp} ===\n\n`);

    res.json({ message: 'OTP generated successfully. (Check the backend terminal console to see the OTP)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ 
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CHAT / MESSAGING API ==========

// Get all conversations for a user
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId
    }).populate('participants', 'firstName lastName image memberId').sort({ lastMessageTime: -1 });

    // For each conversation, get unread count
    const convsWithUnread = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: req.params.userId },
        read: false
      });
      return { ...conv.toObject(), unreadCount };
    }));

    res.json(convsWithUnread);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start or get existing conversation between two users
app.post('/api/conversations', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('participants', 'firstName lastName image memberId');

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId]
      });
      await conversation.save();
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName image memberId');
    }

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
app.post('/api/messages', async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    const message = new Message({ conversationId, senderId, text });
    await message.save();

    // Update the conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageTime: new Date()
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
app.put('/api/messages/read', async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find user by memberId (for starting chat from member card)
app.get('/api/user-by-member/:memberId', async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.params.memberId }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CONNECTION / INTEREST API ==========

// Send interest
app.post('/api/connections/send', async (req, res) => {
  try {
    const { senderId, receiverMemberId } = req.body;
    const receiver = await User.findOne({ memberId: receiverMemberId });
    if (!receiver) return res.status(404).json({ message: 'User not found' });
    if (receiver._id.toString() === senderId) return res.status(400).json({ message: 'Cannot send interest to yourself' });

    // Check if connection already exists (in either direction)
    const existing = await Connection.findOne({
      $or: [
        { senderId, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: senderId }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: 'Interest already sent or received', connection: existing });
    }

    const connection = new Connection({ senderId, receiverId: receiver._id });
    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent interests
app.get('/api/connections/sent/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({ senderId: req.params.userId })
      .populate('receiverId', 'firstName lastName image memberId religion caste profileData')
      .sort({ createdAt: -1 });
    res.json(connections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received interests
app.get('/api/connections/received/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({ receiverId: req.params.userId })
      .populate('senderId', 'firstName lastName image memberId religion caste profileData')
      .sort({ createdAt: -1 });
    res.json(connections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept interest
app.put('/api/connections/:id/accept', async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    connection.status = 'accepted';
    await connection.save();

    // Auto-create a conversation between them
    let conversation = await Conversation.findOne({
      participants: { $all: [connection.senderId, connection.receiverId] }
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [connection.senderId, connection.receiverId]
      });
      await conversation.save();
    }

    res.json({ message: 'Interest accepted! You can now chat.', connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline interest
app.put('/api/connections/:id/decline', async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    connection.status = 'declined';
    await connection.save();
    res.json({ message: 'Interest declined', connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get accepted matches (for chat access check)
app.get('/api/connections/matches/:userId', async (req, res) => {
  try {
    const matches = await Connection.find({
      $or: [
        { senderId: req.params.userId, status: 'accepted' },
        { receiverId: req.params.userId, status: 'accepted' }
      ]
    }).populate('senderId', 'firstName lastName image memberId')
      .populate('receiverId', 'firstName lastName image memberId');
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check connection status between two users
app.get('/api/connections/status/:userId/:memberId', async (req, res) => {
  try {
    const otherUser = await User.findOne({ memberId: req.params.memberId });
    if (!otherUser) return res.json({ status: 'none' });

    const connection = await Connection.findOne({
      $or: [
        { senderId: req.params.userId, receiverId: otherUser._id },
        { senderId: otherUser._id, receiverId: req.params.userId }
      ]
    });

    if (!connection) return res.json({ status: 'none' });
    res.json({ status: connection.status, direction: connection.senderId.toString() === req.params.userId ? 'sent' : 'received', connectionId: connection._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ONLINE TRACKING ==========

// Heartbeat - update lastSeen
app.put('/api/heartbeat', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online status of a user
app.get('/api/online/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('lastSeen');
    if (!user) return res.json({ online: false });
    const isOnline = (Date.now() - new Date(user.lastSeen).getTime()) < 60000; // 60 seconds
    res.json({ online: isOnline, lastSeen: user.lastSeen });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
