# WhatsApp Bot Troubleshooting Guide

## ✅ Status Saat Ini

Bot sudah berhasil:
- ✅ Connect ke WhatsApp
- ✅ Message handler terdaftar
- ✅ Siap menerima pesan

## 🔍 Cara Test Bot

### 1. Pastikan Bot Running
Jalankan bot dengan:
```bash
npm start
```

Tunggu sampai muncul:
```
✅ WhatsApp connected successfully!
📱 Connected as: 628994630519:34@s.whatsapp.net
📝 Registering message handler - waiting for messages...
```

### 2. Testing Mode (Jika Nomor Bot = Nomor Kamu)

**PENTING:** Jika nomor bot dan nomor yang kamu gunakan SAMA, bot akan mengabaikan pesan dari diri sendiri.

**Solusi untuk testing:**

Tambahkan ke `.env` file:
```env
WHATSAPP_TESTING_MODE=true
```

Lalu restart bot. Sekarang bot akan memproses pesan dari diri sendiri.

**⚠️ INGAT:** Set `WHATSAPP_TESTING_MODE=false` atau hapus saat production!

### 3. Kirim Command di WhatsApp

**PENTING:** Command harus diawali dengan `/` (slash)

Coba kirim di grup/channel WhatsApp:
```
/status
```

atau

```
/help
```

**Catatan:** 
- Jika testing mode aktif, kamu bisa kirim dari nomor bot sendiri
- Jika testing mode tidak aktif, minta orang lain kirim command

### 4. Lihat Console Log

Jika bot menerima pesan, akan muncul log seperti ini:
```
🔔 messages.upsert event received (type: notify)
   Total messages: 1

   Message details:
   - From me: false
   - Has message: true
   - Remote JID: 120363123456789012@g.us
   - Message type: notify
   ✅ Processing message...

📩 WhatsApp message received:
   From: 120363123456789012@g.us
   Text: /status

📨 Processing WhatsApp command:
   Command: /status
   User ID: 120363123456789012
   Group ID: 120363123456789012@g.us
   Args: []
   Response: 🤖 Status Bot...
   Sending to: 120363123456789012@g.us
   ✅ Message sent successfully
```

## 🐛 Troubleshooting

### Tidak Ada Log Sama Sekali

**Kemungkinan penyebab:**
1. Bot belum connect sepenuhnya
2. Message handler belum terdaftar
3. WhatsApp belum sync messages

**Solusi:**
1. Restart bot (Ctrl+C, lalu `npm start`)
2. Tunggu sampai muncul "Message handler registered"
3. Tunggu 10-15 detik setelah connect
4. Coba kirim pesan lagi

### Log Muncul Tapi Bot Tidak Reply

**Kemungkinan penyebab:**
1. `WHATSAPP_GROUP_ID` tidak sesuai
2. Bot tidak punya permission di grup/channel
3. Error saat send message

**Solusi:**
1. Lihat log untuk mendapatkan Group ID yang benar:
   ```
   Group ID: 120363123456789012@g.us
   ```
2. Copy Group ID tersebut ke `.env`:
   ```
   WHATSAPP_GROUP_ID=120363123456789012@g.us
   ```
3. Restart bot
4. Coba lagi

### Pesan "Skipped: Not a command"

**Penyebab:** Pesan tidak diawali dengan `/`

**Solusi:** Pastikan command diawali dengan `/`:
```
✅ /status
❌ status
```

### Pesan "Skipped: Message from me"

**Penyebab:** Bot mengabaikan pesan dari diri sendiri (nomor bot = nomor pengirim)

**Solusi:** 
1. **Untuk testing:** Tambahkan ke `.env`:
   ```env
   WHATSAPP_TESTING_MODE=true
   ```
   Restart bot, sekarang bot akan proses pesan dari diri sendiri.

2. **Untuk production:** Minta orang lain kirim command (ini cara yang benar)

**⚠️ PENTING:** Jangan lupa set `WHATSAPP_TESTING_MODE=false` saat production!

### Bot Terus Restart

**Penyebab:** WhatsApp mengirim status `restartRequired`

**Catatan:** Ini normal! Bot akan otomatis restart dan message handler tetap aktif.

**Tidak perlu action:** Bot tetap bisa menerima dan reply pesan.

## 📝 Mendapatkan Group ID

### Metode 1: Dari Console Log
1. Kirim pesan apapun di grup/channel
2. Lihat console log:
   ```
   📩 WhatsApp message received:
      From: 120363123456789012@g.us
   ```
3. Copy ID tersebut ke `.env`

### Metode 2: Dari Command /status
1. Kirim `/status` di grup/channel
2. Bot akan reply dengan Group ID
3. Copy ke `.env`

## 🔧 Format Group ID

### Grup WhatsApp
```
120363123456789012@g.us
```
- Angka panjang (biasanya 18 digit)
- Diakhiri dengan `@g.us`

### Channel/Saluran WhatsApp
```
120363123456789012@newsletter
```
- Angka panjang (biasanya 18 digit)
- Diakhiri dengan `@newsletter`

## ✅ Checklist

Sebelum test, pastikan:
- [ ] Bot sudah running (`npm start`)
- [ ] Muncul "WhatsApp connected successfully"
- [ ] Muncul "Message handler registered"
- [ ] Command diawali dengan `/`
- [ ] Jika nomor bot = nomor kamu, set `WHATSAPP_TESTING_MODE=true`
- [ ] Jika nomor bot ≠ nomor kamu, kirim dari nomor lain
- [ ] Tunggu 10-15 detik setelah connect

## 💡 Tips

### Test Command Sederhana
Mulai dengan command yang paling sederhana:
```
/status
```

Jika berhasil, coba command lain:
```
/help
/tugas
/jadwal
```

### Lihat Log Detail
Semua aktivitas bot tercatat di console. Jika ada masalah, screenshot console log dan kirim ke developer.

### Restart Bot
Jika ada masalah, coba restart bot:
```bash
# Tekan Ctrl+C untuk stop
npm start
```

### Update .env
Setelah dapat Group ID, update `.env`:
```env
WHATSAPP_GROUP_ID=120363123456789012@g.us
```

Lalu restart bot.

## 🆘 Masih Bermasalah?

Jika masih bermasalah setelah mengikuti panduan ini:

1. Screenshot console log lengkap
2. Screenshot pesan yang dikirim di WhatsApp
3. Screenshot `.env` file (sensor API keys)
4. Kirim ke developer untuk analisis lebih lanjut

## 📚 Dokumentasi Lain

- `HOW_TO_GET_ID.md` - Cara mendapatkan semua ID (Discord, WhatsApp, User)
- `COMMANDS.md` - Daftar lengkap command yang tersedia
- `SETUP_GUIDE.md` - Panduan setup lengkap
- `README.md` - Dokumentasi utama
