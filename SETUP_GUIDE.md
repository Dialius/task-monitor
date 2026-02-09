# 📖 Panduan Setup Multi-Platform Class Reminder Bot

Panduan lengkap untuk setup dan konfigurasi bot dari awal.

## 📋 Prerequisites

Sebelum mulai, pastikan sudah install:
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ MongoDB 4.4+ ([Download](https://www.mongodb.com/try/download/community))
- ✅ Git ([Download](https://git-scm.com/))

## 🚀 Langkah 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/Dialius/task-monitor.git
cd task-monitor

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## ⚙️ Langkah 2: Konfigurasi Database

### Option A: MongoDB Local

1. **Install MongoDB** (jika belum)
   - Download dari https://www.mongodb.com/try/download/community
   - Install dengan default settings
   - MongoDB akan jalan di `localhost:27017`

2. **Start MongoDB**
   ```bash
   # Windows (buka Command Prompt as Administrator)
   net start MongoDB
   
   # Atau jalankan mongod.exe langsung
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
   ```

3. **Verify MongoDB Running**
   ```bash
   # Test connection
   mongosh
   # Jika berhasil, akan masuk ke MongoDB shell
   # Ketik 'exit' untuk keluar
   ```

### Option B: MongoDB Atlas (Cloud - Gratis)

1. **Buat Account** di https://www.mongodb.com/cloud/atlas/register
2. **Buat Cluster** (pilih FREE tier)
3. **Setup Database Access**:
   - Database Access > Add New Database User
   - Username: `botuser`
   - Password: (buat password kuat)
   - Database User Privileges: Read and write to any database
4. **Setup Network Access**:
   - Network Access > Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0` (untuk testing)
5. **Get Connection String**:
   - Clusters > Connect > Connect your application
   - Copy connection string
   - Format: `mongodb+srv://botuser:password@cluster.mongodb.net/multiplatform_class_bot`

## 📝 Langkah 3: Konfigurasi Bot

File `.env` sudah dibuat. Sekarang isi konfigurasinya:

### 3.1 Database Configuration

Edit `.env`:
```env
# Untuk MongoDB Local
MONGODB_URI=mongodb://localhost:27017/multiplatform_class_bot

# Atau untuk MongoDB Atlas
MONGODB_URI=mongodb+srv://botuser:password@cluster.mongodb.net/multiplatform_class_bot
```

### 3.2 WhatsApp Configuration (Recommended untuk mulai)

```env
# Aktifkan WhatsApp
WHATSAPP_ENABLED=true

# Group ID akan didapat setelah scan QR code
# Kosongkan dulu, nanti akan diisi
WHATSAPP_GROUP_ID=
```

### 3.3 Discord Configuration (Optional)

Jika ingin pakai Discord:

1. **Buat Discord Bot**:
   - Buka https://discord.com/developers/applications
   - Click "New Application"
   - Beri nama (contoh: "Class Reminder Bot")
   - Masuk ke tab "Bot"
   - Click "Add Bot"
   - **PENTING**: Enable "Message Content Intent"
   - Copy Bot Token

2. **Invite Bot ke Server**:
   - Masuk ke tab "OAuth2" > "URL Generator"
   - Pilih scopes: `bot`, `applications.commands`
   - Pilih permissions: 
     - Send Messages
     - Embed Links
     - Use Slash Commands
     - Mention Everyone (untuk piket)
   - Copy URL dan buka di browser
   - Pilih server dan authorize

3. **Get IDs**:
   - Enable Developer Mode di Discord (Settings > Advanced > Developer Mode)
   - Client ID: Ada di tab "General Information" > Application ID
   - Guild ID: Klik kanan server > Copy Server ID
   - Channel ID: Klik kanan channel > Copy Channel ID

4. **Edit `.env`**:
   ```env
   DISCORD_ENABLED=true
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_GUILD_ID=your_guild_id_here
   DISCORD_CHANNEL_ID=your_channel_id_here
   ```

### 3.4 AI Services Configuration (Optional tapi Recommended)

Bot bisa jalan tanpa AI, tapi dengan AI pesan akan lebih bagus.

#### Groq API (Primary - Gratis & Cepat)

1. Buka https://console.groq.com/
2. Sign up dengan Google/GitHub
3. Masuk ke "API Keys"
4. Click "Create API Key"
5. Copy API key

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-70b-versatile
```

#### Google Gemini API (Fallback - Gratis)

1. Buka https://makersuite.google.com/app/apikey
2. Login dengan Google account
3. Click "Create API Key"
4. Copy API key

```env
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
GEMINI_MODEL=gemini-1.5-flash
```

### 3.5 Scheduler Configuration

```env
# Timezone (default: Asia/Jakarta)
TIMEZONE=Asia/Jakarta

# Recap harian jam 17:00 (5 PM)
DAILY_REMINDER_TIME=17:00

# Recap mingguan hari Jumat (5) jam 20:00 (8 PM)
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00
```

## 🎯 Langkah 4: Setup Database Users

Bot perlu data user untuk permission system. Ada 2 cara:

### Option A: Manual via MongoDB Compass (Recommended)

1. **Install MongoDB Compass** (GUI untuk MongoDB)
   - Download: https://www.mongodb.com/try/download/compass
   - Connect ke MongoDB (local atau Atlas)

2. **Buat Database & Collections**:
   - Database name: `multiplatform_class_bot`
   - Collections akan dibuat otomatis saat bot jalan

3. **Tambah Admin User** (setelah bot jalan pertama kali):
   - Buka collection `admins`
   - Insert Document:
   ```json
   {
     "user_identifier": "628123456789",
     "platform": "whatsapp",
     "role": "admin",
     "nama": "Nama Anda",
     "created_at": { "$date": "2024-01-01T00:00:00.000Z" }
   }
   ```
   - Ganti `628123456789` dengan nomor WhatsApp Anda (tanpa +)
   - Atau untuk Discord, ganti dengan Discord User ID

### Option B: Via MongoDB Shell

```bash
# Connect ke MongoDB
mongosh

# Pilih database
use multiplatform_class_bot

# Insert admin user
db.admins.insertOne({
  user_identifier: "628123456789",
  platform: "whatsapp",
  role: "admin",
  nama: "Nama Anda",
  created_at: new Date()
})

# Verify
db.admins.find()
```

## 🚀 Langkah 5: Jalankan Bot

### Development Mode (dengan auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
# Build dulu
npm run build

# Jalankan
npm start
```

### Production dengan PM2 (Recommended)

```bash
# Install PM2 global
npm install -g pm2

# Start bot
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Restart bot
npm run pm2:restart

# Stop bot
npm run pm2:stop
```

## 📱 Langkah 6: Setup WhatsApp (Jika Enabled)

1. **Jalankan Bot**:
   ```bash
   npm run dev
   ```

2. **Scan QR Code**:
   - QR code akan muncul di terminal
   - Buka WhatsApp di HP
   - Masuk ke Settings > Linked Devices
   - Scan QR code

3. **Get Group ID**:
   - Setelah connect, bot akan log semua group
   - Cari group ID di console log
   - Format: `628xxxxxxxxxx-xxxxxxxxxx@g.us`
   - Copy dan paste ke `.env`:
   ```env
   WHATSAPP_GROUP_ID=628xxxxxxxxxx-xxxxxxxxxx@g.us
   ```

4. **Restart Bot**:
   ```bash
   # Stop bot (Ctrl+C)
   # Start lagi
   npm run dev
   ```

5. **Test Bot**:
   - Kirim pesan di group: `/help`
   - Bot akan reply dengan daftar command

## ✅ Langkah 7: Verify Setup

### Test Commands

Di WhatsApp group atau Discord channel, coba:

```
/help
/status
/tugas
/jadwal
```

Jika bot reply, setup berhasil! 🎉

### Check Logs

```bash
# Lihat logs
cat logs/combined-*.log

# Atau dengan PM2
npm run pm2:logs
```

## 🔧 Troubleshooting

### Bot tidak connect ke MongoDB

**Problem**: `MongoServerError: Authentication failed`

**Solution**:
- Cek username/password di connection string
- Pastikan user punya permission "Read and write to any database"
- Untuk Atlas, cek Network Access (allow 0.0.0.0/0)

---

**Problem**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution**:
- Pastikan MongoDB running (`net start MongoDB`)
- Cek connection string di `.env`
- Test connection dengan `mongosh`

### WhatsApp QR Code tidak muncul

**Problem**: QR code tidak muncul di terminal

**Solution**:
- Pastikan `WHATSAPP_ENABLED=true`
- Pastikan `printQRInTerminal: true` di BaileysClient
- Cek logs untuk error
- Hapus folder `auth_info/` dan coba lagi

### WhatsApp connection closed terus

**Problem**: Connection closed, reconnecting...

**Solution**:
- Bot akan auto-reconnect dengan exponential backoff
- Setelah 5 attempts, QR code baru akan muncul
- Pastikan WhatsApp di HP tidak logout
- Jangan logout dari Linked Devices

### Discord bot tidak online

**Problem**: Bot tidak muncul online di Discord

**Solution**:
- Cek bot token di `.env`
- Pastikan "Message Content Intent" enabled
- Cek bot permissions di server
- Lihat logs untuk error

### Bot tidak reply command

**Problem**: Bot tidak reply saat kirim command

**Solution**:
- Pastikan user sudah ada di database (collection `admins` atau `members`)
- Cek format command: `/command | arg1 | arg2`
- Lihat logs untuk error
- Test dengan `/help` dulu

### AI tidak bekerja

**Problem**: Deskripsi tugas tidak di-enhance

**Solution**:
- Bot akan fallback: Groq → Gemini → original text
- Cek API keys di `.env`
- Cek logs untuk error
- AI timeout default 10 detik
- Bot tetap jalan tanpa AI

## 📚 Next Steps

Setelah setup berhasil:

1. **Tambah Users**:
   - Insert ke collection `admins` (admin/koordinator)
   - Insert ke collection `members` (member biasa)

2. **Test Commands**:
   - Baca [COMMANDS.md](COMMANDS.md) untuk daftar lengkap
   - Test semua command admin
   - Test semua command member

3. **Setup Scheduler**:
   - Bot akan auto-send recap harian & mingguan
   - Sesuaikan waktu di `.env` jika perlu

4. **Backup Database**:
   ```bash
   npm run backup
   ```

5. **Monitor Logs**:
   ```bash
   npm run pm2:logs
   ```

## 🆘 Need Help?

- Baca [README.md](README.md) untuk overview
- Baca [COMMANDS.md](COMMANDS.md) untuk command reference
- Check logs di `./logs/`
- Open issue di GitHub

## 📝 Configuration Summary

Minimal configuration untuk mulai:

```env
# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/multiplatform_class_bot

# WhatsApp (REQUIRED - minimal 1 platform)
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=your_group_id@g.us

# AI (OPTIONAL tapi recommended)
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key

# Scheduler (OPTIONAL - ada default)
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=17:00
```

Selamat menggunakan Multi-Platform Class Reminder Bot! 🎉
