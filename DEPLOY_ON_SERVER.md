# Deploy API on Server (You're Already SSH'd In!)

Since you're already on the server, run these commands directly:

## Step 1: Create Deployment Script

```bash
cat > /tmp/deploy-api.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying API..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20

# Navigate to API directory
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

echo "📥 Downloading code..."
wget -q -O repo.tar.gz https://github.com/Dialius/task-monitor/tarball/main

echo "📦 Extracting..."
tar -xzf repo.tar.gz --strip-components=1
rm repo.tar.gz

echo "📋 Setting up .env..."
if [ -f ~/.env ]; then
  cp ~/.env .
else
  cp .env.example .env
  echo "⚠️  Edit .env with your configuration!"
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building..."
npm run build

echo "📁 Creating directories..."
mkdir -p auth_info logs
chmod 755 auth_info logs

echo "🚀 Starting with PM2..."
pm2 start dist/index.js --name task-monitor-bot
pm2 save

echo "✅ Done!"
pm2 status
pm2 logs task-monitor-bot --lines 20 --nostream
EOF

chmod +x /tmp/deploy-api.sh
```

## Step 2: Run Deployment

```bash
bash /tmp/deploy-api.sh
```

## Step 3: Verify

```bash
# Check PM2 status
pm2 status

# Check API health
curl http://localhost:3001/health

# Check via proxy
curl https://rosybrown-horse-106773.hostingersite.com/api/health
```

## If wget Fails (Repository is Private)

The repository might be private. In that case, you need to:

### Option A: Make Repository Public Temporarily

1. Go to: https://github.com/Dialius/task-monitor/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Make public"
4. Run deployment script
5. Make it private again after deployment

### Option B: Use Personal Access Token

```bash
# Create token at: https://github.com/settings/tokens
# Then use:
wget --header="Authorization: token YOUR_GITHUB_TOKEN" \
  -O repo.tar.gz \
  https://github.com/Dialius/task-monitor/tarball/main
```

### Option C: Exit SSH and Use Local Machine

```bash
# Exit SSH
exit

# On your local Windows machine (PowerShell):
.\deploy-to-hostinger.ps1
```

## Quick Commands Reference

```bash
# Check if bot is running
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart bot
pm2 restart task-monitor-bot

# Stop bot
pm2 stop task-monitor-bot

# Check API
curl http://localhost:3001/health
```
