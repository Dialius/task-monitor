#!/bin/bash
# ============================================
# HOSTINGER BACKEND SETUP SCRIPT
# ============================================
# This script sets up the backend on Hostinger server
# Run this ONCE on the server via SSH

set -e  # Exit on error

echo "🚀 Starting Hostinger Backend Setup..."
echo ""

# ============================================
# STEP 1: Install NVM (Node Version Manager)
# ============================================
echo "📦 Step 1: Installing NVM..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    echo "✅ NVM installed"
else
    echo "✅ NVM already installed"
fi

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo ""

# ============================================
# STEP 2: Install Node.js 20
# ============================================
echo "📦 Step 2: Installing Node.js 20..."
nvm install 20
nvm use 20
nvm alias default 20
echo "✅ Node.js $(node -v) installed"
echo "✅ npm $(npm -v) installed"
echo ""

# ============================================
# STEP 3: Install PM2 globally
# ============================================
echo "📦 Step 3: Installing PM2..."
npm install -g pm2
echo "✅ PM2 installed"
echo ""

# ============================================
# STEP 4: Setup backend directory
# ============================================
echo "📂 Step 4: Setting up backend directory..."
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html

# Create api directory if not exists
mkdir -p api
cd api

echo "✅ Backend directory ready"
echo ""

# ============================================
# STEP 5: Clone repository
# ============================================
echo "📥 Step 5: Cloning repository..."
if [ -d ".git" ]; then
    echo "⚠️  Repository already exists, pulling latest changes..."
    git pull origin main || git pull origin master
else
    echo "Cloning repository..."
    git clone https://github.com/Dialius/task-monitor.git .
fi
echo "✅ Repository cloned"
echo ""

# ============================================
# STEP 6: Install dependencies
# ============================================
echo "📦 Step 6: Installing dependencies..."
npm install --production
echo "✅ Dependencies installed"
echo ""

# ============================================
# STEP 7: Install TypeScript type definitions
# ============================================
echo "📦 Step 7: Installing TypeScript type definitions..."
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors
echo "✅ Type definitions installed"
echo ""

# ============================================
# STEP 8: Build backend
# ============================================
echo "🔨 Step 8: Building backend..."
npm run build:backend
echo "✅ Backend built successfully"
echo ""

# ============================================
# STEP 9: Create .env file
# ============================================
echo "⚙️  Step 9: Creating .env file..."
cat > .env << 'EOF'
# ============================================
# MULTI-PLATFORM CLASS REMINDER BOT CONFIG
# ============================================

# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGODB_URI=mongodb+srv://VinTheGreat:VINTAGE01@cluster0.jhprx.mongodb.net/

# ============================================
# FIRST ADMIN CONFIGURATION (BOOTSTRAP)
# ============================================
FIRST_ADMIN_DISCORD_ID=582071122225528842
FIRST_ADMIN_WHATSAPP_ID=628994630519
FIRST_ADMIN_ROLE=ketua

# ============================================
# DISCORD CONFIGURATION
# ============================================
DISCORD_ENABLED=false
DISCORD_BOT_TOKEN=MTM3MTcyNjc5Mzk4NzQ2MTE4MA.G_yVHh.ljy24Dpsu3uA519b0t83CGmyE-rDnsDDYGn688
DISCORD_CLIENT_ID=1371726793987461180
DISCORD_GUILD_ID=1419483428520460392
DISCORD_CHANNEL_ID=1470432018738184445

# ============================================
# WHATSAPP CONFIGURATION
# ============================================
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=120363424833026714@newsletter
WHATSAPP_TESTING_MODE=true

# ============================================
# AI SERVICE CONFIGURATION
# ============================================
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=AIzaSyAgINOTutYJ5PI3k4brtHTv8HxEcpQcvy4
GEMINI_MODEL=gemini-2.5-flash
AI_TIMEOUT=10

# ============================================
# NOTION INTEGRATION (OPTIONAL)
# ============================================
NOTION_DATABASE_ID=3030a8e24bf6807bb826d8667d0764b0
NOTION_API_KEY=ntn_W28334028706CdGuxGjxJsjl97QvVjiKl87zm7eRk93dV8

# ============================================
# SCHEDULER CONFIGURATION
# ============================================
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=17:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00

# ============================================
# LOGGING CONFIGURATION
# ============================================
LOG_LEVEL=info
LOG_DIR=./logs

# ============================================
# API SERVER CONFIGURATION (DASHBOARD)
# ============================================
API_ENABLED=true
API_PORT=3001
JWT_SECRET=hostinger-production-secret-2024-change-this
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d
FRONTEND_URL=https://rosybrown-horse-106773.hostingersite.com
CORS_ORIGINS=https://rosybrown-horse-106773.hostingersite.com
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
EOF

echo "✅ .env file created"
echo ""

# ============================================
# STEP 10: Create required directories
# ============================================
echo "📁 Step 10: Creating required directories..."
mkdir -p auth_info logs
chmod 755 auth_info logs
echo "✅ Directories created"
echo ""

# ============================================
# STEP 11: Set permissions
# ============================================
echo "🔒 Step 11: Setting permissions..."
chmod -R 755 dist
find dist -type f -exec chmod 644 {} \; 2>/dev/null || true
echo "✅ Permissions set"
echo ""

# ============================================
# STEP 12: Start bot with PM2
# ============================================
echo "🚀 Step 12: Starting bot with PM2..."
pm2 start dist/index.js --name task-monitor-bot
pm2 save
pm2 startup
echo "✅ Bot started"
echo ""

# ============================================
# SETUP COMPLETE
# ============================================
echo "✅ ============================================"
echo "✅ SETUP COMPLETE!"
echo "✅ ============================================"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Useful commands:"
echo "  - Check logs: pm2 logs task-monitor-bot"
echo "  - Restart bot: pm2 restart task-monitor-bot"
echo "  - Stop bot: pm2 stop task-monitor-bot"
echo "  - PM2 status: pm2 status"
echo ""
echo "🌐 Dashboard URL: https://rosybrown-horse-106773.hostingersite.com"
echo "🔗 API URL: https://rosybrown-horse-106773.hostingersite.com/api"
echo ""
echo "⚠️  IMPORTANT: Add NVM to your ~/.bashrc for persistence:"
echo "   echo 'export NVM_DIR=\"\$HOME/.nvm\"' >> ~/.bashrc"
echo "   echo '[ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\"' >> ~/.bashrc"
echo "   source ~/.bashrc"
echo ""
