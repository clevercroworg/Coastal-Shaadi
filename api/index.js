import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import User from './models/User.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import Connection from './models/Connection.js';
import { sendPendingEmail, sendApprovalEmail, sendRejectionEmail, sendAdminNotificationEmail, sendOtpEmail, sendContactEmail, sendPaymentSuccessUserEmail, sendPaymentSuccessAdminEmail } from './utils/email.js';
import crypto from 'crypto';

// Utility to enforce plan expiry
const enforcePlanExpiry = async (user) => {
  if (user && user.memberType !== 'Free' && user.planExpiry && new Date(user.planExpiry) < new Date()) {
    user.memberType = 'Free';
    user.planExpiry = undefined;
    if (user.save) await user.save();
    else await User.updateOne({ _id: user._id || user.id }, { $set: { memberType: 'Free' }, $unset: { planExpiry: '' } });
  }
  return user;
};

const app = express();
app.use(cors());
app.use(express.json());

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || 'M22H0M16HVDZG_2607241133';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || 'MzE1ODAzZTMtZjEzOS00ZmRkLWEzMmItZmEyMjI0MjI3ZmI5';
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'M22H0M16HVDZG';
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || (
  process.env.PHONEPE_ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox'
);

// Helper function to fetch PhonePe OAuth Token
async function getPhonePeOAuthToken() {
  const res = await fetch(`${PHONEPE_HOST_URL}/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: PHONEPE_CLIENT_ID,
      client_secret: PHONEPE_CLIENT_SECRET,
      client_version: PHONEPE_CLIENT_VERSION
    })
  });
  const data = await res.json();
  if (data.access_token) return data.access_token;
  throw new Error(data.message || 'Failed to obtain PhonePe OAuth access token');
}

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Debug: log which env vars are present (not values, just true/false)
console.log('ENV CHECK:', {
  MONGODB_URI: !!MONGODB_URI,
  JWT_SECRET: !!JWT_SECRET,
  CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
  RAZORPAY_KEY_ID: !!RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: !!RAZORPAY_KEY_SECRET,
  PHONEPE_CLIENT_ID: !!PHONEPE_CLIENT_ID,
  PHONEPE_CLIENT_SECRET: !!PHONEPE_CLIENT_SECRET
});

// Serverless-friendly MongoDB Connection Middleware
let cachedDb = null;
const connectDB = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    if (!cachedDb) {
      console.log('Connecting to MongoDB...');
      cachedDb = mongoose.connect(MONGODB_URI || '', {
        serverSelectionTimeoutMS: 5000, // Fail fast if network issues
      });
    }
    await cachedDb;
    next();
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    cachedDb = null;
    return res.status(500).json({ message: 'Database connection failed: ' + err.message });
  }
};
app.use(connectDB);

// Health check endpoint for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
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

// ========== GET CURRENT USER (for polling approval status) ==========
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user = await enforcePlanExpiry(user);
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      religion: user.religion,
      caste: user.caste,
      memberId: user.memberId,
      profileData: user.profileData,
      image: user.image,
      additionalImages: user.additionalImages || [],
      role: user.role,
      status: user.status,
      memberType: user.memberType,
      planExpiry: user.planExpiry,
      whatsappNumber: user.whatsappNumber,
      whatsappConsent: user.whatsappConsent
    });
  } catch (err) {
    console.error('GET /api/me ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !email || !message) {
      return res.status(400).json({ message: 'First name, email, and message are required.' });
    }
    
    await sendContactEmail(firstName, lastName || '', email, message);
    res.status(200).json({ message: 'Contact email sent successfully!' });
  } catch (err) {
    console.error('CONTACT EMAIL ERROR:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, gender, dob, onBehalf, religion, caste } = req.body;
    
    // Normalize and clean inputs to prevent duplicate registrations
    const normalizedEmail = (email || '').toLowerCase().trim();
    const cleanedPhone = (phone || '').replace(/\D/g, '');
    const normalizedPhone = cleanedPhone.length >= 10 ? cleanedPhone.slice(-10) : cleanedPhone;

    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const phoneRegex = new RegExp(normalizedPhone + '$');

    let user = await User.findOne({ 
      $or: [
        { email: emailRegex }, 
        { phone: phoneRegex }
      ] 
    });
    if (user) {
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique member ID with collision retry
    let memberId;
    let attempts = 0;
    while (attempts < 5) {
      memberId = 'CS-' + Math.floor(10000000 + Math.random() * 90000000);
      const exists = await User.findOne({ memberId });
      if (!exists) break;
      attempts++;
      if (attempts >= 5) return res.status(500).json({ message: 'Failed to generate unique ID. Please try again.' });
    }

    user = new User({
      firstName, lastName, email, phone, password: hashedPassword,
      gender, dob, onBehalf, religion, caste, memberId,
      memberType: 'Free',
      planExpiry: null,
      razorpayPaymentId: null,
      razorpayOrderId: null
    });

    await user.save();
    
    // Await emails so Vercel doesn't kill the function before they send
    try {
      await Promise.all([
        sendPendingEmail(user.email, user.firstName),
        sendAdminNotificationEmail(user)
      ]);
    } catch (emailErr) {
      console.error('Email sending failed during registration:', emailErr);
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, firstName, lastName, email, gender, religion, caste, memberId, role: user.role, status: user.status, memberType: user.memberType, planExpiry: user.planExpiry, whatsappNumber: user.whatsappNumber, whatsappConsent: user.whatsappConsent, additionalImages: [] } });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');

    let user = await User.findOne({ email: emailRegex });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email address. Please register.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    user = await enforcePlanExpiry(user);

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, gender: user.gender, religion: user.religion, caste: user.caste, memberId: user.memberId, profileData: user.profileData, image: user.image, additionalImages: user.additionalImages || [], role: user.role, status: user.status, memberType: user.memberType, planExpiry: user.planExpiry, whatsappNumber: user.whatsappNumber, whatsappConsent: user.whatsappConsent } });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { userId, profileData, image, additionalImages, whatsappNumber, whatsappConsent } = req.body;
    const targetUserId = userId || req.userId;

    let user;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      user = await User.findById(targetUserId);
    } else {
      user = await User.findOne({ memberId: targetUserId });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Authorization Check: User can only update their own profile unless admin
    const requestingUser = await User.findById(req.userId).select('role');
    if (user._id.toString() !== req.userId && requestingUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own profile' });
    }

    const updateData = {};
    if (profileData) {
      // Sanitize: never allow memberType or planExpiry inside profileData
      const { memberType: _mt, planExpiry: _pe, password: _pw, role: _r, status: _s, ...cleanData } = profileData;
      updateData.profileData = { ...user.profileData, ...cleanData };
      
      // Extract top-level fields
      const topLevelFields = ['firstName', 'lastName', 'email', 'phone', 'dob', 'religion', 'caste', 'gender'];
      topLevelFields.forEach(field => {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
          delete updateData.profileData[field];
        }
      });
    }
    if (image !== undefined) updateData.image = image;
    if (additionalImages !== undefined) updateData.additionalImages = additionalImages;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (whatsappConsent !== undefined) updateData.whatsappConsent = whatsappConsent;

    const updatedUser = await User.findOneAndUpdate({ _id: user._id }, updateData, { new: true }).select('-password');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/upgrade', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!userId || !plan) return res.status(400).json({ message: 'User ID and plan are required' });

    // Validate plan
    const validPlans = {
      basic: 'Basic',
      premium: 'Premium',
      elite: 'Elite'
    };
    
    const targetMemberType = validPlans[plan.toLowerCase()];
    if (!targetMemberType) return res.status(400).json({ message: 'Invalid plan selected' });

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ memberId: userId });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const planExpiry = new Date();
    if (targetMemberType === 'Basic') planExpiry.setMonth(planExpiry.getMonth() + 3);
    else if (targetMemberType === 'Premium') planExpiry.setMonth(planExpiry.getMonth() + 6);
    else if (targetMemberType === 'Elite') planExpiry.setFullYear(planExpiry.getFullYear() + 1);

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { memberType: targetMemberType, planExpiry },
      { new: true }
    ).select('-password');

    res.json({ message: 'Upgrade successful', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during upgrade' });
  }
});

// ========== RAZORPAY PAYMENT API ==========

// Plan pricing config (amount in paise = INR × 100)
const razorpayPlanConfig = {
  basic:   { name: 'Basic',   price: 1999, gst: Math.round(1999 * 0.18), duration: '3 Months',  months: 3 },
  premium: { name: 'Premium', price: 3499, gst: Math.round(3499 * 0.18), duration: '6 Months',  months: 6 },
  elite:   { name: 'Elite',   price: 5999, gst: Math.round(5999 * 0.18), duration: '12 Months', months: 12 }
};

// Create Razorpay Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!userId || !plan) return res.status(400).json({ message: 'User ID and plan are required' });

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay keys missing in environment variables:', { keyId: !!keyId, keySecret: !!keySecret });
      return res.status(400).json({ message: 'Razorpay payment gateway credentials not configured on server.' });
    }

    const planConfig = razorpayPlanConfig[plan.toLowerCase()];
    if (!planConfig) return res.status(400).json({ message: 'Invalid plan selected' });

    // Find user for validation
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ memberId: userId });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Account not approved yet' });

    const totalAmount = (planConfig.price + planConfig.gst) * 100; // Convert to paise

    const instance = new Razorpay({
      key_id: keyId.trim(),
      key_secret: keySecret.trim()
    });

    const order = await instance.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `cs_${user.memberId}_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        plan: planConfig.name,
        memberId: user.memberId
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId.trim(),
      planName: planConfig.name,
      planDuration: planConfig.duration
    });
  } catch (err) {
    console.error('RAZORPAY CREATE ORDER ERROR:', err);
    const detailMsg = err?.error?.description || err?.message || 'Failed to create payment order.';
    res.status(500).json({ message: `Razorpay Error: ${detailMsg}` });
  }
});

// Verify Razorpay Payment & Upgrade Plan
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification data is incomplete' });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET || '').trim();

    // Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('RAZORPAY SIGNATURE MISMATCH:', { expected: expectedSignature, received: razorpay_signature });
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Signature valid → upgrade user plan
    const planConfig = razorpayPlanConfig[plan.toLowerCase()];
    if (!planConfig) return res.status(400).json({ message: 'Invalid plan' });

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ memberId: userId });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });

    const planExpiry = new Date();
    if (planConfig.months === 12) {
      planExpiry.setFullYear(planExpiry.getFullYear() + 1);
    } else {
      planExpiry.setMonth(planExpiry.getMonth() + planConfig.months);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        memberType: planConfig.name,
        planExpiry,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id
      },
      { new: true }
    ).select('-password');

    console.log(`✅ PAYMENT SUCCESS: ${user.memberId} upgraded to ${planConfig.name} (Payment: ${razorpay_payment_id})`);

    // Send emails asynchronously
    try {
      await Promise.all([
        sendPaymentSuccessUserEmail(user.email, user.firstName, planConfig.name, planConfig.amount, razorpay_payment_id),
        sendPaymentSuccessAdminEmail(user, planConfig.name, planConfig.amount, razorpay_payment_id)
      ]);
    } catch (emailErr) {
      console.error('Failed to send payment success emails:', emailErr);
    }

    res.json({ message: 'Payment verified and plan upgraded successfully', user: updatedUser });
  } catch (err) {
    console.error('RAZORPAY VERIFY ERROR:', err);
    res.status(500).json({ message: 'Payment verification failed. Please contact support.' });
  }
});

// Razorpay Webhook for automatic membership upgrades on hosted payment capture
app.post('/api/razorpay/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest !== signature) {
        console.error('❌ RAZORPAY WEBHOOK SIGNATURE INVALID');
        return res.status(400).json({ message: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    console.log(`=== RAZORPAY WEBHOOK EVENT: ${event} ===`);

    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const amount = payment.amount; // in paise
      const email = payment.email;
      const phone = payment.contact; // contact is the phone number

      console.log(`Payment Captured: Email: ${email}, Phone: ${phone}, Amount: ${amount}`);

      // Map amount to plan
      let planName = '';
      let months = 0;

      // Check both with-GST and without-GST amounts
      if (amount === 235900 || amount === 199900) {
        planName = 'Basic';
        months = 3;
      } else if (amount === 412900 || amount === 349900) {
        planName = 'Premium';
        months = 6;
      } else if (amount === 707900 || amount === 599900) {
        planName = 'Elite';
        months = 12;
      }

      if (!planName) {
        console.warn(`⚠️ Unknown payment amount: ${amount}`);
        return res.status(200).json({ message: 'Unknown plan amount' });
      }

      // Try to find user by email or phone
      let user = null;
      if (email) {
        user = await User.findOne({ email: { $regex: new RegExp('^' + email.trim() + '$', 'i') } });
      }
      if (!user && phone) {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        user = await User.findOne({ phone: { $regex: new RegExp(normalizedPhone + '$') } });
      }

      if (!user) {
        console.warn(`⚠️ User not found for payment. Email: ${email}, Phone: ${phone}`);
        return res.status(200).json({ message: 'User not found' });
      }

      // Update plan
      const planExpiry = new Date();
      planExpiry.setMonth(planExpiry.getMonth() + months);

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          memberType: planName,
          planExpiry,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id || null
        },
        { new: true }
      ).select('-password');

      console.log(`✅ WEBHOOK SUCCESS: ${updatedUser.memberId} upgraded to ${planName}`);

      // Send emails
      try {
        await Promise.all([
          sendPaymentSuccessUserEmail(updatedUser.email, updatedUser.firstName, planName, amount / 100, payment.id),
          sendPaymentSuccessAdminEmail(updatedUser, planName, amount / 100, payment.id)
        ]);
      } catch (emailErr) {
        console.error('Failed to send webhook success emails:', emailErr);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const planAmountMap = {
  basic: { planName: 'Basic', months: 3, amount: 235900 },
  premium: { planName: 'Premium', months: 6, amount: 412900 },
  elite: { planName: 'Elite', months: 12, amount: 707900 }
};

// PhonePe Initiate Online Payment (Supports PROD PG V1 & UAT PG V2)
app.post('/api/phonepe/initiate', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    const planKey = (plan || '').toLowerCase();
    const planInfo = planAmountMap[planKey];

    if (!planInfo) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const merchantOrderId = `MT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;

    const redirectUrl = `${origin}/checkout/${planKey}?txnId=${merchantOrderId}&status=check`;
    const callbackUrl = `${origin}/api/phonepe/callback`;

    const isProd = process.env.PHONEPE_ENV === 'PROD';

    if (isProd) {
      // Production PG V1 Checksum Signing Flow
      const saltKey = process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || '987bde96-92ce-439d-b88b-abb75ee64116';
      const saltIndex = process.env.PHONEPE_CLIENT_VERSION || process.env.PHONEPE_SALT_INDEX || '1';
      const merchantId = process.env.PHONEPE_MERCHANT_ID || 'M22H0M16HVDZG';
      const hostUrl = process.env.PHONEPE_HOST_URL || 'https://api.phonepe.com/apis/hermes';

      const payPayload = {
        merchantId,
        merchantTransactionId: merchantOrderId,
        merchantUserId: user.memberId || user._id.toString(),
        amount: planInfo.amount,
        redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl,
        mobileNumber: (user.phone || '9876543210').replace(/\D/g, '').slice(-10),
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payPayload)).toString('base64');
      const stringToSign = base64Payload + '/pg/v1/pay' + saltKey;
      const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
      const checksum = `${sha256}###${saltIndex}`;

      console.log(`[PhonePe Prod Initiate] Order: ${merchantOrderId}, User: ${user.email}, Plan: ${planInfo.planName}`);

      const phonepeRes = await fetch(`${hostUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'accept': 'application/json'
        },
        body: JSON.stringify({ request: base64Payload })
      });

      const phonepeData = await phonepeRes.json();
      console.log('[PhonePe Prod Response]', phonepeData);

      if (phonepeData.success && phonepeData.data?.instrumentResponse?.redirectInfo?.url) {
        return res.json({
          success: true,
          redirectUrl: phonepeData.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: merchantOrderId
        });
      } else {
        console.error('[PhonePe Prod Error]', phonepeData);
        return res.status(400).json({
          message: phonepeData.message || (phonepeData.code === '404' ? 'PhonePe Account Verification Pending. PhonePe team is currently activating your merchant production account.' : 'Failed to initiate PhonePe payment.')
        });
      }
    } else {
      // UAT Sandbox PG V2 OAuth Flow
      const token = await getPhonePeOAuthToken();

      const payPayload = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantOrderId,
        merchantUserId: user.memberId || user._id.toString(),
        amount: planInfo.amount,
        redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl,
        mobileNumber: (user.phone || '9876543210').replace(/\D/g, '').slice(-10)
      };

      console.log(`[PhonePe UAT Initiate V2] Order: ${merchantOrderId}, User: ${user.email}, Plan: ${planInfo.planName}`);

      const phonepeRes = await fetch(`${PHONEPE_HOST_URL}/checkout/v2/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        },
        body: JSON.stringify(payPayload)
      });

      const phonepeData = await phonepeRes.json();
      console.log('[PhonePe UAT Response]', phonepeData);

      if (phonepeRes.ok && phonepeData.redirectUrl) {
        return res.json({
          success: true,
          redirectUrl: phonepeData.redirectUrl,
          merchantTransactionId: merchantOrderId,
          orderId: phonepeData.orderId
        });
      } else {
        console.error('[PhonePe UAT Error]', phonepeData);
        return res.status(400).json({
          message: phonepeData.message || 'Failed to initiate PhonePe payment. Please try again.'
        });
      }
    }
  } catch (err) {
    console.error('[PhonePe Initiate Exception]', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// PhonePe Server-to-Server Callback / Webhook
app.post('/api/phonepe/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('[PhonePe Callback Received]', callbackData);

    const merchantOrderId = callbackData.merchantOrderId || callbackData.data?.merchantTransactionId;
    const amount = callbackData.amount || callbackData.data?.amount;
    const state = callbackData.state || callbackData.code;

    if (state === 'COMPLETED' || state === 'PAYMENT_SUCCESS') {
      let planName = 'Basic';
      let months = 3;
      if (amount === 412900 || amount === 349900) {
        planName = 'Premium';
        months = 6;
      } else if (amount === 707900 || amount === 599900) {
        planName = 'Elite';
        months = 12;
      }

      const merchantUserId = callbackData.merchantUserId || callbackData.data?.merchantUserId;
      let user = null;
      if (merchantUserId && mongoose.Types.ObjectId.isValid(merchantUserId)) {
        user = await User.findById(merchantUserId);
      }
      if (!user && merchantUserId) {
        user = await User.findOne({ memberId: merchantUserId });
      }

      if (user) {
        const planExpiry = new Date();
        planExpiry.setMonth(planExpiry.getMonth() + months);

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          {
            memberType: planName,
            planExpiry,
            phonepeTransactionId: merchantOrderId,
            paymentProvider: 'PhonePe'
          },
          { new: true }
        ).select('-password');

        console.log(`✅ PHONEPE WEBHOOK SUCCESS: ${updatedUser.memberId} upgraded to ${planName}`);

        try {
          await Promise.all([
            sendPaymentSuccessUserEmail(updatedUser.email, updatedUser.firstName, planName, (amount || 0) / 100, merchantOrderId),
            sendPaymentSuccessAdminEmail(updatedUser, planName, (amount || 0) / 100, merchantOrderId)
          ]);
        } catch (emailErr) {
          console.error('Failed to send PhonePe email:', emailErr);
        }
      }
    }

    res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error('[PhonePe Callback Exception]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PhonePe Status Verification (Called by frontend redirect callback)
app.post('/api/phonepe/verify', authMiddleware, async (req, res) => {
  try {
    const { transactionId, plan } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID required' });
    }

    const planKey = (plan || '').toLowerCase();
    const planInfo = planAmountMap[planKey] || planAmountMap.basic;

    console.log(`[PhonePe Verify V2] Checking status for Order: ${transactionId}`);

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const planExpiry = new Date();
    planExpiry.setMonth(planExpiry.getMonth() + planInfo.months);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        memberType: planInfo.planName,
        planExpiry,
        phonepeTransactionId: transactionId,
        paymentProvider: 'PhonePe'
      },
      { new: true }
    ).select('-password');

    try {
      await Promise.all([
        sendPaymentSuccessUserEmail(updatedUser.email, updatedUser.firstName, planInfo.planName, planInfo.amount / 100, transactionId),
        sendPaymentSuccessAdminEmail(updatedUser, planInfo.planName, planInfo.amount / 100, transactionId)
      ]);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[PhonePe Verify Exception]', err);
    res.status(500).json({ message: 'Verification error' });
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

app.get('/api/showcase-profiles', async (req, res) => {
  try {
    const filter = { role: 'user', status: 'approved' };
    
    // If viewer's gender is provided, show opposite gender profiles
    const viewerGender = req.query.viewerGender;
    if (viewerGender) {
      // Show opposite gender: if viewer is Female, show Male profiles and vice versa
      filter.gender = viewerGender === 'Female' ? 'Male' : 'Female';
    }
    
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(3)
      .select('firstName memberId gender religion caste profileData image')
      .lean();
    res.json(users);
  } catch (err) {
    console.error('SHOWCASE PROFILES ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/members', authMiddleware, async (req, res) => {
  try {
    // Auto-downgrade any globally expired plans before fetching
    await User.updateMany(
      { planExpiry: { $lt: new Date() }, memberType: { $ne: 'Free' } },
      { $set: { memberType: 'Free' }, $unset: { planExpiry: '' } }
    );

    // Fetch current logged-in user to filter by opposite gender
    const currentUser = await User.findById(req.userId).select('gender');
    const filter = { role: 'user', status: 'approved' };
    if (currentUser && currentUser.gender) {
      filter.gender = currentUser.gender === 'Female' ? 'Male' : 'Female';
    }

    const users = await User.find(filter).select('-password').lean();

    // Boost regions for Elite plan
    const boostRegions = ['udupi', 'mangalore', 'mangaluru', 'manipal', 'kundapura', 'karwar', 'kasaragod'];

    // Sort: Elite + boost region first → Elite others → rest
    users.sort((a, b) => {
      const aIsElite = a.memberType === 'Elite' ? 1 : 0;
      const bIsElite = b.memberType === 'Elite' ? 1 : 0;

      const aCity = (a.profileData?.city || '').toLowerCase();
      const bCity = (b.profileData?.city || '').toLowerCase();
      const aIsBoosted = aIsElite && boostRegions.some(r => aCity.includes(r)) ? 1 : 0;
      const bIsBoosted = bIsElite && boostRegions.some(r => bCity.includes(r)) ? 1 : 0;

      // Boosted Elite first, then other Elite, then rest
      if (bIsBoosted !== aIsBoosted) return bIsBoosted - aIsBoosted;
      if (bIsElite !== aIsElite) return bIsElite - aIsElite;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest first within tiers
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN API ==========

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Send email notification based on status
    try {
      if (status === 'approved') {
        await sendApprovalEmail(user.email, user.firstName);
      } else if (status === 'rejected') {
        await sendRejectionEmail(user.email, user.firstName);
      }
    } catch (emailErr) {
      console.error('Email sending failed during admin update:', emailErr);
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update user's membership plan (CMS-ready)
app.put('/api/admin/users/:id/plan', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { memberType, planExpiry } = req.body;
    if (!['Free', 'Basic', 'Premium', 'Elite'].includes(memberType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }
    const updateData = { memberType };
    if (planExpiry) updateData.planExpiry = new Date(planExpiry);

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete a user safely
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Safely cleanup associated data
    await Connection.deleteMany({ $or: [{ senderId: user._id }, { receiverId: user._id }] });
    // Also delete user from conversations by removing the conversation entirely if it's 1-on-1
    await Conversation.deleteMany({ participants: user._id });
    await Message.deleteMany({ senderId: user._id });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

// Clean stale memberType from inside profileData (safe to run repeatedly)
(async () => {
  try {
    await mongoose.connection.asPromise();
    await User.updateMany(
      { 'profileData.memberType': { $exists: true } },
      { $unset: { 'profileData.memberType': '' } }
    );
  } catch (e) {}
})();

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const user = await User.findOne({ email: emailRegex });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.resetOtpAttempts = 0;
    await user.save();
    
    // Send email with OTP
    await sendOtpEmail(user.email, otp, user.firstName);

    res.json({ message: 'OTP sent successfully to your email address.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const user = await User.findOne({ email: emailRegex });

    if (!user || !user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.resetOtpAttempts >= 3) {
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    if (user.resetOtp !== otp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const user = await User.findOne({ email: emailRegex });

    if (!user || !user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.resetOtpAttempts >= 3) {
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    if (user.resetOtp !== otp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CHAT / MESSAGING API ==========

// ========== USER INTERACTIONS API (SHORTLIST, INTEREST, IGNORE) ==========

app.get('/api/user/interactions', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('shortlistedIds interestedIds ignoredIds');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      shortlistedIds: user.shortlistedIds || [],
      interestedIds: user.interestedIds || [],
      ignoredIds: user.ignoredIds || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/user/shortlist', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
    const update = action === 'remove'
      ? { $pull: { shortlistedIds: targetUserId } }
      : { $addToSet: { shortlistedIds: targetUserId } };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('shortlistedIds');
    res.json({ shortlistedIds: user.shortlistedIds || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/user/interest', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
    const update = action === 'remove'
      ? { $pull: { interestedIds: targetUserId } }
      : { $addToSet: { interestedIds: targetUserId } };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('interestedIds');
    res.json({ interestedIds: user.interestedIds || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/user/ignore', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
    const update = action === 'remove'
      ? { $pull: { ignoredIds: targetUserId } }
      : { $addToSet: { ignoredIds: targetUserId } };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('ignoredIds');
    res.json({ ignoredIds: user.ignoredIds || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CHAT / MESSAGING API ==========

// Get all conversations for a user
app.get('/api/conversations/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden: Cannot access conversations of another user' });
    }

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

// Start or get existing conversation between two users (plan-gated)
app.post('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ message: 'Forbidden: Cannot start conversation on behalf of another user' });
    }

    const receiver = await User.findById(receiverId).select('gender');
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    // Server-side plan check: Free users cannot initiate conversations
    const sender = await User.findById(senderId).select('memberType gender');
    if (!sender) return res.status(404).json({ message: 'Sender not found' });
    if (sender.memberType === 'Free') {
      return res.status(403).json({ message: 'Upgrade your plan to start conversations.' });
    }

    // Enforce opposite gender check
    if (sender.gender === receiver.gender) {
      return res.status(400).json({ message: 'Conversations can only be started between profiles of the opposite gender' });
    }

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
app.get('/api/messages/:conversationId', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conversation.participants.some(p => p.toString() === req.userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation' });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message (server-side plan enforcement)
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ message: 'Forbidden: Cannot send message as another user' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conversation.participants.some(p => p.toString() === req.userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this conversation' });
    }

    // Server-side plan check: Free users cannot send messages
    const sender = await User.findById(senderId).select('memberType');
    if (!sender) return res.status(404).json({ message: 'Sender not found' });
    if (sender.memberType === 'Free') {
      return res.status(403).json({ message: 'Upgrade your plan to send messages.' });
    }

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
app.put('/api/messages/read', authMiddleware, async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    if (req.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

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
app.get('/api/user-by-member/:memberId', authMiddleware, async (req, res) => {
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
app.post('/api/connections/send', authMiddleware, async (req, res) => {
  try {
    const { senderId, receiverMemberId } = req.body;
    if (req.userId !== senderId) {
      return res.status(403).json({ message: 'Forbidden: Cannot send interest on behalf of another user' });
    }

    const receiver = await User.findOne({ memberId: receiverMemberId });
    if (!receiver) return res.status(404).json({ message: 'User not found' });
    if (receiver._id.toString() === senderId) return res.status(400).json({ message: 'Cannot send interest to yourself' });

    // Enforce opposite gender check
    const sender = await User.findById(senderId).select('gender');
    if (!sender) return res.status(404).json({ message: 'Sender not found' });
    if (sender.gender === receiver.gender) {
      return res.status(400).json({ message: 'Interests can only be sent to profiles of the opposite gender' });
    }

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
app.get('/api/connections/sent/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden: Cannot view sent interests of another user' });
    }

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
app.get('/api/connections/received/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden: Cannot view received interests of another user' });
    }

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
app.put('/api/connections/:id/accept', authMiddleware, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    if (connection.receiverId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden: Only the receiver can accept this interest' });
    }

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
app.put('/api/connections/:id/decline', authMiddleware, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Connection not found' });

    if (connection.receiverId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden: Only the receiver can decline this interest' });
    }

    connection.status = 'declined';
    await connection.save();
    res.json({ message: 'Interest declined', connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get accepted matches (for chat access check)
app.get('/api/connections/matches/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

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
