# 🚀 Quick Start: Deploy ke Hostinger

## ✅ Yang Sudah Siap

- ✅ GitHub Actions workflows configured
- ✅ Build scripts optimized
- ✅ Frontend Vite config ready
- ✅ Backend TypeScript config ready

## 📋 Yang Perlu Dilakukan (30 Menit)

### Step 1: Add GitHub Secrets (5 menit)

Buka: https://github.com/Dialius/task-monitor/settings/secrets/actions

Tambahkan 6 secrets ini:

```
SSH_HOST = 153.92.9.187
SSH_USERNAME = u909490256
SSH_PASSWORD = [your SSH password]
SSH_PORT = 65002
VITE_API_URL = https://rosybrown-horse-106773.hostingersite.com/api
VITE_WS_URL = https://rosybrown-horse-106773.hostingersite.com
```

### Step 2: Setup Backend di Hostinger (15 menit)

```bash
# 1. SSH ke Hostinger
ssh -p 65002 u909490256@153.92.9.187

# 2. Navigate ke public_html
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html

# 3. Create API directory
mkdir -p api
cd api

# 4. Clone repository
git clone https://github.com/Dialius/task-monitor.git .

# 5. Install dependencies
npm install --production

# 6. Build backend
npm run build:backend

# 7. Create .env file
nano .env
```

Paste environment variables ke `.env`:
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Discord
DISCORD_ENABLED=true
DISCORD_BOT_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...
DISCORD_CHANNEL_ID=...

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=...

# Notion
NOTION_API_KEY=...
NOTION_DATABASE_ID=...

# Groq AI
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-70b-versatile

# Gemini AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash

# API Server
API_ENABLED=true
API_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
CORS_ORIGINS=https://rosybrown-horse-106773.hostingersite.com

# Frontend URL
FRONTEND_URL=https://rosybrown-horse-106773.hostingersite.com

# Logging
LOG_LEVEL=info
```

Save: `Ctrl+X` → `Y` → `Enter`

```bash
# 8. Install PM2
npm install -g pm2

# 9. Start bot
pm2 start dist/index.js --name task-monitor-bot
pm2 save
pm2 startup

# 10. Check status
pm2 status
pm2 logs task-monitor-bot
```

### Step 3: Test Auto-Deploy (10 menit)

#### Test Frontend:

```bash
# Di komputer Anda
cd D:\task-monitor

# Edit file
echo "# Test Deploy" >> frontend/README.md

# Push
git add .
git commit -m "Test: Frontend auto-deploy"
git push
```

Buka: https://github.com/Dialius/task-monitor/actions

Lihat workflow "Deploy Frontend to Hostinger" running (hijau ✅)

Buka: https://rosybrown-horse-106773.hostingersite.com

Dashboard harus muncul!

#### Test Backend:

```bash
# Edit file
echo "// Test Deploy" >> src/bot.ts

# Push
git add .
git commit -m "Test: Backend auto-deploy"
git push
```

Buka: https://github.com/Dialius/task-monitor/actions

Lihat workflow "Deploy Backend to Hostinger" running (hijau ✅)

SSH dan check:
```bash
ssh -p 65002 u909490256@153.92.9.187
pm2 status
```

Bot harus running!

---

## 🎯 Setelah Ini

### Workflow Normal:

1. **Edit code** di komputer
2. **Commit** changes
3. **Push** ke GitHub
4. **Auto-deploy!** 🎉

### Frontend Changes:
```bash
# Edit frontend files
git add .
git commit -m "feat: Add new feature"
git push
# Auto-deploy ke https://rosybrown-horse-106773.hostingersite.com
```

### Backend Changes:
```bash
# Edit backend files
git add .
git commit -m "fix: Fix bug"
git push
# Auto-deploy dan PM2 restart otomatis
```

---

## 📊 Monitoring

### GitHub Actions:
https://github.com/Dialius/task-monitor/actions

### PM2 Status:
```bash
ssh -p 65002 u909490256@153.92.9.187
pm2 status
pm2 logs task-monitor-bot
pm2 monit
```

### Website:
- Frontend: https://rosybrown-horse-106773.hostingersite.com
- Backend API: https://rosybrown-horse-106773.hostingersite.com/api/health

---

## 🐛 Troubleshooting

### Workflow Failed?

1. Check GitHub Actions logs
2. Verify GitHub Secrets benar
3. Test SSH: `ssh -p 65002 u909490256@153.92.9.187`

### Bot Not Running?

```bash
ssh -p 65002 u909490256@153.92.9.187
pm2 logs task-monitor-bot
pm2 restart task-monitor-bot
```

### Frontend Blank Page?

1. Check browser console (F12)
2. Check VITE_API_URL dan VITE_WS_URL
3. Check backend running: `pm2 status`

---

## 🎉 Done!

Sekarang Anda punya:
- ✅ Auto-deploy frontend
- ✅ Auto-deploy backend
- ✅ Bot running 24/7
- ✅ Professional CI/CD pipeline

Push code → Auto-deploy! 🚀

---

## 📚 Dokumentasi Lengkap

- `AUTO_DEPLOY_GUIDE.md` - Complete auto-deploy guide
- `.github/SETUP_SECRETS.md` - Setup GitHub Secrets
- `DEPLOYMENT_COMPLETE_SUMMARY.md` - Full summary

Happy deploying! 🎊
