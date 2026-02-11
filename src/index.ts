/**
 * Multi-Platform Class Reminder Bot
 * Main entry point
 * Requirements: 17.1 (Global error handlers)
 */

import dotenv from 'dotenv';
import { APIServer } from './api';
import { getLogger } from './utils/Logger';

// Load environment variables
dotenv.config();

const logger = getLogger();

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   🤖 Task Monitor Bot - API Server                    ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('📋 Starting API server...');
console.log('   Bot will NOT start automatically');
console.log('   Use dashboard to start/stop bot\n');

// Start API server if enabled
if (process.env.API_ENABLED === 'true') {
  const apiPort = parseInt(process.env.API_PORT || '3001');
  const apiServer = new APIServer(apiPort);
  
  apiServer.start().catch((error) => {
    logger.error('Failed to start API server', error);
    console.error('❌ Failed to start API server:', error);
  });
} else {
  console.log('⚠️  API server is disabled in .env');
  console.log('   Set API_ENABLED=true to enable dashboard\n');
}
