# Current Issue and Solution

## 🔴 Current Problem

The API is not accessible because the backend code was deleted from the server. The directory `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/` exists but is empty.

## ✅ What's Working

1. Frontend deployed: https://rosybrown-horse-106773.hostingersite.com
2. PHP proxy created: `api-proxy.php`
3. `.htaccess` configured with API routing
4. Express app has `trust proxy` enabled
5. MongoDB connection ready
6. Node.js 20 installed via NVM
7. PM2 installed

## ❌ What's Not Working

1. Backend code not deployed
2. PM2 process deleted (no bot running)
3. API endpoints return 502 Bad Gateway

## 🎯 Solution

Deploy the backend code using one of these methods:

### Method 1: Automated PowerShell Script (RECOMMENDED)

```powershell
# Run this on your local machine (Windows)
.\deploy-to-hostinger.ps1
```

This script will:
1. Build the project
2. Create deployment package
3. Upload via SCP
4. Deploy on server
5. Start PM2 process

### Method 2: Manual SCP Upload

```bash
# 1. Build locally
npm run build

# 2. Create package
mkdir deploy-package
cp -r dist deploy-package/
cp -r src deploy-package/
cp package.json deploy-package/
cp package-lock.json deploy-package/
cp tsconfig.json deploy-package/
cp .env deploy-package/

# 3. Upload
scp -P 65002 -r deploy-package u909490256@153.92.9.187:/home/u909490256/task-monitor-deploy

# 4. SSH and deploy
ssh -p 65002 u909490256@153.92.9.187
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
cp -r /home/u909490256/task-monitor-deploy/* .
npm install
mkdir -p auth_info logs
pm2 start dist/index.js --name task-monitor-bot
pm2 save
```

### Method 3: Hostinger File Manager (If SCP Fails)

1. Go to: https://hpanel.hostinger.com/
2. Files → File Manager
3. Navigate to: `/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/`
4. Upload these files/folders:
   - `dist/` (entire folder)
   - `src/` (entire folder)
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `.env`

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

## 🔍 Verification Steps

After deployment:

1. **Check PM2:**
```bash
ssh -p 65002 u909490256@153.92.9.187 "pm2 status"
# Should show: task-monitor-bot | online
```

2. **Check API health:**
```bash
curl https://rosybrown-horse-106773.hostingersite.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

3. **Check dashboard:**
- Open: https://rosybrown-horse-106773.hostingersite.com/login
- Should show login page
- Login with: admin / admin123

## 📝 Technical Details

### PHP Proxy (`api-proxy.php`)

The PHP proxy forwards requests from `/api/*` to `http://localhost:3001`:

```php
// Get request path (remove /api prefix)
$requestUri = $_SERVER['REQUEST_URI'];
$path = preg_replace('#^/api#', '', $requestUri);
$targetUrl = 'http://localhost:3001' . $path;

// Forward request with cURL
// ... (see api-proxy.php for full code)
```

### .htaccess Routing

```apache
# Route API requests to PHP proxy (MUST be first)
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ /api-proxy.php [L,QSA]

# Frontend routing (for everything else)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

### Express Trust Proxy

```typescript
// src/api/index.ts
private setupMiddleware(): void {
  // Trust proxy - required for running behind PHP proxy
  this.app.set('trust proxy', true);
  // ...
}
```

## 🚨 Important Notes

1. **Frontend Redeployment:** The `.htaccess` file gets overwritten when frontend is redeployed. Always backup or recreate API routing rules after frontend deployment.

2. **Git Clone Issue:** `git clone` doesn't work on the server because it requires authentication. Use SCP or File Manager instead.

3. **Node Version:** PM2 must use Node.js 20. Always run `nvm use 20` before starting PM2.

4. **Environment Variables:** Make sure `.env` file exists in the API directory with all required variables (MongoDB URI, API keys, etc.).

## 📊 Current Status

- ✅ Infrastructure ready (Node.js, PM2, MongoDB)
- ✅ Routing configured (PHP proxy, .htaccess)
- ✅ Code ready locally (built and tested)
- ❌ Code needs to be uploaded to server
- ❌ PM2 process needs to be started

## 🎯 Next Action

Run the deployment script:

```powershell
.\deploy-to-hostinger.ps1
```

This will complete the deployment and get your bot running!
