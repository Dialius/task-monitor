/**
 * Create Dashboard User Script
 * Creates a dashboard admin user with WhatsApp number as username
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

// Password hashing
const bcrypt = require('bcrypt');

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createDashboardUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get WhatsApp number from env
    const whatsappNumber = process.env.FIRST_ADMIN_WHATSAPP_ID || '628994630519';
    const defaultPassword = process.env.DASHBOARD_DEFAULT_PASSWORD || 'admin123';

    // Check if user exists
    const existingUser = await User.findOne({ username: whatsappNumber });
    
    if (existingUser) {
      console.log('ℹ️  User already exists:');
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Created: ${existingUser.createdAt}\n`);
      console.log('💡 To reset password, delete the user first or use change password API\n');
    } else {
      // Create new user
      const user = await User.create({
        username: whatsappNumber,
        password: defaultPassword,
        role: 'admin'
      });

      console.log('✅ Dashboard Admin User Created!');
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Role: ${user.role}`);
      console.log('\n⚠️  IMPORTANT: Change password after first login!\n');
    }

    // Also create default admin user if not exists
    const defaultAdmin = await User.findOne({ username: 'admin' });
    
    if (!defaultAdmin) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin user also created (username: admin, password: admin123)\n');
    }

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDashboardUser();
