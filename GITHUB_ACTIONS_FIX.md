# 🔧 GitHub Actions Deployment Fix

## 🚨 Current Error

**Error Message:**
```
2026/02/11 08:17:26 dial tcp ***.***.***.***:*****: connect: connection timed out
Error: Process completed with exit code 1.
```

**Location:** Deploy to Hostinger via SSH step

---

## 🔍 Root Cause Analysis

### Possible Causes:

1. **GitHub Secrets Not Configured** ❌
   - SSH_HOST, SSH_USERNAME, SSH_PASSWORD, SSH_PORT belum di-set
   - Atau value-nya salah

2. **SSH Connection Blocked** ❌
   - Hostinger firewall blocking GitHub Actions IP
   - SSH port salah
   - SSH credentials salah

3. **Network Timeout** ❌
   - Connection timeout (30 minutes too long)
   - Network issue between GitHub Actions dan Hostinger

---

## ✅ Solution 1: Verify GitHub Secrets

### Step 1: Check Current Secrets

1. Open: https://github.com/Dialius/task-monitor/settings/secrets/actions
2. Verify these secrets exist:
   - `SSH_HOST`
   - `SSH_USERNAME`
   - `SSH_PASSWORD`
   - `SSH_PORT`
   - `VITE_API_URL`
   - `VITE_WS_URL`

### Step 2: Add/Update Secrets

**If secrets don't exist or need update:**

1. Go to: https://github.com/Dialius/task-monitor/settings/secrets/actions
2. Click **"New repository secret"** or **"Update"**
3. Add each secret:

#### SSH_HOST
```
Name: SSH_HOST
Value: 153.92.9.187
```

#### SSH_USERNAME
```
Name: SSH_USERNAME
Value: u909490256
```

#### SSH_PASSWORD
```
Name: SSH_PASSWORD
Value: [Your Hostinger SSH password]
```

#### SSH_PORT
```
Name: SSH_PORT
Value: 65002
```

#### VITE_API_URL
```
Name: VITE_API_URL
Value: https://rosybrown-horse-106773.hostingersite.com/api
```

#### VITE_WS_URL
```
Name: VITE_WS_URL
Value: wss://rosybrown-horse-106773.hostingersite.com
```

### Step 3: Test SSH Connection Manually

**From your local machine:**
```bash
ssh -p 65002 u909490256@153.92.9.187
```

**Expected:** Should connect successfully

**If fails:** Check password or contact Hostinger support

---

## ✅ Solution 2: Use Alternative Deployment Method

Since GitHub Actions SSH might be blocked by Hostinger, we can use **Git Pull** method instead.

### Method: Deploy via Git Pull on Server

**How it works:**
1. Push code to GitHub ✅
2. SSH to Hostinger manually
3. Run `git pull` to update code
4. Rebuild and restart

**Pros:**
- No SSH connection from GitHub Actions needed
- More reliable
- Simpler

**Cons:**
- Need manual SSH to server
- Not fully automated

### Implementation:

Create a simple deploy script on server:

```bash
# SSH to Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Create deploy script
cat > /home/u909490256/deploy-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying backend..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Navigate to backend
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build
echo "🔨 Building..."
npm run build:backend

# Restart PM2
echo "🔄 Restarting bot..."
pm2 restart task-monitor-bot

echo "✅ Deployment complete!"
pm2 status
EOF

# Make executable
chmod +x /home/u909490256/deploy-backend.sh

# Test run
bash /home/u909490256/deploy-backend.sh
```

**Usage:**
```bash
# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Run deploy script
bash /home/u909490256/deploy-backend.sh
```

---

## ✅ Solution 3: Disable Auto-Deploy (Temporary)

If auto-deploy is not critical, we can disable it temporarily:

### Option A: Disable Workflow

1. Rename workflow files:
```bash
git mv .github/workflows/deploy-backend.yml .github/workflows/deploy-backend.yml.disabled
git mv .github/workflows/deploy-frontend.yml .github/workflows/deploy-frontend.yml.disabled
git commit -m "chore: Temporarily disable auto-deploy workflows"
git push
```

2. Deploy manually using script from Solution 2

### Option B: Skip CI for Commits

Add `[skip ci]` to commit message:
```bash
git commit -m "feat: New feature [skip ci]"
git push
```

This will skip GitHub Actions workflows.

---

## ✅ Solution 4: Fix Workflow Timeout

Current timeout is 30 minutes, which might be too long. Let's reduce it:

### Update Workflow Files

**File: `.github/workflows/deploy-backend.yml`**

Change:
```yaml
command_timeout: 30m
timeout: 30m
```

To:
```yaml
command_timeout: 10m
timeout: 10m
```

**File: `.github/workflows/deploy-frontend.yml`**

Same change.

---

## ✅ Solution 5: Add Debug Logging

Add debug steps to see what's happening:

### Update Backend Workflow

Add before SSH step:
```yaml
- name: 🔍 Debug SSH Connection
  run: |
    echo "SSH_HOST: ${{ secrets.SSH_HOST }}"
    echo "SSH_USERNAME: ${{ secrets.SSH_USERNAME }}"
    echo "SSH_PORT: ${{ secrets.SSH_PORT }}"
    echo "Testing connection..."
    nc -zv ${{ secrets.SSH_HOST }} ${{ secrets.SSH_PORT }} || echo "Connection failed"
```

---

## 🎯 Recommended Solution

**For now, use Solution 2 (Git Pull Method):**

1. ✅ Push code to GitHub (auto-deploy will fail, that's OK)
2. ✅ SSH to Hostinger manually
3. ✅ Run deploy script: `bash /home/u909490256/deploy-backend.sh`
4. ✅ Done!

**Later, we can:**
- Contact Hostinger support to whitelist GitHub Actions IPs
- Or use alternative deployment method (Hostinger API, FTP, etc.)

---

## 📝 Quick Deploy Commands

### Backend Deploy (Manual):
```bash
# SSH to server
ssh -p 65002 u909490256@153.92.9.187

# Navigate to backend
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api

# Pull, build, restart
git pull origin main && \
npm install --production && \
npm run build:backend && \
pm2 restart task-monitor-bot && \
pm2 status
```

### Frontend Deploy (Manual):
```bash
# On local machine, build frontend
cd D:\task-monitor\frontend
npm run build

# Upload via FTP or SCP
# Or use Hostinger File Manager
```

---

## 🔍 Troubleshooting

### Issue 1: "Permission denied (publickey)"

**Cause:** SSH key authentication required

**Solution:** Use password authentication (already configured in workflow)

### Issue 2: "Connection refused"

**Cause:** Wrong SSH port or host

**Solution:** Verify:
- SSH_HOST = `153.92.9.187`
- SSH_PORT = `65002`

### Issue 3: "Authentication failed"

**Cause:** Wrong password

**Solution:** 
1. Test SSH manually: `ssh -p 65002 u909490256@153.92.9.187`
2. Update SSH_PASSWORD secret with correct password

### Issue 4: "Timeout"

**Cause:** Hostinger firewall blocking GitHub Actions

**Solution:** Use manual deploy method (Solution 2)

---

## 📊 Deployment Status

### Current Status:
- ❌ Auto-deploy via GitHub Actions: **FAILING** (connection timeout)
- ✅ Manual deploy via SSH: **WORKING**
- ✅ Frontend: **DEPLOYED** (accessible)
- ✅ Backend: **RUNNING** (PM2 online)

### Recommended Workflow:
1. Develop locally
2. Commit and push to GitHub
3. SSH to Hostinger
4. Run deploy script
5. Verify deployment

---

## 🎉 Summary

**Problem:** GitHub Actions can't connect to Hostinger via SSH (timeout)

**Quick Fix:** Use manual deploy via SSH + git pull

**Long-term Fix:** 
- Contact Hostinger support to whitelist GitHub Actions IPs
- Or use alternative deployment method

**For now:** Manual deploy is reliable and works perfectly! ✅

---

## 📞 Need Help?

### Test SSH Connection:
```bash
ssh -p 65002 u909490256@153.92.9.187
```

### Check GitHub Secrets:
https://github.com/Dialius/task-monitor/settings/secrets/actions

### View GitHub Actions Logs:
https://github.com/Dialius/task-monitor/actions

### Deploy Manually:
```bash
ssh -p 65002 u909490256@153.92.9.187
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api
git pull origin main && npm install --production && npm run build:backend && pm2 restart task-monitor-bot
```

---

**Status:** Manual deploy working, auto-deploy needs Hostinger support ✅
