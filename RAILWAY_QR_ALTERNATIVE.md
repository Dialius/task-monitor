# Railway QR Code Alternative Solutions

Jika pairing code tidak berhasil, ada beberapa alternatif:

## Solusi 1: QR Code via URL (RECOMMENDED)

Baileys bisa generate QR code sebagai data URL yang bisa dibuka di browser.

### Setup:

1. **Disable pairing code di Railway:**
   ```
   WHATSAPP_USE_PAIRING_CODE=false
   ```
   Atau hapus variable tersebut.

2. **Deploy ulang**

3. **Lihat logs** - Copy QR code data URL yang muncul

4. **Buka di browser** - Paste URL di browser, scan dengan WhatsApp

## Solusi 2: Run Locally Dulu, Upload Session

Cara paling reliable:

### Step 1: Run Bot di Komputer Lokal

```bash
# Clone repo
git clone https://github.com/Dialius/task-monitor.git
cd task-monitor

# Install dependencies
npm install

# Copy .env
cp .env.example .env

# Edit .env - set semua credentials
# Pastikan WHATSAPP_USE_PAIRING_CODE=false atau hapus

# Build
npm run build

# Run
npm start
```

### Step 2: Scan QR Code

QR code akan muncul di terminal. Scan dengan WhatsApp.

### Step 3: Upload Session ke Railway

Setelah connected, folder `auth_info/` akan berisi session files.

**Option A: Commit ke Git (Private Repo Only!)**
```bash
# HANYA jika repo private!
git add auth_info/
git commit -m "Add WhatsApp session"
git push
```

**Option B: Upload Manual via Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Upload files
railway up
```

**Option C: Use Railway Volumes (Advanced)**

Setup persistent volume di Railway untuk `auth_info/` folder.

## Solusi 3: Pairing Code Troubleshooting

Jika tetap ingin pakai pairing code:

### Cek Format Nomor

Pastikan format nomor benar di Railway variables:

```
WHATSAPP_PAIRING_NUMBER=628994630519
```

Format yang benar:
- ✅ `628994630519` (62 + nomor tanpa 0)
- ✅ `6281234567890`
- ❌ `+628994630519` (jangan pakai +)
- ❌ `08994630519` (jangan pakai 0 di depan)
- ❌ `62 899 4630 519` (jangan pakai spasi)

### Cek Nomor Aktif

Pastikan:
1. Nomor aktif dan terdaftar di WhatsApp
2. WhatsApp versi terbaru
3. Tidak ada linked device lain yang conflict

### Cek Logs untuk Error

Di Railway logs, cari error message:
```
❌ Failed to request pairing code: [error message]
```

Error umum:
- `not-authorized` - Nomor tidak valid atau tidak terdaftar
- `rate-limit` - Terlalu banyak request, tunggu beberapa menit
- `invalid-phone` - Format nomor salah

## Solusi 4: Gunakan WhatsApp Business API (Paid)

Untuk production yang lebih stable, pertimbangkan:
- WhatsApp Business API (official)
- Twilio WhatsApp API
- MessageBird WhatsApp API

## Rekomendasi

Untuk Railway deployment:

1. **Terbaik**: Run locally dulu, upload session (Solusi 2)
2. **Alternatif**: Pairing code dengan format nomor yang benar (Solusi 3)
3. **Fallback**: QR code via URL (Solusi 1)

## Support

Jika masih bermasalah:
1. Share screenshot Railway logs (sensor sensitive info)
2. Share error message lengkap
3. Konfirmasi format nomor yang digunakan
4. Cek WhatsApp version di HP
