# 🚀 WhatsApp Session - Quick Start

## ✅ Apa yang Sudah Diperbaiki?

1. **QR Code Interval**: 45 detik (tidak spam lagi)
2. **Timeout**: 5 menit (lebih banyak waktu)
3. **Session Auto-Save**: Tersimpan di `auth_info/`
4. **No Re-login**: Tidak perlu scan QR setiap deploy

## 📋 Quick Commands

```bash
# Check session status
npm run test:session

# Start bot (first time - will show QR)
npm start

# Start bot (next time - auto connect)
npm start

# Build before deploy
npm run build
```

## 🎯 First Time Setup

1. **Start bot**
   ```bash
   npm start
   ```

2. **Scan QR code**
   - Copy URL dari logs (data:image/png;base64,...)
   - Paste di browser
   - Scan dengan WhatsApp

3. **Done!**
   - Session tersimpan di `auth_info/`
   - Next deploy: auto-connect

## 🚂 Railway Deployment

### Option 1: With Volume (Recommended)
```
1. Railway Dashboard > Your Service
2. Settings > Volumes > New Volume
3. Mount path: /app/auth_info
4. Redeploy
```

### Option 2: With MongoDB
```bash
npm install mongo-baileys
```

Update `src/clients/BaileysClient.ts`:
```typescript
import { MongoStore } from 'mongo-baileys';

const store = new MongoStore({
  mongoUri: process.env.MONGODB_URI,
  sessionId: 'whatsapp-bot'
});

const { state, saveCreds } = await store.useMongoAuthState();
```

## 🔍 Verify Session

```bash
# Check if session exists
npm run test:session

# Should show:
# ✅ creds.json - Credentials tersimpan
# ✅ app-state-sync-key-* - State keys tersimpan
```

## 📁 Files Structure

```
auth_info/
├── .gitkeep              # Keep folder in git
├── creds.json            # Main credentials (gitignored)
└── app-state-sync-*.json # State keys (gitignored)
```

## ⚠️ Important Notes

- ✅ Folder `auth_info/` di-commit (dengan .gitkeep)
- ❌ File session TIDAK di-commit (di .gitignore)
- ✅ Session auto-save setelah scan QR
- ✅ QR code muncul setiap 45 detik
- ✅ Timeout 5 menit untuk scan

## 🐛 Troubleshooting

### Session hilang setelah restart
➡️ Setup Railway Volume atau gunakan MongoDB

### QR code terlalu cepat
➡️ Sudah diperbaiki! Sekarang 45 detik

### Timeout terlalu cepat
➡️ Sudah diperbaiki! Sekarang 5 menit

### Connection replaced
➡️ Tutup WhatsApp Web lain atau bot instance lain

## 📚 Full Documentation

- `WHATSAPP_SESSION_GUIDE.md` - Complete guide
- `RAILWAY_SESSION_FIX.md` - Railway specific
- `scripts/test-session.js` - Session checker

## 🎉 That's It!

Session sekarang tersimpan otomatis. Tidak perlu login ulang setiap deploy!
