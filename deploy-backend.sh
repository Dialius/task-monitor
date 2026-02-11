#!/bin/bash
# ============================================
# BACKEND DEPLOYMENT SCRIPT
# ============================================
# Run this script on Hostinger server to deploy backend

set -e  # Exit on error

echo "🚀 Starting Backend Deployment..."
echo ""

# ============================================
# STEP 1: Load NVM
# ============================================
echo "📦 Loading NVM..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 || nvm use default
echo "✅ Node.js $(node -v) loaded"
echo ""

# ============================================
# STEP 2: Navigate to Backend Directory
# ============================================
echo "📂 Navigating to backend directory..."
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
echo "✅ Current directory: $(pwd)"
echo ""

# ============================================
# STEP 3: Pull Latest Code
# ============================================
echo "📥 Pulling latest code from GitHub..."
git pull origin main || git pull origin master
echo "✅ Code updated"
echo ""

# ============================================
# STEP 4: Install Dependencies
# ============================================
echo "📦 Installing dependencies..."
npm install --production
echo "✅ Dependencies installed"
echo ""

# ============================================
# STEP 5: Install TypeScript Type Definitions
# ============================================
echo "📦 Installing TypeScript type definitions..."
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
echo "✅ Type definitions installed"
echo ""

# ============================================
# STEP 6: Build Backend
# ============================================
echo "🔨 Building backend..."
npm run build:backend
echo "✅ Backend built successfully"
echo ""

# ============================================
# STEP 7: Restart PM2 Process
# ============================================
echo "🔄 Restarting bot..."
pm2 restart task-monitor-bot || pm2 start dist/index.js --name task-monitor-bot
pm2 save
echo "✅ Bot restarted"
echo ""

# ============================================
# STEP 8: Show Status
# ============================================
echo "📊 PM2 Status:"
pm2 status
echo ""

echo "📝 Recent Logs:"
pm2 logs task-monitor-bot --lines 20 --nostream
echo ""

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo "✅ ============================================"
echo "✅ BACKEND DEPLOYMENT COMPLETE!"
echo "✅ ============================================"
echo ""
echo "🌐 Dashboard: https://rosybrown-horse-106773.hostingersite.com"
echo "🔗 API: https://rosybrown-horse-106773.hostingersite.com/api"
echo ""
echo "📝 Useful commands:"
echo "  - Check logs: pm2 logs task-monitor-bot"
echo "  - Restart bot: pm2 restart task-monitor-bot"
echo "  - Stop bot: pm2 stop task-monitor-bot"
echo "  - PM2 status: pm2 status"
echo ""
