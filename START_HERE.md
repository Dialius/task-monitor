# 🚀 START HERE - Hostinger Backend Setup

## 📋 Situasi Saat Ini

### ✅ Yang Sudah Selesai:
- Frontend deployed dan bisa diakses: https://rosybrown-horse-106773.hostingersite.com
- GitHub Actions workflow sudah dikonfigurasi
- Repository sudah di-clone ke server Hostinger
- Dokumentasi lengkap sudah dibuat

### ❌ Yang Belum Selesai:
- Node.js/npm belum terinstall di server Hostinger
- Backend belum bisa di-build
- Bot belum bisa running

### 🎯 Yang Harus Dilakukan:
**Setup manual SEKALI** untuk install Node.js, npm, dan PM2 di server Hostinger.

---

## 🚀 Quick Start (Pilih Salah Satu)

### Option 1: Quick Setup (RECOMMENDED) ⚡
**Untuk yang mau cepat, langsung copy-paste commands**

📄 **Buka file:** `QUICK_SETUP_COMMANDS.md`

**Estimasi waktu:** 10-15 menit

---

### Option 2: Detailed Setup 📖
**Untuk yang mau paham setiap step**

📄 **Buka file:** `HOSTINGER_MANUAL_SETUP.md`

**Estimasi waktu:** 15-20 menit

---

### Option 3: Automated Script 🤖
**Untuk yang mau fully automated (advanced)**

📄 **Buka file:** `SETUP_BACKEND_HOSTINGER.sh`

**Cara pakai:**
```bash
# SSH ke Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Download script
curl -o setup.sh https://raw.githubusercontent.com/Dialius/task-monitor/main/SETUP_BACKEND_HOSTINGER.sh

# Run script
bash setup.sh
```

**Estimasi waktu:** 5-10 menit

---

## 📚 Dokumentasi Lengkap

### 1. `QUICK_SETUP_COMMANDS.md` ⚡
**Isi:** Copy-paste commands untuk quick setup
**Untuk:** Yang mau cepat selesai
**Baca kalau:** Kamu sudah familiar dengan terminal

### 2. `HOSTINGER_MANUAL_SETUP.md` 📖
**Isi:** Step-by-step guide dengan penjelasan detail
**Untuk:** Yang mau paham setiap step
**Baca kalau:** Kamu mau belajar atau troubleshoot

### 3. `PENJELASAN_MASALAH_DAN_SOLUSI.md` 🔍
**Isi:** Penjelasan detail masalah yang terjadi (dalam Bahasa Indonesia)
**Untuk:** Yang penasaran kenapa error dan bagaimana solusinya
**Baca kalau:** Kamu mau paham root cause dan technical details

### 4. `BACKEND_SETUP_COMPLETE.md` 📊
**Isi:** Complete documentation dengan architecture, troubleshooting, FAQ
**Untuk:** Reference lengkap untuk maintenance
**Baca kalau:** Kamu butuh reference atau troubleshooting

### 5. `SETUP_BACKEND_HOSTINGER.sh` 🤖
**Isi:** Automated setup script
**Untuk:** Fully automated setup
**Baca kalau:** Kamu prefer automated script

---

## 🎯 Recommended Flow

### Step 1: Pahami Masalahnya
📄 Baca: `PENJELASAN_MASALAH_DAN_SOLUSI.md` (5 menit)

**Kamu akan paham:**
- Kenapa error `npm: command not found`
- Kenapa harus install NVM
- Kenapa harus setup manual dulu

---

### Step 2: Setup Backend
📄 Ikuti: `QUICK_SETUP_COMMANDS.md` (10-15 menit)

**Kamu akan:**
- Install NVM
- Install Node.js 20
- Install PM2
- Clone repository
- Build backend
- Start bot

---

### Step 3: Verify Setup
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs task-monitor-bot --lines 50

# Test API
curl http://localhost:3001/api/health
```

---

### Step 4: Test Dashboard
1. Buka: https://rosybrown-horse-106773.hostingersite.com
2. Login dengan WhatsApp: `628994630519`
3. Set password (first login)
4. Test start/stop bot dari dashboard

---

### Step 5: Test Auto-Deploy
1. Edit file di local (contoh: tambah comment di `src/bot.ts`)
2. Commit dan push ke GitHub
3. Check GitHub Actions: https://github.com/Dialius/task-monitor/actions
4. Verify bot restart otomatis di server

---

## 🚨 Troubleshooting

### Issue: `npm: command not found`
**Solusi:** Install NVM dan Node.js (ikuti Step 1-2 di QUICK_SETUP_COMMANDS.md)

### Issue: Build fails
**Solusi:** Install TypeScript type definitions
```bash
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt @types/node @types/cors typescript
npm run build:backend
```

### Issue: PM2 crashes
**Solusi:** Check logs
```bash
pm2 logs task-monitor-bot --lines 100
```

### Issue: Port 3001 already in use
**Solusi:** Kill existing process
```bash
lsof -ti:3001 | xargs kill -9
pm2 restart task-monitor-bot
```

---

## 📞 Need Help?

### Dokumentasi:
- `QUICK_SETUP_COMMANDS.md` → Quick reference
- `HOSTINGER_MANUAL_SETUP.md` → Detailed guide
- `PENJELASAN_MASALAH_DAN_SOLUSI.md` → Problem explanation
- `BACKEND_SETUP_COMPLETE.md` → Complete documentation

### Common Commands:
```bash
# SSH to Hostinger
ssh -p 65002 u909490256@153.92.9.187

# Check PM2 status
pm2 status

# View logs
pm2 logs task-monitor-bot

# Restart bot
pm2 restart task-monitor-bot

# Stop bot
pm2 stop task-monitor-bot

# Monitor bot
pm2 monit
```

---

## ✅ Success Checklist

- [ ] SSH ke Hostinger berhasil
- [ ] NVM terinstall (`nvm --version`)
- [ ] Node.js 20 terinstall (`node -v`)
- [ ] PM2 terinstall (`pm2 --version`)
- [ ] Repository di-clone
- [ ] Dependencies terinstall
- [ ] Backend berhasil di-build (`dist/` folder exists)
- [ ] .env file dibuat
- [ ] Bot running dengan PM2 (`pm2 status` shows "online")
- [ ] NVM persistent di `~/.bashrc`
- [ ] Dashboard bisa diakses
- [ ] Login dashboard berhasil
- [ ] Bot bisa start/stop dari dashboard
- [ ] Auto-deploy berfungsi (test dengan push code)

---

## 🎉 After Setup Complete

### Daily Usage:
1. Edit code di local
2. Commit dan push ke GitHub
3. GitHub Actions otomatis deploy
4. Bot restart otomatis
5. Done! 🎉

### Monitoring:
- Dashboard: https://rosybrown-horse-106773.hostingersite.com
- PM2 logs: `pm2 logs task-monitor-bot`
- PM2 status: `pm2 status`

### Maintenance:
- Update dependencies: `npm update`
- Rebuild: `npm run build:backend`
- Restart: `pm2 restart task-monitor-bot`

---

## 🚀 Let's Go!

**Mulai dari sini:**
1. 📖 Baca `PENJELASAN_MASALAH_DAN_SOLUSI.md` (5 menit)
2. ⚡ Ikuti `QUICK_SETUP_COMMANDS.md` (10-15 menit)
3. ✅ Verify setup berhasil
4. 🎉 Enjoy auto-deploy!

**Total waktu:** 15-20 menit

**Setelah setup manual selesai, semua deployment otomatis via GitHub Actions!** 🚀

---

**Good luck! 🎉**
