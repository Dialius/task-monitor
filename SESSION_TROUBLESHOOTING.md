# 🔧 WhatsApp Session Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. QR Code Terlalu Cepat Generate

**Gejala:**
```
QR code muncul terus-menerus setiap detik
Sulit untuk scan karena terlalu cepat berubah
```

**Solusi:**
✅ **SUDAH DIPERBAIKI!** QR code sekarang muncul setiap 45 detik.

**Verifikasi:**
```bash
# Check logs, should see:
⏳ QR code terlalu cepat, tunggu 45s...
```

---

### 2. Connection Timeout Terlalu Cepat

**Gejala:**
```
❌ INITIALIZATION FAILED: Error: WhatsApp connection timeout after 2 minutes
```

**Solusi:**
✅ **SUDAH DIPERBAIKI!** Timeout sekarang 5 menit.

**Verifikasi:**
```bash
# Check logs, should see:
⏳ Menunggu koneksi... (300s tersisa)
⏳ Menunggu koneksi... (270s tersisa)
```

---

### 3. Session Tidak Tersimpan

**Gejala:**
```
Setiap restart bot, harus scan QR code lagi
Folder auth_info/ kosong atau hanya ada .gitkeep
```

**Diagnosis:**
```bash
npm run test:session
```

**Solusi A: Check Folder Permissions**
```bash
# Windows
icacls auth_info

# Linux/Mac
ls -la auth_info/
chmod 755 auth_info/
```

**Solusi B: Check .gitignore**
```bash
# Should have:
auth_info/*
!auth_info/.gitkeep
```

**Solusi C: Manual Session Save**
```bash
# After successful connection, check:
ls auth_info/

# Should see:
# creds.json
# app-state-sync-key-*.json
```

---

### 4. Session Hilang Setelah Deploy

**Gejala:**
```
Local: Session tersimpan ✅
Railway: Session hilang setelah restart ❌
```

**Penyebab:**
Railway menggunakan ephemeral filesystem - file hilang saat restart.

**Solusi A: Railway Volume (Recommended)**
```
1. Railway Dashboard
2. Your Service > Settings
3. Volumes > New Volume
4. Mount path: /app/auth_info
5. Redeploy
```

**Solusi B: MongoDB Storage**
```bash
npm install mongo-baileys
```

```typescript
// src/clients/BaileysClient.ts
import { MongoStore } from 'mongo-baileys';

const store = new MongoStore({
  mongoUri: process.env.MONGODB_URI,
  sessionId: 'whatsapp-bot'
});

const { state, saveCreds } = await store.useMongoAuthState();
```

**Solusi C: PostgreSQL Storage**
```bash
npm install postgres-baileys
```

---

### 5. Connection Replaced Error

**Gejala:**
```
⚠️  Connection replaced (1/3)
💡 Possible causes:
   • Another bot instance is running
   • WhatsApp Web is open in another browser
```

**Solusi:**
1. **Tutup WhatsApp Web** di semua browser
2. **Stop bot instances lain** yang menggunakan nomor sama
3. **Check Linked Devices** di WhatsApp HP:
   ```
   WhatsApp > Menu > Linked Devices
   Remove unused devices
   ```
4. **Restart bot** setelah cleanup

**Prevention:**
```env
# Use different phone numbers for different bots
WHATSAPP_PAIRING_NUMBER=628123456789  # Bot 1
WHATSAPP_PAIRING_NUMBER=628987654321  # Bot 2
```

---

### 6. QR Code Tidak Muncul

**Gejala:**
```
Bot start tapi tidak ada QR code di logs
Stuck di "Connecting to WhatsApp..."
```

**Diagnosis:**
```bash
# Check if session already exists
npm run test:session
```

**Solusi A: Session Sudah Ada**
```bash
# If session exists, bot will auto-connect
# No QR code needed!
✅ This is normal behavior
```

**Solusi B: Clear Session**
```bash
# If you want to re-authenticate:
# Windows
del /Q auth_info\*.*

# Linux/Mac
rm -f auth_info/*

# Keep .gitkeep
# Then restart bot
npm start
```

**Solusi C: Check Baileys Version**
```bash
npm list @whiskeysockets/baileys
# Should be: ^7.0.0-rc.9 or higher
```

---

### 7. Pairing Code Tidak Bekerja

**Gejala:**
```
WHATSAPP_USE_PAIRING_CODE=true
Tapi tidak ada pairing code di logs
```

**Solusi:**
```env
# Check .env configuration
WHATSAPP_ENABLED=true
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628123456789  # Format: 628xxx (no + or spaces)
```

**Format Nomor:**
```
✅ Correct: 628123456789
❌ Wrong: +62 812-3456-789
❌ Wrong: 0812-3456-789
❌ Wrong: 62 812 3456 789
```

**Verifikasi:**
```bash
# Should see in logs:
📱 PAIRING CODE MODE
🔢 Requesting pairing code for: 628123456789
╔════════════════════════════════════════╗
║  PAIRING CODE (8 DIGIT)               ║
╠════════════════════════════════════════╣
║  12345678                              ║
╚════════════════════════════════════════╝
```

---

### 8. Session Corrupt

**Gejala:**
```
Error: Cannot read properties of undefined
Error: Invalid session data
Bot crashes on startup
```

**Solusi:**
```bash
# 1. Backup current session (just in case)
# Windows
xcopy auth_info auth_info_backup /E /I

# Linux/Mac
cp -r auth_info auth_info_backup

# 2. Clear session
# Windows
del /Q auth_info\*.*

# Linux/Mac
rm -f auth_info/*

# 3. Keep .gitkeep
# Don't delete .gitkeep file!

# 4. Restart bot
npm start

# 5. Scan QR code again
```

---

### 9. Multiple QR Codes in Logs

**Gejala:**
```
Logs penuh dengan QR code
Sulit menemukan QR code yang valid
```

**Solusi:**
✅ **SUDAH DIPERBAIKI!** QR code sekarang muncul setiap 45 detik.

**Tips:**
1. **Scroll ke bawah** untuk QR code terbaru
2. **Copy URL** (data:image/png;base64,...)
3. **Paste di browser** untuk lihat QR code
4. **Scan segera** (berlaku 60 detik)

---

### 10. Railway Logs Tidak Menampilkan QR

**Gejala:**
```
Railway logs tidak menampilkan ASCII QR code dengan baik
```

**Solusi:**
Bot sudah generate QR code sebagai **data URL**:

```bash
# Look for this in logs:
🔗 BUKA URL INI DI BROWSER:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...

# Steps:
1. COPY entire URL (starts with data:image/png;base64,)
2. PASTE in browser address bar
3. QR code will appear as image
4. Scan with WhatsApp
```

---

## 🔍 Diagnostic Commands

### Check Session Status
```bash
npm run test:session
```

### Check Logs
```bash
# Local
npm start

# Railway
railway logs

# PM2
pm2 logs
```

### Check Files
```bash
# Windows
dir auth_info

# Linux/Mac
ls -la auth_info/
```

### Check Environment
```bash
# Windows
type .env

# Linux/Mac
cat .env
```

---

## 📊 Session Health Checklist

Run this checklist to verify session health:

```bash
# 1. Check folder exists
[ ] auth_info/ folder exists

# 2. Check files
[ ] auth_info/creds.json exists
[ ] auth_info/app-state-sync-*.json exists

# 3. Check .gitignore
[ ] auth_info/* in .gitignore
[ ] !auth_info/.gitkeep in .gitignore

# 4. Check permissions
[ ] Folder readable/writable

# 5. Check bot connection
[ ] Bot connects without QR code
[ ] No errors in logs

# 6. Check Railway (if deployed)
[ ] Volume mounted at /app/auth_info
[ ] OR MongoDB configured
```

---

## 🆘 Emergency Recovery

If nothing works, follow these steps:

### 1. Complete Reset
```bash
# Stop bot
# Windows: Ctrl+C
# PM2: pm2 stop all

# Backup everything
# Windows
xcopy auth_info auth_info_backup /E /I
xcopy .env .env.backup

# Linux/Mac
cp -r auth_info auth_info_backup
cp .env .env.backup

# Clear session
# Windows
del /Q auth_info\*.*

# Linux/Mac
rm -f auth_info/*

# Rebuild
npm run build

# Start fresh
npm start
```

### 2. Verify Configuration
```env
# .env should have:
WHATSAPP_ENABLED=true

# Choose ONE:
# Option A: QR Code (default)
WHATSAPP_USE_PAIRING_CODE=false

# Option B: Pairing Code (better for servers)
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628123456789
```

### 3. Test Connection
```bash
# Should see:
🚀 Starting Multi-Platform Bot...
📋 Step 6/8: Connecting to platforms...
   → Connecting to WhatsApp...
   → Using QR CODE mode
   → Scan QR code with your phone if this is first time

# Then QR code appears
```

### 4. Verify Session Saved
```bash
# After successful connection:
npm run test:session

# Should show:
✅ Session VALID! Bot akan auto-connect tanpa QR code
```

---

## 📞 Get Help

If you still have issues:

1. **Check Documentation:**
   - `WHATSAPP_SESSION_GUIDE.md` - Full guide
   - `RAILWAY_SESSION_FIX.md` - Railway specific
   - `SESSION_QUICK_START.md` - Quick start

2. **Check Logs:**
   - Look for error messages
   - Check connection status
   - Verify QR code generation

3. **Check GitHub Issues:**
   - [Baileys Issues](https://github.com/WhiskeySockets/Baileys/issues)
   - Search for similar problems

4. **Create Issue:**
   - Include error logs
   - Include environment info
   - Include steps to reproduce

---

## ✅ Success Indicators

You know it's working when:

✅ QR code appears every 45 seconds (not every second)
✅ Timeout is 5 minutes (not 2 minutes)
✅ Session files created in auth_info/
✅ Next restart: auto-connect (no QR code)
✅ No "connection timeout" errors
✅ Bot stays connected

---

**Remember:** Session persistence is working! If you have issues, it's usually configuration or storage related, not the code itself.
