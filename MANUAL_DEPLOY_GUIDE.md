# 📦 Manual Deployment Guide

## 🎯 Overview

Karena GitHub Actions auto-deploy mengalami connection timeout ke Hostinger, kita akan menggunakan **manual deployment** yang lebih reliable.

**Workflow:**
1. Develop locally ✅
2. Commit & push to GitHub ✅
3. Deploy manually via SSH ✅

---

## 🚀 Backend Deployment (Quick)

### Method 1: One-Line Command (Fastest) ⚡

**SSH to Hostinger and run:**
```bash
ssh -p 65002 u909490256@153.92.9.187 "cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api && export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\" && nvm use 20 && git pull origin main && npm install --production && npm run build:backend && pm2 restart task-monitor-bot && pm2 status"
```

### Method 2: Using Deploy Script (Recommended) 📜

**Step 1: SSH to Hostinger**
```bash
ssh -p 65002 u909490256@153.92.9.187
```

**Step 2: Create deploy script (one-time setup)**
```bash
cat > /home/u909490256/deploy-backend.sh << 'EOF'
#!/bin/bash
set -e
echo "🚀 Deploying backend..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Navigate to backend
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Pull, install, build, restart
git pull origin main
npm install --production
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
npm run build:backend
pm2 restart task-monitor-bot

echo "✅ Deployment complete!"
pm2 status
EOF

chmod +x /home/u909490256/deploy-backend.sh
```

**Step 3: Run deploy script**
```bash
bash /home/u909490256/deploy-backend.sh
```

### Method 3: Step-by-Step (Manual) 🔧

**SSH to Hostinger:**
```bash
ssh -p 65002 u909490256@153.92.9.187
```

**Run commands:**
```bash
# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Navigate to backend
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Install type definitions
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript

# Build
npm run build:backend

# Restart bot
pm2 restart task-monitor-bot

# Check status
pm2 status
pm2 logs task-monitor-bot --lines 20
```

---

## 🎨 Frontend Deployment

### Method 1: Build Locally + Upload via SCP (Recommended) 📤

**Step 1: Build frontend locally (Windows)**
```powershell
# Navigate to project
cd D:\task-monitor\frontend

# Install dependencies
npm install

# Build
npm run build
```

**Step 2: Upload via SCP**
```powershell
# Upload dist folder to Hostinger
scp -P 65002 -r dist/* u909490256@153.92.9.187:/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/
```

### Method 2: Build on Server (Alternative) 🔧

**SSH to Hostinger:**
```bash
ssh -p 65002 u909490256@153.92.9.187
```

**Run commands:**
```bash
# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Navigate to frontend
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html

# Clone repository (if not exists)
git clone https://github.com/Dialius/task-monitor.git temp-build
cd temp-build/frontend

# Install dependencies
npm install

# Build
npm run build

# Copy build files to public_html
cp -r dist/* ../../

# Cleanup
cd ../../
rm -rf temp-build

# Verify
ls -lh
```

### Method 3: Upload via Hostinger File Manager 📁

**Step 1: Build locally**
```powershell
cd D:\task-monitor\frontend
npm install
npm run build
```

**Step 2: Upload via File Manager**
1. Login to Hostinger hPanel: https://hpanel.hostinger.com
2. Go to **File Manager**
3. Navigate to: `/domains/rosybrown-horse-106773.hostingersite.com/public_html/`
4. Delete old files (except `api/` folder)
5. Upload all files from `frontend/dist/`
6. Done! ✅

---

## 🔄 Complete Deployment Workflow

### Scenario: You made changes to both frontend and backend

**Step 1: Commit and push to GitHub**
```bash
# On local machine (Windows)
cd D:\task-monitor

# Add changes
git add .

# Commit
git commit -m "feat: New feature"

# Push
git push origin main
```

**Step 2: Deploy backend**
```bash
# SSH to Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Run deploy script
bash /home/u909490256/deploy-backend.sh
```

**Step 3: Deploy frontend**
```powershell
# On local machine (Windows)
cd D:\task-monitor\frontend

# Build
npm run build

# Upload via SCP
scp -P 65002 -r dist/* u909490256@153.92.9.187:/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/
```

**Step 4: Verify**
1. Open: https://rosybrown-horse-106773.hostingersite.com
2. Check dashboard loads
3. Test login
4. Check bot status

---

## 📊 Deployment Checklist

### Before Deployment:
- [ ] Code tested locally
- [ ] No errors in console
- [ ] All tests passing
- [ ] Committed to Git
- [ ] Pushed to GitHub

### Backend Deployment:
- [ ] SSH to Hostinger
- [ ] Run deploy script
- [ ] Check PM2 status (online)
- [ ] Check logs (no errors)
- [ ] Test API endpoint

### Frontend Deployment:
- [ ] Build locally
- [ ] Upload to Hostinger
- [ ] Clear browser cache
- [ ] Test dashboard loads
- [ ] Test login
- [ ] Test all features

### After Deployment:
- [ ] Dashboard accessible
- [ ] Login working
- [ ] Bot status showing
- [ ] Logs displaying
- [ ] No errors in browser console

---

## 🐛 Troubleshooting

### Issue 1: "git pull" fails with "Permission denied"

**Solution:**
```bash
# Check if you're in the right directory
pwd

# Check git remote
git remote -v

# If needed, re-clone
cd ..
rm -rf api
git clone https://github.com/Dialius/task-monitor.git api
cd api
```

### Issue 2: "npm: command not found"

**Solution:**
```bash
# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Verify
node -v
npm -v
```

### Issue 3: "pm2: command not found"

**Solution:**
```bash
# Install PM2 globally
npm install -g pm2

# Verify
pm2 --version
```

### Issue 4: Build fails with TypeScript errors

**Solution:**
```bash
# Install type definitions
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript

# Rebuild
npm run build:backend
```

### Issue 5: Frontend shows blank page

**Solution:**
1. Check browser console (F12) for errors
2. Verify API URL in frontend/.env
3. Check if backend is running: `pm2 status`
4. Clear browser cache (Ctrl+Shift+Delete)
5. Hard refresh (Ctrl+F5)

---

## 🎯 Quick Reference

### Backend Deploy (One Command):
```bash
ssh -p 65002 u909490256@153.92.9.187 "bash /home/u909490256/deploy-backend.sh"
```

### Frontend Deploy (One Command):
```powershell
cd D:\task-monitor\frontend && npm run build && scp -P 65002 -r dist/* u909490256@153.92.9.187:/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/
```

### Check Bot Status:
```bash
ssh -p 65002 u909490256@153.92.9.187 "pm2 status && pm2 logs task-monitor-bot --lines 20 --nostream"
```

### Restart Bot:
```bash
ssh -p 65002 u909490256@153.92.9.187 "pm2 restart task-monitor-bot"
```

---

## 📝 Notes

### Why Manual Deployment?

**Pros:**
- ✅ More reliable (no connection timeout)
- ✅ Full control over deployment process
- ✅ Can see logs in real-time
- ✅ Easier to troubleshoot

**Cons:**
- ❌ Not fully automated
- ❌ Need to SSH manually
- ❌ Takes a bit more time

### Future: Auto-Deploy

Once Hostinger whitelists GitHub Actions IPs or we find alternative method, we can re-enable auto-deploy.

For now, manual deployment is the most reliable option! ✅

---

## 🎉 Summary

**Deployment Process:**
1. Code → Commit → Push to GitHub ✅
2. SSH to Hostinger ✅
3. Run deploy script ✅
4. Verify deployment ✅

**Time Required:**
- Backend: ~2-3 minutes
- Frontend: ~3-5 minutes
- Total: ~5-8 minutes

**Reliability:** 99.9% (very reliable!)

---

**Happy Deploying!** 🚀
