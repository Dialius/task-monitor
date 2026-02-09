# Discord Setup Guide

Panduan lengkap untuk setup Discord bot dan deploy slash commands.

## 📋 Prerequisites

1. **Discord Bot Token**
   - Buka [Discord Developer Portal](https://discord.com/developers/applications)
   - Klik "New Application"
   - Beri nama aplikasi Anda
   - Pergi ke tab "Bot"
   - Klik "Add Bot"
   - Copy "Token" (ini adalah DISCORD_BOT_TOKEN)

2. **Discord Client ID**
   - Di halaman aplikasi yang sama
   - Pergi ke tab "General Information"
   - Copy "Application ID" (ini adalah DISCORD_CLIENT_ID)

3. **Discord Guild ID (Server ID)**
   - Buka Discord
   - Klik kanan pada server Anda
   - Klik "Copy Server ID" (ini adalah DISCORD_GUILD_ID)
   - *Catatan: Anda harus mengaktifkan Developer Mode di Discord Settings > Advanced > Developer Mode*

4. **Discord Channel ID**
   - Klik kanan pada channel yang ingin digunakan
   - Klik "Copy Channel ID" (ini adalah DISCORD_CHANNEL_ID)

5. **Discord User ID (Untuk Admin Pertama)**
   - Buka Discord
   - Klik kanan pada username Anda (atau user yang ingin dijadikan admin)
   - Klik "Copy User ID" (ini adalah FIRST_ADMIN_USER_ID)
   - *Catatan: Developer Mode harus aktif*

## 🔧 Setup Bot Permissions

1. Di Discord Developer Portal, pergi ke tab "Bot"
2. Aktifkan intents berikut:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

3. Di tab "OAuth2" > "URL Generator":
   - Pilih scope: `bot` dan `applications.commands`
   - Pilih permissions:
     - ✅ Read Messages/View Channels
     - ✅ Send Messages
     - ✅ Embed Links
     - ✅ Attach Files
     - ✅ Read Message History
     - ✅ Use Slash Commands
     - ✅ Manage Messages (optional)

4. Copy URL yang dihasilkan dan buka di browser untuk invite bot ke server

## 🚀 Deploy Slash Commands

### Step 1: Setup Environment Variables

Pastikan `.env` sudah terisi dengan benar:

```env
# Database
MONGODB_URI=your_mongodb_uri

# First Admin (PENTING!)
# Isi Discord ID jika menggunakan Discord
FIRST_ADMIN_DISCORD_ID=your_discord_user_id
# Isi WhatsApp ID jika menggunakan WhatsApp (nomor HP tanpa +)
FIRST_ADMIN_WHATSAPP_ID=6281234567890
# Role untuk admin pertama
FIRST_ADMIN_ROLE=ketua

# Discord
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_CHANNEL_ID=your_channel_id_here
DISCORD_ENABLED=true
```

**PENTING:** 
- Isi `FIRST_ADMIN_DISCORD_ID` dengan Discord User ID Anda jika menggunakan Discord
- Isi `FIRST_ADMIN_WHATSAPP_ID` dengan nomor WhatsApp Anda jika menggunakan WhatsApp
- Anda bisa isi keduanya jika menggunakan kedua platform
- Bot akan otomatis membuat admin untuk platform yang dikonfigurasi saat pertama kali start

### Step 2: Run Deploy Script

```bash
npm run deploy-commands
```

Output yang diharapkan:

```
╔════════════════════════════════════════════════════════╗
║   🤖 DISCORD SLASH COMMANDS DEPLOYMENT               ║
╚════════════════════════════════════════════════════════╝

📋 Step 1/3: Deleting old guild commands...
✅ Old guild commands deleted

📋 Step 2/3: Registering 25 new commands...
✅ Successfully registered 25 slash commands

📋 Step 3/3: Listing registered commands:
   Member Commands (11):
   • /tugas - Lihat semua tugas aktif
   • /tugas_hari_ini - Tugas deadline hari ini
   ...

   Admin Commands (14):
   • /add_tugas - Tambah tugas
   • /edit_tugas - Edit tugas
   ...

✅ Deployment complete!
```

### Step 3: Verify Commands

1. Buka Discord server Anda
2. Ketik `/` di chat
3. Anda akan melihat semua command bot muncul di autocomplete

## 🔄 Kapan Harus Deploy Ulang?

Jalankan `npm run deploy-commands` lagi jika:

1. **Pertama kali setup** - Untuk mendaftarkan semua command
2. **Menambah command baru** - Setelah menambah command di code
3. **Mengubah command** - Setelah mengubah nama/deskripsi/options command
4. **Pindah server** - Jika menggunakan DISCORD_GUILD_ID yang berbeda
5. **Command tidak muncul** - Jika command lama masih muncul atau command baru tidak muncul

## 🧹 Menghapus Semua Commands

Jika Anda ingin menghapus semua command tanpa mendaftarkan yang baru:

1. Edit `scripts/deploy-commands.js`
2. Comment out bagian "Step 2/3" (registrasi command baru)
3. Jalankan `npm run deploy-commands`

Atau gunakan script berikut:

```javascript
// delete-all-commands.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

rest.put(
  Routes.applicationGuildCommands(
    process.env.DISCORD_CLIENT_ID,
    process.env.DISCORD_GUILD_ID
  ),
  { body: [] }
)
.then(() => console.log('✅ All commands deleted'))
.catch(console.error);
```

## 📝 Command List

### Member Commands (11)
- `/tugas` - Lihat semua tugas aktif
- `/tugas_hari_ini` - Tugas deadline hari ini
- `/tugas_minggu_ini` - Tugas deadline minggu ini
- `/jadwal` - Jadwal hari ini
- `/jadwal_besok` - Jadwal besok
- `/jadwal_minggu_ini` - Jadwal minggu ini
- `/piket` - Piket hari ini
- `/piket_minggu_ini` - Piket minggu ini
- `/help` atau `/bantuan` - Daftar command
- `/status` - Status bot

### Admin Commands (14)
- `/add_tugas` - Tambah tugas baru
- `/edit_tugas` - Edit tugas
- `/hapus_tugas` - Hapus tugas
- `/tandai_selesai` - Tandai tugas selesai
- `/add_jadwal` - Tambah jadwal
- `/edit_jadwal` - Edit jadwal
- `/hapus_jadwal` - Hapus jadwal
- `/ganti_jadwal` - Ganti jadwal + buat pengumuman
- `/set_piket` - Set piket
- `/edit_piket` - Edit piket
- `/add_pengumuman` - Tambah pengumuman
- `/hapus_pengumuman` - Hapus pengumuman
- `/broadcast` - Broadcast pesan
- `/broadcast_urgent` - Broadcast pesan urgent

## ❓ Troubleshooting

### Command tidak muncul di Discord

1. Pastikan bot sudah di-invite dengan scope `applications.commands`
2. Jalankan ulang `npm run deploy-commands`
3. Tunggu beberapa menit (Discord cache)
4. Restart Discord client

### Error: Missing Access

Bot tidak punya permission untuk mendaftarkan command. Pastikan:
- Bot sudah di-invite dengan permission yang benar
- Bot punya role dengan permission "Use Application Commands"

### Error: Invalid Token

- Pastikan DISCORD_BOT_TOKEN benar
- Token tidak boleh ada spasi atau karakter tambahan
- Regenerate token di Discord Developer Portal jika perlu

### Command terduplikasi

Ini terjadi jika command didaftarkan sebagai guild command DAN global command. Solusi:
1. Jalankan `npm run deploy-commands` untuk reset guild commands
2. Pastikan tidak ada script lain yang mendaftarkan command

### Command lama masih muncul

Discord cache command. Solusi:
1. Jalankan `npm run deploy-commands` untuk hapus dan daftar ulang
2. Restart Discord client
3. Tunggu 5-10 menit untuk cache clear

## 🔗 Resources

- [Discord.js Guide - Slash Commands](https://discordjs.guide/slash-commands/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs/intro)
