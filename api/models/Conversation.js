import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
