# Railway WhatsApp Pairing Code Setup

## Kenapa Pairing Code?

QR code di Railway logs sangat sulit dibaca karena formatnya ASCII art. Pairing code jauh lebih mudah - kamu akan dapat 8 digit angka yang bisa langsung dimasukkan di WhatsApp.

## Setup di Railway

### 1. Tambahkan Environment Variables

Di Railway dashboard, masuk ke project > Variables, tambahkan:

```
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628994630519
```

Ganti `628994630519` dengan nomor WhatsApp kamu (format: 628xxx tanpa + atau spasi).

### 2. Deploy Ulang

Railway akan otomatis deploy ulang setelah kamu push ke GitHub, atau kamu bisa manual redeploy di dashboard.

### 3. Lihat Logs untuk Pairing Code

Setelah deploy, buka Railway logs. Kamu akan melihat:

```
╔════════════════════════════════════════╗
║  PAIRING CODE (8 DIGIT)               ║
╠════════════════════════════════════════╣
║  XXXX-XXXX                            ║
╚════════════════════════════════════════╝

📱 Cara pakai:
   1. Buka WhatsApp di HP kamu
   2. Tap Menu (⋮) atau Settings
   3. Tap "Linked Devices"
   4. Tap "Link a Device"
   5. Tap "Link with phone number instead"
   6. Masukkan kode: XXXX-XXXX

⏳ Menunggu pairing...
```

### 4. Masukkan Pairing Code di WhatsApp

1. Buka WhatsApp di HP kamu
2. Tap **Menu (⋮)** atau **Settings** (⚙️)
3. Tap **Linked Devices**
4. Tap **Link a Device**
5. Tap **Link with phone number instead** (di bawah QR scanner)
6. Masukkan 8 digit kode dari Railway logs
7. Tunggu beberapa detik

### 5. Verifikasi Koneksi

Setelah pairing berhasil, di Railway logs akan muncul:

```
✅ WhatsApp connected successfully!

📱 Connected as: 628994630519@s.whatsapp.net
```

## Troubleshooting

### Pairing Code Tidak Muncul

Pastikan environment variables sudah benar:
- `WHATSAPP_USE_PAIRING_CODE=true`
- `WHATSAPP_PAIRING_NUMBER=628994630519` (nomor kamu)

### Pairing Code Expired

Pairing code berlaku 60 detik. Jika expired:
1. Restart deployment di Railway
2. Ambil pairing code baru dari logs
3. Masukkan segera di WhatsApp

### Connection Replaced Error

Jika muncul "Connection replaced":
1. Buka WhatsApp > Linked Devices
2. Hapus semua device yang tidak digunakan
3. Pastikan tidak ada bot lain yang running dengan nomor yang sama
4. Restart deployment di Railway

## Kembali ke QR Code

Jika ingin kembali menggunakan QR code, hapus atau set ke false:

```
WHATSAPP_USE_PAIRING_CODE=false
```

Atau hapus variable tersebut dari Railway.

## Tips

1. **Simpan Session**: Setelah pairing berhasil, session akan tersimpan. Kamu tidak perlu pairing lagi kecuali:
   - Logout dari WhatsApp
   - Hapus linked device
   - Clear auth_info folder

2. **Multiple Deployments**: Jangan deploy bot yang sama di 2 tempat dengan nomor yang sama. WhatsApp akan disconnect salah satu.

3. **Testing Mode**: Set `WHATSAPP_TESTING_MODE=false` saat production agar bot tidak memproses pesan dari diri sendiri.

## Environment Variables Lengkap untuk Railway

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task_monitor_bot

# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628994630519
WHATSAPP_GROUP_ID=120363424833026714@newsletter
WHATSAPP_TESTING_MODE=false

# Admin
FIRST_ADMIN_WHATSAPP_ID=628994630519
FIRST_ADMIN_ROLE=ketua

# AI Services
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash

# Notion
NOTION_DATABASE_ID=your_database_id
NOTION_API_KEY=your_notion_key

# API (disabled for bot-only)
API_ENABLED=false

# Timezone
TIMEZONE=Asia/Jakarta
```

## Next Steps

Setelah WhatsApp connected:
1. Test dengan command `/status` di channel WhatsApp
2. Coba command lain seperti `/tugas`, `/jadwal`
3. Monitor logs di Railway untuk error
4. Setup Notion sync jika belum

## Support

Jika masih ada masalah:
1. Check Railway logs untuk error message
2. Pastikan semua environment variables sudah benar
3. Verify MongoDB connection string
4. Check Notion API key dan database ID
