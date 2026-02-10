# 📝 Cara Tambah Properties ke Database Notion

## 🎯 Tujuan
Menambahkan properties yang dibutuhkan bot ke database Notion yang sudah ada.

## 📍 Database Info
- **Database ID:** `3030a8e24bf6807bb826d8667d0764b0`
- **URL:** https://www.notion.so/3030a8e24bf6807bb826d8667d0764b0

## 🔧 Langkah-Langkah

### 1. Buka Database di Notion
- Klik link di atas atau buka dari workspace Notion kamu
- Pastikan kamu sudah login

### 2. Tambah Properties Satu Per Satu

Klik tombol **"+ Add a property"** atau **"+ New property"** di header tabel.

#### Property 1: Judul (Title)
- **Name:** `Judul`
- **Type:** `Title`
- Klik "Create"

#### Property 2: Mata Pelajaran (Select)
- **Name:** `Mata Pelajaran`
- **Type:** `Select`
- **Options:** Tambahkan satu per satu:
  - Matematika
  - Fisika
  - Kimia
  - Biologi
  - Bahasa Indonesia
  - Bahasa Inggris
  - Sejarah
  - Geografi
  - Ekonomi
  - Sosiologi
  - PJOK
  - Seni Budaya
  - Prakarya
  - PKN
  - Agama
  - MP/MK
  - Lainnya

#### Property 3: Deskripsi (Rich Text)
- **Name:** `Deskripsi`
- **Type:** `Text`

#### Property 4: Deadline (Date)
- **Name:** `Deadline`
- **Type:** `Date`

#### Property 5: Tipe (Select)
- **Name:** `Tipe`
- **Type:** `Select`
- **Options:**
  - Tugas
  - PR
  - Proyek
  - Ujian
  - Kuis
  - Presentasi
  - Laporan
  - Lainnya

#### Property 6: Prioritas (Select)
- **Name:** `Prioritas`
- **Type:** `Select`
- **Options:**
  - urgent
  - tinggi
  - normal
  - rendah

#### Property 7: Status (Select)
- **Name:** `Status`
- **Type:** `Select`
- **Options:**
  - aktif
  - selesai
  - dibatalkan

#### Property 8: Link Pengumpulan (URL)
- **Name:** `Link Pengumpulan`
- **Type:** `URL`

#### Property 9: Catatan (Rich Text)
- **Name:** `Catatan`
- **Type:** `Text`

#### Property 10: Created By (Rich Text)
- **Name:** `Created By`
- **Type:** `Text`

### 3. Verifikasi Properties

Setelah selesai, database kamu harus punya 10 properties:
1. ✅ Judul (Title)
2. ✅ Mata Pelajaran (Select)
3. ✅ Deskripsi (Text)
4. ✅ Deadline (Date)
5. ✅ Tipe (Select)
6. ✅ Prioritas (Select)
7. ✅ Status (Select)
8. ✅ Link Pengumpulan (URL)
9. ✅ Catatan (Text)
10. ✅ Created By (Text)

### 4. Test Connection

Jalankan script test:
```bash
node scripts/check-notion-properties.js
```

Output yang diharapkan:
```
✅ Database found: [nama database]
✅ Properties found: 10

Properties:
  1. Judul (title)
  2. Mata Pelajaran (select)
  3. Deskripsi (rich_text)
  ...
```

### 5. Test Add Task

Jalankan script test add:
```bash
node scripts/test-add-notion-task.js
```

Jika berhasil:
```
✅ Task added to Notion successfully!
Page ID: [notion page id]
```

### 6. Test dari WhatsApp

Kirim command di channel:
```
/add_tugas | Matematika | Latihan Soal | Kerjakan halaman 45-50 | 2026-02-15
```

Response yang diharapkan:
```
✅ Tugas berhasil ditambahkan!

📝 Detail Tugas:
Judul: Latihan Soal
Mata Pelajaran: Matematika
...
✨ Synced to Notion
```

## 🎨 Tips

### Warna untuk Select Options
Notion akan otomatis assign warna, tapi kamu bisa customize:
- **Prioritas:**
  - urgent → Red
  - tinggi → Orange
  - normal → Blue
  - rendah → Gray

- **Status:**
  - aktif → Blue
  - selesai → Green
  - dibatalkan → Red

### Urutan Properties
Kamu bisa drag & drop properties untuk mengatur urutan tampilan di Notion.

Urutan yang recommended:
1. Judul
2. Mata Pelajaran
3. Deadline
4. Prioritas
5. Status
6. Tipe
7. Deskripsi
8. Link Pengumpulan
9. Catatan
10. Created By

## ❓ Troubleshooting

### "Property already exists"
- Skip property tersebut, lanjut ke yang berikutnya
- Atau rename property yang sudah ada agar sesuai dengan nama yang dibutuhkan

### "Cannot add property"
- Pastikan kamu punya permission untuk edit database
- Pastikan database bukan read-only
- Coba refresh page Notion

### Test script gagal
- Pastikan database ID di .env benar
- Pastikan Notion API key valid
- Pastikan integration sudah di-share ke database

## 🎉 Selesai!

Setelah semua properties ditambahkan, bot akan otomatis sync tugas ke Notion setiap kali ada command `/add_tugas`.

Cek di Notion untuk melihat tugas yang ditambahkan dari bot!
