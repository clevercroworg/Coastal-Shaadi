import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String },
  dob: { type: String },
  onBehalf: { type: String },
  religion: { type: String },
  caste: { type: String },
  memberId: { type: String, unique: true },
  profileData: { type: Object, default: {} },
  image: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
