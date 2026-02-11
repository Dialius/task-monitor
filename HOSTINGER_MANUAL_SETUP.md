# 🚀 Hostinger Backend Manual Setup Guide

## Masalah yang Terjadi

Dari error yang kamu alami:
```
-bash: npm: command not found
```

**Root Cause:** Node.js dan npm belum terinstall di server Hostinger kamu. Hostinger tidak menyediakan Node.js secara default, jadi kita harus install sendiri menggunakan NVM (Node Version Manager).

## Solusi: Install Node.js via NVM

Ikuti langkah-langkah ini di SSH Hostinger:

---

## STEP 1: Install NVM (Node Version Manager)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM ke session saat ini
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verify NVM installed
nvm --version
```

**Expected Output:** `0.39.7` atau versi lainnya

---

## STEP 2: Install Node.js 20

```bash
# Install Node.js 20
nvm install 20

# Use Node.js 20
nvm use 20

# Set Node.js 20 as default
nvm alias default 20

# Verify installation
node -v
npm -v
```

**Expected Output:**
```
v20.x.x
10.x.x
```

---

## STEP 3: Install PM2 Globally

```bash
npm install -g pm2

# Verify PM2 installed
pm2 --version
```

---

## STEP 4: Navigate to Backend Directory

```bash
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html

# Create api directory
mkdir -p api
cd api
```

---

## STEP 5: Clone Repository

```bash
# Clone repository
git clone https://github.com/Dialius/task-monitor.git .
```

**Note:** Jika diminta username/password GitHub:
- Username: `Dialius`
- Password: Gunakan **Personal Access Token** (bukan password biasa)
  - Cara buat: GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - Pilih scope: `repo` (full control of private repositories)

---

## STEP 6: Install Dependencies

```bash
# Install production dependencies
npm install --production

# Install TypeScript type definitions (needed for build)
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
```

---

## STEP 7: Create .env File

```bash
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://VinTheGreat:VINTAGE01@cluster0.jhprx.mongodb.net/
FIRST_ADMIN_DISCORD_ID=582071122225528842
FIRST_ADMIN_WHATSAPP_ID=628994630519
FIRST_ADMIN_ROLE=ketua
DISCORD_ENABLED=false
DISCORD_BOT_TOKEN=MTM3MTcyNjc5Mzk4NzQ2MTE4MA.G_yVHh.ljy24Dpsu3uA519b0t83CGmyE-rDnsDDYGn688
DISCORD_CLIENT_ID=1371726793987461180
DISCORD_GUILD_ID=1419483428520460392
DISCORD_CHANNEL_ID=1470432018738184445
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=120363424833026714@newsletter
WHATSAPP_TESTING_MODE=true
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=AIzaSyAgINOTutYJ5PI3k4brtHTv8HxEcpQcvy4
GEMINI_MODEL=gemini-2.5-flash
AI_TIMEOUT=10
NOTION_DATABASE_ID=3030a8e24bf6807bb826d8667d0764b0
NOTION_API_KEY=ntn_W28334028706CdGuxGjxJsjl97QvVjiKl87zm7eRk93dV8
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=17:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00
LOG_LEVEL=info
LOG_DIR=./logs
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
```

---

## STEP 8: Build Backend

```bash
# Build TypeScript to JavaScript
npm run build:backend
```

**Expected Output:** `dist/` folder created with compiled JavaScript files

---

## STEP 9: Create Required Directories

```bash
# Create auth_info and logs directories
mkdir -p auth_info logs
chmod 755 auth_info logs
```

---

## STEP 10: Start Bot with PM2

```bash
# Start bot
pm2 start dist/index.js --name task-monitor-bot

# Save PM2 process list
pm2 save

# Setup PM2 to start on server reboot
pm2 startup

# Check status
pm2 status
```

**Expected Output:**
```
┌─────┬──────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ status  │ restart │ uptime   │
├─────┼──────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ task-monitor-bot     │ online  │ 0       │ 0s       │
└─────┴──────────────────────┴─────────┴─────────┴──────────┘
```

---

## STEP 11: Make NVM Persistent (IMPORTANT!)

Agar NVM tetap available setelah logout/login, tambahkan ke `~/.bashrc`:

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

---

## Verify Setup

### Check Bot Logs
```bash
pm2 logs task-monitor-bot
```

### Check PM2 Status
```bash
pm2 status
```

### Test API Endpoint
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

---

## Useful PM2 Commands

```bash
# View logs
pm2 logs task-monitor-bot

# Restart bot
pm2 restart task-monitor-bot

# Stop bot
pm2 stop task-monitor-bot

# Delete bot from PM2
pm2 delete task-monitor-bot

# Monitor bot (real-time)
pm2 monit
```

---

## Troubleshooting

### Issue: `npm: command not found` after reboot
**Solution:** Run `source ~/.bashrc` or logout and login again

### Issue: Build fails with TypeScript errors
**Solution:** Make sure all type definitions are installed:
```bash
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
```

### Issue: PM2 process crashes
**Solution:** Check logs:
```bash
pm2 logs task-monitor-bot --lines 100
```

### Issue: Port 3001 already in use
**Solution:** Kill existing process:
```bash
lsof -ti:3001 | xargs kill -9
pm2 restart task-monitor-bot
```

---

## Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend already deployed
3. 🔄 Test dashboard login at: https://rosybrown-horse-106773.hostingersite.com
4. 🔄 Start bot from dashboard

---

## Dashboard Access

- **URL:** https://rosybrown-horse-106773.hostingersite.com
- **Default Admin:** Will be created from `FIRST_ADMIN_WHATSAPP_ID` in .env
- **Login:** Use WhatsApp number `628994630519` with any password (first login will set password)

---

## Auto-Deploy (After Manual Setup)

Setelah setup manual selesai, GitHub Actions akan otomatis deploy setiap kali ada push ke repository:

1. Push code ke GitHub
2. GitHub Actions akan:
   - Pull latest code
   - Install dependencies
   - Build backend
   - Restart PM2 process

**No manual intervention needed!** 🎉

---

## Summary

Masalah yang kamu alami:
1. ❌ Node.js/npm tidak terinstall di Hostinger
2. ❌ Repository belum di-clone
3. ❌ Dependencies belum terinstall
4. ❌ Backend belum di-build
5. ❌ PM2 belum terinstall

Solusi:
1. ✅ Install NVM (Node Version Manager)
2. ✅ Install Node.js 20 via NVM
3. ✅ Install PM2 globally
4. ✅ Clone repository
5. ✅ Install dependencies + type definitions
6. ✅ Build backend
7. ✅ Start bot with PM2
8. ✅ Make NVM persistent

Setelah setup manual ini selesai, auto-deploy via GitHub Actions akan berfungsi! 🚀
