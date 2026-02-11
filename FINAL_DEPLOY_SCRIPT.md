# Final Deploy Script

## Problem
- Domain `terminal.jastiphype.shop` hilang
- NVM dan Node.js tidak terinstall
- Backend belum deployed

## Solution

### 1. Install NVM dan Node.js

```bash
ssh -p 65002 u909490256@153.92.9.187

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v
npm -v

# Install PM2 globally
npm install -g pm2
```

### 2. Deploy Backend

```bash
# Copy files
cd ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
cp -r ~/backend-deploy/* .

# Install dependencies
npm install

# Create directories
mkdir -p auth_info logs

# Start with PM2
pm2 start dist/index.js --name task-monitor-bot
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs task-monitor-bot --lines 20
```

### 3. Deploy Frontend

```bash
# On local machine
cd D:\task-monitor\frontend
npm run build

# Upload
scp -P 65002 -r dist/* u909490256@153.92.9.187:~/frontend-new/

# SSH and deploy
ssh -p 65002 u909490256@153.92.9.187
cp -r ~/frontend-new/* ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/
```

### 4. Test

```bash
# Test API
curl http://localhost:3001/health

# Test dashboard
# Open: https://rosybrown-horse-106773.hostingersite.com/login
# Login: admin / admin123
```

## Quick Commands

```bash
# SSH
ssh -p 65002 u909490256@153.92.9.187

# Check PM2
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart
pm2 restart task-monitor-bot
```
