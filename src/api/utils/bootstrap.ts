/**
 * Bootstrap utilities for API server
 * Creates default dashboard admin user
 */

import mongoose from 'mongoose';
import { User } from '../../models/User';
import { getLogger } from '../../utils/Logger';

const logger = getLogger();

/**
 * Create default dashboard admin user
 * Uses credentials from environment or defaults
 */
export async function createDefaultDashboardUser(): Promise<void> {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      logger.warn('MongoDB not connected - skipping dashboard user creation');
      return;
    }

    // Check if any users exist
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      logger.info(`Dashboard users already exist (${userCount} users)`);
      return;
    }

    // Create default admin user
    const defaultUsername = process.env.DASHBOARD_DEFAULT_USERNAME || 'admin';
    const defaultPassword = process.env.DASHBOARD_DEFAULT_PASSWORD || 'admin123';

    await User.create({
      username: defaultUsername,
      password: defaultPassword,
      role: 'admin'
    });

    logger.info(`✅ Default dashboard admin created: ${defaultUsername}`);
    console.log('\n✅ Default Dashboard Admin Created!');
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!\n');
  } catch (error) {
    logger.error('Failed to create default dashboard user', error as Error);
    console.error('❌ Failed to create dashboard user:', error);
  }
}
