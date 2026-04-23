import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Coastal Shaadi Support" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPendingEmail = async (email, firstName) => {
  const subject = 'Your Account is Pending Verification - Coastal Shaadi';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #d946ef; text-align: center;">Welcome to Coastal Shaadi!</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for registering. Your account has been created and is currently <strong>pending verification</strong> by our administrative team.</p>
      <p>To ensure a safe and authentic community, we manually review all profiles. We will notify you via email as soon as your account is approved.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>The Coastal Shaadi Team</strong></p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendApprovalEmail = async (email, firstName) => {
  const subject = 'Your Account is Approved! - Coastal Shaadi';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #22c55e; text-align: center;">Account Approved!</h2>
      <p>Hi ${firstName},</p>
      <p>Great news! Your account has been <strong>approved</strong> by our team.</p>
      <p>You can now log in to your dashboard, complete your profile, and start connecting with other active members.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://coastalshaadi.com/login" style="background-color: #d946ef; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login Now</a>
      </div>
      <p>Best Regards,</p>
      <p><strong>The Coastal Shaadi Team</strong></p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendRejectionEmail = async (email, firstName) => {
  const subject = 'Update Regarding Your Registration - Coastal Shaadi';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #ef4444; text-align: center;">Registration Update</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for your interest in joining Coastal Shaadi.</p>
      <p>Unfortunately, after reviewing your registration details, we are unable to approve your account at this time.</p>
      <p>If you believe this is an error or would like to provide additional information, please contact our support team.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>The Coastal Shaadi Team</strong></p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendAdminNotificationEmail = async (user) => {
  const subject = 'New User Registration - Action Required';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #d946ef; text-align: center;">New User Registration</h2>
      <p>A new user has just registered and is waiting for approval.</p>
      <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Gender:</strong> ${user.gender}</p>
      <p><strong>Religion & Caste:</strong> ${user.religion} - ${user.caste}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://coastalshaadi.com/admin/login" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to Approve/Reject</a>
      </div>
    </div>
  `;
  await sendEmail(process.env.SMTP_USER, subject, html); // Sends to the support email itself
};
