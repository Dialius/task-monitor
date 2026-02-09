# Cara Mendapatkan ID untuk Edit/Hapus

Panduan lengkap untuk mendapatkan ID tugas, jadwal, dan pengumuman.

## 📋 Kenapa Perlu ID?

Untuk edit atau hapus data (tugas, jadwal, pengumuman), Anda perlu ID unik dari data tersebut. ID ini seperti nomor identitas yang membedakan satu data dengan data lainnya.

## 🔍 Cara Mendapatkan ID

### 1. Dari Command List

Setiap kali Anda melihat daftar tugas/jadwal/pengumuman, ID akan ditampilkan.

#### Untuk Tugas:
```
/tugas
```

Output:
```
📝 Daftar Tugas:

1. 👤 Essay Sejarah
   📚 Sejarah
   📅 Deadline: Sabtu, 15 Februari 2026
   🚨 Prioritas: urgent
   📄 Tulis essay tentang kemerdekaan Indonesia
   🆔 ID: `67a1b2c3d4e5f6789012345`  ← INI ID-NYA!
```

#### Untuk Jadwal:
```
/jadwal
```

Output:
```
📅 Jadwal Pelajaran:

1. 📖 Matematika
   ⏰ 08:00 - 09:30
   🏫 Ruangan: R.101
   👨‍🏫 Guru: Pak Budi
   🆔 ID: `67a1b2c3d4e5f6789012346`  ← INI ID-NYA!
```

#### Untuk Pengumuman:
```
/tugas
```
(Pengumuman akan muncul di recap atau bisa ditambahkan command khusus)

### 2. Dari Response Saat Tambah Data

Setiap kali Anda menambah tugas/jadwal/pengumuman, ID akan langsung ditampilkan.

#### Contoh Add Tugas:
```
/add_tugas
  judul: Essay Sejarah
  deskripsi: Tulis essay tentang kemerdekaan
  deadline: 2026-02-15
  mata_pelajaran: Sejarah
  tipe: individu
```

Response:
```
✅ Tugas berhasil ditambahkan!

📝 Essay Sejarah
📚 Sejarah
📅 Deadline: 15/02/2026
🚨 Prioritas: urgent
🆔 ID: `67a1b2c3d4e5f6789012345`  ← INI ID-NYA!

💡 Gunakan ID ini untuk edit atau hapus tugas
```

## 📝 Cara Menggunakan ID

### Edit Tugas
```
/edit_tugas
  task_id: 67a1b2c3d4e5f6789012345
  field: deadline
  value: 2026-02-20
```

### Hapus Tugas
```
/hapus_tugas
  task_id: 67a1b2c3d4e5f6789012345
```

### Tandai Selesai
```
/tandai_selesai
  task_id: 67a1b2c3d4e5f6789012345
```

### Edit Jadwal
```
/edit_jadwal
  schedule_id: 67a1b2c3d4e5f6789012346
  field: ruangan
  value: R.202
```

### Hapus Jadwal
```
/hapus_jadwal
  schedule_id: 67a1b2c3d4e5f6789012346
```

### Hapus Pengumuman
```
/hapus_pengumuman
  announcement_id: 67a1b2c3d4e5f6789012347
```

## 💡 Tips

### 1. Copy ID dengan Benar
- ID ditampilkan dalam format monospace: `67a1b2c3d4e5f6789012345`
- Di Discord, Anda bisa klik dan copy langsung
- Pastikan copy seluruh ID (24 karakter)

### 2. ID Bersifat Unik
- Setiap tugas/jadwal/pengumuman punya ID berbeda
- ID tidak akan berubah setelah dibuat
- ID tidak bisa ditebak atau dibuat manual

### 3. Simpan ID Penting
- Jika ada tugas yang sering di-edit, simpan ID-nya
- Bisa di-note di tempat lain untuk referensi cepat

### 4. ID Case-Sensitive
- Huruf besar dan kecil berbeda
- Copy paste lebih aman daripada ketik manual

## ❓ Troubleshooting

### "Task ID tidak ditemukan"
- Pastikan ID yang di-copy benar dan lengkap
- Cek apakah tugas sudah dihapus sebelumnya
- Coba lihat daftar tugas lagi dengan `/tugas`

### "Invalid ID format"
- ID harus 24 karakter
- Hanya boleh huruf (a-f) dan angka (0-9)
- Tidak boleh ada spasi atau karakter khusus

### ID tidak muncul di output
- Pastikan bot sudah di-update ke versi terbaru
- Restart bot jika perlu
- Cek apakah command berhasil dijalankan

## 🔗 Command Terkait

- `/tugas` - Lihat semua tugas dengan ID
- `/tugas_hari_ini` - Tugas hari ini dengan ID
- `/tugas_minggu_ini` - Tugas minggu ini dengan ID
- `/jadwal` - Jadwal hari ini dengan ID
- `/jadwal_minggu_ini` - Jadwal minggu ini dengan ID

## 📚 Contoh Workflow

### Workflow 1: Tambah dan Edit Tugas
```
1. Tambah tugas:
   /add_tugas | Essay | Tulis essay | 2026-02-15 | Sejarah | individu
   
2. Bot reply dengan ID:
   🆔 ID: `67a1b2c3d4e5f6789012345`
   
3. Copy ID tersebut

4. Edit deadline:
   /edit_tugas | 67a1b2c3d4e5f6789012345 | deadline | 2026-02-20
```

### Workflow 2: Lihat Daftar dan Hapus
```
1. Lihat daftar tugas:
   /tugas
   
2. Cari tugas yang ingin dihapus, copy ID-nya:
   🆔 ID: `67a1b2c3d4e5f6789012345`
   
3. Hapus tugas:
   /hapus_tugas | 67a1b2c3d4e5f6789012345
```

### Workflow 3: Tandai Selesai
```
1. Lihat tugas hari ini:
   /tugas_hari_ini
   
2. Copy ID tugas yang sudah selesai:
   🆔 ID: `67a1b2c3d4e5f6789012345`
   
3. Tandai selesai:
   /tandai_selesai | 67a1b2c3d4e5f6789012345
```

## 🎓 Best Practices

1. **Selalu cek daftar dulu** sebelum edit/hapus
2. **Copy paste ID** jangan ketik manual
3. **Verifikasi ID** sebelum hapus (tidak bisa undo!)
4. **Gunakan command list** untuk melihat semua ID
5. **Simpan ID penting** untuk referensi cepat
