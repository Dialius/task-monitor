#!/bin/bash
# Setup API Subdomain Configuration
# Run this on Hostinger server after creating subdomain in hPanel

set -e

echo "🌐 Setting up API subdomain configuration..."

# Variables
API_DIR="$HOME/domains/rosybrown-horse-106773.hostingersite.com/public_html/api"
FRONTEND_URL="https://rosybrown-horse-106773.hostingersite.com"
API_URL="https://api.rosybrown-horse-106773.hostingersite.com"

# 1. Update backend .env
echo "📝 Updating backend .env..."
cd "$API_DIR"

# Backup current .env
cp .env .env.backup

# Update CORS_ORIGINS
sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=${FRONTEND_URL},${API_URL}|" .env

# Update FRONTEND_URL
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=${FRONTEND_URL}|" .env

echo "✅ Backend .env updated"

# 2. Create .htaccess for API subdomain
echo "📝 Creating API .htaccess..."
cat > "$API_DIR/.htaccess" << 'HTEOF'
# API Subdomain Configuration
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Proxy all requests to Node.js API on port 3001
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header always set Access-Control-Allow-Origin "*"
  Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
  Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Handle OPTIONS requests
<IfModule mod_rewrite.c>
  RewriteCond %{REQUEST_METHOD} OPTIONS
  RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
HTEOF

echo "✅ API .htaccess created"

# 3. Restart PM2
echo "🔄 Restarting PM2..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
pm2 restart task-monitor-bot

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Current configuration:"
echo "   Frontend: $FRONTEND_URL"
echo "   API:      $API_URL"
echo ""
echo "🔍 Verification steps:"
echo "   1. Wait 5-15 minutes for DNS propagation"
echo "   2. Test API: curl $API_URL/health"
echo "   3. Open dashboard: $FRONTEND_URL/login"
echo "   4. Login with: admin / admin123"
echo ""
echo "📝 Check logs:"
echo "   pm2 logs task-monitor-bot"
echo ""
