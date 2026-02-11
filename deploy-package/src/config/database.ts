/**
 * Database Configuration
 * MongoDB connection with retry logic
 */

import mongoose from 'mongoose';

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000; // 5 seconds

/**
 * Connect to MongoDB with retry logic
 * Requirements: 15.1, 15.2, 15.3
 */
export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_class_bot';
  
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`📡 Attempting to connect to MongoDB... (Attempt ${retries + 1}/${MAX_RETRIES})`);
      
      await mongoose.connect(mongoUri);
      
      console.log('✅ MongoDB connected successfully');
      return;
      
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection failed (Attempt ${retries}/${MAX_RETRIES}):`, error);
      
      if (retries >= MAX_RETRIES) {
        console.error('💥 All connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      console.log(`⏳ Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

/**
 * Setup connection event handlers for monitoring
 * Requirements: 15.1, 15.2, 15.3
 */
export function setupConnectionHandlers(): void {
  // Connection successful
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });
  
  // Connection error
  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });
  
  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Mongoose disconnected from MongoDB');
  });
  
  // Application termination
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('👋 Mongoose connection closed due to application termination');
    process.exit(0);
  });
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  console.log('🔌 MongoDB disconnected');
}
