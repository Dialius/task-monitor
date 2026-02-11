# API Deployment Solution

## Problem Summary

The API routes are not accessible because:
1. ✅ PHP proxy created (`api-proxy.php`)
2. ✅ `.htaccess` configured with API routing rules
3. ❌ Backend code not deployed to `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/`
4. ❌ PM2 process deleted (no bot running)

## Root Cause

The `api` directory was deleted or never properly created. The bot needs to be deployed to this location.

## Solution: Manual Deployment via SCP

Since `git clone` requires authentication on the server, we'll use SCP to upload the code from your local machine.

### Step 1: Prepare Local Build

```bash
# On your local machine (Windows)
cd D:\task-monitor

# Build the project
npm run build

# Create deployment package
mkdir deploy-package
cp -r dist deploy-package/
cp -r src deploy-package/
cp package.json deploy-package/
cp package-lock.json deploy-package/
cp tsconfig.json deploy-package/
cp .env.example deploy-package/
```

### Step 2: Upload via SCP

```bash
# Upload the deployment package
scp -P 65002 -r deploy-package u909490256@153.92.9.187:/home/u909490256/task-monitor-deploy

# Or use WinSCP if you prefer GUI
```

### Step 3: Deploy on Server

```bash
# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Run deployment script
cat > /tmp/deploy-from-upload.sh << 'EOF'
#!/bin/bash
set -e
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20

echo "Deploying API from uploaded package..."
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Copy files from upload
cp -r /home/u909490256/task-monitor-deploy/* .

# Copy .env
if [ -f /home/u909490256/.env ]; then
  cp /home/u909490256/.env .
else
  cp .env.example .env
  echo "⚠️  Please edit .env with your configuration"
fi

# Install dependencies
npm install

# Create directories
mkdir -p auth_info logs
chmod 755 auth_info logs

# Start with PM2
pm2 start dist/index.js --name task-monitor-bot
pm2 save

echo "✅ Deployment complete!"
pm2 status
pm2 logs task-monitor-bot --lines 20
EOF

chmod +x /tmp/deploy-from-upload.sh
bash /tmp/deploy-from-upload.sh
```

## Alternative: Use Hostinger File Manager

If SCP doesn't work, use Hostinger's File Manager:

1. Go to hPanel: https://hpanel.hostinger.com/
2. Navigate to: Files → File Manager
3. Go to: `/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/`
4. Upload these files:
   - `dist/` folder (entire folder)
   - `src/` folder (entire folder)
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `.env` (create from `.env.example`)

5. Then SSH and run:
```bash
ssh -p 65002 u909490256@153.92.9.187
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
npm install
mkdir -p auth_info logs
pm2 start dist/index.js --name task-monitor-bot
pm2 save
```

## Verification Steps

After deployment:

1. **Check PM2 status:**
```bash
pm2 status
# Should show: task-monitor-bot | online
```

2. **Check API locally:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

3. **Check API via proxy:**
```bash
curl https://rosybrown-horse-106773.hostingersite.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

4. **Check dashboard:**
- Open: https://rosybrown-horse-106773.hostingersite.com/login
- Should show login page (not blank)
- Try login with: admin / admin123

## Current Status

- ✅ Frontend deployed and accessible
- ✅ PHP proxy created (`api-proxy.php`)
- ✅ `.htaccess` configured correctly
- ✅ Express app has `trust proxy` enabled
- ❌ Backend code needs to be uploaded
- ❌ PM2 process needs to be started

## Next Steps

1. Choose deployment method (SCP or File Manager)
2. Upload backend code
3. Run deployment script
4. Verify API is accessible
5. Test dashboard login

## Files Modified

- `src/api/index.ts` - Added `trust proxy` setting
- `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api-proxy.php` - Created
- `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/.htaccess` - Updated with API routing

## Important Notes

- The `.htaccess` file gets overwritten when frontend is redeployed
- Always backup `.htaccess` before frontend deployment
- Or add API routing rules to frontend build process
