# 🚂 Railway Deployment Guide

## 📋 Checklist Persiapan

- [x] Code sudah di GitHub
- [x] `.env` sudah dikonfigurasi
- [x] `package.json` sudah ada build script
- [ ] Railway account
- [ ] Environment variables ready

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Buat Akun Railway

1. Buka: https://railway.app/
2. Click **"Login"** atau **"Start a New Project"**
3. **Sign up with GitHub** (recommended)
4. Authorize Railway untuk akses GitHub repos

**Screenshot yang akan kamu lihat:**
- Railway akan minta akses ke GitHub
- Pilih "Authorize Railway"

---

### Step 2: Create New Project

1. Di Railway dashboard, click **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Cari dan pilih repository: **`Dialius/task-monitor`**
4. Click **"Deploy Now"**

Railway akan:
- ✅ Auto-detect Node.js
- ✅ Install dependencies (`npm install`)
- ✅ Build project (`npm run build`)
- ✅ Start bot (`npm start`)

**Tunggu 2-3 menit** untuk initial deployment.

---

### Step 3: Configure Environment Variables

Ini yang PALING PENTING! Bot tidak akan jalan tanpa environment variables.

1. Di Railway dashboard, click project kamu
2. Click tab **"Variables"**
3. Click **"+ New Variable"**
4. Add satu per satu:

```env
# Database
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.jhprx.mongodb.net/task_monitor_bot

# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=120363424833026714@newsletter
WHATSAPP_TESTING_MODE=true

# Discord Configuration (optional)
DISCORD_ENABLED=false

# AI Services
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_TIMEOUT=10

# Notion Integration
NOTION_DATABASE_ID=3030a8e24bf6807bb826d8667d0764b0
NOTION_API_KEY=your_notion_api_key_here

# Timezone & Scheduler
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=17:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# API Server (DISABLED for bot-only)
API_ENABLED=false

# First Admin (Bootstrap)
FIRST_ADMIN_WHATSAPP_ID=628994630519
FIRST_ADMIN_ROLE=ketua
```

**Tips:**
- Copy paste satu per satu
- Jangan ada spasi di awal/akhir
- Pastikan semua value benar

---

### Step 4: Redeploy dengan Environment Variables

Setelah add semua variables:

1. Click **"Deploy"** atau **"Redeploy"**
2. Tunggu 2-3 menit
3. Check logs untuk memastikan bot running

---

### Step 5: Check Logs

1. Di Railway dashboard, click tab **"Deployments"**
2. Click deployment terbaru
3. Click **"View Logs"**

**Log yang HARUS muncul:**
```
╔════════════════════════════════════════════════════════╗
║   🤖 Task Monitor Bot - API Server                    ║
╚════════════════════════════════════════════════════════╝

📋 Starting API server...
   Bot will NOT start automatically
   Use dashboard to start/stop bot

⚠️  API server is disabled in .env
   Set API_ENABLED=true to enable dashboard
```

**Jika ada error:**
- Check environment variables
- Pastikan MongoDB URI benar
- Check logs untuk error message

---

### Step 6: Verify Bot Running

**Check MongoDB Connection:**
Logs harus menunjukkan:
```
✅ MongoDB connected successfully
```

**Check WhatsApp Connection:**
Bot akan generate QR code di logs (jika pertama kali):
```
Scan QR code to connect WhatsApp...
```

**Jika tidak ada QR code:**
- Bot sudah pernah connect sebelumnya
- Auth session masih valid
- Bot langsung connect

---

### Step 7: Monitor Bot

**Railway Dashboard:**
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time logs
- **Deployments:** History of deployments

**Useful Commands (Railway CLI - Optional):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open dashboard
railway open
```

---

## 🔧 TROUBLESHOOTING

### Problem: Build Failed

**Error:** `npm ERR! missing script: build`

**Solution:**
Check `package.json` memiliki build script:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

### Problem: Bot Crashes on Start

**Error:** `Cannot find module 'dist/index.js'`

**Solution:**
1. Check build script di `package.json`
2. Pastikan TypeScript compiled
3. Redeploy

---

### Problem: MongoDB Connection Failed

**Error:** `MongoServerError: bad auth`

**Solution:**
1. Check `MONGODB_URI` di Railway variables
2. Pastikan tidak ada spasi
3. Test connection di MongoDB Atlas:
   - Network Access → Add IP: `0.0.0.0/0` (allow all)
   - Database Access → Check user credentials

---

### Problem: WhatsApp Not Connecting

**Error:** `Connection closed`

**Solution:**
1. Check `WHATSAPP_GROUP_ID` benar
2. Scan QR code dari logs
3. Pastikan WhatsApp tidak login di device lain

---

### Problem: Out of Credit

**Error:** `Service suspended due to insufficient credits`

**Solution:**
1. Check usage di Railway dashboard
2. Optimize bot untuk reduce usage
3. Upgrade to paid plan ($5/month)

**Tips untuk hemat credit:**
- Disable unnecessary features
- Reduce log verbosity
- Optimize database queries

---

## 💰 COST MONITORING

### Check Usage:
1. Railway Dashboard → Project
2. Click **"Usage"** tab
3. Monitor:
   - **Execution time:** Berapa lama bot running
   - **Memory:** RAM usage
   - **Network:** Bandwidth usage

### Estimasi:
- **Bot sederhana:** ~$2-3/month
- **Bot dengan Notion sync:** ~$3-4/month
- **Bot dengan heavy traffic:** ~$4-5/month

### Tips Hemat:
- Disable API server (sudah disabled)
- Reduce Notion sync frequency
- Optimize database queries
- Use efficient logging

---

## 🎯 NEXT STEPS

### After Deployment:

1. **Test Bot:**
   - Send command di WhatsApp group
   - Check response
   - Test semua features

2. **Monitor Logs:**
   - Check for errors
   - Monitor performance
   - Watch credit usage

3. **Setup Alerts (Optional):**
   - Railway can send email alerts
   - Setup for deployment failures
   - Setup for high usage

4. **Backup Auth Session:**
   - Download `auth_info` folder dari Railway
   - Backup locally
   - Restore jika perlu redeploy

---

## 📞 SUPPORT

### Railway Support:
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

### Bot Issues:
- Check logs first
- Test locally: `npm run dev`
- Check MongoDB connection
- Verify environment variables

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Railway account created
- [ ] Project deployed from GitHub
- [ ] All environment variables added
- [ ] Bot successfully started
- [ ] MongoDB connected
- [ ] WhatsApp connected (QR scanned)
- [ ] Test commands working
- [ ] Logs monitored
- [ ] Usage tracked

**Status:** Ready to use! 🎉

---

**Need help?** Check logs atau tanya di Discord Railway community!
