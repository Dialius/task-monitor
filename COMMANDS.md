# 📋 Daftar Command Bot

Dokumentasi lengkap semua command yang tersedia.

## 🔰 Member Commands

Command yang bisa digunakan oleh semua user (member dan admin).

### 📝 Tugas

#### `/tugas`
Menampilkan semua tugas yang belum selesai.

**Format:**
```
/tugas
```

**Output:**
```
📝 Daftar Tugas:

1. 👤 Soal Matematika Bab 5
   🚨 Matematika • Sel, 10 Feb
   Selesaikan soal integral di halaman 45-50
   🆔 6989fc62e52dcb6f17493d50
```

---

#### `/tugas_hari_ini`
Menampilkan tugas yang deadline-nya hari ini.

**Format:**
```
/tugas_hari_ini
```

---

#### `/tugas_minggu_ini`
Menampilkan tugas yang deadline-nya minggu ini.

**Format:**
```
/tugas_minggu_ini
```

---

### 📅 Jadwal

#### `/jadwal` atau `/jadwal_hari_ini`
Menampilkan jadwal pelajaran hari ini.

**Format:**
```
/jadwal
```

**Output:**
```
📅 Jadwal Pelajaran:

1. 📖 Matematika
   ⏰ 08:00-09:30 • R.101 • Pak Budi
   🆔 6989fc62e52dcb6f17493d51
```

---

#### `/jadwal_besok`
Menampilkan jadwal pelajaran besok.

**Format:**
```
/jadwal_besok
```

---

#### `/jadwal_minggu_ini`
Menampilkan jadwal pelajaran minggu ini.

**Format:**
```
/jadwal_minggu_ini
```

---

### 🧹 Piket

#### `/piket`
Menampilkan jadwal piket hari ini.

**Format:**
```
/piket
```

**Output:**
```
🧹 Piket Senin:

1. Budi
2. Ani
3. Citra
```

---

#### `/piket_minggu_ini`
Menampilkan jadwal piket minggu ini.

**Format:**
```
/piket_minggu_ini
```

---

### ℹ️ Info

#### `/help` atau `/bantuan`
Menampilkan daftar command yang tersedia.

**Format:**
```
/help
```

---

#### `/status`
Menampilkan status bot dan statistik.

**Format:**
```
/status
```

**Output:**
```
✅ Bot Status: Online
📊 Statistik:
   • Tugas aktif: 5
   • Jadwal hari ini: 3
   • Piket hari ini: 3 siswa
```

---

## 👑 Admin Commands

Command yang hanya bisa digunakan oleh admin.

### 📝 Manajemen Tugas

#### `/add_tugas`
Menambahkan tugas baru.

**Format:**
```
/add_tugas | judul | deskripsi | deadline | mata_pelajaran | tipe
```

**Parameter:**
- `judul`: Judul tugas
- `deskripsi`: Deskripsi tugas (akan di-enhance oleh AI)
- `deadline`: Tanggal deadline (format: YYYY-MM-DD)
- `mata_pelajaran`: Nama mata pelajaran
- `tipe`: Tipe tugas (`individu`, `kelompok`, atau `ujian`)

**Contoh:**
```
/add_tugas | Essay Sejarah | Tulis essay tentang kemerdekaan | 2026-02-25 | Sejarah | individu
```

**Output:**
```
✅ Tugas ditambahkan!

📝 Essay Sejarah
ℹ️ Sejarah • Rab, 25 Feb
🆔 6989fc62e52dcb6f17493d52

💡 Gunakan ID untuk edit/hapus
```

---

#### `/edit_tugas`
Mengedit tugas yang sudah ada.

**Format:**
```
/edit_tugas | task_id | field | value
```

**Parameter:**
- `task_id`: ID tugas (lihat dari output `/tugas`)
- `field`: Field yang mau diubah (`judul`, `deskripsi`, `deadline`, `mata_pelajaran`, `tipe`)
- `value`: Nilai baru

**Contoh:**
```
/edit_tugas | 6989fc62e52dcb6f17493d52 | deadline | 2026-02-28
```

---

#### `/hapus_tugas`
Menghapus tugas.

**Format:**
```
/hapus_tugas | task_id
```

**Contoh:**
```
/hapus_tugas | 6989fc62e52dcb6f17493d52
```

---

#### `/tandai_selesai`
Menandai tugas sebagai selesai.

**Format:**
```
/tandai_selesai | task_id
```

**Contoh:**
```
/tandai_selesai | 6989fc62e52dcb6f17493d52
```

---

### 📅 Manajemen Jadwal

#### `/add_jadwal`
Menambahkan jadwal pelajaran baru.

**Format:**
```
/add_jadwal | hari | jam_mulai | jam_selesai | mata_pelajaran | ruangan | nama_guru
```

**Parameter:**
- `hari`: Hari (`Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Minggu`)
- `jam_mulai`: Jam mulai (format: HH:MM)
- `jam_selesai`: Jam selesai (format: HH:MM)
- `mata_pelajaran`: Nama mata pelajaran
- `ruangan`: Nama ruangan
- `nama_guru`: Nama guru

**Contoh:**
```
/add_jadwal | Senin | 08:00 | 09:30 | Matematika | R.101 | Pak Budi
```

---

#### `/edit_jadwal`
Mengedit jadwal yang sudah ada.

**Format:**
```
/edit_jadwal | schedule_id | field | value
```

**Parameter:**
- `schedule_id`: ID jadwal
- `field`: Field yang mau diubah (`jam_mulai`, `jam_selesai`, `mata_pelajaran`, `ruangan`, `nama_guru`)
- `value`: Nilai baru

**Contoh:**
```
/edit_jadwal | 6989fc62e52dcb6f17493d53 | ruangan | R.202
```

---

#### `/hapus_jadwal`
Menghapus jadwal.

**Format:**
```
/hapus_jadwal | schedule_id
```

**Contoh:**
```
/hapus_jadwal | 6989fc62e52dcb6f17493d53
```

---

#### `/ganti_jadwal`
Mengganti jadwal dan otomatis membuat pengumuman.

**Format:**
```
/ganti_jadwal | schedule_id | field | value | alasan
```

**Parameter:**
- `schedule_id`: ID jadwal
- `field`: Field yang mau diubah
- `value`: Nilai baru
- `alasan`: Alasan perubahan (akan masuk ke pengumuman)

**Contoh:**
```
/ganti_jadwal | 6989fc62e52dcb6f17493d53 | ruangan | R.202 | Ruangan lama sedang renovasi
```

---

### 🧹 Manajemen Piket

#### `/set_piket`
Mengatur jadwal piket untuk hari tertentu.

**Format:**
```
/set_piket | hari | nama1,nomor1 | nama2,nomor2 | ...
```

**Parameter:**
- `hari`: Hari (`Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Minggu`)
- `nama,nomor`: Nama siswa dan nomor WhatsApp (dipisah koma)

**Contoh:**
```
/set_piket | Senin | Budi,081234567890 | Ani,081234567891 | Citra,081234567892
```

---

#### `/edit_piket`
Mengedit jadwal piket (sama dengan `/set_piket`).

**Format:**
```
/edit_piket | hari | nama1,nomor1 | nama2,nomor2 | ...
```

---

### 📢 Manajemen Pengumuman

#### `/add_pengumuman`
Menambahkan pengumuman baru.

**Format:**
```
/add_pengumuman | tanggal | judul | tipe | keterangan
```

**Parameter:**
- `tanggal`: Tanggal pengumuman (format: YYYY-MM-DD)
- `judul`: Judul pengumuman
- `tipe`: Tipe pengumuman (`acara`, `perubahan_jadwal`, `praktikum`, `lainnya`)
- `keterangan`: Keterangan pengumuman

**Contoh:**
```
/add_pengumuman | 2026-02-15 | Libur Nasional | acara | Sekolah libur untuk peringatan hari besar
```

---

#### `/hapus_pengumuman`
Menghapus pengumuman.

**Format:**
```
/hapus_pengumuman | announcement_id
```

**Contoh:**
```
/hapus_pengumuman | 6989fc62e52dcb6f17493d54
```

---

### 📣 Broadcast

#### `/broadcast`
Mengirim broadcast pesan ke grup.

**Format:**
```
/broadcast | pesan
```

**Contoh:**
```
/broadcast | Besok ada rapat OSIS jam 14:00
```

**Output:**
```
📢 PENGUMUMAN

Besok ada rapat OSIS jam 14:00
```

---

#### `/broadcast_urgent`
Mengirim broadcast urgent dengan highlight.

**Format:**
```
/broadcast_urgent | pesan
```

**Contoh:**
```
/broadcast_urgent | Ujian Matematika dimajukan ke besok!
```

**Output:**
```
🚨 PENGUMUMAN PENTING 🚨

Ujian Matematika dimajukan ke besok!

⚠️ Mohon segera dibaca!
```

---

## 📝 Tips Penggunaan

### 1. Mendapatkan ID
Setiap kali menambahkan tugas/jadwal/pengumuman, ID akan ditampilkan. Copy ID tersebut untuk edit/hapus.

Atau gunakan command list untuk melihat ID:
```
/tugas          → Lihat ID tugas
/jadwal         → Lihat ID jadwal
```

### 2. Format Tanggal
Selalu gunakan format `YYYY-MM-DD`:
- ✅ Benar: `2026-02-15`
- ❌ Salah: `15-02-2026`, `15/02/2026`, `2026/02/15`

### 3. Format Waktu
Selalu gunakan format `HH:MM`:
- ✅ Benar: `08:00`, `14:30`
- ❌ Salah: `8:00`, `14.30`, `2:30 PM`

### 4. Delimiter
Gunakan `|` (pipe) untuk memisahkan argumen:
- ✅ Benar: `/add_tugas | Judul | Deskripsi | 2026-02-15 | Matematika | individu`
- ❌ Salah: `/add_tugas Judul Deskripsi 2026-02-15 Matematika individu`

### 5. Tipe Tugas
Pilihan tipe tugas:
- `individu` → Tugas individu (emoji: 👤)
- `kelompok` → Tugas kelompok (emoji: 👥)
- `ujian` → Ujian (emoji: 📝)

### 6. Tipe Pengumuman
Pilihan tipe pengumuman:
- `acara` → Acara sekolah (emoji: 🎉)
- `perubahan_jadwal` → Perubahan jadwal (emoji: 🔄)
- `praktikum` → Praktikum (emoji: 🔬)
- `lainnya` → Lainnya (emoji: 📢)

### 7. Prioritas Tugas (Otomatis)
Bot akan otomatis menentukan prioritas berdasarkan deadline:
- 🚨 **Urgent**: Deadline < 24 jam
- ⚠️ **Penting**: Deadline < 72 jam (3 hari)
- ℹ️ **Normal**: Deadline ≥ 72 jam

---

## 🔗 Dokumentasi Lainnya

- [Quick Start](QUICK_START.md) - Panduan cepat mulai
- [Setup Guide](SETUP_GUIDE.md) - Setup lengkap
- [Admin Setup](ADMIN_SETUP.md) - Setup admin pertama
- [Discord Setup](DISCORD_SETUP.md) - Setup Discord bot
- [How to Get ID](HOW_TO_GET_ID.md) - Cara mendapatkan ID
