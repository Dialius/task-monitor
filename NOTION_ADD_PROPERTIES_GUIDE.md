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

#### Property 1: Judul (Title) ⭐
- **Name:** `Judul`
- **Type:** `Title` (ini adalah property utama, hanya 1 per database)
- Klik "Create"

#### Property 2: Mata Pelajaran (Select)
- **Name:** `Mata Pelajaran`
- **Type:** `Select` (dropdown dengan 1 pilihan)
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

#### Property 3: Deskripsi (Text)
- **Name:** `Deskripsi`
- **Type:** `Text` (di Notion UI mungkin tertulis "Text" atau "Rich text")
- Ini untuk teks panjang dengan formatting

#### Property 4: Deadline (Date)
- **Name:** `Deadline`
- **Type:** `Date` (tanggal dengan/tanpa waktu)

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
- **Type:** `URL` (link yang bisa diklik)

#### Property 9: Catatan (Text)
- **Name:** `Catatan`
- **Type:** `Text` (di Notion UI mungkin tertulis "Text" atau "Rich text")

#### Property 10: Created By (Text)
- **Name:** `Created By`
- **Type:** `Text` (di Notion UI mungkin tertulis "Text" atau "Rich text")

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

---

## 📚 Penjelasan Property Types di Notion

Berdasarkan [dokumentasi resmi Notion API](https://developers.notion.com/reference/property-object), berikut adalah property types yang tersedia:

### Property Types yang Digunakan Bot:

1. **Title** - Property utama yang jadi judul page
   - Hanya boleh 1 Title property per database
   - Otomatis jadi nama page saat dibuka
   - Di UI Notion: "Title"

2. **Text** (Rich Text) - Teks dengan formatting
   - Bisa bold, italic, link, dll
   - Untuk deskripsi panjang
   - Di UI Notion: "Text" atau "Rich text"

3. **Select** - Dropdown dengan 1 pilihan
   - User hanya bisa pilih 1 option
   - Bisa custom warna per option
   - Di UI Notion: "Select"

4. **Date** - Tanggal dengan/tanpa waktu
   - Bisa date only atau date + time
   - Bisa date range (start - end)
   - Di UI Notion: "Date"

5. **URL** - Link yang bisa diklik
   - Otomatis jadi hyperlink
   - Validasi format URL
   - Di UI Notion: "URL"

### Property Types Lain yang Tersedia (tidak dipakai bot):

- **Multi-select** - Dropdown dengan multiple pilihan
- **Number** - Angka dengan berbagai format (currency, percent, dll)
- **Checkbox** - True/false checkbox
- **Email** - Email address
- **Phone** - Nomor telepon
- **People** - Mention user Notion
- **Files** - Upload file atau link file
- **Formula** - Kalkulasi otomatis
- **Relation** - Link ke database lain
- **Rollup** - Aggregate data dari relation
- **Created time** - Timestamp otomatis saat dibuat
- **Created by** - User yang buat page
- **Last edited time** - Timestamp terakhir edit
- **Last edited by** - User terakhir edit
- **Status** - Status dengan grouping (seperti Kanban)

### Perbedaan Select vs Multi-select:

- **Select**: User pilih 1 option saja (contoh: Prioritas = "urgent")
- **Multi-select**: User bisa pilih banyak option (contoh: Tags = ["penting", "deadline-dekat", "kelompok"])

Bot menggunakan **Select** karena setiap tugas hanya punya 1 mata pelajaran, 1 prioritas, 1 status, dll.

### Referensi:
- [Notion API Property Object Reference](https://developers.notion.com/reference/property-object)
- Content rephrased for compliance with licensing restrictions
