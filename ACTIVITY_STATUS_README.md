# 🎯 Discord Activity Status - Quick Start

## Setup Cepat (5 Menit)

### 1. Tambahkan ke `.env`

```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
```

### 2. Jalankan Bot

```bash
npm run dev
```

### 3. Selesai! ✅

Bot akan menampilkan status yang berganti setiap 5 menit:
- 👀 Watching Tugas hari ini: 3
- 👀 Watching Tugas minggu ini: 8
- 🎮 Playing Total tugas aktif: 15
- 👀 Watching Tugas urgent: 2
- 🎧 Listening Perintah dari kelas
- 🎮 Playing Reminder Bot v1.0

**Log yang akan terlihat:**
```
✅ Activity status rotation started
   → Interval: 5 minutes
   → Total activities: 6

🔄 Activity Status: 👀 Watching Tugas hari ini: 3
```

Setiap 5 menit, Anda akan melihat log baru:
```
🔄 Activity Status: 👀 Watching Tugas minggu ini: 8
```

## Konfigurasi

| Setting | Default | Deskripsi |
|---------|---------|-----------|
| `DISCORD_ACTIVITY_ENABLED` | `true` | Aktifkan/nonaktifkan fitur |
| `DISCORD_ACTIVITY_INTERVAL` | `5` | Interval rotasi (menit) |

## Kustomisasi Status

Edit file `src/config/activityTemplates.ts`:

```typescript
export const defaultActivityTemplates: ActivityTemplate[] = [
  {
    type: 3,                    // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
    text: 'Tugas hari ini: {count}',
    dynamic: true,              // true = ambil data dari DB
    dataSource: 'tasks_today'   // sumber data
  },
  {
    type: 0,                    // Playing
    text: 'Status custom Anda',
    dynamic: false              // false = teks statis
  }
];
```

## Data Source Tersedia

- `tasks_today` - Jumlah tugas hari ini
- `tasks_week` - Jumlah tugas minggu ini
- `tasks_total` - Total tugas aktif
- `tasks_urgent` - Jumlah tugas urgent

## Dokumentasi Lengkap

📚 Lihat [ACTIVITY_STATUS_GUIDE.md](./ACTIVITY_STATUS_GUIDE.md) untuk dokumentasi lengkap

🔧 Lihat [ACTIVITY_STATUS_CUSTOM_EXAMPLE.md](./ACTIVITY_STATUS_CUSTOM_EXAMPLE.md) untuk contoh kustomisasi

📊 Lihat [ACTIVITY_STATUS_LOG_EXAMPLE.md](./ACTIVITY_STATUS_LOG_EXAMPLE.md) untuk contoh log output

## Troubleshooting

**Status tidak muncul?**
- Pastikan `DISCORD_ACTIVITY_ENABLED=true`
- Restart bot setelah ubah config

**Status tidak berganti?**
- Cek interval yang Anda set
- Lihat log untuk error

**Data tidak update?**
- Pastikan database terkoneksi
- Cek apakah ada data di database

## File yang Dimodifikasi

✅ `src/services/ActivityStatusService.ts` - Service utama (BARU)
✅ `src/config/activityTemplates.ts` - Template status (BARU)
✅ `src/clients/DiscordClient.ts` - Integrasi Discord
✅ `src/bot.ts` - Inisialisasi service
✅ `src/config/ConfigManager.ts` - Load config
✅ `.env.example` - Contoh konfigurasi

---

**Selamat mencoba! 🚀**
