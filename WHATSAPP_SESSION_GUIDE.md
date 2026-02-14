# 📱 WhatsApp Session Persistence Guide

## 🎯 Masalah yang Diselesaikan

Bot tidak perlu login ulang setiap kali deploy/restart. Session WhatsApp akan tersimpan otomatis di folder `auth_info`.

## ✅ Fitur yang Sudah Diimplementasikan

### 1. **Auto-Save Session**
- Session tersimpan otomatis menggunakan `useMultiFileAuthState` dari Baileys
- Lokasi: folder `auth_info/`
- Format: Multiple JSON files (creds.json, app-state-sync-key-*.json, dll)

### 2. **QR Code Interval Diperpanjang**
- QR code baru muncul setiap **45 detik** (bukan setiap detik)
- Mengurangi spam QR code di logs
- Lebih mudah untuk scan dengan tenang

### 3. **Timeout Diperpanjang**
- Timeout koneksi: **5 menit** (dari 2 menit)
- Lebih banyak waktu untuk scan QR code
- Progress log setiap 30 detik

### 4. **Session Folder Protected**
- Folder `auth_info/` sudah ada di git dengan `.gitkeep`
- `.gitignore` sudah dikonfigurasi:
  ```
  auth_info/*
  !auth_info/.gitkeep
  ```
- Folder tidak akan hilang saat deploy

## 🚀 Cara Kerja

### Pertama Kali Deploy (Belum Ada Session)

1. Bot akan generate QR code
2. QR code muncul setiap 45 detik (tidak terlalu cepat)
3. Scan QR code dengan WhatsApp di HP kamu
4. Setelah tersambung, session otomatis tersimpan di `auth_info/`
5. Bot siap digunakan

### Deploy Berikutnya (Sudah Ada Session)

1. Bot akan load session dari `auth_info/`
2. **TIDAK PERLU SCAN QR CODE LAGI** ✅
3. Langsung connect ke WhatsApp
4. Bot siap digunakan

## 📋 Checklist Deployment

### Railway/Heroku/VPS

- [ ] Pastikan folder `auth_info/` ada di repository
- [ ] Pastikan `.gitignore` sudah benar (lihat di atas)
- [ ] Commit dan push perubahan
- [ ] Deploy pertama kali: scan QR code
- [ ] Deploy berikutnya: otomatis connect

### Persistent Storage (Recommended)

Untuk platform seperti Railway, session akan hilang jika:
- Container di-restart dengan fresh filesystem
- Deploy baru menghapus volume

**Solusi:**

#### Option 1: Railway Volume (Recommended)
```bash
# Di Railway Dashboard:
1. Go to your service
2. Click "Variables" tab
3. Add volume mount: /app/auth_info
4. Redeploy
```

#### Option 2: Database Storage
Gunakan package seperti:
- `mongo-baileys` - Store session di MongoDB
- `postgres-baileys` - Store session di PostgreSQL
- `redis-auth-baileys` - Store session di Redis

Contoh dengan MongoDB:
```typescript
import { MongoStore } from 'mongo-baileys';

const store = new MongoStore({
  mongoUri: process.env.MONGODB_URI,
  sessionId: 'whatsapp-bot'
});

const { state, saveCreds } = await store.useMongoAuthState();
```

## 🔧 Environment Variables

Tambahkan di `.env`:

```env
# WhatsApp Configuration
WHATSAPP_ENABLED=true

# QR Code Mode (default)
WHATSAPP_USE_PAIRING_CODE=false

# Atau Pairing Code Mode (lebih baik untuk server)
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628123456789
```

## 💡 Tips

### 1. Gunakan Pairing Code untuk Server
Lebih mudah daripada QR code untuk deployment:
```env
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628123456789
```

Cara pakai:
1. Bot akan generate 8-digit code
2. Buka WhatsApp > Linked Devices
3. Tap "Link with phone number instead"
4. Masukkan code

### 2. Monitor Session Health
Session bisa expired jika:
- Tidak digunakan > 14 hari
- WhatsApp di HP logout
- Linked device di-remove dari HP

Solusi: Bot akan auto-reconnect dan generate QR/pairing code baru

### 3. Backup Session
Backup folder `auth_info/` secara berkala:
```bash
# Backup
tar -czf auth_info_backup.tar.gz auth_info/

# Restore
tar -xzf auth_info_backup.tar.gz
```

## 🐛 Troubleshooting

### Session Tidak Tersimpan
```bash
# Check folder permissions
ls -la auth_info/

# Should see files like:
# - creds.json
# - app-state-sync-key-*.json
```

### QR Code Terlalu Cepat
✅ Sudah diperbaiki! QR code sekarang muncul setiap 45 detik.

### Timeout Terlalu Cepat
✅ Sudah diperbaiki! Timeout sekarang 5 menit.

### Session Hilang Setelah Deploy
Gunakan persistent storage (Railway Volume atau Database).

## 📊 Perbandingan Storage Options

| Method | Pros | Cons | Recommended For |
|--------|------|------|-----------------|
| **File System** | Simple, no extra setup | Lost on container restart | Local development |
| **Railway Volume** | Persistent, fast | Platform-specific | Railway deployment |
| **MongoDB** | Persistent, scalable | Requires MongoDB | Production |
| **PostgreSQL** | Persistent, reliable | Requires PostgreSQL | Production |
| **Redis** | Fast, persistent | Requires Redis | High-traffic bots |

## 🎉 Hasil Akhir

Setelah implementasi ini:

✅ Session tersimpan otomatis
✅ QR code tidak spam (45 detik interval)
✅ Timeout lebih lama (5 menit)
✅ Tidak perlu login ulang setiap deploy
✅ Folder `auth_info/` protected di git

## 📚 Referensi

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [useMultiFileAuthState](https://github.com/WhiskeySockets/Baileys/blob/master/src/Utils/auth-utils.ts)
- [Railway Volumes](https://docs.railway.app/reference/volumes)
- [mongo-baileys](https://www.npmjs.com/package/mongo-baileys)
