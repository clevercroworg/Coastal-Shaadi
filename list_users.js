import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  gender: String,
  memberId: String,
  memberType: String,
  planExpiry: Date,
  role: String,
  status: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const users = await User.find({}).select('firstName lastName email phone gender memberId memberType role status createdAt').sort({ createdAt: -1 }).lean();

    console.log(`Total Users: ${users.length}\n`);
    console.log('='.repeat(160));
    console.log(
      'No'.padEnd(5) +
      'Name'.padEnd(25) +
      'Email'.padEnd(35) +
      'Phone'.padEnd(16) +
      'Gender'.padEnd(10) +
      'MemberID'.padEnd(16) +
      'Plan'.padEnd(10) +
      'Role'.padEnd(8) +
      'Status'.padEnd(12) +
      'Registered'
    );
    console.log('='.repeat(160));

    users.forEach((u, i) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A';
      console.log(
        String(i + 1).padEnd(5) +
        name.padEnd(25).slice(0, 25) +
        (u.email || 'N/A').padEnd(35).slice(0, 35) +
        (u.phone || 'N/A').padEnd(16).slice(0, 16) +
        (u.gender || 'N/A').padEnd(10).slice(0, 10) +
        (u.memberId || 'N/A').padEnd(16).slice(0, 16) +
        (u.memberType || 'Free').padEnd(10).slice(0, 10) +
        (u.role || 'user').padEnd(8).slice(0, 8) +
        (u.status || 'N/A').padEnd(12).slice(0, 12) +
        date
      );
    });

    console.log('='.repeat(160));

    // Summary
    const admins = users.filter(u => u.role === 'admin').length;
    const pending = users.filter(u => u.status === 'pending').length;
    const approved = users.filter(u => u.status === 'approved').length;
    const rejected = users.filter(u => u.status === 'rejected').length;
    const males = users.filter(u => u.gender === 'Male').length;
    const females = users.filter(u => u.gender === 'Female').length;
    const free = users.filter(u => !u.memberType || u.memberType === 'Free').length;
    const basic = users.filter(u => u.memberType === 'Basic').length;
    const premium = users.filter(u => u.memberType === 'Premium').length;
    const elite = users.filter(u => u.memberType === 'Elite').length;

    console.log(`\n--- Summary ---`);
    console.log(`Total: ${users.length} | Admins: ${admins} | Regular Users: ${users.length - admins}`);
    console.log(`Status  → Approved: ${approved} | Pending: ${pending} | Rejected: ${rejected}`);
    console.log(`Gender  → Male: ${males} | Female: ${females}`);
    console.log(`Plans   → Free: ${free} | Basic: ${basic} | Premium: ${premium} | Elite: ${elite}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
