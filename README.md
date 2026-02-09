# Multi-Platform Class Reminder Bot

Bot pengingat tugas dan jadwal kelas yang mendukung Discord dan WhatsApp. Bot ini membantu mengelola tugas, jadwal pelajaran, piket, dan pengumuman dengan fitur AI untuk meningkatkan pesan dan recap otomatis.

## 🌟 Fitur Utama

### Platform Support
- **Discord**: Slash commands, embeds, buttons, role-based permissions
- **WhatsApp**: Text commands, mentions, group messaging via Baileys
- **Multi-Platform**: Dapat berjalan di kedua platform secara bersamaan

### Manajemen Tugas
- Tambah, edit, hapus tugas dengan prioritas otomatis
- Prioritas berdasarkan deadline (urgent <24h, penting <72h, normal)
- Query tugas: semua, hari ini, minggu ini
- Integrasi Notion (opsional) untuk sinkronisasi

### Jadwal Pelajaran
- Manajemen jadwal per hari
- Soft delete untuk perubahan jadwal
- Pengumuman otomatis saat jadwal berubah
- Query jadwal: hari ini, besok, minggu ini

### Piket & Pengumuman
- Manajemen jadwal piket dengan mention otomatis
- Pengumuman khusus dengan tipe (umum, penting, urgent)
- Broadcast pesan ke grup

### AI Enhancement
- Groq (primary) dan Gemini (fallback) untuk rewrite pesan
- Format recap harian dan mingguan yang engaging
- Graceful degradation jika AI tidak tersedia

### Reminder Otomatis
- Recap harian (default 17:00): jadwal besok, tugas, piket, pengumuman
- Recap mingguan (default Jumat 20:00): statistik tugas minggu depan
- Timezone support (default Asia/Jakarta)

### Permission System
- Role-based access control (Admin, Koordinator, Member)
- Koordinator restrictions: tidak bisa broadcast, manage users, Notion sync
- Platform-agnostic user identification

## 📋 Requirements

- Node.js 18+ dan npm
- MongoDB 4.4+
- Discord Bot Token (jika menggunakan Discord)
- WhatsApp account (jika menggunakan WhatsApp)
- Groq API Key (opsional, untuk AI)
- Gemini API Key (opsional, untuk AI fallback)
- Notion API Key (opsional, untuk integrasi Notion)

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/Dialius/task-monitor.git
cd task-monitor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` ke `.env` dan isi konfigurasi:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/multiplatform_class_bot

# Discord (jika menggunakan Discord)
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_CHANNEL_ID=your_discord_channel_id
DISCORD_ENABLED=true

# WhatsApp (jika menggunakan WhatsApp)
WHATSAPP_GROUP_ID=your_whatsapp_group_id@g.us
WHATSAPP_ENABLED=true

# AI Services (opsional)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Scheduler
```

### 4. Deploy Discord Slash Commands (Jika Menggunakan Discord)

**PENTING:** Sebelum menjalankan bot Discord, Anda harus mendeploy slash commands terlebih dahulu:

```bash
npm run deploy-commands
```

Script ini akan:
- Menghapus semua command lama dari server Discord
- Mendaftarkan 25 command baru (11 member + 14 admin)
- Menampilkan daftar command yang berhasil didaftarkan

**Catatan:** Jalankan command ini setiap kali Anda:
- Pertama kali setup bot
- Menambah/mengubah command baru
- Pindah ke server Discord yang berbeda

### 5. Build dan Run
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=17:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=20:00

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### 4. Setup Discord Bot (Opsional)

1. Buat bot di [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable "Message Content Intent" di Bot settings
3. Invite bot ke server dengan permissions: Send Messages, Embed Links, Use Slash Commands
4. Copy Bot Token, Client ID, Guild ID, dan Channel ID ke `.env`

### 5. Setup MongoDB

Pastikan MongoDB berjalan:

```bash
# Local MongoDB
mongod

# Atau gunakan MongoDB Atlas (cloud)
# Update MONGODB_URI di .env dengan connection string Atlas
```

### 6. Build & Run

```bash
# Build TypeScript
npm run build

# Start bot
npm start

# Atau development mode dengan auto-reload
npm run dev
```

### 7. WhatsApp Authentication (Jika Menggunakan WhatsApp)

Saat pertama kali menjalankan bot dengan WhatsApp enabled:
1. QR code akan muncul di terminal
2. Scan QR code dengan WhatsApp di HP
3. Session akan tersimpan di folder `auth_info/`
4. Bot akan auto-reconnect di run berikutnya

## 📖 Command Reference

### Format Command

```
/command | arg1 | arg2 | arg3
```

Delimiter: `|` (pipe)

### Admin Commands

#### Task Management
```
/add_tugas | Judul | Deskripsi | YYYY-MM-DD | Mata Pelajaran | individu/kelompok/ujian
/edit_tugas | task_id | field | new_value
/hapus_tugas | task_id
/tandai_selesai | task_id
```

#### Schedule Management
```
/add_jadwal | Senin/Selasa/Rabu/Kamis/Jumat/Sabtu | HH:MM-HH:MM | Mata Pelajaran | Ruangan
```

#### Piket Management
```
/set_piket | Senin/Selasa/Rabu/Kamis/Jumat/Sabtu | Nama1,Nama2 | Nomor1,Nomor2
```

#### Announcement Management
```
/add_pengumuman | Judul | Isi | YYYY-MM-DD | umum/penting/urgent
```

### Member Commands

#### Task Queries
```
/tugas                  # Semua tugas aktif
/tugas_hari_ini        # Tugas hari ini
/tugas_minggu_ini      # Tugas minggu ini
```

#### Schedule Queries
```
/jadwal                # Jadwal hari ini
/jadwal_besok          # Jadwal besok
/jadwal_minggu_ini     # Jadwal minggu ini
```

#### Piket Queries
```
/piket                 # Piket hari ini
/piket_minggu_ini      # Piket minggu ini
```

#### Utility
```
/help atau /bantuan    # Daftar command
/status                # Status bot
```

## 🏗️ Architecture

```
src/
├── adapters/          # Platform abstraction layer
│   ├── PlatformAdapter.ts
│   ├── DiscordAdapter.ts
│   └── WhatsAppAdapter.ts
├── clients/           # Platform clients
│   ├── DiscordClient.ts
│   └── BaileysClient.ts
├── config/            # Configuration
│   ├── database.ts
│   └── ConfigManager.ts
├── handlers/          # Command handlers
│   ├── AdminCommandHandler.ts
│   └── MemberCommandHandler.ts
├── models/            # MongoDB models
│   ├── Admin.ts
│   ├── Member.ts
│   ├── Task.ts
│   ├── Jadwal.ts
│   ├── Piket.ts
│   ├── Pengumuman.ts
│   ├── BotConfig.ts
│   └── Log.ts
├── services/          # Business logic
│   ├── PermissionService.ts
│   ├── TaskService.ts
│   ├── ScheduleService.ts
│   ├── PiketService.ts
│   ├── AnnouncementService.ts
│   ├── AIService.ts
│   └── ReminderScheduler.ts
├── utils/             # Utilities
│   ├── CommandParser.ts
│   ├── CommandRouter.ts
│   ├── Formatter.ts
│   ├── Logger.ts
│   └── Validator.ts
├── bot.ts             # Main bot integration
└── index.ts           # Entry point
```

## 🔧 Configuration

### Database Configuration

Bot menggunakan MongoDB dengan collections:
- `admins`: User dengan role admin/koordinator
- `members`: User member
- `tasks`: Tugas kelas
- `jadwal_pelajaran`: Jadwal per hari
- `jadwal_piket`: Piket per hari
- `pengumuman_khusus`: Pengumuman
- `bot_config`: Konfigurasi bot
- `logs`: Activity logs

### Permission Matrix

| Command | Admin | Koordinator | Member |
|---------|-------|-------------|--------|
| Task Management | ✅ | ✅ | ❌ |
| Schedule Management | ✅ | ✅ | ❌ |
| Piket Management | ✅ | ✅ | ❌ |
| Announcement | ✅ | ✅ | ❌ |
| Broadcast | ✅ | ❌ | ❌ |
| Notion Sync | ✅ | ❌ | ❌ |
| Query Commands | ✅ | ✅ | ✅ |

## 🐛 Troubleshooting

### WhatsApp Connection Issues

**Problem**: QR code tidak muncul
- Pastikan `WHATSAPP_ENABLED=true` di `.env`
- Pastikan `printQRInTerminal: true` di BaileysClient config
- Cek logs di `./logs/` untuk error details

**Problem**: Connection closed terus-menerus
- Bot akan auto-reconnect dengan exponential backoff (1s, 2s, 4s, 8s, 16s)
- Setelah 5 attempts, QR code baru akan di-generate
- Pastikan WhatsApp di HP tidak logout

### Discord Connection Issues

**Problem**: Bot tidak online
- Cek Discord Bot Token di `.env`
- Pastikan "Message Content Intent" enabled di Discord Developer Portal
- Cek bot permissions di server

**Problem**: Slash commands tidak muncul
- Bot akan auto-register slash commands saat connect
- Tunggu beberapa menit untuk Discord sync
- Kick dan re-invite bot jika perlu

### Database Issues

**Problem**: Connection timeout
- Pastikan MongoDB berjalan
- Cek `MONGODB_URI` di `.env`
- Bot akan retry 10x dengan 5s interval

### AI Service Issues

**Problem**: AI tidak bekerja
- Bot akan fallback dari Groq → Gemini → original text
- Cek API keys di `.env`
- Cek logs untuk error details
- AI timeout default 10 detik

## 📝 Development

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

## 📚 Documentation

- [Requirements](/.kiro/specs/whatsapp-class-reminder-bot/requirements.md)
- [Design](/.kiro/specs/whatsapp-class-reminder-bot/design.md)
- [Tasks](/.kiro/specs/whatsapp-class-reminder-bot/tasks.md)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Authors

- Dialius - Initial work

## 🙏 Acknowledgments

- Discord.js for Discord integration
- Baileys for WhatsApp integration
- Groq & Google Gemini for AI services
- MongoDB for database
- Node-cron for scheduling
