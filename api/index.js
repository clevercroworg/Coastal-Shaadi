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

// Member-facing messages for failures. Technical details go to the logs only.
const SERVER_ERROR = 'Something went wrong on our side. Please try again in a moment.';
const PAYMENT_NOT_CONFIRMED = 'We could not confirm your payment yet. If any amount was deducted, please contact our support team and we will activate your plan right away.';

// Fields one member may see about another. Contact details, reset codes and
// payment records are never included.
const PUBLIC_PROFILE_FIELDS = 'firstName lastName gender dob onBehalf religion caste memberId profileData image additionalImages memberType whatsappNumber whatsappConsent createdAt';

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
// Keep the raw body so webhook signatures can be checked against exactly what was sent
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// ========== AUTH MIDDLEWARE ==========
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again to continue.' });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'You do not have permission to access this page.' });
    next();
  } catch (err) {
    return res.status(500).json({ message: SERVER_ERROR });
  }
};

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Debug: log which env vars are present (not values, just true/false)
console.log('ENV CHECK:', {
  MONGODB_URI: !!MONGODB_URI,
  JWT_SECRET: !!JWT_SECRET,
  CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
  RAZORPAY_KEY_ID: !!RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: !!RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: !!process.env.RAZORPAY_WEBHOOK_SECRET
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
    return res.status(503).json({ message: 'Our service is temporarily unavailable. Please try again in a few minutes.' });
  }
};
app.use(connectDB);

// Health check endpoint for debugging
app.get('/api/health', (req, res) => {
  const rzpId = process.env.RAZORPAY_KEY_ID || '';
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET || '';
  res.json({
    status: 'ok',
    mongoState: mongoose.connection.readyState,
    razorpay: {
      keyIdPrefix: rzpId ? rzpId.substring(0, 14) : 'MISSING',
      keyIdLength: rzpId.trim().length,
      keySecretLength: rzpSecret.trim().length,
      isLiveKey: rzpId.startsWith('rzp_live_')
    },
    envVars: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: !!process.env.RAZORPAY_WEBHOOK_SECRET
    }
  });
});

// ========== GET CURRENT USER (for polling approval status) ==========
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    let user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });
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
    res.status(500).json({ message: SERVER_ERROR });
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
    res.status(500).json({ message: "We couldn't send your message right now. Please try again shortly." });
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
      return res.status(400).json({ message: 'An account with this email or phone number already exists. Please log in instead.' });
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
      if (attempts >= 5) return res.status(500).json({ message: "We couldn't complete your registration right now. Please try again in a moment." });
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

    let user = await User.findOne({ email: emailRegex }).select('+password');
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

    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });

    // Authorization Check: User can only update their own profile unless admin
    const requestingUser = await User.findById(req.userId).select('role');
    if (user._id.toString() !== req.userId && requestingUser?.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own profile.' });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.post('/api/upgrade', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, plan } = req.body;
    if (!userId || !plan) return res.status(400).json({ message: 'Please choose a membership plan to continue.' });

    // Validate plan
    const validPlans = {
      basic: 'Basic',
      premium: 'Premium',
      elite: 'Elite'
    };
    
    const targetMemberType = validPlans[plan.toLowerCase()];
    if (!targetMemberType) return res.status(400).json({ message: 'Please choose a valid membership plan.' });

    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ memberId: userId });
    }

    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });

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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// ========== RAZORPAY PAYMENT API ==========

// Plan pricing config (amount in paise = INR × 100)
const razorpayPlanConfig = {
  basic:   { name: 'Basic',   price: 1999, gst: Math.round(1999 * 0.18), duration: '3 Months',  months: 3 },
  premium: { name: 'Premium', price: 3499, gst: Math.round(3499 * 0.18), duration: '6 Months',  months: 6 },
  elite:   { name: 'Elite',   price: 5999, gst: Math.round(5999 * 0.18), duration: '12 Months', months: 12 }
};

const planTotalPaise = (planConfig) => (planConfig.price + planConfig.gst) * 100;

// Read keys per request so updated Vercel env vars apply without a redeploy
const getRazorpay = () => new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || '').trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || '').trim()
});

// Constant-time comparison for payment signatures
const signaturesMatch = (expected, received) => {
  const a = Buffer.from(String(expected || ''));
  const b = Buffer.from(String(received || ''));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

const escapeRegex = (value) => String(value).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

const planExpiryFrom = (months) => {
  const planExpiry = new Date();
  planExpiry.setMonth(planExpiry.getMonth() + months);
  return planExpiry;
};

// Create Razorpay Order for the logged-in member
app.post('/api/razorpay/create-order', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ message: 'Please choose a membership plan to continue.' });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing in environment variables');
      return res.status(503).json({ message: 'Online payments are temporarily unavailable. Please try again shortly or contact support.' });
    }

    const planConfig = razorpayPlanConfig[String(plan).toLowerCase()];
    if (!planConfig) return res.status(400).json({ message: 'Please choose a valid membership plan.' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Your profile is still being verified. You can upgrade as soon as it is approved.' });

    // The member and plan are stored on the order; verification trusts only these
    const order = await getRazorpay().orders.create({
      amount: planTotalPaise(planConfig),
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
      keyId: process.env.RAZORPAY_KEY_ID.trim(),
      planName: planConfig.name,
      planDuration: planConfig.duration
    });
  } catch (err) {
    console.error('RAZORPAY CREATE ORDER ERROR:', err);
    res.status(500).json({ message: "We couldn't start the payment right now. Please try again in a moment." });
  }
});

// Verify Razorpay Payment & Upgrade Plan
app.post('/api/razorpay/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: PAYMENT_NOT_CONFIRMED });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!keySecret || !signaturesMatch(expectedSignature, razorpay_signature)) {
      console.error('RAZORPAY SIGNATURE MISMATCH:', { order: razorpay_order_id, payment: razorpay_payment_id, user: req.userId });
      return res.status(400).json({ message: PAYMENT_NOT_CONFIRMED });
    }

    // Plan and member come from the order created on our server, never from the browser
    const order = await getRazorpay().orders.fetch(razorpay_order_id);
    const planConfig = Object.values(razorpayPlanConfig).find(p => p.name === order.notes?.plan);
    if (!planConfig || order.amount !== planTotalPaise(planConfig)) {
      console.error('RAZORPAY ORDER PLAN/AMOUNT MISMATCH:', { order: order.id, notes: order.notes, amount: order.amount });
      return res.status(400).json({ message: PAYMENT_NOT_CONFIRMED });
    }
    if (order.notes?.userId !== req.userId) {
      console.error('RAZORPAY ORDER BELONGS TO ANOTHER MEMBER:', { order: order.id, orderUser: order.notes?.userId, user: req.userId });
      return res.status(403).json({ message: PAYMENT_NOT_CONFIRMED });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });

    // Already applied (by the webhook or a repeated request): don't extend the plan again
    if (user.razorpayOrderId === razorpay_order_id) {
      const currentUser = await User.findById(user._id).select('-password');
      return res.json({ message: 'Payment verified and plan upgraded successfully', user: currentUser });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        memberType: planConfig.name,
        planExpiry: planExpiryFrom(planConfig.months),
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        paymentProvider: 'Razorpay'
      },
      { new: true }
    ).select('-password');

    console.log(`✅ PAYMENT SUCCESS: ${user.memberId} upgraded to ${planConfig.name} (Payment: ${razorpay_payment_id})`);

    const amountPaid = planConfig.price + planConfig.gst;
    try {
      await Promise.all([
        sendPaymentSuccessUserEmail(user.email, user.firstName, planConfig.name, amountPaid, razorpay_payment_id),
        sendPaymentSuccessAdminEmail(user, planConfig.name, amountPaid, razorpay_payment_id)
      ]);
    } catch (emailErr) {
      console.error('Failed to send payment success emails:', emailErr);
    }

    res.json({ message: 'Payment verified and plan upgraded successfully', user: updatedUser });
  } catch (err) {
    console.error('RAZORPAY VERIFY ERROR:', err);
    res.status(500).json({ message: PAYMENT_NOT_CONFIRMED });
  }
});

// Razorpay Webhook for automatic membership upgrades on hosted payment capture
app.post('/api/razorpay/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // Non-2xx makes Razorpay retry, so payments are applied once the secret is set
      console.error('❌ RAZORPAY_WEBHOOK_SECRET is not configured; webhook rejected');
      return res.status(500).json({ message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const digest = crypto.createHmac('sha256', webhookSecret).update(req.rawBody || '').digest('hex');
    if (!signaturesMatch(digest, signature)) {
      console.error('❌ RAZORPAY WEBHOOK SIGNATURE INVALID');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body.event;
    console.log(`=== RAZORPAY WEBHOOK EVENT: ${event} ===`);

    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const amount = payment.amount; // in paise
      const email = payment.email;
      const phone = payment.contact; // contact is the phone number

      console.log(`Payment Captured: Email: ${email}, Phone: ${phone}, Amount: ${amount}`);

      // Map amount to plan (with-GST and without-GST amounts)
      let planName = '';
      let months = 0;
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

      // Checkout orders carry the member on the order; payment pages fall back to email/phone
      let user = null;
      if (payment.order_id) {
        try {
          const order = await getRazorpay().orders.fetch(payment.order_id);
          if (order.notes?.userId && mongoose.Types.ObjectId.isValid(order.notes.userId)) {
            user = await User.findById(order.notes.userId);
          }
        } catch (orderErr) {
          console.error('Could not fetch order for webhook payment:', orderErr);
        }
      }
      if (!user && email) {
        user = await User.findOne({ email: { $regex: new RegExp('^' + escapeRegex(email.trim()) + '$', 'i') } });
      }
      if (!user && phone) {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        if (normalizedPhone.length === 10) {
          user = await User.findOne({ phone: { $regex: new RegExp(normalizedPhone + '$') } });
        }
      }

      if (!user) {
        console.warn(`⚠️ User not found for payment. Email: ${email}, Phone: ${phone}`);
        return res.status(200).json({ message: 'User not found' });
      }

      // Already applied (by checkout verification or an earlier delivery of this event)
      if (user.razorpayPaymentId === payment.id || (payment.order_id && user.razorpayOrderId === payment.order_id)) {
        return res.status(200).json({ status: 'ok' });
      }

      const planUpdate = {
        memberType: planName,
        planExpiry: planExpiryFrom(months),
        razorpayPaymentId: payment.id,
        paymentProvider: 'Razorpay'
      };
      if (payment.order_id) planUpdate.razorpayOrderId = payment.order_id;

      const updatedUser = await User.findOneAndUpdate({ _id: user._id }, planUpdate, { new: true }).select('-password');

      console.log(`✅ WEBHOOK SUCCESS: ${updatedUser.memberId} upgraded to ${planName}`);

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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// PhonePe is not offered at checkout. These endpoints previously upgraded plans
// without confirming payment with PhonePe, so they stay disabled until a
// verified integration is added.
const phonepeUnavailable = (req, res) => {
  res.status(503).json({ message: 'PhonePe payments are temporarily unavailable. Please choose another payment method.' });
};
app.post('/api/phonepe/initiate', phonepeUnavailable);
app.post('/api/phonepe/verify', phonepeUnavailable);
app.post('/api/phonepe/callback', (req, res) => {
  console.warn('[PhonePe Callback ignored: integration disabled]', req.body);
  res.status(200).json({ status: 'OK' });
});

app.get('/api/profile/:id', authMiddleware, async (req, res) => {
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id).select('-password');
    } else {
      user = await User.findOne({ memberId: req.params.id }).select('-password');
    }
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });

    // Full details (email, phone) are only for the member themselves or an admin
    if (user._id.toString() !== req.userId) {
      const requester = await User.findById(req.userId).select('role');
      if (requester?.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to view this profile.' });
      }
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
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
      const isFemale = (viewerGender || '').trim().toLowerCase() === 'female';
      filter.gender = isFemale ? 'Male' : 'Female';
    }
    
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(3)
      .select('firstName memberId gender religion caste profileData image')
      .lean();
    res.json(users);
  } catch (err) {
    console.error('SHOWCASE PROFILES ERROR:', err);
    res.status(500).json({ message: SERVER_ERROR });
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
      const isFemale = (currentUser.gender || '').trim().toLowerCase() === 'female';
      filter.gender = isFemale ? 'Male' : 'Female';
    }

    const users = await User.find(filter).select(PUBLIC_PROFILE_FIELDS).lean();

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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// ========== ADMIN API ==========

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });
    
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Admin: Update user's membership plan (CMS-ready)
app.put('/api/admin/users/:id/plan', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { memberType, planExpiry } = req.body;
    if (!['Free', 'Basic', 'Premium', 'Elite'].includes(memberType)) {
      return res.status(400).json({ message: 'Please choose a valid membership plan.' });
    }
    const updateData = { memberType };
    if (planExpiry) updateData.planExpiry = new Date(planExpiry);

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Admin: Delete a user safely
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });
    
    // Safely cleanup associated data
    await Connection.deleteMany({ $or: [{ senderId: user._id }, { receiverId: user._id }] });
    // Also delete user from conversations by removing the conversation entirely if it's 1-on-1
    await Conversation.deleteMany({ participants: user._id });
    await Message.deleteMany({ senderId: user._id });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
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
      return res.status(404).json({ message: "We couldn't find an account with this email address. Please check it or register." });
    }

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.resetOtpAttempts = 0;
    await user.save();
    
    // Send email with OTP
    await sendOtpEmail(user.email, otp, user.firstName);

    res.json({ message: 'OTP sent successfully to your email address.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const user = await User.findOne({ email: emailRegex }).select('+resetOtp +resetOtpExpires +resetOtpAttempts');

    if (!user || !user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'This verification code is invalid or has expired. Please request a new one.' });
    }

    if (user.resetOtpAttempts >= 3) {
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    if (user.resetOtp !== otp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'The verification code is incorrect. Please check it and try again.' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const normalizedEmail = (email || '').toLowerCase().trim();
    const emailRegex = new RegExp('^' + normalizedEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
    const user = await User.findOne({ email: emailRegex }).select('+resetOtp +resetOtpExpires +resetOtpAttempts');

    if (!user || !user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'This verification code is invalid or has expired. Please request a new one.' });
    }

    if (user.resetOtpAttempts >= 3) {
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    if (user.resetOtp !== otp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'The verification code is incorrect. Please check it and try again.' });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// ========== CHAT / MESSAGING API ==========

// ========== USER INTERACTIONS API (SHORTLIST, INTEREST, IGNORE) ==========

app.get('/api/user/interactions', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('shortlistedIds interestedIds ignoredIds');
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });
    res.json({
      shortlistedIds: user.shortlistedIds || [],
      interestedIds: user.interestedIds || [],
      ignoredIds: user.ignoredIds || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.post('/api/user/shortlist', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'Something was missing from your request. Please refresh the page and try again.' });
    const update = action === 'remove'
      ? { $pull: { shortlistedIds: targetUserId } }
      : { $addToSet: { shortlistedIds: targetUserId } };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('shortlistedIds');
    res.json({ shortlistedIds: user.shortlistedIds || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.post('/api/user/interest', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'Something was missing from your request. Please refresh the page and try again.' });
    const update = action === 'remove'
      ? { $pull: { interestedIds: targetUserId } }
      : { $addToSet: { interestedIds: targetUserId } };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('interestedIds');
    res.json({ interestedIds: user.interestedIds || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

app.post('/api/user/ignore', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'Something was missing from your request. Please refresh the page and try again.' });
    const update = action === 'remove'
      ? { $pull: { ignoredIds: targetUserId } }
      : { $addToSet: { ignoredIds: targetUserId } };
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('ignoredIds');
    res.json({ ignoredIds: user.ignoredIds || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// ========== CHAT / MESSAGING API ==========

// Get all conversations for a user
app.get('/api/conversations/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'You do not have permission to view these conversations.' });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Start or get existing conversation between two users (plan-gated)
app.post('/api/conversations', authMiddleware, async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ message: 'You do not have permission to start this conversation.' });
    }

    const receiver = await User.findById(receiverId).select('gender');
    if (!receiver) return res.status(404).json({ message: 'This profile could not be found.' });

    // Server-side plan check: Free users cannot initiate conversations
    const sender = await User.findById(senderId).select('memberType gender');
    if (!sender) return res.status(404).json({ message: 'Your profile could not be found. Please log in again.' });
    if (sender.memberType === 'Free') {
      return res.status(403).json({ message: 'Upgrade your plan to start conversations.' });
    }

    // Enforce opposite gender check
    if (sender.gender === receiver.gender) {
      return res.status(400).json({ message: 'Conversations can only be started with profiles of the opposite gender.' });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'This conversation is no longer available.' });

    const isParticipant = conversation.participants.some(p => p.toString() === req.userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'You do not have access to this conversation.' });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Send a message (server-side plan enforcement)
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    if (req.userId !== senderId) {
      return res.status(403).json({ message: 'You do not have permission to send this message.' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'This conversation is no longer available.' });

    const isParticipant = conversation.participants.some(p => p.toString() === req.userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'You do not have access to this conversation.' });
    }

    // Server-side plan check: Free users cannot send messages
    const sender = await User.findById(senderId).select('memberType');
    if (!sender) return res.status(404).json({ message: 'Your profile could not be found. Please log in again.' });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Mark messages as read
app.put('/api/messages/read', authMiddleware, async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    if (req.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Find user by memberId (for starting chat from member card)
app.get('/api/user-by-member/:memberId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ memberId: req.params.memberId }).select(PUBLIC_PROFILE_FIELDS);
    if (!user) return res.status(404).json({ message: 'This profile could not be found.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// ========== CONNECTION / INTEREST API ==========

// Send interest
app.post('/api/connections/send', authMiddleware, async (req, res) => {
  try {
    const { senderId, receiverMemberId } = req.body;
    if (req.userId !== senderId) {
      return res.status(403).json({ message: 'You do not have permission to send this interest.' });
    }

    const receiver = await User.findOne({ memberId: receiverMemberId });
    if (!receiver) return res.status(404).json({ message: 'This profile could not be found.' });
    if (receiver._id.toString() === senderId) return res.status(400).json({ message: 'You cannot send an interest to your own profile.' });

    // Enforce opposite gender check
    const sender = await User.findById(senderId).select('gender');
    if (!sender) return res.status(404).json({ message: 'Your profile could not be found. Please log in again.' });
    if (sender.gender === receiver.gender) {
      return res.status(400).json({ message: 'Interests can only be sent to profiles of the opposite gender.' });
    }

    // Check if connection already exists (in either direction)
    const existing = await Connection.findOne({
      $or: [
        { senderId, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: senderId }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already exchanged interest with this member.', connection: existing });
    }

    const connection = new Connection({ senderId, receiverId: receiver._id });
    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Get sent interests
app.get('/api/connections/sent/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'You do not have permission to view these interests.' });
    }

    const connections = await Connection.find({ senderId: req.params.userId })
      .populate('receiverId', 'firstName lastName image memberId religion caste profileData')
      .sort({ createdAt: -1 });
    res.json(connections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Get received interests
app.get('/api/connections/received/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'You do not have permission to view these interests.' });
    }

    const connections = await Connection.find({ receiverId: req.params.userId })
      .populate('senderId', 'firstName lastName image memberId religion caste profileData')
      .sort({ createdAt: -1 });
    res.json(connections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Accept interest
app.put('/api/connections/:id/accept', authMiddleware, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'This interest is no longer available.' });

    if (connection.receiverId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the member who received this interest can accept it.' });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Decline interest
app.put('/api/connections/:id/decline', authMiddleware, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'This interest is no longer available.' });

    if (connection.receiverId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the member who received this interest can decline it.' });
    }

    connection.status = 'declined';
    await connection.save();
    res.json({ message: 'Interest declined', connection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Get accepted matches (for chat access check)
app.get('/api/connections/matches/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
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
    res.status(500).json({ message: SERVER_ERROR });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// ========== ONLINE TRACKING ==========

// Heartbeat - update lastSeen
app.put('/api/heartbeat', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Something was missing from your request. Please refresh the page and try again.' });
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: SERVER_ERROR });
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
    res.status(500).json({ message: SERVER_ERROR });
  }
});

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'The page you were looking for could not be found.' });
});

// Last-resort handler so unexpected failures (including malformed request
// bodies) always return a friendly JSON message instead of an HTML error page.
app.use((err, req, res, next) => {
  console.error('UNHANDLED API ERROR:', req.method, req.originalUrl, err);
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'We could not read your request. Please refresh the page and try again.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'That file or request is too large. Please try a smaller one.' });
  }
  res.status(500).json({ message: SERVER_ERROR });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
