import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { timestamps: true });

// Prevent duplicate connection requests
connectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.models.Connection || mongoose.model('Connection', connectionSchema);
