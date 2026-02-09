# Discord Activity Status Guide

## 📋 Deskripsi

Fitur **Activity Status Rotation** memungkinkan Discord bot untuk menampilkan status aktivitas yang berganti-ganti secara otomatis di profil bot. Status ini dapat menampilkan informasi dinamis seperti jumlah tugas hari ini, tugas minggu ini, dan informasi lainnya.

## ✨ Fitur

- ✅ Status berganti otomatis setiap interval waktu tertentu (default: 5 menit)
- ✅ Menampilkan data real-time dari database (jumlah tugas, dll)
- ✅ Dapat dikonfigurasi melalui file `.env`
- ✅ Mendukung berbagai tipe aktivitas: Playing (0), Streaming (1), Listening (2), Watching (3), Competing (5)
- ✅ Mudah dikustomisasi dengan menambah/mengurangi status

## 🎯 Contoh Status yang Ditampilkan

Bot akan menampilkan status secara bergantian seperti:

1. 👀 **Watching** Tugas hari ini: 3
2. 👀 **Watching** Tugas minggu ini: 8
3. 🎮 **Playing** Total tugas aktif: 15
4. 👀 **Watching** Tugas urgent: 2
5. 🎧 **Listening** Perintah dari kelas
6. 🎮 **Playing** Reminder Bot v1.0

## ⚙️ Konfigurasi

### 1. File `.env`

Tambahkan konfigurasi berikut di file `.env`:

```env
# Discord Activity Status Configuration
# Enable/disable rotating activity status
DISCORD_ACTIVITY_ENABLED=true

# Rotation interval in minutes (default: 5)
DISCORD_ACTIVITY_INTERVAL=5
```

### 2. Penjelasan Konfigurasi

| Variable | Deskripsi | Default | Contoh |
|----------|-----------|---------|--------|
| `DISCORD_ACTIVITY_ENABLED` | Aktifkan/nonaktifkan fitur | `true` | `true` atau `false` |
| `DISCORD_ACTIVITY_INTERVAL` | Interval rotasi dalam menit | `5` | `3`, `5`, `10`, `15` |

## 🎨 Kustomisasi Status

Untuk mengubah atau menambah status yang ditampilkan, edit file `src/config/activityTemplates.ts`:

```typescript
export const defaultActivityTemplates: ActivityTemplate[] = [
  {
    type: 3, // Watching
    text: 'Tugas hari ini: {count}',
    dynamic: true,
    dataSource: 'tasks_today'
  },
  {
    type: 3, // Watching
    text: 'Tugas minggu ini: {count}',
    dynamic: true,
    dataSource: 'tasks_week'
  },
  // Tambahkan status custom Anda di sini
  {
    type: 0, // Playing
    text: 'Status custom Anda',
    dynamic: false
  }
];
```

### Tipe Aktivitas yang Tersedia

| Type | Angka | Tampilan di Discord | Contoh |
|------|-------|---------------------|--------|
| Playing | 0 | 🎮 Playing ... | Playing Reminder Bot |
| Streaming | 1 | 🎥 Streaming ... | Streaming on Twitch |
| Listening | 2 | 🎧 Listening to ... | Listening to Perintah dari kelas |
| Watching | 3 | 👀 Watching ... | Watching Tugas hari ini: 5 |
| Competing | 5 | 🏆 Competing in ... | Competing in Class Rankings |

### Data Source yang Tersedia

| Data Source | Deskripsi | Contoh Output |
|-------------|-----------|---------------|
| `tasks_today` | Jumlah tugas hari ini | Tugas hari ini: 3 |
| `tasks_week` | Jumlah tugas minggu ini | Tugas minggu ini: 8 |
| `tasks_total` | Total tugas aktif | Total tugas aktif: 15 |
| `tasks_urgent` | Jumlah tugas urgent | Tugas urgent: 2 |

### Contoh Kustomisasi

#### Menambah Status Statis

```typescript
{
  type: 0, // Playing
  text: 'Bot Kelas 12 IPA 1',
  dynamic: false
}
```

#### Menambah Status Dinamis

```typescript
{
  type: 3, // Watching
  text: 'Member aktif: {count}',
  dynamic: true,
  dataSource: 'tasks_urgent' // Ganti dengan data source yang sesuai
}
```

## 🚀 Cara Menggunakan

### 1. Setup Awal

Pastikan konfigurasi Discord sudah benar di file `.env`:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_CHANNEL_ID=your_channel_id_here
DISCORD_ENABLED=true

# Activity Status
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
```

### 2. Jalankan Bot

```bash
npm run dev
```

atau

```bash
npm start
```

### 3. Verifikasi

Setelah bot berjalan, Anda akan melihat log seperti ini:

```
✅ Discord bot online
✓ Server: 123456789012345678
✓ Channel: 987654321098765432
✓ Activity rotation: Enabled
✓ Rotation interval: 5 minutes

✅ Activity status rotation started
   → Interval: 5 minutes
   → Total activities: 6

🔄 Activity Status: 👀 Watching Tugas hari ini: 3
```

### 4. Cek Status Bot

Buka Discord dan lihat profil bot Anda. Status akan berganti setiap 5 menit (atau sesuai interval yang Anda set).

### 5. Monitor Log

Setiap kali status berganti, Anda akan melihat log di console:

```
🔄 Activity Status: 👀 Watching Tugas minggu ini: 8
🔄 Activity Status: 🎮 Playing Total tugas aktif: 15
🔄 Activity Status: 👀 Watching Tugas urgent: 2
```

📚 **Lihat contoh log lengkap di**: [ACTIVITY_STATUS_LOG_EXAMPLE.md](./ACTIVITY_STATUS_LOG_EXAMPLE.md)

## 🔧 Troubleshooting

### Status tidak muncul

1. Pastikan `DISCORD_ACTIVITY_ENABLED=true` di file `.env`
2. Restart bot setelah mengubah konfigurasi
3. Cek log untuk error

### Status tidak berganti

1. Periksa interval yang Anda set (mungkin terlalu lama)
2. Cek log untuk error saat update status
3. Pastikan bot memiliki permission yang cukup

### Data tidak update

1. Pastikan database terkoneksi dengan baik
2. Cek apakah ada tugas di database
3. Periksa log untuk error saat fetch data

## 📝 Catatan Teknis

### Cara Kerja

1. Bot membaca konfigurasi dari `.env` dan `activityTemplates.ts`
2. Saat bot ready, `ActivityStatusService` akan start
3. Service akan update status pertama kali secara langsung
4. Kemudian menggunakan `setInterval` untuk update status setiap X menit
5. Setiap update, service akan:
   - Ambil template status berikutnya
   - Jika dynamic, fetch data dari database
   - Replace placeholder `{count}` dengan data real
   - Update status bot menggunakan `client.user.setPresence()`

### File yang Terlibat

- `src/services/ActivityStatusService.ts` - Service utama untuk mengelola status
- `src/config/activityTemplates.ts` - Template status yang akan ditampilkan
- `src/clients/DiscordClient.ts` - Integrasi dengan Discord client
- `src/bot.ts` - Inisialisasi service saat bot start
- `src/config/ConfigManager.ts` - Load konfigurasi dari `.env`

## 🎓 Best Practices

1. **Interval yang Wajar**: Gunakan interval minimal 3-5 menit untuk menghindari rate limit Discord
2. **Jumlah Status**: 4-8 status adalah jumlah yang ideal
3. **Mix Static & Dynamic**: Kombinasikan status statis dan dinamis untuk variasi
4. **Informasi Relevan**: Tampilkan informasi yang berguna untuk member kelas

## 📚 Referensi

- [Discord.js Documentation - Client Presence](https://discord.js.org/#/docs/discord.js/main/class/ClientUser?scrollTo=setPresence)
- [Discord API - Activity Types](https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types)

## 🤝 Kontribusi

Jika Anda ingin menambahkan data source baru atau fitur lainnya:

1. Edit `ActivityStatusService.ts` untuk menambah data source
2. Update `activityTemplates.ts` untuk menambah template
3. Test dengan menjalankan bot
4. Dokumentasikan perubahan Anda

---

**Dibuat dengan ❤️ untuk memudahkan manajemen kelas**
