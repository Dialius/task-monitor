/**
 * PM2 Ecosystem Configuration
 * For production deployment with PM2 process manager
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 *   pm2 logs
 */

module.exports = {
  apps: [
    {
      name: 'multiplatform-class-bot',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'production'
      },
      
      // Restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Restart delay
      restart_delay: 5000,
      
      // Error handling
      min_uptime: '10s',
      max_restarts: 10,
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true
    }
  ]
};
