# Railway Environment Variables Setup

## Quick Setup Guide

Masuk ke Railway dashboard > Project > Variables tab, lalu tambahkan semua variable berikut:

## 🔴 REQUIRED (Wajib)

### Database
```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.jhprx.mongodb.net/task_monitor_bot
```

### WhatsApp - Pairing Code Mode (Recommended)
```
WHATSAPP_ENABLED=true
WHATSAPP_USE_PAIRING_CODE=true
WHATSAPP_PAIRING_NUMBER=628994630519
WHATSAPP_GROUP_ID=120363424833026714@newsletter
```

### Admin
```
FIRST_ADMIN_WHATSAPP_ID=628994630519
FIRST_ADMIN_ROLE=ketua
```

### AI Services
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Notion Integration
```
NOTION_DATABASE_ID=3030a8e24bf6807bb826d8667d0764b0
NOTION_API_KEY=your_notion_api_key_here
```

## 🟡 OPTIONAL (Opsional)

### API Server (Disabled for bot-only)
```
API_ENABLED=false
```

### Testing Mode (Set false untuk production)
```
WHATSAPP_TESTING_MODE=false
```

### Timezone
```
TIMEZONE=Asia/Jakarta
```

### Reminder Schedule
```
DAILY_REMINDER_TIME=17:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00
```

### Logging
```
LOG_LEVEL=info
```

## 📋 Copy-Paste All (Production Ready)

Untuk kemudahan, copy semua ini sekaligus:

```bash
# Database
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.jhprx.mongodb.net/task_monitor_bot

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
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Notion
NOTION_DATABASE_ID=3030a8e24bf6807bb826d8667d0764b0
NOTION_API_KEY=your_notion_api_key_here

# API (disabled)
API_ENABLED=false

# Timezone & Schedule
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=17:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00

# Logging
LOG_LEVEL=info
```

## 🚀 Deployment Steps

1. **Setup Variables** - Copy paste semua variable di atas ke Railway
2. **Deploy** - Railway akan auto-deploy dari GitHub
3. **Check Logs** - Lihat pairing code di logs
4. **Pair WhatsApp** - Masukkan 8 digit code di WhatsApp
5. **Test Bot** - Kirim `/status` di channel WhatsApp

## 📱 Pairing Code Steps

Setelah deploy, di Railway logs akan muncul:

```
╔════════════════════════════════════════╗
║  PAIRING CODE (8 DIGIT)               ║
╠════════════════════════════════════════╣
║  1234-5678                            ║
╚════════════════════════════════════════╝
```

Cara pakai:
1. Buka WhatsApp > Menu > Linked Devices
2. Tap "Link a Device"
3. Tap "Link with phone number instead"
4. Masukkan code: 1234-5678
5. Done!

## ⚠️ Important Notes

1. **Pairing code expired dalam 60 detik** - Masukkan segera!
2. **Jangan share API keys** - Ini contoh, ganti dengan key kamu
3. **Testing mode** - Set `WHATSAPP_TESTING_MODE=false` untuk production
4. **Multiple instances** - Jangan run 2 bot dengan nomor yang sama
5. **Session persistence** - Setelah pairing, session tersimpan. Tidak perlu pairing lagi

## 🔧 Troubleshooting

### Bot tidak start
- Check MongoDB URI valid
- Check semua required variables ada

### Pairing code tidak muncul
- Pastikan `WHATSAPP_USE_PAIRING_CODE=true`
- Pastikan `WHATSAPP_PAIRING_NUMBER` benar (format: 628xxx)

### Connection replaced
- Hapus linked devices yang tidak digunakan di WhatsApp
- Pastikan tidak ada bot lain running dengan nomor yang sama

### Notion sync tidak jalan
- Check `NOTION_DATABASE_ID` benar
- Check `NOTION_API_KEY` valid
- Pastikan database di-share dengan integration

## 📚 More Info

- [RAILWAY_PAIRING_CODE_SETUP.md](./RAILWAY_PAIRING_CODE_SETUP.md) - Detailed pairing code guide
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Full deployment guide
- [RAILWAY_STATUS.md](./RAILWAY_STATUS.md) - Latest updates and fixes
