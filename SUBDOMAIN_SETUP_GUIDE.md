# 🌐 Subdomain Setup Guide - API Routing Solution

## Overview

Kita akan membuat subdomain `api.rosybrown-horse-106773.hostingersite.com` yang akan point ke folder API backend. Ini menghindari masalah .htaccess routing.

## Architecture

**Before (Not Working):**
```
https://rosybrown-horse-106773.hostingersite.com/
├── /              → Frontend (index.html)
└── /api/*         → Should go to API but doesn't work
```

**After (Working):**
```
https://rosybrown-horse-106773.hostingersite.com/     → Frontend
https://api.rosybrown-horse-106773.hostingersite.com/ → API Backend
```

## Step-by-Step Setup

### 1. Create Subdomain in hPanel

1. **Login to hPanel:**
   - Go to: https://hpanel.hostinger.com/
   - Login with your credentials

2. **Navigate to Subdomains:**
   - Click on "Domains" in the left sidebar
   - Click on "Subdomains"

3. **Create New Subdomain:**
   - Click "Create Subdomain" button
   - Enter subdomain name: `api`
   - Select domain: `rosybrown-horse-106773.hostingersite.com`
   - Document root: `/public_html/api`
   - Click "Create"

4. **Wait for DNS Propagation:**
   - Usually takes 5-15 minutes
   - Can take up to 24 hours in rare cases

### 2. Configure Backend for Subdomain

Update CORS and environment variables:

```bash
ssh -p 65002 u909490256@153.92.9.187
cd ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
```

Edit `.env` file:
```bash
nano .env
```

Update these lines:
```env
# Add subdomain to CORS origins
CORS_ORIGINS=https://rosybrown-horse-106773.hostingersite.com,https://api.rosybrown-horse-106773.hostingersite.com

# Update frontend URL
FRONTEND_URL=https://rosybrown-horse-106773.hostingersite.com
```

Save and restart PM2:
```bash
pm2 restart task-monitor-bot
```

### 3. Update Frontend Configuration

Update frontend to use subdomain API:

**Local machine:**
```bash
cd D:\task-monitor\frontend
```

Edit `frontend/.env`:
```env
VITE_API_URL=https://api.rosybrown-horse-106773.hostingersite.com
VITE_WS_URL=wss://api.rosybrown-horse-106773.hostingersite.com
```

### 4. Rebuild and Redeploy Frontend

```bash
cd D:\task-monitor\frontend
npm run build
```

Upload to Hostinger:
```bash
scp -P 65002 -r dist/* u909490256@153.92.9.187:~/domains/rosybrown-horse-106773.hostingersite.com/public_html/
```

Or use Hostinger File Manager to upload files from `frontend/dist/` to `/public_html/`

### 5. Create .htaccess for API Subdomain

The API subdomain needs its own .htaccess:

```bash
ssh -p 65002 u909490256@153.92.9.187
cat > ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/.htaccess << 'EOF'
# API Subdomain Configuration
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Redirect all requests to Node.js API
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
EOF
```

## Verification Steps

### 1. Test API Subdomain

Wait 5-15 minutes for DNS propagation, then test:

```bash
# Test health endpoint
curl https://api.rosybrown-horse-106773.hostingersite.com/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend Connection

1. Open: https://rosybrown-horse-106773.hostingersite.com/login
2. Try to login with: `admin` / `admin123`
3. Should successfully authenticate

### 3. Check Browser Console

Open browser DevTools (F12) → Console:
- Should see WebSocket connection to `wss://api.rosybrown-horse-106773.hostingersite.com`
- No CORS errors
- API requests going to subdomain

## Troubleshooting

### DNS Not Propagating

Check DNS status:
```bash
nslookup api.rosybrown-horse-106773.hostingersite.com
```

If not found, wait longer or clear DNS cache:
```bash
# Windows
ipconfig /flushdns

# Linux/Mac
sudo dscacheutil -flushcache
```

### CORS Errors

Update backend `.env`:
```env
CORS_ORIGINS=https://rosybrown-horse-106773.hostingersite.com,https://api.rosybrown-horse-106773.hostingersite.com
```

Restart PM2:
```bash
pm2 restart task-monitor-bot
```

### 502 Bad Gateway

Check if API is running:
```bash
pm2 status
pm2 logs task-monitor-bot
```

Restart if needed:
```bash
pm2 restart task-monitor-bot
```

### SSL Certificate Issues

Hostinger should auto-provision SSL for subdomain. If not:
1. Go to hPanel → SSL
2. Click "Install SSL" for subdomain
3. Wait 5-10 minutes

## Alternative: Manual Proxy Setup

If .htaccess proxy doesn't work, use PHP proxy:

```bash
cat > ~/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/index.php << 'EOF'
<?php
// Proxy all requests to Node.js
$url = 'http://localhost:3001' . $_SERVER['REQUEST_URI'];
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);

if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

http_response_code($httpCode);
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

foreach (explode("\n", $responseHeaders) as $header) {
    $header = trim($header);
    if (!empty($header) && strpos($header, 'HTTP/') !== 0) {
        header($header);
    }
}

echo $responseBody;
curl_close($ch);
?>
EOF
```

## Summary

**What We're Doing:**
1. ✅ Create subdomain: `api.rosybrown-horse-106773.hostingersite.com`
2. ✅ Point subdomain to `/public_html/api/`
3. ✅ Update frontend to use subdomain
4. ✅ Update backend CORS settings
5. ✅ Redeploy frontend with new API URL

**Benefits:**
- ✅ No .htaccess routing issues
- ✅ Clean separation of frontend/backend
- ✅ Better for production
- ✅ Easier to debug
- ✅ Standard industry practice

**Time Required:**
- Setup: 10 minutes
- DNS propagation: 5-15 minutes
- Total: ~25 minutes

## Next Steps

After subdomain is created and DNS propagates:
1. Test API: `curl https://api.rosybrown-horse-106773.hostingersite.com/health`
2. Test dashboard login
3. Start bot from dashboard
4. Scan WhatsApp QR code
5. Test bot commands

You're almost there! 🚀
