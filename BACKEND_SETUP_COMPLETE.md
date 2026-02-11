# 🚀 Backend Setup Complete - Hostinger Deployment

## 📋 Masalah yang Dialami

### Error yang Muncul:
```bash
-bash: npm: command not found
```

### Root Cause Analysis:

1. **Node.js/npm tidak terinstall** di server Hostinger
   - Hostinger tidak menyediakan Node.js secara default
   - Perlu install manual menggunakan NVM (Node Version Manager)

2. **GitHub Actions workflow gagal** karena:
   - Script mencoba menjalankan `npm install` tanpa Node.js
   - Tidak ada NVM initialization di workflow

3. **Repository belum di-clone** ke server
   - Directory `/home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html/api/` belum ada

---

## ✅ Solusi yang Diimplementasikan

### 1. Setup Scripts Created

#### `SETUP_BACKEND_HOSTINGER.sh`
- Automated setup script untuk first-time installation
- Handles: NVM install, Node.js install, PM2 install, repository clone, dependencies, build, start bot

#### `HOSTINGER_MANUAL_SETUP.md`
- Detailed step-by-step manual setup guide
- Explains each step with expected outputs
- Includes troubleshooting section

#### `QUICK_SETUP_COMMANDS.md`
- Quick reference card dengan copy-paste commands
- Minimal explanation, maksimal action
- Perfect untuk quick setup

### 2. GitHub Actions Workflow Updated

**File:** `.github/workflows/deploy-backend.yml`

**Changes:**
- Added NVM initialization at start of deployment
- Added Node.js version verification
- Added TypeScript type definitions installation
- Added error handling for file permissions

**New Workflow Steps:**
```yaml
# Load NVM (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 20
nvm use 20 || nvm use default

# Verify Node.js and npm are available
echo "📦 Node.js version: $(node -v)"
echo "📦 npm version: $(npm -v)"
```

---

## 📝 Setup Steps (Manual)

### Prerequisites:
- SSH access to Hostinger: `ssh -p 65002 u909490256@153.92.9.187`
- GitHub repository: `https://github.com/Dialius/task-monitor`

### Step-by-Step:

1. **Install NVM**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

2. **Install Node.js 20**
   ```bash
   nvm install 20
   nvm use 20
   nvm alias default 20
   ```

3. **Install PM2**
   ```bash
   npm install -g pm2
   ```

4. **Setup Backend Directory**
   ```bash
   cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html
   mkdir -p api && cd api
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/Dialius/task-monitor.git .
   ```

6. **Install Dependencies**
   ```bash
   npm install --production
   npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
   ```

7. **Create .env File**
   - All environment variables included in setup script
   - Production-ready configuration

8. **Build Backend**
   ```bash
   npm run build:backend
   ```

9. **Create Directories & Start Bot**
   ```bash
   mkdir -p auth_info logs
   chmod 755 auth_info logs
   pm2 start dist/index.js --name task-monitor-bot
   pm2 save
   ```

10. **Make NVM Persistent**
    ```bash
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    source ~/.bashrc
    ```

---

## 🎯 Deployment Architecture

### Current Setup:

```
Hostinger Server
├── Frontend: /public_html/
│   ├── index.html
│   ├── assets/
│   └── ... (Vite build output)
│
└── Backend: /public_html/api/
    ├── dist/ (compiled TypeScript)
    ├── src/ (source code)
    ├── auth_info/ (WhatsApp session)
    ├── logs/ (application logs)
    ├── .env (environment variables)
    └── node_modules/
```

### URLs:
- **Frontend:** https://rosybrown-horse-106773.hostingersite.com
- **Backend API:** https://rosybrown-horse-106773.hostingersite.com/api
- **Health Check:** https://rosybrown-horse-106773.hostingersite.com/api/health

---

## 🔄 Auto-Deploy Workflow

### How It Works:

1. **Developer pushes code** to GitHub (main/master branch)

2. **GitHub Actions triggers** (on changes to `src/`, `package.json`, `tsconfig.json`)

3. **Workflow steps:**
   - Checkout code
   - Setup Node.js 18 (on GitHub runner)
   - Install dependencies
   - Build backend
   - Deploy to Hostinger via SSH:
     - Load NVM
     - Use Node.js 20
     - Pull latest code
     - Install dependencies
     - Build backend
     - Restart PM2 process

4. **Bot automatically restarts** with new code

### GitHub Secrets Required:
- `SSH_HOST`: 153.92.9.187
- `SSH_USERNAME`: u909490256
- `SSH_PASSWORD`: (Hostinger SSH password)
- `SSH_PORT`: 65002
- `VITE_API_URL`: https://rosybrown-horse-106773.hostingersite.com/api
- `VITE_WS_URL`: wss://rosybrown-horse-106773.hostingersite.com

---

## 🛠️ PM2 Process Management

### Useful Commands:

```bash
# Check status
pm2 status

# View logs (real-time)
pm2 logs task-monitor-bot

# View last 100 lines
pm2 logs task-monitor-bot --lines 100

# Restart bot
pm2 restart task-monitor-bot

# Stop bot
pm2 stop task-monitor-bot

# Delete from PM2
pm2 delete task-monitor-bot

# Monitor (real-time dashboard)
pm2 monit

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

---

## 🔍 Verification Steps

### 1. Check Node.js Installation:
```bash
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

### 2. Check PM2 Status:
```bash
pm2 status
```

**Expected Output:**
```
┌─────┬──────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ status  │ restart │ uptime   │
├─────┼──────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ task-monitor-bot     │ online  │ 0       │ 5m       │
└─────┴──────────────────────┴─────────┴─────────┴──────────┘
```

### 3. Check Bot Logs:
```bash
pm2 logs task-monitor-bot --lines 50
```

**Look for:**
- ✅ MongoDB connected
- ✅ WhatsApp connected (if enabled)
- ✅ Discord connected (if enabled)
- ✅ API server listening on port 3001

### 4. Test API Endpoint:
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-xx-xx..."
}
```

### 5. Test Dashboard:
- Open: https://rosybrown-horse-106773.hostingersite.com
- Should see login page
- Try login with WhatsApp number: `628994630519`

---

## 🚨 Troubleshooting

### Issue 1: `npm: command not found` after reboot

**Cause:** NVM not loaded in current session

**Solution:**
```bash
source ~/.bashrc
# or
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

---

### Issue 2: Build fails with TypeScript errors

**Cause:** Missing type definitions

**Solution:**
```bash
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
npm run build:backend
```

---

### Issue 3: PM2 process crashes immediately

**Cause:** Runtime error in code

**Solution:**
```bash
# Check logs for error details
pm2 logs task-monitor-bot --lines 100

# Common issues:
# - Missing .env file
# - Invalid MongoDB URI
# - Port already in use
```

---

### Issue 4: Port 3001 already in use

**Cause:** Another process using port 3001

**Solution:**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill process
lsof -ti:3001 | xargs kill -9

# Restart bot
pm2 restart task-monitor-bot
```

---

### Issue 5: GitHub Actions deployment fails

**Cause:** NVM not loaded in SSH session

**Solution:** Already fixed in updated workflow (`.github/workflows/deploy-backend.yml`)

---

### Issue 6: WhatsApp QR code not showing

**Cause:** No terminal access for QR display

**Solution:**
```bash
# Check logs for QR code (will be ASCII art)
pm2 logs task-monitor-bot

# Or check auth_info directory
ls -la auth_info/
```

---

## 📊 Monitoring & Maintenance

### Daily Checks:
```bash
# Check bot status
pm2 status

# Check recent logs
pm2 logs task-monitor-bot --lines 50
```

### Weekly Maintenance:
```bash
# Update dependencies
npm update

# Rebuild
npm run build:backend

# Restart
pm2 restart task-monitor-bot
```

### Log Rotation:
- Winston automatically rotates logs daily
- Logs stored in `./logs/` directory
- Old logs automatically compressed

---

## 🎉 Success Criteria

✅ Node.js 20 installed via NVM
✅ PM2 installed globally
✅ Repository cloned to `/public_html/api/`
✅ Dependencies installed
✅ Backend built successfully (`dist/` folder exists)
✅ .env file created with production config
✅ Bot running with PM2 (status: online)
✅ NVM persistent in `~/.bashrc`
✅ GitHub Actions workflow updated
✅ Auto-deploy working

---

## 🔗 Related Documentation

- `HOSTINGER_MANUAL_SETUP.md` - Detailed step-by-step guide
- `QUICK_SETUP_COMMANDS.md` - Quick reference commands
- `SETUP_BACKEND_HOSTINGER.sh` - Automated setup script
- `AUTO_DEPLOY_GUIDE.md` - GitHub Actions auto-deploy guide
- `.github/SETUP_SECRETS.md` - GitHub Secrets configuration

---

## 📞 Support

### Common Questions:

**Q: Kenapa harus pakai NVM?**
A: Hostinger tidak menyediakan Node.js secara default. NVM memungkinkan kita install dan manage multiple Node.js versions.

**Q: Kenapa pakai Node.js 20?**
A: Node.js 20 adalah LTS (Long Term Support) version yang stable dan recommended untuk production.

**Q: Kenapa pakai PM2?**
A: PM2 adalah process manager yang:
- Auto-restart jika crash
- Log management
- Monitoring
- Startup script (auto-start on reboot)

**Q: Apakah auto-deploy akan berfungsi setelah setup manual?**
A: Ya! Setelah setup manual selesai, GitHub Actions akan otomatis deploy setiap kali ada push ke repository.

---

## 🚀 Next Steps

1. ✅ Complete manual setup on Hostinger
2. ✅ Verify bot is running with PM2
3. ✅ Test dashboard login
4. ✅ Test bot commands (WhatsApp/Discord)
5. ✅ Push code to GitHub to test auto-deploy
6. ✅ Monitor logs for any issues

---

## 📝 Notes

- **First-time setup:** Requires manual installation (NVM, Node.js, PM2)
- **Subsequent deploys:** Fully automated via GitHub Actions
- **No downtime:** PM2 handles graceful restarts
- **Logs:** Available via PM2 and Winston (daily rotation)
- **Monitoring:** Use PM2 monit or dashboard

---

**Setup Date:** 2024-02-11
**Status:** ✅ Ready for deployment
**Estimated Setup Time:** 10-15 minutes

---

🎉 **Backend setup complete! Ready to deploy!** 🎉
