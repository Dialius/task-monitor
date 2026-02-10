# 🚀 Hostinger Deployment Guide

## ❓ Apakah Bot Bisa Di-Hosting di Hostinger?

### ⚠️ JAWABAN: TIDAK DIREKOMENDASIKAN (Tapi Ada Alternatif)

---

## 🔍 Analisis Requirements

### Bot Requirements

**Runtime:**
- ✅ Node.js 18+ (TypeScript compiled to JavaScript)
- ✅ MongoDB database
- ✅ Persistent storage untuk WhatsApp session
- ✅ Long-running process (24/7)
- ✅ WebSocket connections (WhatsApp Baileys)
- ✅ Cron jobs (auto-edit every 1 hour)

**Resources:**
- RAM: ~200-500 MB
- CPU: Low (spikes during AI parsing)
- Storage: ~100 MB + logs
- Network: Persistent connections to WhatsApp/Discord

---

## 🏢 Hostinger Business Plan Capabilities

### ✅ Yang Tersedia:
1. **Node.js Support** - ✅ Ada (via cPanel)
2. **SSH Access** - ✅ Ada
3. **Cron Jobs** - ✅ Ada
4. **Storage** - ✅ 200 GB NVMe
5. **RAM** - ✅ 6 GB
6. **CPU** - ✅ 4 cores

### ❌ Yang TIDAK Tersedia/Terbatas:
1. **Long-running processes** - ❌ Shared hosting restart processes
2. **WebSocket persistent connections** - ❌ Tidak stable
3. **MongoDB** - ❌ Tidak include (harus external)
4. **Process management (PM2)** - ⚠️ Terbatas
5. **Root access** - ❌ Tidak ada

---

## ⚠️ Masalah Utama di Hostinger Shared Hosting

### 1. Process Restart Otomatis
**Problem:** Shared hosting restart processes secara berkala (biasanya setiap 24 jam atau saat idle).

**Impact:**
- WhatsApp session terputus
- Perlu scan QR code ulang
- Cron jobs mungkin tidak reliable

---

### 2. WebSocket Connections
**Problem:** Baileys (WhatsApp library) butuh persistent WebSocket connection.

**Impact:**
- Connection sering terputus
- Tidak stable untuk production
- Messages bisa missed

---

### 3. MongoDB External
**Problem:** Hostinger tidak provide MongoDB, harus pakai external service.

**Impact:**
- Latency lebih tinggi
- Biaya tambahan (MongoDB Atlas, etc.)
- Network overhead

---

### 4. Resource Limits
**Problem:** Shared hosting punya resource limits per account.

**Impact:**
- CPU throttling saat AI parsing
- Memory limits bisa tercapai
- Concurrent connections terbatas

---

## ✅ SOLUSI YANG DIREKOMENDASIKAN

### Option 1: VPS (Virtual Private Server) ⭐ RECOMMENDED

**Providers:**
- **Hostinger VPS** - $4.99/month (KVM 1)
- **DigitalOcean** - $6/month (Basic Droplet)
- **Vultr** - $6/month (Cloud Compute)
- **Linode** - $5/month (Nanode)

**Advantages:**
- ✅ Full root access
- ✅ Persistent processes
- ✅ Stable WebSocket connections
- ✅ Install MongoDB locally
- ✅ PM2 process management
- ✅ No resource sharing

**Setup Time:** 30-60 minutes

---

### Option 2: Cloud Platform (PaaS)

**Providers:**
- **Railway.app** - $5/month (Hobby plan)
- **Render.com** - $7/month (Starter)
- **Fly.io** - ~$5/month (Pay as you go)
- **Heroku** - $7/month (Eco Dyno)

**Advantages:**
- ✅ Easy deployment (Git push)
- ✅ Auto-scaling
- ✅ Built-in MongoDB (some providers)
- ✅ Free SSL
- ✅ Monitoring dashboard

**Setup Time:** 15-30 minutes

---

### Option 3: Hostinger Business + External Services ⚠️ NOT RECOMMENDED

**Setup:**
- Hostinger Business: Bot code
- MongoDB Atlas: Free tier (512 MB)
- Keep WhatsApp session in external storage

**Advantages:**
- ✅ Sudah punya Hostinger
- ✅ Murah (no additional cost)

**Disadvantages:**
- ❌ Tidak stable
- ❌ Frequent disconnections
- ❌ Perlu monitoring terus
- ❌ WhatsApp session sering expired

**Verdict:** Bisa jalan tapi TIDAK RELIABLE untuk production.

---

## 🎯 REKOMENDASI TERBAIK

### Untuk Bot WhatsApp: VPS

**Recommended: Hostinger VPS KVM 1**
- **Price:** $4.99/month (~Rp 80.000/bulan)
- **Specs:** 1 vCPU, 4 GB RAM, 50 GB NVMe
- **OS:** Ubuntu 22.04 LTS
- **Location:** Singapore (low latency)

**Why VPS?**
1. ✅ Full control over processes
2. ✅ Stable WhatsApp connection
3. ✅ Install MongoDB locally (no external service)
4. ✅ PM2 for process management
5. ✅ Reliable cron jobs
6. ✅ No resource sharing
7. ✅ Root access for troubleshooting

---

## 📋 VPS Setup Guide (Hostinger)

### Step 1: Order VPS

1. Login ke Hostinger
2. Go to VPS → Order VPS
3. Pilih **KVM 1** ($4.99/month)
4. OS: **Ubuntu 22.04 LTS**
5. Location: **Singapore**
6. Complete payment

---

### Step 2: Initial Setup

**Connect via SSH:**
```bash
ssh root@your-vps-ip
```

**Update system:**
```bash
apt update && apt upgrade -y
```

**Install Node.js 18:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # Should show v18.x
```

**Install MongoDB:**
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Verify
mongosh --eval "db.version()"
```

**Install PM2:**
```bash
npm install -g pm2
pm2 startup  # Follow instructions
```

**Install Git:**
```bash
apt install -y git
```

---

### Step 3: Deploy Bot

**Clone repository:**
```bash
cd /opt
git clone https://github.com/Dialius/task-monitor.git
cd task-monitor
```

**Install dependencies:**
```bash
npm install
```

**Configure environment:**
```bash
cp .env.example .env
nano .env
```

**Update .env:**
```bash
# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/task_monitor

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=your_channel_id

# Discord (optional)
DISCORD_ENABLED=false

# Notion
NOTION_API_KEY=your_notion_key
NOTION_DATABASE_ID=your_database_id

# AI Service
GROQ_API_KEY=your_groq_key
# OR
GEMINI_API_KEY=your_gemini_key

# Timezone
TIMEZONE=Asia/Jakarta
```

**Build:**
```bash
npm run build
```

**Start with PM2:**
```bash
pm2 start dist/index.js --name task-monitor
pm2 save
```

**Check status:**
```bash
pm2 status
pm2 logs task-monitor
```

---

### Step 4: Setup Firewall

**Allow SSH and MongoDB:**
```bash
ufw allow 22/tcp
ufw allow 27017/tcp  # MongoDB (if needed externally)
ufw enable
```

---

### Step 5: Setup Auto-restart

**PM2 already handles:**
- ✅ Auto-restart on crash
- ✅ Auto-start on server reboot
- ✅ Log rotation
- ✅ Monitoring

**Verify:**
```bash
pm2 list
pm2 info task-monitor
```

---

## 🔧 Maintenance Commands

**View logs:**
```bash
pm2 logs task-monitor
pm2 logs task-monitor --lines 100
```

**Restart bot:**
```bash
pm2 restart task-monitor
```

**Stop bot:**
```bash
pm2 stop task-monitor
```

**Update bot:**
```bash
cd /opt/task-monitor
git pull origin main
npm install
npm run build
pm2 restart task-monitor
```

**Monitor resources:**
```bash
pm2 monit
htop
```

**Check MongoDB:**
```bash
mongosh
use task_monitor
db.tasks.countDocuments()
```

---

## 💰 Cost Comparison

### Option 1: VPS (Recommended)
**Hostinger VPS KVM 1:**
- VPS: $4.99/month (~Rp 80.000)
- MongoDB: Included (local)
- **Total: $4.99/month**

---

### Option 2: Cloud Platform
**Railway.app:**
- Hobby plan: $5/month
- MongoDB: Included
- **Total: $5/month**

---

### Option 3: Hostinger Business + External
**Hostinger Business:**
- Already paid (no additional cost)
- MongoDB Atlas: Free tier
- **Total: $0/month**

**BUT:** Not reliable, frequent issues!

---

## 🎯 Final Recommendation

### ⭐ PILIH VPS!

**Reasons:**
1. ✅ Paling stable dan reliable
2. ✅ Full control
3. ✅ Murah ($4.99/month)
4. ✅ Sudah familiar dengan Hostinger
5. ✅ Easy to setup (30-60 menit)
6. ✅ No external dependencies
7. ✅ Production-ready

**Hostinger Business bisa dipakai untuk:**
- Website/landing page
- Documentation hosting
- Static files
- Backup storage

---

## 🚫 Jangan Pakai Shared Hosting Untuk:

1. ❌ WhatsApp bots (butuh persistent connection)
2. ❌ Discord bots (same reason)
3. ❌ Long-running processes
4. ❌ WebSocket applications
5. ❌ Real-time applications

**Shared hosting cocok untuk:**
- ✅ WordPress websites
- ✅ Static websites
- ✅ PHP applications
- ✅ Cron jobs (simple tasks)

---

## 📞 Support

**Hostinger VPS Support:**
- Live chat: 24/7
- Knowledge base: https://support.hostinger.com
- Community: https://www.hostinger.com/tutorials/vps

**Bot Issues:**
- GitHub: https://github.com/Dialius/task-monitor/issues
- Documentation: See `TESTING_GUIDE.md`

---

## ✅ Kesimpulan

**Jawaban:** Bot TIDAK BISA di-hosting dengan reliable di Hostinger Business (shared hosting).

**Solusi:** Upgrade ke Hostinger VPS KVM 1 ($4.99/month) untuk deployment yang stable dan production-ready.

**Benefit VPS:**
- Stable WhatsApp connection
- No disconnections
- Full control
- Local MongoDB
- PM2 process management
- Production-ready

**Next Steps:**
1. Order Hostinger VPS KVM 1
2. Follow setup guide di atas
3. Deploy bot dalam 30-60 menit
4. Bot running 24/7 tanpa masalah!

---

**Need help with VPS setup? Let me know!** 🚀
