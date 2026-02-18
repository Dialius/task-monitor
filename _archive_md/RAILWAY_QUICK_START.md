# 🚂 Railway Quick Start - 5 Menit Deploy!

## ✅ Prerequisites
- [x] Code sudah di GitHub: https://github.com/Dialius/task-monitor
- [x] MongoDB Atlas ready
- [x] Environment variables ready

---

## 🚀 DEPLOY SEKARANG (5 Langkah)

### 1️⃣ Buka Railway & Login
👉 **https://railway.app/**

Click **"Login"** → **"Login with GitHub"**

---

### 2️⃣ Create New Project
Click **"New Project"** → **"Deploy from GitHub repo"**

Pilih: **`Dialius/task-monitor`**

Click **"Deploy Now"**

⏳ Tunggu 2-3 menit...

---

### 3️⃣ Add Environment Variables
Click project → Tab **"Variables"** → **"+ New Variable"**

**Copy paste ini satu per satu:**

```
MONGODB_URI=mongodb+srv://VinTheGreat:VINTAGE01@cluster0.jhprx.mongodb.net/task_monitor_bot
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=120363424833026714@newsletter
WHATSAPP_TESTING_MODE=true
DISCORD_ENABLED=false
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
API_ENABLED=false
FIRST_ADMIN_WHATSAPP_ID=628994630519
FIRST_ADMIN_ROLE=ketua
```

---

### 4️⃣ Redeploy
Click **"Deploy"** atau **"Redeploy"**

⏳ Tunggu 2-3 menit...

---

### 5️⃣ Check Logs
Tab **"Deployments"** → Click deployment terbaru → **"View Logs"**

**Harus muncul:**
```
╔════════════════════════════════════════════════════════╗
║   🤖 Task Monitor Bot - API Server                    ║
╚════════════════════════════════════════════════════════╝

✅ MongoDB connected successfully
```

**Jika ada QR code:**
- Scan dengan WhatsApp
- Bot akan connect

**Jika tidak ada QR code:**
- Bot sudah connect (auth session masih valid)

---

## ✅ DONE! Bot Running 24/7

### Test Bot:
1. Buka WhatsApp group
2. Send: `/status`
3. Bot harus reply!

---

## 📊 Monitor Usage

**Railway Dashboard:**
- **Metrics:** CPU, Memory usage
- **Logs:** Real-time logs
- **Usage:** Credit usage ($5 gratis/bulan)

**Estimasi:** Bot ini pakai ~$3-4/month

---

## 🆘 Troubleshooting

### Bot tidak start?
1. Check logs untuk error
2. Verify environment variables
3. Check MongoDB connection

### MongoDB error?
1. MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow all)

### WhatsApp tidak connect?
1. Check logs untuk QR code
2. Scan dengan WhatsApp
3. Pastikan tidak login di device lain

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Check `RAILWAY_DEPLOYMENT.md` untuk detail lengkap

---

**🎉 Selamat! Bot kamu sudah running di Railway!**
