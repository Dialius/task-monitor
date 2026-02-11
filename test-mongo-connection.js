const mongoose = require('mongoose');

const uri = 'mongodb+srv://VinTheGreat:VINTAGE01@cluster0.jhprx.mongodb.net/task_monitor_bot';

console.log('Testing MongoDB connection...');
console.log('URI:', uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('Connection state:', mongoose.connection.readyState);
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection failed:');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Full error:', err);
  process.exit(1);
});
