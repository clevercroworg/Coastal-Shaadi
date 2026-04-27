import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  gender: { type: String },
  dob: { type: String },
  onBehalf: { type: String },
  religion: { type: String },
  caste: { type: String },
  memberId: { type: String, unique: true },
  profileData: { type: Object, default: {} },
  image: { type: String },
  whatsappNumber: { type: String },
  whatsappConsent: { type: Boolean, default: false },
  memberType: { type: String, enum: ['Free', 'Basic', 'Premium', 'Elite'], default: 'Free' },
  planExpiry: { type: Date },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
  lastSeen: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
