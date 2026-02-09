# Command Reference

Dokumentasi lengkap untuk semua command yang tersedia di Multi-Platform Class Reminder Bot.

## Format Command

Semua command menggunakan format:
```
/command | arg1 | arg2 | arg3
```

- Prefix: `/` (slash)
- Delimiter: `|` (pipe)
- Whitespace di sekitar delimiter akan di-trim otomatis

## Permission Levels

| Role | Description |
|------|-------------|
| **Admin** | Full access ke semua command |
| **Koordinator** | Access ke task/schedule/piket management, tidak bisa broadcast/manage users/Notion sync |
| **Member** | Read-only access, hanya query commands |

---

## Admin Commands

### Task Management

#### `/add_tugas`
Menambahkan tugas baru dengan AI enhancement untuk deskripsi.

**Format:**
```
/add_tugas | Judul | Deskripsi | YYYY-MM-DD | Mata Pelajaran | Tipe
```

**Arguments:**
- `Judul`: Judul tugas (required)
- `Deskripsi`: Deskripsi detail tugas (required)
- `YYYY-MM-DD`: Deadline dalam format tahun-bulan-tanggal (required)
- `Mata Pelajaran`: Nama mata pelajaran (required)
- `Tipe`: Jenis tugas - `individu`, `kelompok`, atau `ujian` (required)

**Prioritas Otomatis:**
- `urgent`: Deadline < 24 jam
- `penting`: Deadline < 72 jam
- `normal`: Deadline ≥ 72 jam

**Example:**
```
/add_tugas | Essay Sejarah | Tulis essay tentang Perang Dunia II | 2024-03-15 | Sejarah | individu
```

**Response:**
- Success: Konfirmasi tugas ditambahkan dengan ID dan prioritas
- Error: Pesan error jika format salah atau field kosong

---

#### `/edit_tugas`
Mengedit field tertentu dari tugas yang sudah ada.

**Format:**
```
/edit_tugas | task_id | field | new_value
```

**Arguments:**
- `task_id`: MongoDB ObjectId dari tugas (required)
- `field`: Field yang ingin diedit - `judul`, `deskripsi`, `deadline`, `mata_pelajaran`, `tipe` (required)
- `new_value`: Nilai baru untuk field tersebut (required)

**Example:**
```
/edit_tugas | 507f1f77bcf86cd799439011 | deadline | 2024-03-20
/edit_tugas | 507f1f77bcf86cd799439011 | tipe | kelompok
```

**Response:**
- Success: Konfirmasi field berhasil diupdate
- Error: Task ID tidak ditemukan atau field invalid

---

#### `/hapus_tugas`
Menghapus tugas dari database (hard delete).

**Format:**
```
/hapus_tugas | task_id
```

**Arguments:**
- `task_id`: MongoDB ObjectId dari tugas (required)

**Example:**
```
/hapus_tugas | 507f1f77bcf86cd799439011
```

**Response:**
- Success: Konfirmasi tugas berhasil dihapus
- Error: Task ID tidak ditemukan

---

#### `/tandai_selesai`
Menandai tugas sebagai selesai.

**Format:**
```
/tandai_selesai | task_id
```

**Arguments:**
- `task_id`: MongoDB ObjectId dari tugas (required)

**Example:**
```
/tandai_selesai | 507f1f77bcf86cd799439011
```

**Response:**
- Success: Konfirmasi tugas ditandai selesai
- Error: Task ID tidak ditemukan

---

### Schedule Management

#### `/add_jadwal`
Menambahkan jadwal pelajaran untuk hari tertentu.

**Format:**
```
/add_jadwal | Hari | HH:MM-HH:MM | Mata Pelajaran | Ruangan
```

**Arguments:**
- `Hari`: Nama hari - `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu` (required)
- `HH:MM-HH:MM`: Waktu mulai dan selesai (required)
- `Mata Pelajaran`: Nama mata pelajaran (required)
- `Ruangan`: Nama/nomor ruangan (required)

**Example:**
```
/add_jadwal | Senin | 08:00-09:30 | Matematika | R.301
/add_jadwal | Rabu | 13:00-14:30 | Fisika | Lab Fisika
```

**Response:**
- Success: Konfirmasi jadwal ditambahkan
- Error: Format waktu salah atau hari invalid

---

### Piket Management

#### `/set_piket`
Mengatur jadwal piket untuk hari tertentu dengan mention otomatis.

**Format:**
```
/set_piket | Hari | Nama1,Nama2,Nama3 | Nomor1,Nomor2,Nomor3
```

**Arguments:**
- `Hari`: Nama hari - `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu` (required)
- `Nama1,Nama2,...`: Daftar nama siswa dipisah koma (required)
- `Nomor1,Nomor2,...`: Daftar nomor WhatsApp dipisah koma (required)

**Important:**
- Jumlah nama dan nomor harus sama
- Nomor WhatsApp tanpa tanda + atau spasi (contoh: 628123456789)

**Example:**
```
/set_piket | Senin | Budi,Ani,Citra | 628123456789,628234567890,628345678901
```

**Response:**
- Success: Konfirmasi piket diatur dengan mention
- Error: Jumlah nama dan nomor tidak sama

---

### Announcement Management

#### `/add_pengumuman`
Menambahkan pengumuman khusus dengan tipe tertentu.

**Format:**
```
/add_pengumuman | Judul | Isi | YYYY-MM-DD | Tipe
```

**Arguments:**
- `Judul`: Judul pengumuman (required)
- `Isi`: Isi pengumuman (required)
- `YYYY-MM-DD`: Tanggal pengumuman (required)
- `Tipe`: Jenis pengumuman - `umum`, `penting`, atau `urgent` (required)

**Example:**
```
/add_pengumuman | Libur Nasional | Besok libur nasional, tidak ada kelas | 2024-03-17 | penting
```

**Response:**
- Success: Konfirmasi pengumuman ditambahkan
- Error: Format tanggal salah atau tipe invalid

---

## Member Commands

### Task Queries

#### `/tugas`
Menampilkan semua tugas aktif yang belum selesai.

**Format:**
```
/tugas
```

**Response:**
- List tugas dengan format:
  - Emoji berdasarkan tipe (📝 individu, 👥 kelompok, 📋 ujian)
  - Judul, mata pelajaran, deadline
  - Prioritas (🔴 urgent, 🟡 penting, 🟢 normal)
  - Deskripsi
- Jika tidak ada tugas: "Tidak ada tugas aktif"

---

#### `/tugas_hari_ini`
Menampilkan tugas yang deadline-nya hari ini.

**Format:**
```
/tugas_hari_ini
```

**Response:**
- List tugas hari ini dengan format sama seperti `/tugas`
- Jika tidak ada: "Tidak ada tugas untuk hari ini"

---

#### `/tugas_minggu_ini`
Menampilkan tugas yang deadline-nya minggu ini.

**Format:**
```
/tugas_minggu_ini
```

**Response:**
- List tugas minggu ini dengan format sama seperti `/tugas`
- Jika tidak ada: "Tidak ada tugas untuk minggu ini"

---

### Schedule Queries

#### `/jadwal` atau `/jadwal_hari_ini`
Menampilkan jadwal pelajaran hari ini.

**Format:**
```
/jadwal
```

**Response:**
- List jadwal dengan format:
  - Waktu (HH:MM-HH:MM)
  - Mata pelajaran
  - Ruangan
- Jika tidak ada: "Tidak ada jadwal untuk hari ini"

---

#### `/jadwal_besok`
Menampilkan jadwal pelajaran besok.

**Format:**
```
/jadwal_besok
```

**Response:**
- List jadwal besok dengan format sama seperti `/jadwal`
- Jika tidak ada: "Tidak ada jadwal untuk besok"

---

#### `/jadwal_minggu_ini`
Menampilkan jadwal pelajaran untuk minggu ini, dikelompokkan per hari.

**Format:**
```
/jadwal_minggu_ini
```

**Response:**
- Jadwal per hari (Senin - Sabtu)
- Format sama seperti `/jadwal`
- Jika tidak ada: "Tidak ada jadwal untuk minggu ini"

---

### Piket Queries

#### `/piket`
Menampilkan jadwal piket hari ini dengan mention.

**Format:**
```
/piket
```

**Response:**
- Nama siswa piket dengan mention (WhatsApp: @nomor, Discord: <@userId>)
- Jika tidak ada: "Tidak ada piket untuk hari ini"

---

#### `/piket_minggu_ini`
Menampilkan jadwal piket untuk minggu ini.

**Format:**
```
/piket_minggu_ini
```

**Response:**
- Piket per hari (Senin - Sabtu)
- Nama siswa dengan mention
- Jika tidak ada: "Tidak ada piket untuk minggu ini"

---

### Utility Commands

#### `/help` atau `/bantuan`
Menampilkan daftar command yang tersedia berdasarkan role user.

**Format:**
```
/help
```

**Response:**
- Admin: Semua command (admin + member)
- Koordinator: Command management + query (tanpa broadcast/Notion)
- Member: Hanya query commands

---

#### `/status`
Menampilkan status bot dan statistik.

**Format:**
```
/status
```

**Response:**
- Platform yang aktif (Discord/WhatsApp)
- Database connection status
- Uptime
- Total users, tasks, schedules

---

## Platform-Specific Features

### Discord

#### Slash Commands
- Semua command tersedia sebagai slash commands
- Auto-complete untuk arguments
- Inline help text

#### Embeds
- Task list menggunakan embeds dengan color coding:
  - 🔴 Red: Urgent
  - 🟡 Yellow: Penting
  - 🟢 Green: Normal
- Schedule dan piket juga menggunakan embeds

#### Buttons
- Task list memiliki buttons untuk quick actions
- Pagination untuk list panjang

#### Mentions
- Format: `<@userId>`
- Auto-resolve dari Discord role/member

### WhatsApp

#### Text Commands
- Semua command menggunakan text dengan prefix `/`
- Parse dari message text

#### Mentions
- Format: `@phoneNumber`
- Mention langsung ke nomor WhatsApp

#### Group Messages
- Bot hanya merespon di group yang dikonfigurasi
- Filter message dari bot sendiri

---

## Error Messages

### Common Errors

**"Anda tidak memiliki akses untuk command ini"**
- User tidak punya permission untuk command tersebut
- Cek role di database

**"Format command salah"**
- Argument kurang atau format tidak sesuai
- Cek format command di dokumentasi

**"Task ID tidak ditemukan"**
- Task dengan ID tersebut tidak ada di database
- Pastikan ID benar (MongoDB ObjectId)

**"Format tanggal salah, gunakan YYYY-MM-DD"**
- Tanggal tidak sesuai format
- Contoh yang benar: 2024-03-15

**"Format waktu salah, gunakan HH:MM"**
- Waktu tidak sesuai format
- Contoh yang benar: 08:00 atau 13:30

**"Tipe tidak valid"**
- Enum value tidak sesuai
- Cek nilai yang diperbolehkan (individu/kelompok/ujian, umum/penting/urgent, dll)

---

## Tips & Best Practices

1. **Task Management**
   - Gunakan deskripsi yang jelas dan detail
   - Set deadline yang realistis
   - Review tugas secara berkala

2. **Schedule Management**
   - Update jadwal jika ada perubahan
   - Gunakan format waktu yang konsisten
   - Cantumkan ruangan dengan jelas

3. **Piket Management**
   - Pastikan nomor WhatsApp benar
   - Update jika ada perubahan anggota
   - Gunakan nama lengkap untuk clarity

4. **Announcements**
   - Gunakan tipe yang sesuai (urgent untuk hal penting)
   - Tulis judul yang descriptive
   - Set tanggal yang relevan

5. **Query Commands**
   - Gunakan command spesifik untuk hasil lebih fokus
   - `/tugas_hari_ini` lebih cepat dari `/tugas`
   - Check status bot jika ada masalah

---

## Automated Features

### Daily Recap (Default: 17:00)
Bot akan otomatis mengirim recap harian berisi:
- Jadwal besok
- Tugas yang deadline-nya besok
- Piket besok
- Pengumuman yang relevan

### Weekly Recap (Default: Jumat 20:00)
Bot akan otomatis mengirim recap mingguan berisi:
- Statistik tugas minggu depan
- Breakdown by tipe (individu/kelompok/ujian)
- Breakdown by prioritas (urgent/penting/normal)
- Pengumuman minggu depan

### AI Enhancement
- Deskripsi tugas akan di-enhance oleh AI
- Recap akan diformat dengan AI untuk lebih engaging
- Fallback ke text original jika AI gagal

---

## Support

Jika ada pertanyaan atau masalah:
1. Cek dokumentasi di README.md
2. Cek logs di `./logs/` untuk error details
3. Contact admin bot
4. Open issue di GitHub repository
