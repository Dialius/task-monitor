# Notion Integration Troubleshooting

## Cek Status Notion

### 1. Test Koneksi Lokal
```bash
node scripts/test-notion-connection.js
```

### 2. Cek Log Bot
Saat bot start, cari log berikut:
- ✅ `Notion service initialized with robust error handling` - Notion aktif
- ⚠️ `Notion service disabled - missing API key or database ID` - Notion tidak aktif

## Penyebab Notion Disabled

### 1. Environment Variables Tidak Diset
**Gejala:** Log menunjukkan `hasApiKey: false` atau `hasDatabaseId: false`

**Solusi:**
- Pastikan `.env` memiliki:
  ```
  NOTION_ENABLED=true
  NOTION_API_KEY=ntn_xxxxx
  NOTION_DATABASE_ID=xxxxx
  ```
- Restart bot setelah mengubah `.env`

### 2. Railway Environment Variables
**Gejala:** Lokal works, Railway tidak

**Solusi:**
1. Buka Railway Dashboard
2. Pilih service bot Anda
3. Masuk ke tab "Variables"
4. Pastikan ada:
   - `NOTION_ENABLED` dengan value `true`
   - `NOTION_API_KEY` dengan value `ntn_xxxxx`
   - `NOTION_DATABASE_ID` dengan value database ID
5. Klik "Deploy" untuk restart dengan env vars baru

### 3. Notion Integration Tidak Punya Akses
**Gejala:** Log error `unauthorized` atau `object_not_found`

**Solusi:**
1. Buka database Notion Anda
2. Klik "Share" di kanan atas
3. Invite integration Anda (nama integration yang Anda buat)
4. Pastikan integration punya akses "Can edit"

### 4. Database ID Salah
**Gejala:** Log error `object_not_found`

**Cara Dapat Database ID:**
1. Buka database Notion di browser
2. URL akan seperti: `https://www.notion.so/xxxxx?v=yyyyy`
3. `xxxxx` adalah Database ID (32 karakter)
4. Copy dan paste ke `NOTION_DATABASE_ID`

## Cara Test di Railway

### 1. Cek Logs
```bash
railway logs
```

Cari log:
```
Notion service initialized with robust error handling
```

### 2. Cek Environment Variables
```bash
railway variables
```

Pastikan `NOTION_API_KEY` dan `NOTION_DATABASE_ID` ada.

### 3. Set Environment Variables
```bash
railway variables set NOTION_ENABLED=true
railway variables set NOTION_API_KEY=ntn_xxxxx
railway variables set NOTION_DATABASE_ID=xxxxx
```

### 4. Redeploy
```bash
railway up
```

## Verifikasi Notion Aktif

### Command /status
Jalankan command `/status` di Discord atau WhatsApp.

Output harus menunjukkan:
```
🔗 Notion: ✅ Connected
```

Jika menunjukkan:
```
🔗 Notion: ❌ Disabled
```

Berarti Notion belum aktif.

## Common Issues

### Issue: "Notion service disabled - missing API key or database ID"
**Penyebab:** Environment variables tidak ter-load

**Solusi:**
1. Cek `.env` file (lokal) atau Railway Variables (production)
2. Pastikan tidak ada typo di nama variable
3. Restart bot

### Issue: "unauthorized" error
**Penyebab:** Integration tidak punya akses ke database

**Solusi:**
1. Share database dengan integration
2. Pastikan integration punya permission "Can edit"

### Issue: "object_not_found" error
**Penyebab:** Database ID salah atau database tidak exist

**Solusi:**
1. Verifikasi Database ID dari URL Notion
2. Pastikan database masih exist
3. Pastikan format ID benar (32 karakter hex)

## Debug Mode

Untuk debug lebih detail, set log level ke debug:

```bash
# .env
LOG_LEVEL=debug
```

Atau di Railway:
```bash
railway variables set LOG_LEVEL=debug
```

Restart bot, lalu cek log untuk detail lebih lengkap.
