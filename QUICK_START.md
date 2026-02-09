# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan bot.

## 1️⃣ Setup Database & Dummy Data

```bash
# Seed dummy data ke database
npm run seed
```

Data yang akan dibuat:
- ✅ 3 tugas (urgent, penting, normal)
- ✅ 3 jadwal pelajaran
- ✅ 2 jadwal piket
- ✅ 2 pengumuman

## 2️⃣ Deploy Discord Commands

```bash
# Deploy slash commands ke Discord
npm run deploy-commands
```

## 3️⃣ Jalankan Bot

```bash
# Development mode
npm run dev

# Production mode (build dulu)
npm run build
npm start

# Dengan PM2
npm run pm2:start
```

## 4️⃣ Test Commands

### Member Commands (Semua user bisa pakai)

```
/tugas
/tugas_hari_ini
/jadwal
/piket
/help
/status
```

### Admin Commands (Perlu permission admin)

```
/add_tugas | Judul | Deskripsi | 2026-02-15 | Matematika | individu
/edit_tugas | task_id | judul | Judul Baru
/hapus_tugas | task_id
/tandai_selesai | task_id

/add_jadwal | Senin | 08:00 | 09:30 | Matematika | R.101 | Pak Budi
/edit_jadwal | schedule_id | ruangan | R.202
/hapus_jadwal | schedule_id

/set_piket | Senin | Budi,081234567890 | Ani,081234567891
/add_pengumuman | 2026-02-15 | Judul | acara | Keterangan
```

## 5️⃣ Troubleshooting

### Newline tidak muncul di Discord?
- Pastikan bot sudah di-build ulang: `npm run build`
- Restart bot
- Test dengan command `/tugas` untuk melihat format output

### Command tidak muncul di Discord?
- Jalankan: `npm run deploy-commands`
- Tunggu beberapa detik
- Refresh Discord (Ctrl+R)

### Bot tidak bisa connect?
- Cek `.env` sudah diisi dengan benar
- Pastikan MongoDB running
- Cek Discord token valid
- Lihat log di `logs/bot-YYYY-MM-DD.log`

## 📝 Tips

1. **Lihat ID untuk edit/hapus**: Setiap kali tambah tugas/jadwal/pengumuman, ID akan ditampilkan
2. **Copy ID**: ID ditampilkan dalam format monospace (backticks) untuk mudah di-copy
3. **Format tanggal**: Selalu gunakan format YYYY-MM-DD (contoh: 2026-02-15)
4. **Format waktu**: Selalu gunakan format HH:MM (contoh: 08:00)
5. **Delimiter**: Gunakan `|` (pipe) untuk memisahkan argumen command

## 🔗 Dokumentasi Lengkap

- [Setup Guide](SETUP_GUIDE.md) - Setup lengkap dari awal
- [Admin Setup](ADMIN_SETUP.md) - Setup admin pertama
- [Discord Setup](DISCORD_SETUP.md) - Setup Discord bot
- [Commands](COMMANDS.md) - Daftar semua command
- [How to Get ID](HOW_TO_GET_ID.md) - Cara mendapatkan ID untuk edit/hapus
