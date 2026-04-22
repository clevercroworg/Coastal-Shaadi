import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String },
  dob: { type: String },
  onBehalf: { type: String },
  religion: { type: String },
  caste: { type: String },
  memberId: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
