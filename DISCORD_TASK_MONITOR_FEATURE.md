# Discord Task Monitor Feature

Fitur monitoring tugas real-time untuk Discord dengan auto-update embed, interactive buttons, dan rate limiting.

## 📊 Fitur

### 1. Task Monitor Embed

Embed yang auto-update setiap 2 jam menampilkan:

```
⋅•⋅☾ Task Monitor ☽⋅•⋅

Status Tugas
2 ┊ 🟢 tugas aktif
2 ┊ ⚫ tugas selesai

Tipe Tugas
```
3 Individu | 2 Kelompok
```


🕐 Last Updated: 2 hours ago

Made By VinTheGreat • Server Name
```

**Fitur:**
- Auto-update setiap 2 jam
- Edit embed existing (tidak membuat baru)
- Menampilkan statistik real-time dari database
- Animated emoji untuk semua icon
- Customizable color dan footer

### 2. Interactive Buttons

Dua button di bawah embed:

**📅 Minggu Ini**
- Menampilkan semua tugas minggu ini
- Sorted by nearest deadline
- Response ephemeral (hanya terlihat oleh user)

**📆 Tugas Besok**
- Menampilkan tugas untuk besok
- Sorted by nearest deadline
- Response ephemeral (hanya terlihat oleh user)

**Format Response:**
```
⋅•⋅☾ Minggu Ini ☽⋅•⋅

📝 Tugas Algoritma - Sorting
📅 Deadline: 16 Feb 2026, 23:59
👤 Tipe: Individu
🟢 Status: Aktif

📝 Project Web Development
📅 Deadline: 18 Feb 2026, 23:59
👥 Tipe: Kelompok
🟢 Status: Aktif

📊 Sorted by nearest deadline
```

### 3. Rate Limiting

**General Commands (30 detik per user):**
- Berlaku untuk command di channel biasa
- User hanya bisa execute command setiap 30 detik
- Mencegah spam

**Command Channel (2 jam per user):**
- Berlaku khusus di command channel
- User hanya bisa execute command setiap 2 jam
- Rate limit lebih ketat untuk channel khusus member

**Cooldown Message:**
```
⏳ Mohon tunggu 1 menit 30 detik sebelum menggunakan command lagi.
```

### 4. Loading Messages

Setiap button interaction menampilkan:
1. Loading message dengan animated emoji
2. Minimum display time: 500ms
3. Edit dengan response atau error message

```
🔄 Memproses...
```

### 5. Activity Status

Bot activity status dengan template variables:

**Template Variables:**
- `{total}` - Total tugas aktif
- `{active}` - Jumlah tugas aktif
- `{nearest}` - Deadline terdekat

**Contoh:**
```
Watching 5 tugas aktif
Watching Deadline terdekat: 16 Feb
Watching Tugas kuliah kelas
```

**Konfigurasi:**
- Rotation interval: 5 menit (default)
- Activity type: WATCHING, PLAYING, LISTENING, COMPETING
- Multiple templates dengan rotation

## 🔧 Setup

### 1. Channel Configuration

Anda perlu 2 channel:

**Info Channel:**
- Channel untuk Task Monitor embed
- Bot akan post dan update embed di sini
- Auto-update setiap 2 jam

**Command Channel:**
- Channel khusus untuk member commands
- Rate limiting 2 jam per user
- Mencegah spam di channel member

### 2. Emoji Configuration

Upload 10 animated emoji ke Discord Developer Portal:

| Emoji | Deskripsi | Digunakan Untuk |
|-------|-----------|-----------------|
| 🟢 online | Status aktif | Tugas aktif |
| ⚫ offline | Status selesai | Tugas selesai |
| 🕐 clock | Jam/waktu | Last updated |
| ⏳ loading | Loading spinner | Loading message |
| 📅 calendar | Kalender | Deadline, buttons |
| 📝 task | Icon tugas | Task list |
| 👤 individual | Icon individu | Tipe individu |
| 👥 group | Icon kelompok | Tipe kelompok |
| ✅ success | Checkmark | Success message |
| ❌ error | X merah | Error message |

### 3. Environment Variables

Tambahkan ke `.env`:

```env
# Channel IDs
DISCORD_INFO_CHANNEL_ID=123456789012345678
DISCORD_COMMAND_CHANNEL_ID=123456789012345678

# Animated Emojis
DISCORD_EMOJI_ONLINE=<a:online:1472202442664972392>
DISCORD_EMOJI_OFFLINE=<a:offline:1472202439997526262>
DISCORD_EMOJI_CLOCK=<a:clock:1472202437338206282>
DISCORD_EMOJI_LOADING=<a:loading:1472202449728307312>
DISCORD_EMOJI_CALENDAR=<a:calendar:1472202454606020904>
DISCORD_EMOJI_TASK=<a:task:1472202447274508348>
DISCORD_EMOJI_INDIVIDUAL=<a:individu:1472202431151607951>
DISCORD_EMOJI_GROUP=<a:group:1472202456690720880>
DISCORD_EMOJI_SUCCESS=<a:success:1472202445244469278>
DISCORD_EMOJI_ERROR=<a:error:1472202434591064157>

# Embed Styling
DISCORD_EMBED_COLOR=#5865F2
DISCORD_FOOTER_ICON=https://i.imgur.com/AfFp7pu.png

# Activity Status
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
DISCORD_ACTIVITY_TYPE=WATCHING

# Rate Limiting
DISCORD_RATE_LIMIT_GENERAL=30
DISCORD_RATE_LIMIT_COMMAND=7200
```

### 4. Start Bot

```bash
npm run dev
```

Check console untuk log:
```
✅ Discord Task Monitor feature enabled
   → Info Channel: 123456789012345678
   → Command Channel: 123456789012345678
   → Auto-update: Every 2 hours
   → Buttons: Minggu Ini, Tugas Besok
```

## 📖 Usage

### Member Commands

**Di Info Channel:**
- Click button "Minggu Ini" untuk lihat tugas minggu ini
- Click button "Tugas Besok" untuk lihat tugas besok
- Rate limit: 30 detik per user

**Di Command Channel:**
- Click button untuk query tugas
- Rate limit: 2 jam per user (lebih ketat)

### Admin

Task Monitor akan auto-update setiap 2 jam dengan data terbaru dari database dan Notion.

## 🎨 Customization

### Embed Color

Edit di `.env`:
```env
DISCORD_EMBED_COLOR=#5865F2  # Discord Blurple
DISCORD_EMBED_COLOR=#FF0000  # Red
DISCORD_EMBED_COLOR=#00FF00  # Green
```

### Footer

Edit di `.env`:
```env
DISCORD_FOOTER_ICON=https://your-icon-url.png
```

Edit di `src/config/discord.config.ts`:
```typescript
footer: {
  icon: process.env.DISCORD_FOOTER_ICON || 'URL',
  text: 'Made By VinTheGreat' // Edit text di sini
}
```

### Activity Templates

Edit di `src/config/discord.config.ts`:
```typescript
templates: [
  {
    text: '{total} tugas aktif',
    dynamic: true
  },
  {
    text: 'Deadline terdekat: {nearest}',
    dynamic: true
  },
  {
    text: 'Custom text tanpa variable',
    dynamic: false
  }
]
```

### Rate Limits

Edit di `.env`:
```env
DISCORD_RATE_LIMIT_GENERAL=30    # 30 detik
DISCORD_RATE_LIMIT_COMMAND=7200  # 2 jam
```

## 🔍 Monitoring

### Logs

Check logs untuk monitoring:
```
[INFO] Task Monitor auto-update started (interval: 2 hours)
[INFO] Task Monitor embed updated (messageId: 123..., stats: {...})
[INFO] Button interaction handled (userId: 123..., buttonId: tasks_week, taskCount: 5)
[INFO] Rate limiter cleanup (remainingUsers: 10)
```

### Console Output

```
🔄 Activity Status: Watching 5 tugas aktif
📊 Task Monitor embed updated
   → Active: 5 tasks
   → Completed: 10 tasks
   → Individu: 3 | Kelompok: 2
```

## 🐛 Troubleshooting

### Embed tidak muncul

**Solusi:**
1. Check channel ID benar
2. Check bot permissions (Send Messages, Embed Links)
3. Check logs untuk error
4. Restart bot

### Button tidak respond

**Solusi:**
1. Check rate limiting (user mungkin cooldown)
2. Check logs untuk error
3. Check button interaction handler terdaftar

### Emoji tidak muncul

**Solusi:**
1. Check emoji format: `<a:name:ID>`
2. Check emoji sudah di-upload ke aplikasi bot
3. Check bot permission "Use External Emojis"

### Configuration validation failed

**Solusi:**
1. Check semua required fields di `.env`
2. Check format emoji benar
3. Check channel IDs valid (17-19 digit)
4. Check hex color format (#RRGGBB)

## 📚 Documentation

Lihat [DISCORD_SETUP.md](./DISCORD_SETUP.md) untuk panduan setup lengkap.

## 🎯 Roadmap

- [ ] Custom button labels
- [ ] More button options (Hari Ini, Semua Tugas)
- [ ] Task filtering by type
- [ ] Export task list
- [ ] Notification preferences per user

## 📝 License

MIT License - see LICENSE file for details
