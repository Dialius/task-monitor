# Discord Task Monitor Setup Guide

Panduan lengkap untuk mengkonfigurasi fitur Discord Task Monitor.

## Daftar Isi

1. [Persyaratan](#persyaratan)
2. [Mendapatkan Channel IDs](#mendapatkan-channel-ids)
3. [Mendapatkan Animated Emoji IDs](#mendapatkan-animated-emoji-ids)
4. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
5. [Konfigurasi Discord Config](#konfigurasi-discord-config)
6. [Customisasi Embed](#customisasi-embed)
7. [Troubleshooting](#troubleshooting)

## Persyaratan

- Discord Bot sudah dibuat di [Discord Developer Portal](https://discord.com/developers/applications)
- Bot sudah diundang ke server dengan permissions:
  - Send Messages
  - Embed Links
  - Read Message History
  - Use External Emojis
  - Add Reactions
- Developer Mode diaktifkan di Discord (User Settings > Advanced > Developer Mode)

## Mendapatkan Channel IDs

1. Buka Discord dan aktifkan Developer Mode:
   - User Settings > Advanced > Developer Mode (ON)

2. Klik kanan pada channel yang ingin digunakan

3. Pilih "Copy ID"

4. Anda membutuhkan 2 channel IDs:
   - **Info Channel**: Channel untuk Task Monitor embed (auto-update)
   - **Command Channel**: Channel untuk member commands (dengan rate limiting 2 jam)

## Mendapatkan Animated Emoji IDs

### Cara 1: Melalui Discord Developer Portal

1. Buka [Discord Developer Portal](https://discord.com/developers/applications)

2. Pilih aplikasi bot Anda

3. Klik menu "Emojis" di sidebar

4. Upload emoji animated Anda (format .gif, max 256KB)

5. Setelah upload, copy Emoji ID dari list

6. Format emoji: `<a:nama_emoji:ID_emoji>`
   - Contoh: `<a:online:1472202442664972392>`

### Cara 2: Melalui Discord Client

1. Ketik emoji di chat dengan backslash di depan:
   ```
   \:nama_emoji:
   ```

2. Discord akan menampilkan format lengkap:
   ```
   <a:online:1472202442664972392>
   ```

3. Copy format lengkap tersebut

### Emoji yang Dibutuhkan

Anda perlu 10 animated emoji:

| Emoji Key | Deskripsi | Digunakan Untuk |
|-----------|-----------|-----------------|
| `online` | Status aktif (hijau) | Tugas aktif |
| `offline` | Status selesai (abu-abu) | Tugas selesai |
| `clock` | Jam/waktu | Last updated timestamp |
| `loading` | Loading spinner | Loading message |
| `calendar` | Kalender | Deadline, button label |
| `task` | Icon tugas | Task list |
| `individual` | Icon individu | Tipe tugas individu |
| `group` | Icon kelompok | Tipe tugas kelompok |
| `success` | Checkmark hijau | Success message |
| `error` | X merah | Error message |

## Konfigurasi Environment Variables

Tambahkan ke file `.env`:

```env
# Discord Task Monitor Configuration
DISCORD_INFO_CHANNEL_ID=123456789012345678
DISCORD_COMMAND_CHANNEL_ID=123456789012345678

# Animated Emojis (format: <a:name:ID>)
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

# Rate Limiting (in seconds)
DISCORD_RATE_LIMIT_GENERAL=30
DISCORD_RATE_LIMIT_COMMAND=7200
```

## Konfigurasi Discord Config

File konfigurasi ada di `src/config/discord.config.ts`.

### Struktur Konfigurasi

```typescript
{
  channels: {
    info: "CHANNEL_ID",      // Info channel
    command: "CHANNEL_ID"    // Command channel
  },
  
  emojis: {
    online: "<a:online:ID>",
    offline: "<a:offline:ID>",
    // ... 8 emoji lainnya
  },
  
  embed: {
    color: "#5865F2",        // Hex color
    footer: {
      icon: "URL",           // Footer icon URL
      text: "Made By VinTheGreat"
    }
  },
  
  activity: {
    enabled: true,
    interval: 5,             // minutes
    type: "WATCHING",
    templates: [
      {
        text: "{total} tugas aktif",
        dynamic: true
      }
    ]
  },
  
  rateLimits: {
    general: 30,             // seconds
    command: 7200            // seconds (2 hours)
  }
}
```

## Customisasi Embed

### Warna Embed

Gunakan hex color code (6 digit):

```env
DISCORD_EMBED_COLOR=#5865F2  # Discord Blurple
DISCORD_EMBED_COLOR=#FF0000  # Red
DISCORD_EMBED_COLOR=#00FF00  # Green
DISCORD_EMBED_COLOR=#0099FF  # Blue
```

### Footer Icon

Upload icon ke image hosting (Imgur, Discord CDN, dll) dan gunakan URL-nya:

```env
DISCORD_FOOTER_ICON=https://i.imgur.com/AfFp7pu.png
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
    text: '{active} tugas menunggu',
    dynamic: true
  },
  {
    text: 'Deadline terdekat: {nearest}',
    dynamic: true
  }
]
```

**Template Variables:**
- `{total}` - Total tugas aktif
- `{active}` - Jumlah tugas aktif (sama dengan {total})
- `{nearest}` - Deadline terdekat (format: dd MMM)

## Fitur Task Monitor

### Task Monitor Embed

Embed yang auto-update setiap 2 jam dengan informasi:
- Status tugas (aktif/selesai)
- Tipe tugas (individu/kelompok)
- Last updated timestamp

### Interactive Buttons

2 button di bawah embed:
- **Minggu Ini**: Menampilkan tugas minggu ini
- **Tugas Besok**: Menampilkan tugas besok

Response button:
- Ephemeral (hanya terlihat oleh user yang klik)
- Sorted by nearest deadline
- Menampilkan: nama, deadline, tipe, status

### Rate Limiting

**General Commands** (30 detik per user):
- Berlaku untuk semua command di channel biasa
- User hanya bisa execute command setiap 30 detik

**Command Channel** (2 jam per user):
- Berlaku khusus di command channel
- User hanya bisa execute command setiap 2 jam
- Mencegah spam di channel khusus member

### Loading Messages

Setiap button click akan menampilkan:
1. Loading message dengan animated emoji
2. Minimum display time: 500ms
3. Edit dengan response atau error message

## Troubleshooting

### Bot tidak bisa akses channel

**Error**: `Info channel not accessible`

**Solusi**:
1. Pastikan bot ada di server
2. Pastikan bot punya permission "View Channel" dan "Send Messages"
3. Pastikan channel ID benar (17-19 digit)

### Emoji tidak muncul

**Error**: `Invalid emoji format`

**Solusi**:
1. Pastikan format emoji: `<a:name:ID>`
2. Pastikan emoji sudah di-upload ke aplikasi bot
3. Pastikan bot punya permission "Use External Emojis"

### Embed tidak update

**Solusi**:
1. Check logs untuk error
2. Pastikan TaskService berjalan normal
3. Pastikan database connection aktif
4. Restart bot

### Button tidak respond

**Solusi**:
1. Check rate limiting (mungkin user masih cooldown)
2. Check logs untuk error
3. Pastikan button interaction handler terdaftar

### Configuration validation failed

**Error**: `Discord configuration validation failed`

**Solusi**:
1. Check semua required fields di `.env`
2. Pastikan format emoji benar
3. Pastikan channel IDs valid (17-19 digit)
4. Pastikan hex color format benar (#RRGGBB)

## Testing

### Test Manual

1. Start bot
2. Check console untuk log:
   ```
   ✅ Discord Task Monitor feature enabled
      → Info Channel: 123456789012345678
      → Command Channel: 123456789012345678
      → Auto-update: Every 2 hours
      → Buttons: Minggu Ini, Tugas Besok
   ```

3. Buka info channel, pastikan embed muncul

4. Click button "Minggu Ini" atau "Tugas Besok"

5. Pastikan response muncul (ephemeral)

### Test Rate Limiting

1. Click button di command channel
2. Tunggu response
3. Click button lagi
4. Harus muncul cooldown message

### Test Auto-Update

1. Tunggu 2 jam
2. Check embed di info channel
3. Pastikan timestamp "Last Updated" berubah

## Support

Jika ada masalah:
1. Check logs di `./logs/`
2. Check console output
3. Pastikan semua environment variables sudah diset
4. Pastikan bot permissions sudah benar

## Changelog

### Version 1.0.0
- Initial release
- Task Monitor embed dengan auto-update
- Interactive buttons (Minggu Ini, Tugas Besok)
- Rate limiting per user
- Loading messages
- Activity status dengan template variables
- Configurable emojis dan styling
