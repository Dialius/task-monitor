# Cara Mendapatkan ID untuk Bot

## 📱 WhatsApp Group/Channel ID

### Metode 1: Dari Console Log (Paling Mudah)
1. Jalankan bot dengan `npm start`
2. Tunggu sampai bot connect (QR code sudah di-scan)
3. Kirim pesan apapun (misalnya "test") di grup/channel WhatsApp
4. Lihat console log, akan muncul seperti ini:
   ```
   📩 WhatsApp message received:
      From: 120363123456789012@g.us
   ```
5. Copy ID tersebut (contoh: `120363123456789012@g.us`)
6. Paste ke `.env` file:
   ```
   WHATSAPP_GROUP_ID=120363123456789012@g.us
   ```

### Metode 2: Dari Command /status
1. Pastikan bot sudah connect
2. Kirim `/status` di grup/channel WhatsApp
3. Bot akan reply dengan informasi termasuk Group ID
4. Copy Group ID tersebut ke `.env` file

### Format ID WhatsApp:
- **Grup**: `120363123456789012@g.us` (angka panjang + @g.us)
- **Channel/Saluran**: `120363123456789012@newsletter` (angka panjang + @newsletter)
- **Personal Chat**: `628123456789@s.whatsapp.net` (nomor HP + @s.whatsapp.net)

## 💬 Discord IDs

### Discord Server ID (Guild ID)
1. Aktifkan Developer Mode:
   - Settings → Advanced → Developer Mode (ON)
2. Klik kanan server → Copy Server ID
3. Paste ke `.env`:
   ```
   DISCORD_GUILD_ID=1234567890123456789
   ```

### Discord Channel ID
1. Aktifkan Developer Mode (lihat di atas)
2. Klik kanan channel → Copy Channel ID
3. Paste ke `.env`:
   ```
   DISCORD_CHANNEL_ID=1234567890123456789
   ```

### Discord User ID
1. Aktifkan Developer Mode (lihat di atas)
2. Klik kanan user → Copy User ID
3. Paste ke `.env` untuk admin:
   ```
   FIRST_ADMIN_DISCORD_ID=1234567890123456789
   ```

## 👤 WhatsApp User ID (Nomor HP)

### Format:
- Nomor HP tanpa `+` dan tanpa spasi
- Contoh: `628123456789` (untuk +62 812-3456-789)

### Cara dapat:
1. Buka WhatsApp Web
2. Klik profil user
3. Lihat nomor HP
4. Hapus `+` dan spasi
5. Paste ke `.env`:
   ```
   FIRST_ADMIN_WHATSAPP_ID=628123456789
   ```

## 🔧 Tips

### Restart Bot Setelah Update .env
Setelah mengubah `.env` file, restart bot:
```bash
# Ctrl+C untuk stop bot
npm start
```

### Cek Konfigurasi
Bot akan menampilkan konfigurasi saat start:
```
✅ BOT IS RUNNING!

📝 Available Commands:
   ...

💡 Tip: Kirim /help di chat untuk melihat semua command
```

### Troubleshooting

**Bot tidak reply di WhatsApp:**
1. Pastikan `WHATSAPP_ENABLED=true` di `.env`
2. Pastikan `WHATSAPP_GROUP_ID` sudah diisi dengan benar
3. Pastikan bot sudah connect (lihat console log)
4. Coba kirim command dengan `/` prefix (contoh: `/status`)

**Bot tidak reply di Discord:**
1. Pastikan `DISCORD_ENABLED=true` di `.env`
2. Pastikan semua Discord ID sudah benar
3. Pastikan bot sudah di-invite ke server
4. Pastikan bot punya permission untuk read/send messages
5. Deploy slash commands dulu: `npm run deploy-commands`

**Permission denied:**
1. Pastikan user ID sudah terdaftar sebagai admin
2. Cek role admin di database
3. Gunakan command member dulu untuk test (contoh: `/status`, `/help`)
