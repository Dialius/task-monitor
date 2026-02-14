# Setup Bot Locally → Upload Session ke Railway

Ini cara paling reliable untuk setup WhatsApp di Railway!

## Kenapa Cara Ini?

- ✅ QR code jelas di terminal lokal
- ✅ Scan sekali, session tersimpan
- ✅ Upload session ke Railway, langsung jalan
- ✅ Tidak perlu pairing code yang ribet

## Step-by-Step

### 1. Setup di Komputer Lokal

Kamu sudah punya folder `task-monitor` di komputer. Pastikan `.env` sudah benar:

```bash
# Buka folder
cd D:\task-monitor

# Pastikan .env sudah ada dan benar
# Check file .env
```

### 2. Disable Pairing Code (Gunakan QR)

Edit `.env`, set:
```
WHATSAPP_USE_PAIRING_CODE=false
```

Atau hapus baris `WHATSAPP_USE_PAIRING_CODE` dan `WHATSAPP_PAIRING_NUMBER`.

### 3. Hapus Session Lama (Jika Ada)

```bash
# Hapus folder auth_info jika ada
rmdir /s /q auth_info

# Atau manual: hapus folder auth_info
```

### 4. Build & Run Bot

```bash
# Install dependencies (jika belum)
npm install

# Build
npm run build

# Run bot
npm start
```

### 5. Scan QR Code

QR code akan muncul di terminal. Scan dengan WhatsApp:
1. Buka WhatsApp di HP
2. Tap Menu > Linked Devices
3. Tap "Link a Device"
4. Scan QR code di terminal

Tunggu sampai muncul:
```
✅ WhatsApp connected successfully!
📱 Connected as: 628994630519@s.whatsapp.net
```

### 6. Stop Bot

Setelah connected, tekan `Ctrl+C` untuk stop bot.

### 7. Upload Session ke Railway

Sekarang folder `auth_info/` berisi session files. Ada 2 cara upload:

#### Option A: Commit ke Git (RECOMMENDED)

**⚠️ PENTING: Pastikan repo PRIVATE!**

```bash
# Check apakah auth_info di .gitignore
# Jika ada, hapus dari .gitignore

# Add session files
git add auth_info/

# Commit
git commit -m "Add WhatsApp session for Railway"

# Push
git push
```

Railway akan auto-deploy dan session akan tersedia!

#### Option B: Railway CLI (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy with files
railway up
```

### 8. Update Railway Environment Variables

Pastikan di Railway variables:
```
WHATSAPP_USE_PAIRING_CODE=false
```

Atau hapus variable tersebut.

### 9. Deploy & Test

Railway akan auto-deploy. Check logs:
```
✅ WhatsApp connected successfully!
📱 Connected as: 628994630519@s.whatsapp.net
```

Tidak perlu scan QR lagi! Session sudah tersimpan.

### 10. Test Bot

Kirim command di WhatsApp channel:
```
/status
```

Bot harus reply!

## Troubleshooting

### Session Tidak Ter-upload

Pastikan `auth_info/` tidak di `.gitignore`:

```bash
# Check .gitignore
cat .gitignore

# Jika ada "auth_info/", hapus baris tersebut
# Edit .gitignore, hapus baris: auth_info/
```

### Railway Masih Minta QR/Pairing

Pastikan:
1. Session files ter-upload (check di GitHub repo)
2. Railway variables: `WHATSAPP_USE_PAIRING_CODE=false` atau dihapus
3. Redeploy di Railway

### Connection Replaced

Jika muncul "Connection replaced":
1. Stop bot lokal (jangan run 2 bot bersamaan)
2. Hapus linked device lain di WhatsApp
3. Restart Railway deployment

## Security Notes

### ⚠️ PENTING: Session Files Sensitive!

Session files di `auth_info/` berisi credentials WhatsApp. Jangan share!

**Jika repo PUBLIC:**
- ❌ JANGAN commit auth_info/
- ✅ Gunakan Railway CLI untuk upload
- ✅ Atau gunakan Railway Volumes

**Jika repo PRIVATE:**
- ✅ Aman untuk commit auth_info/
- ✅ Pastikan repo benar-benar private
- ✅ Jangan share repo dengan orang lain

### Protect Session Files

Tambahkan ke `.gitignore` jika repo public:
```
# WhatsApp session (sensitive!)
auth_info/
```

## Alternative: Railway Volumes

Untuk production yang lebih aman, gunakan Railway Volumes:

1. Create volume di Railway dashboard
2. Mount ke `/app/auth_info`
3. Upload session via Railway CLI
4. Session persistent dan tidak di git

## Next Steps

Setelah bot running di Railway:
1. Test semua commands
2. Monitor logs untuk errors
3. Setup Notion sync
4. Configure reminder schedule
5. Add more admins jika perlu

## Summary

Cara ini paling reliable karena:
- QR code jelas di terminal lokal
- Session tersimpan dan bisa di-reuse
- Tidak perlu pairing code yang sering error
- Sekali setup, jalan terus di Railway

Selamat mencoba! 🚀
