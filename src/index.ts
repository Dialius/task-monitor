/**
 * Multi-Platform Class Reminder Bot
 * Main entry point
 * Requirements: 17.1 (Global error handlers)
 */

import dotenv from 'dotenv';
import { APIServer } from './api';
import { MultiPlatformBot } from './bot';
import { getLogger } from './utils/Logger';

// Load environment variables
dotenv.config();

const logger = getLogger();

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at: ' + String(promise) + ', reason: ' + String(reason));
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

/**
 * Main startup function
 */
async function main() {
  try {
    // Start API server FIRST so health check passes quickly (important for Back4App/containers)
    if (process.env.API_ENABLED === 'true') {
      console.log('📋 Starting API server first (for health check)...');
      const apiPort = parseInt(process.env.API_PORT || '3001');
      const apiServer = new APIServer(apiPort);
      await apiServer.start();
      console.log(`✅ API server running on port ${apiPort}\n`);
    } else {
      console.log('⚠️  API server is disabled');
      console.log('   Set API_ENABLED=true in .env to enable dashboard\n');
    }

    // Then start the bot (takes longer: Discord, WhatsApp, DB, etc.)
    console.log('🚀 Starting Multi-Platform Bot...\n');
    const bot = new MultiPlatformBot();
    await bot.start();

  } catch (error) {
    logger.error('Failed to start application', error as Error);
    console.error('\n❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
main();
