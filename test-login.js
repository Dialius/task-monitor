const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://VinTheGreat:VINTAGE01@cluster0.jhprx.mongodb.net/task_monitor_bot';

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected!');

    // Find admin user
    console.log('\nSearching for admin user...');
    const user = await User.findOne({ username: 'admin' });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('  - ID:', user._id);
    console.log('  - Username:', user.username);
    console.log('  - Role:', user.role);
    console.log('  - Password hash:', user.password.substring(0, 20) + '...');

    // Test password
    console.log('\nTesting password "admin123"...');
    const isMatch = await user.comparePassword('admin123');
    
    if (isMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
