# 🆓 Free Bot Hosting Options

## 📊 Perbandingan Platform Hosting Gratis

### 1. Railway.app ⭐ RECOMMENDED
**Website:** https://railway.app/

**Pros:**
- ✅ $5 credit gratis per bulan (cukup untuk bot 24/7)
- ✅ Deploy langsung dari GitHub
- ✅ Support Node.js, Python, Go, dll
- ✅ Environment variables management
- ✅ Logs real-time
- ✅ Auto-deploy on git push
- ✅ Custom domain support
- ✅ Persistent storage (volumes)
- ✅ Tidak perlu credit card untuk trial

**Cons:**
- ⚠️ Setelah $5 habis, perlu upgrade ($5/month)
- ⚠️ Sleep mode jika tidak ada activity (bisa diatasi dengan cron job)

**Cocok untuk:**
- WhatsApp bot (butuh persistent connection)
- Discord bot
- Bot yang perlu running 24/7

**Estimasi Usage:**
- Bot sederhana: ~$3-4/month
- Bot dengan database: ~$4-5/month

---

### 2. Render.com ⭐ RECOMMENDED
**Website:** https://render.com/

**Pros:**
- ✅ Free tier permanent (tidak expire)
- ✅ Deploy dari GitHub
- ✅ Auto-deploy on push
- ✅ Environment variables
- ✅ Logs dan monitoring
- ✅ Custom domain
- ✅ PostgreSQL database gratis

**Cons:**
- ⚠️ Free tier sleep setelah 15 menit tidak ada request
- ⚠️ Spin up time ~30 detik saat wake up
- ⚠️ 750 jam/bulan (cukup untuk 1 service 24/7)

**Cocok untuk:**
- Discord bot (bisa handle sleep mode)
- Bot yang tidak butuh persistent connection
- Bot dengan traffic rendah

**Workaround Sleep Mode:**
- Setup cron job untuk ping setiap 10 menit
- Gunakan UptimeRobot untuk keep alive

---

### 3. Fly.io
**Website:** https://fly.io/

**Pros:**
- ✅ Free tier generous (3 shared-cpu VMs)
- ✅ 160GB bandwidth/month
- ✅ Deploy dari Dockerfile
- ✅ Persistent volumes (3GB gratis)
- ✅ Global deployment
- ✅ Tidak sleep

**Cons:**
- ⚠️ Perlu credit card untuk verify
- ⚠️ Setup lebih kompleks (butuh Dockerfile)
- ⚠️ Resource terbatas di free tier

**Cocok untuk:**
- WhatsApp bot (no sleep)
- Bot yang butuh persistent storage
- Advanced users

---

### 4. Heroku (Tidak Recommended)
**Website:** https://www.heroku.com/

**Status:** ❌ Tidak ada free tier lagi sejak November 2022

**Alternative:**
- Heroku sekarang mulai dari $5/month
- Tidak worth it untuk bot sederhana

---

### 5. Glitch.com
**Website:** https://glitch.com/

**Pros:**
- ✅ Completely free
- ✅ Online code editor
- ✅ Auto-deploy
- ✅ Community support

**Cons:**
- ⚠️ Sleep setelah 5 menit tidak ada request
- ⚠️ 4000 request/hour limit
- ⚠️ Resource sangat terbatas
- ⚠️ Tidak cocok untuk production

**Cocok untuk:**
- Testing dan development
- Bot sederhana dengan traffic rendah

---

### 6. Replit
**Website:** https://replit.com/

**Pros:**
- ✅ Free tier available
- ✅ Online IDE
- ✅ Easy setup
- ✅ Community

**Cons:**
- ⚠️ Sleep mode di free tier
- ⚠️ Resource terbatas
- ⚠️ Tidak reliable untuk 24/7

**Cocok untuk:**
- Development dan testing
- Learning projects

---

### 7. Oracle Cloud Free Tier ⭐ BEST for 24/7
**Website:** https://www.oracle.com/cloud/free/

**Pros:**
- ✅ ALWAYS FREE (tidak expire)
- ✅ 2 AMD VMs dengan 1GB RAM each
- ✅ 4 ARM VMs dengan 24GB RAM total
- ✅ 200GB storage
- ✅ Full control (seperti VPS)
- ✅ No sleep mode
- ✅ Public IP

**Cons:**
- ⚠️ Perlu credit card untuk verify
- ⚠️ Setup manual (seperti VPS)
- ⚠️ Perlu skill Linux/server management
- ⚠️ Kadang susah daftar (banyak yang ditolak)

**Cocok untuk:**
- WhatsApp bot 24/7
- Multiple bots
- Advanced users yang bisa manage server

---

### 8. Google Cloud Run
**Website:** https://cloud.google.com/run

**Pros:**
- ✅ 2 million requests/month gratis
- ✅ 360,000 GB-seconds memory
- ✅ Auto-scale
- ✅ Pay per use

**Cons:**
- ⚠️ Perlu credit card
- ⚠️ Cold start (sleep mode)
- ⚠️ Tidak cocok untuk persistent connection

**Cocok untuk:**
- API-based bots
- Webhook bots
- Serverless architecture

---

## 🎯 REKOMENDASI BERDASARKAN KEBUTUHAN

### Untuk WhatsApp Bot (Butuh 24/7, Persistent Connection)

**Pilihan Terbaik:**
1. **Railway.app** - Paling mudah, $5 credit gratis
2. **Oracle Cloud** - Gratis selamanya, tapi butuh skill
3. **Fly.io** - Good balance antara mudah dan gratis

**Tidak Recommended:**
- ❌ Render.com (sleep mode)
- ❌ Glitch (sleep mode)
- ❌ Replit (sleep mode)

### Untuk Discord Bot (Bisa Handle Sleep)

**Pilihan Terbaik:**
1. **Render.com** - Free permanent + workaround sleep
2. **Railway.app** - Paling mudah
3. **Fly.io** - No sleep

### Untuk Testing/Development

**Pilihan Terbaik:**
1. **Glitch** - Paling mudah
2. **Replit** - Online IDE
3. **Render.com** - Production-ready

---


## 🚀 STEP-BY-STEP DEPLOYMENT

### Option 1: Railway.app (EASIEST)

#### 1. Persiapan
```bash
# Pastikan project sudah di GitHub
git add -A
git commit -m "Prepare for Railway deployment"
git push origin main
```

#### 2. Deploy ke Railway
1. Buka https://railway.app/
2. Sign up dengan GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Pilih repository: `task-monitor`
6. Railway akan auto-detect Node.js

#### 3. Configure Environment Variables
Di Railway dashboard:
- Settings → Variables
- Add semua variable dari `.env`:
  ```
  MONGODB_URI=mongodb+srv://...
  WHATSAPP_ENABLED=true
  WHATSAPP_GROUP_ID=...
  GROQ_API_KEY=...
  GEMINI_API_KEY=...
  NOTION_DATABASE_ID=...
  NOTION_API_KEY=...
  API_ENABLED=false
  ```

#### 4. Deploy
- Railway akan auto-deploy
- Check logs di dashboard
- Bot akan running 24/7

#### 5. Monitor
```bash
# Install Railway CLI (optional)
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs
```

**Estimasi Biaya:** $3-4/month (dari $5 credit gratis)

---

### Option 2: Render.com (FREE PERMANENT)

#### 1. Persiapan
```bash
# Push ke GitHub
git push origin main
```

#### 2. Deploy ke Render
1. Buka https://render.com/
2. Sign up dengan GitHub
3. Click "New +" → "Web Service"
4. Connect repository: `task-monitor`
5. Configure:
   - Name: `task-monitor-bot`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
   - Plan: `Free`

#### 3. Environment Variables
Di Render dashboard:
- Environment → Add Environment Variables
- Copy semua dari `.env`

#### 4. Keep Alive (Prevent Sleep)
Buat file `keep-alive.js`:
```javascript
const https = require('https');

// Ping setiap 10 menit
setInterval(() => {
  https.get('https://your-app.onrender.com/health', (res) => {
    console.log(`Keep alive ping: ${res.statusCode}`);
  });
}, 10 * 60 * 1000);
```

Atau gunakan external service:
- UptimeRobot: https://uptimerobot.com/ (gratis)
- Cron-job.org: https://cron-job.org/ (gratis)

**Estimasi Biaya:** $0 (gratis selamanya dengan workaround)

---

### Option 3: Oracle Cloud (ADVANCED)

#### 1. Sign Up
1. Buka https://www.oracle.com/cloud/free/
2. Sign up (perlu credit card untuk verify)
3. Pilih region terdekat

#### 2. Create VM Instance
1. Compute → Instances → Create Instance
2. Pilih:
   - Image: Ubuntu 22.04
   - Shape: VM.Standard.E2.1.Micro (Always Free)
   - Add SSH key
3. Create

#### 3. Setup Server
```bash
# SSH ke server
ssh ubuntu@<your-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/Dialius/task-monitor.git
cd task-monitor

# Install dependencies
npm install

# Build
npm run build

# Create .env
nano .env
# Paste environment variables

# Start with PM2
pm2 start dist/index.js --name task-monitor-bot
pm2 save
pm2 startup

# Setup firewall (optional)
sudo ufw allow 22
sudo ufw enable
```

#### 4. Monitor
```bash
# Check status
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart
pm2 restart task-monitor-bot
```

**Estimasi Biaya:** $0 (gratis selamanya)

---

### Option 4: Fly.io

#### 1. Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

#### 2. Login
```bash
fly auth login
```

#### 3. Create Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

#### 4. Deploy
```bash
# Initialize
fly launch

# Deploy
fly deploy

# Set environment variables
fly secrets set MONGODB_URI="mongodb+srv://..."
fly secrets set WHATSAPP_ENABLED="true"
# ... set semua env vars

# Check status
fly status

# View logs
fly logs
```

**Estimasi Biaya:** $0 (dalam free tier)

---

## 🔧 TROUBLESHOOTING

### Railway.app

**Problem:** Build failed
```bash
# Solution: Check build logs
# Pastikan package.json memiliki build script
```

**Problem:** Out of memory
```bash
# Solution: Optimize build
# Tambah di package.json:
"engines": {
  "node": "20.x"
}
```

### Render.com

**Problem:** Service sleeping
```bash
# Solution: Setup UptimeRobot
# Ping URL setiap 5 menit
```

**Problem:** Slow cold start
```bash
# Solution: Tidak bisa dihindari di free tier
# Upgrade ke paid plan ($7/month) untuk no sleep
```

### Oracle Cloud

**Problem:** Cannot SSH
```bash
# Solution: Check security list
# Ingress rule: 0.0.0.0/0 port 22
```

**Problem:** Out of disk space
```bash
# Solution: Clean up
sudo apt autoremove
sudo apt clean
pm2 flush
```

---

## 💰 COST COMPARISON

| Platform | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| Railway | $5 credit/month | $5/month | Easy setup |
| Render | Free forever* | $7/month | Discord bot |
| Fly.io | 3 VMs free | $1.94/month | Flexible |
| Oracle | Always free | - | 24/7 WhatsApp |
| Glitch | Free | $8/month | Testing |
| Replit | Free | $7/month | Learning |

*dengan sleep mode

---

## 🎯 FINAL RECOMMENDATION

### Untuk Bot Kamu (WhatsApp + Discord + Notion):

**Pilihan #1: Railway.app**
- ✅ Paling mudah setup
- ✅ $5 credit gratis (cukup 1 bulan)
- ✅ No sleep mode
- ✅ Auto-deploy
- ⚠️ Setelah 1 bulan perlu bayar $5/month

**Pilihan #2: Oracle Cloud**
- ✅ Gratis selamanya
- ✅ No sleep mode
- ✅ Full control
- ⚠️ Setup lebih kompleks
- ⚠️ Perlu skill server management

**Pilihan #3: Render.com + UptimeRobot**
- ✅ Gratis selamanya
- ✅ Mudah setup
- ⚠️ Perlu workaround untuk sleep mode
- ⚠️ Cold start 30 detik

### My Suggestion:
1. **Mulai dengan Railway** - Coba gratis 1 bulan
2. **Jika cocok** - Lanjut bayar $5/month (worth it)
3. **Jika mau gratis** - Pindah ke Oracle Cloud atau Render

---

## 📞 SUPPORT

### Railway
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

### Render
- Docs: https://render.com/docs
- Community: https://community.render.com/

### Oracle Cloud
- Docs: https://docs.oracle.com/en-us/iaas/
- Forum: https://community.oracle.com/

### Fly.io
- Docs: https://fly.io/docs/
- Community: https://community.fly.io/

---

**Mau saya bantu deploy ke platform mana?** 🚀
