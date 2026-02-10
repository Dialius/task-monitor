# Sistem Reminder Otomatis

Bot ini memiliki sistem reminder otomatis yang akan mengirim pesan ke grup/channel WhatsApp sesuai jadwal.

## 📅 Jadwal Reminder

### 1. **Reminder Harian (Senin-Kamis)**
- **Waktu**: Setiap hari Senin-Kamis jam **16:00** (4 sore)
- **Isi**: Info tugas untuk **hari besok**
- **Format**: Recap harian dengan emoji dan struktur lengkap

**Contoh:**
```
🌟 INFO TUGAS HARIAN

📅 Hari ini | Selasa, 3 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
Semoga hari ini tetap sehat, semangat, dan gak ketinggalan info tugas ya 💪

━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS HARI INI
━━━━━━━━━━━━━━━━━━

🏃 PJOK
📌 Tugas:
1️⃣ Mempelajari teknik-teknik dalam lompat jauh
2️⃣ Membuat resume 2 lembar
📥 Link Pengumpulan:
https://drive.google.com/...

━━━━━━━━━━━━━━━━━━

💻 MP 1
📌 Tugas:
1️⃣ Mencari dataset baru di Kaggle
⚠️ Catatan:
Materi ini akan diujikan secara lisan pada Selasa, 10 Februari 2026

━━━━━━━━━━━━━━━━━━

🌟 Penutup

Tetap semangat mengerjakan tugas ya, teman-teman 💪
Terima kasih sudah membaca sampai akhir 🙏

Kalau ada info yang kurang atau salah ketik, silakan kabari admin.
CMIIW 🤗
```

### 2. **Reminder Mingguan (Jumat)**
- **Waktu**: Setiap hari Jumat jam **16:00** (4 sore)
- **Isi**: Info tugas untuk **minggu depan** (Senin-Jumat)
- **Format**: Recap mingguan dengan breakdown per hari

**Contoh:**
```
🌟 INFO TUGAS MINGGUAN

📅 Minggu ke-2 | Nov 2025

🌈 Halo halo teman teman XI PPLG 3!
Gimana kabarnya minggu ini? Semoga tetap semangat dan produktif ya 💪

Nih admin bawain update tugas mingguan biar kalian gak ketinggalan info!
Yuk, cek dari hari Senin sampai Ahad 👇

🗓 Daftar Tugas Mingguan

📖 Senin (10/11/25)
[Matematika] → Persiapan PAS MATEMATIKA
[BK] → membuat Curiculum Vitae (CV)
[MK3] → Menyelesaikan tugas modul

💻 Selasa (11/11/25)
[PAI] → menulis di buku tentang kitab kitab yang diturunkan Allah
[MK4] → melanjutkan membuat xml dari design yang telah dibuat

📚 Rabu (12/11/25)
[MK2] → menyelesaikan tugas sesuai tutorial
Link: https://youtu.be/...

🌿 Kamis (13/11/25)
[Sejarah] → membuat PPT tentang pemberontakan yang ada di Indonesia
[Bahasa Jawa] → Menentukan PJ juga peran dalam prosesi adat mantu

🎨 Jumat (14/11/25)
→ Belum ada tugas

Udah segitu dulu tugasnya untuk minggu ini yaa 🌻

Kalau ada yang kelewat atau salah ketik, tolong kasih tahu admin ya~
CMIIW

Tetap semangat ngerjain tugasnya 🤗
```

### 3. **Reminder Hari Senin (Minggu)**
- **Waktu**: Setiap hari Minggu jam **16:00** (4 sore)
- **Isi**: Info tugas untuk **hari Senin besok**
- **Format**: Sama dengan reminder harian
- **Tujuan**: Mengingatkan tugas Senin di akhir pekan

### 4. **Tidak Ada Reminder (Sabtu)**
- Hari Sabtu tidak ada reminder otomatis
- Biarkan siswa istirahat di akhir pekan 😊

## 🔧 Cara Kerja

### 1. Cron Schedule
Bot menggunakan `node-cron` untuk scheduling:
- **Senin-Kamis**: `0 16 * * 1-4` (16:00 hari 1-4)
- **Jumat**: `0 16 * * 5` (16:00 hari 5)
- **Minggu**: `0 16 * * 0` (16:00 hari 0)

### 2. Data Source
Bot mengambil data dari database MongoDB:
- **Tasks**: Tugas yang deadline-nya sesuai tanggal
- **Schedules**: Jadwal pelajaran (opsional)

### 3. Format Otomatis
Bot otomatis memformat pesan dengan:
- Emoji sesuai mata pelajaran
- Struktur yang konsisten
- Link pengumpulan (jika ada)
- Catatan tambahan (jika ada)

## 📝 Cara Menambah Tugas

### Via Command (Admin)
```
/add_tugas | Matematika | Mengerjakan soal halaman 45-50 | 2026-02-11 | individu
```

### Parameter:
1. **Mata Pelajaran**: Nama mapel (PJOK, MP 1, Matematika, dll)
2. **Deskripsi**: Deskripsi tugas lengkap
3. **Deadline**: Format YYYY-MM-DD
4. **Tipe**: individu / kelompok / ujian

### Field Opsional:
Untuk menambah link pengumpulan atau catatan, edit tugas:
```
/edit_tugas | <task_id> | link_pengumpulan | https://drive.google.com/...
/edit_tugas | <task_id> | catatan | Dikumpulkan paling lambat jam 23:59
```

## 🎨 Emoji Mata Pelajaran

Bot otomatis menambahkan emoji sesuai mata pelajaran:

| Mata Pelajaran | Emoji |
|----------------|-------|
| PJOK | 🏃 |
| MP 1-4 | 💻 |
| MK 1-4 | 💻 |
| Matematika | 🔢 |
| Sejarah | 📚 |
| PAI | 🕌 |
| Bahasa Indonesia | 📖 |
| Bahasa Inggris | 🌍 |
| Bahasa Jawa | 🎭 |
| BK | 🧠 |
| Fisika | ⚛️ |
| Kimia | 🧪 |
| Biologi | 🌱 |
| Ekonomi | 💰 |
| Geografi | 🌏 |
| Sosiologi | 👥 |
| Seni Budaya | 🎨 |
| PPKN | 🇮🇩 |
| Lainnya | 📝 |

## ⚙️ Konfigurasi

### Timezone
Default: `Asia/Jakarta` (WIB)

Untuk mengubah, edit `.env`:
```env
TIMEZONE=Asia/Jakarta
```

### Testing Reminder
Untuk test reminder tanpa menunggu jadwal:

**Test Daily Recap:**
```javascript
// Di console Node.js atau buat script test
const bot = require('./dist/bot');
// Panggil method sendDailyRecap() secara manual
```

**Atau gunakan command manual:**
```
/tugas_hari_ini
/tugas_minggu_ini
```

## 🐛 Troubleshooting

### Reminder Tidak Terkirim

**Cek:**
1. Bot sudah running? (`npm start`)
2. `WHATSAPP_GROUP_ID` sudah diisi di `.env`?
3. Bot punya akses ke grup/channel?
4. Timezone sudah benar?

**Log:**
Lihat console untuk log scheduler:
```
Daily reminder scheduled (Mon-Thu 16:00)
Weekly reminder scheduled (Fri 16:00)
Sunday reminder scheduled (Sun 16:00 - Monday tasks)
```

### Format Pesan Tidak Sesuai

**Penyebab:**
- Data tugas tidak lengkap
- Field `mata_pelajaran` tidak sesuai

**Solusi:**
- Pastikan semua tugas punya `mata_pelajaran`
- Gunakan nama mapel yang konsisten
- Edit tugas yang salah format

### Tidak Ada Tugas di Reminder

**Normal jika:**
- Memang tidak ada tugas untuk tanggal tersebut
- Tugas sudah selesai (status: 'selesai')

**Pesan yang muncul:**
```
✨ Tidak ada tugas untuk hari ini!
Enjoy your day! 🎉
```

## 💡 Tips

### 1. Konsistensi Nama Mapel
Gunakan nama yang sama untuk mata pelajaran:
- ✅ "MP 1", "MP 2", "MP 3"
- ❌ "MP1", "mp 1", "MP-1"

### 2. Deadline yang Jelas
Set deadline dengan benar:
- Format: `YYYY-MM-DD`
- Contoh: `2026-02-11` untuk 11 Februari 2026

### 3. Link Pengumpulan
Selalu tambahkan link pengumpulan jika ada:
```
/edit_tugas | <id> | link_pengumpulan | https://...
```

### 4. Catatan Penting
Tambahkan catatan untuk info tambahan:
```
/edit_tugas | <id> | catatan | Dikumpulkan dalam bentuk PDF
```

## 📊 Monitoring

### Log File
Semua aktivitas reminder tercatat di:
```
logs/bot-YYYY-MM-DD.log
```

### Console Output
Saat reminder terkirim, akan muncul log:
```
[INFO] Generating daily recap
[INFO] Daily recap sent successfully
```

## 🔮 Future Features

Fitur yang bisa ditambahkan:
- [ ] Reminder custom per kelas
- [ ] Reminder untuk ujian/UTS/UAS
- [ ] Reminder piket
- [ ] Reminder pengumuman penting
- [ ] Statistik tugas per minggu
- [ ] Export recap ke PDF

## 📚 Dokumentasi Terkait

- `COMMANDS.md` - Daftar command lengkap
- `SETUP_GUIDE.md` - Panduan setup bot
- `WHATSAPP_TROUBLESHOOTING.md` - Troubleshooting WhatsApp
- `README.md` - Dokumentasi utama
