import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  // select: false keeps secrets out of every query unless explicitly requested
  password: { type: String, required: true, select: false },
  gender: { type: String },
  dob: { type: String },
  onBehalf: { type: String },
  religion: { type: String },
  caste: { type: String },
  memberId: { type: String, unique: true },
  profileData: { type: Object, default: {} },
  image: { type: String },
  additionalImages: { type: [String], default: [] },
  whatsappNumber: { type: String },
  whatsappConsent: { type: Boolean, default: false },
  memberType: { type: String, enum: ['Free', 'Basic', 'Premium', 'Elite'], default: 'Free' },
  planExpiry: { type: Date },
  phonepeTransactionId: { type: String },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  paymentProvider: { type: String },
  resetOtp: { type: String, select: false },
  resetOtpExpires: { type: Date, select: false },
  resetOtpAttempts: { type: Number, default: 0, select: false },
  shortlistedIds: { type: [String], default: [] },
  interestedIds: { type: [String], default: [] },
  ignoredIds: { type: [String], default: [] },
  lastSeen: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
