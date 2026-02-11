# 🚀 Quick Setup Commands - Copy & Paste

Jalankan command ini satu per satu di SSH Hostinger:

---

## 1️⃣ Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
nvm --version
```

---

## 2️⃣ Install Node.js 20

```bash
nvm install 20 && \
nvm use 20 && \
nvm alias default 20 && \
node -v && \
npm -v
```

---

## 3️⃣ Install PM2

```bash
npm install -g pm2 && \
pm2 --version
```

---

## 4️⃣ Setup Backend Directory

```bash
cd /home/u909490256/domains/rosybrown-horse-106773.hostingersite.com/public_html && \
mkdir -p api && \
cd api
```

---

## 5️⃣ Clone Repository

```bash
git clone https://github.com/Dialius/task-monitor.git .
```

**Note:** Jika diminta password, gunakan GitHub Personal Access Token (bukan password biasa)

---

## 6️⃣ Install Dependencies

```bash
npm install --production && \
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
```

---

## 7️⃣ Create .env File

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

## 8️⃣ Build Backend

```bash
npm run build:backend
```

---

## 9️⃣ Create Directories & Start Bot

```bash
mkdir -p auth_info logs && \
chmod 755 auth_info logs && \
pm2 start dist/index.js --name task-monitor-bot && \
pm2 save && \
pm2 status
```

---

## 🔟 Make NVM Persistent

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc && \
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc && \
source ~/.bashrc
```

---

## ✅ Verify Setup

```bash
pm2 logs task-monitor-bot --lines 50
```

---

## 🎯 Useful Commands

```bash
# Check bot status
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart bot
pm2 restart task-monitor-bot

# Stop bot
pm2 stop task-monitor-bot

# Monitor bot (real-time)
pm2 monit
```

---

## 🌐 Access Dashboard

**URL:** https://rosybrown-horse-106773.hostingersite.com

**Login:**
- WhatsApp: `628994630519`
- Password: (set on first login)

---

## 🚨 Troubleshooting

### If `npm: command not found` after reboot:
```bash
source ~/.bashrc
```

### If build fails:
```bash
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
npm run build:backend
```

### If PM2 crashes:
```bash
pm2 logs task-monitor-bot --lines 100
```

---

## 📝 Summary

1. Install NVM → Install Node.js 20 → Install PM2
2. Clone repository → Install dependencies
3. Create .env → Build backend
4. Start bot with PM2 → Make NVM persistent
5. Done! 🎉

**Auto-deploy akan berfungsi setelah setup manual ini selesai!**
