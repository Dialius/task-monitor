# Bot Status Configuration Guide

Panduan untuk mengatur status presence bot Discord.

## Konfigurasi

Tambahkan di file `.env`:

```env
# Bot Presence Status
# Options: online, idle, dnd, invisible
# Default: online
DISCORD_BOT_STATUS=online
```

## Status Options

### 1. Online (Hijau) ✅
```env
DISCORD_BOT_STATUS=online
```
- Bot tampil dengan status hijau (online)
- Menunjukkan bot aktif dan siap menerima command
- **Recommended untuk production**

### 2. Idle (Kuning) 🌙
```env
DISCORD_BOT_STATUS=idle
```
- Bot tampil dengan status kuning (idle/away)
- Menunjukkan bot sedang idle atau tidak aktif penuh
- Cocok untuk maintenance mode atau testing

### 3. Do Not Disturb (Merah) 🔴
```env
DISCORD_BOT_STATUS=dnd
```
- Bot tampil dengan status merah (do not disturb)
- Menunjukkan bot sedang sibuk atau dalam mode khusus
- Cocok untuk maintenance atau limited operation

### 4. Invisible (Abu-abu) 👻
```env
DISCORD_BOT_STATUS=invisible
```
- Bot tampil offline (abu-abu) tapi tetap berfungsi
- Bot tetap bisa menerima dan memproses command
- Cocok untuk silent operation atau stealth mode

## Cara Menggunakan

1. **Edit file `.env`**
   ```env
   DISCORD_BOT_STATUS=online
   ```

2. **Restart bot**
   ```bash
   npm run dev
   # atau
   npm start
   ```

3. **Verifikasi**
   - Cek member list di Discord server
   - Bot akan tampil dengan status yang dipilih
   - Activity status tetap berjalan normal

## Kombinasi dengan Activity Status

Status presence dan activity status bekerja bersamaan:

```env
# Status presence (warna indicator)
DISCORD_BOT_STATUS=online

# Activity status (text yang ditampilkan)
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_TYPE=3
```

Contoh hasil:
- **Online** (hijau) + **Watching 6 tasks** ✅
- **Idle** (kuning) + **Playing kejar deadline** 🌙
- **DND** (merah) + **Listening to reminders** 🔴

## Catatan Penting

1. **Default Value**: Jika tidak diset, default adalah `online`
2. **Invalid Value**: Jika value tidak valid, akan fallback ke `online`
3. **Case Sensitive**: Gunakan lowercase (`online`, bukan `Online` atau `ONLINE`)
4. **Restart Required**: Perubahan memerlukan restart bot
5. **Functionality**: Semua status tetap memungkinkan bot menerima command

## Troubleshooting

### Bot tidak berubah status
- Pastikan sudah restart bot setelah edit `.env`
- Cek log untuk error: `Activity status service initialized`
- Verifikasi value yang digunakan valid

### Status berubah tapi activity tidak muncul
- Cek `DISCORD_ACTIVITY_ENABLED=true`
- Verifikasi activity templates di `discord.config.ts`
- Cek log untuk error activity service

### Bot tampil offline padahal online
- Kemungkinan menggunakan `DISCORD_BOT_STATUS=invisible`
- Bot tetap berfungsi normal, hanya tampil offline
- Ubah ke `online` jika ingin tampil online

## Rekomendasi

| Environment | Recommended Status | Alasan |
|-------------|-------------------|--------|
| Production | `online` | Jelas dan profesional |
| Development | `idle` atau `dnd` | Membedakan dari production |
| Testing | `dnd` atau `invisible` | Tidak mengganggu users |
| Maintenance | `dnd` | Menunjukkan sedang maintenance |
| Silent Mode | `invisible` | Bot bekerja tanpa terlihat |

## Example Configurations

### Production Bot
```env
DISCORD_BOT_STATUS=online
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_TYPE=3
```

### Development Bot
```env
DISCORD_BOT_STATUS=idle
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_TYPE=0
```

### Maintenance Mode
```env
DISCORD_BOT_STATUS=dnd
DISCORD_ACTIVITY_ENABLED=true
# Set activity text to "Under Maintenance" di config
```

### Silent Operation
```env
DISCORD_BOT_STATUS=invisible
DISCORD_ACTIVITY_ENABLED=false
```
