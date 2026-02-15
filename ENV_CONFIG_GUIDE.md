# Environment Configuration Guide

Panduan lengkap untuk mengatur file `.env` dengan format yang simple dan mudah dibaca.

## 📋 Format Baru

File `.env` sekarang menggunakan format yang lebih clean dan mudah dibaca:

```env
# ========================== [[[ SECTION NAME ]]] ==========================

# --------=========== SUBSECTION ===========--------
VARIABLE_NAME=value                            # Explanation here
```

## 🎯 Keuntungan Format Baru

1. **Visual Separator** - Mudah membedakan section dengan border ASCII
2. **Inline Comments** - Penjelasan langsung di sebelah kanan variable
3. **Grouped Settings** - Settings dikelompokkan berdasarkan fungsi
4. **Clean & Simple** - Tidak ada komentar panjang yang mengganggu

## 📖 Section Breakdown

### 1. DATABASE SETTINGS
```env
MONGODB_URI=mongodb://...                      # MongoDB connection string
```
- Connection string ke MongoDB database
- Bisa local atau cloud (MongoDB Atlas)

### 2. FIRST ADMIN (BOOTSTRAP)
```env
FIRST_ADMIN_DISCORD_ID=123456789               # Discord User ID
FIRST_ADMIN_WHATSAPP_ID=628123456789           # WhatsApp number without +
FIRST_ADMIN_ROLE=ketua                         # Role: ketua / wakil / koordinator
```
- Admin pertama yang otomatis dibuat saat bot start
- Untuk bootstrap sebelum ada data di database

### 3. DISCORD SETTINGS
```env
DISCORD_ENABLED=true                           # Enable Discord bot
DISCORD_BOT_TOKEN=MTxxxxx                      # Bot token
DISCORD_CLIENT_ID=123456789                    # Application ID
DISCORD_GUILD_ID=987654321                     # Server ID
DISCORD_CHANNEL_ID=111222333                   # Channel ID
```

#### Discord Role Permissions
```env
DISCORD_ADMIN_ROLE_IDS=123,456,789             # Admin roles (comma-separated)
DISCORD_LEADER_ROLE_IDS=111,222                # Leader roles (comma-separated)
```
- Admin roles: Bisa gunakan admin commands
- Leader roles: Bisa gunakan leader + admin commands

#### Discord Activity Status
```env
DISCORD_ACTIVITY_ENABLED=true                  # Enable rotating status
DISCORD_ACTIVITY_INTERVAL=5                    # Rotation interval (minutes)
DISCORD_ACTIVITY_TYPE=3                        # 0=Playing, 2=Listening, 3=Watching
DISCORD_BOT_STATUS=online                      # online / idle / dnd / invisible
```

#### Discord Task Monitor
```env
DISCORD_INFO_CHANNEL_ID=123456                 # Channel for Task Monitor embed
DISCORD_COMMAND_CHANNEL_ID=789012              # Channel for member commands
```

#### Discord Emojis
```env
DISCORD_EMOJI_ONLINE=<a:online:ID>             # Animated emoji format
DISCORD_EMOJI_OFFLINE=<a:offline:ID>
# ... more emojis
```

#### Discord Styling
```env
DISCORD_EMBED_COLOR=#5865F2                    # Embed color (hex)
DISCORD_FOOTER_ICON=https://...                # Footer icon URL
```

#### Discord Rate Limiting
```env
DISCORD_RATE_LIMIT_GENERAL=30                  # General rate limit (seconds)
DISCORD_RATE_LIMIT_COMMAND=7200                # Command channel rate limit (2 hours)
```

### 4. WHATSAPP SETTINGS
```env
WHATSAPP_ENABLED=true                          # Enable WhatsApp bot
WHATSAPP_GROUP_ID=120xxx@newsletter            # WhatsApp group ID
WHATSAPP_USE_PAIRING_CODE=false                # Use pairing code vs QR
WHATSAPP_TESTING_MODE=false                    # Allow self messages (testing only)
```

### 5. AI SERVICE SETTINGS
```env
# Groq API (Primary)
GROQ_API_KEY=gsk_xxx                           # Groq API key
GROQ_MODEL=llama-3.3-70b-versatile             # Model name

# Gemini API (Fallback)
GEMINI_API_KEY=AIza...                         # Gemini API key
GEMINI_MODEL=gemini-2.5-flash                  # Model name

AI_TIMEOUT=10                                  # Timeout in seconds
```

### 6. NOTION INTEGRATION
```env
NOTION_ENABLED=true                            # Enable Notion sync
NOTION_DATABASE_ID=xxx-xxx-xxx                 # Database ID
NOTION_API_KEY=ntn_xxx                         # API key
```

### 7. SCHEDULER SETTINGS
```env
TIMEZONE=Asia/Jakarta                          # Timezone
DAILY_REMINDER_TIME=17:00                      # Daily reminder (HH:MM)
WEEKLY_REMINDER_DAY=5                          # 0=Sunday, 6=Saturday
WEEKLY_REMINDER_TIME=20:00                     # Weekly reminder (HH:MM)
```

### 8. LOGGING SETTINGS
```env
LOG_LEVEL=info                                 # error / warn / info / debug
LOG_DIR=./logs                                 # Log directory
```

### 9. API SERVER (OPTIONAL)
```env
API_ENABLED=false                              # Enable API server
API_PORT=3001                                  # Server port
JWT_SECRET=change-this                         # JWT secret
# ... more API settings
```

## 🔧 Cara Menggunakan

1. **Copy `.env.example` ke `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` dengan text editor:**
   - Isi value yang kosong
   - Sesuaikan dengan kebutuhan
   - Jangan ubah format/structure

3. **Restart bot:**
   ```bash
   npm run dev
   ```

## ✅ Tips

1. **Inline Comments** - Penjelasan ada di kanan, jangan dihapus
2. **Visual Separator** - Border ASCII membantu navigasi
3. **Grouped Settings** - Settings sejenis dikelompokkan
4. **Required vs Optional** - Lihat inline comment untuk tahu mana yang wajib
5. **Comma-Separated** - Untuk multiple values (role IDs, CORS origins)

## 🚫 Jangan Lakukan

1. ❌ Jangan hapus inline comments
2. ❌ Jangan ubah format border ASCII
3. ❌ Jangan share `.env` ke public
4. ❌ Jangan commit `.env` ke git (sudah ada di `.gitignore`)

## 📝 Example

```env
# ========================== [[[ CLASS REMINDER BOT CONFIG ]]] ==========================

# --------=========== DISCORD SETTINGS ===========--------
DISCORD_ENABLED=true                           # Enable Discord bot (true/false)
DISCORD_BOT_TOKEN=MTxxxxx                      # Bot token from Discord Developer Portal
DISCORD_CLIENT_ID=123456789                    # Application ID
DISCORD_GUILD_ID=987654321                     # Server ID

# Discord Role Permissions (comma-separated role IDs)
DISCORD_ADMIN_ROLE_IDS=111,222,333             # Admin roles - Can use admin commands
DISCORD_LEADER_ROLE_IDS=444,555                # Leader roles - Can use leader + admin commands
```

## 🔄 Migration dari Format Lama

Jika Anda punya `.env` dengan format lama:

1. Backup `.env` lama:
   ```bash
   cp .env .env.backup
   ```

2. Copy `.env.example` baru:
   ```bash
   cp .env.example .env
   ```

3. Copy values dari `.env.backup` ke `.env` baru

4. Verify dan test

## 📞 Support

Jika ada pertanyaan tentang konfigurasi:
1. Baca inline comments di `.env`
2. Lihat `.env.example` untuk reference
3. Check dokumentasi lengkap di README.md
