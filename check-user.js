const mongoose = require('mongoose');

const uri = 'mongodb+srv://VinTheGreat:VINTAGE01@cluster0.jhprx.mongodb.net/task_monitor_bot';

async function checkUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected!');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(c => console.log('  -', c.name));

    // Check users collection
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\nTotal users: ${userCount}`);

    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('\nUsers:');
      users.forEach(u => {
        console.log(`  - Username: ${u.username}, Role: ${u.role}, ID: ${u._id}`);
      });
    } else {
      console.log('❌ No users found in database!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
