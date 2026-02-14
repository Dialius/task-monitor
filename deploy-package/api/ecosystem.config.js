module.exports = {
  apps: [{
    name: 'task-monitor-bot',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '300M', // Batasi memory agar tidak dimatikan Hostinger
    env: {
      NODE_ENV: 'production',
      PORT: 3001 // Port backend, HARUS beda dengan port frontend (80/443)
    }
  }]
};
