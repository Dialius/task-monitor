# Struktur Database Notion

## 📊 Database: Tugas Kelas

### Properties (Kolom)

| No | Property Name | Type | Required | Description | Options/Config |
|----|--------------|------|----------|-------------|----------------|
| 1 | **Judul** | Title | ✅ Yes | Judul tugas | - |
| 2 | **Mata Pelajaran** | Select | ✅ Yes | Nama mata pelajaran | Matematika, Bahasa Indonesia, Bahasa Inggris, Sejarah, PAI, PJOK, BK, MP 1-4, MK 1-4, Bahasa Jawa |
| 3 | **Deskripsi** | Rich Text | ✅ Yes | Deskripsi lengkap tugas | Max 2000 karakter |
| 4 | **Deadline** | Date | ✅ Yes | Tanggal & waktu deadline | Include time |
| 5 | **Tipe** | Select | ✅ Yes | Tipe tugas | Individu, Kelompok, Ujian |
| 6 | **Prioritas** | Select | ✅ Yes | Prioritas (auto-calculated) | Urgent (≤24h), Penting (≤72h), Normal (>72h) |
| 7 | **Status** | Select | ✅ Yes | Status tugas | Aktif, Selesai |
| 8 | **Link Pengumpulan** | URL | ❌ No | Link Google Drive/Classroom | - |
| 9 | **Catatan** | Rich Text | ❌ No | Catatan tambahan | Max 1000 karakter |
| 10 | **Created By** | Rich Text | ✅ Yes | User ID pembuat | - |
| 11 | **Created At** | Created time | Auto | Waktu dibuat | Auto by Notion |
| 12 | **Updated At** | Last edited time | Auto | Waktu terakhir diupdate | Auto by Notion |

### Detail Properties

#### 1. Judul (Title)
```
Type: Title
Required: Yes
Validation: 3-200 karakter
Example: "Latihan Soal Matematika Bab 5"
```

#### 2. Mata Pelajaran (Select)
```
Type: Select
Required: Yes
Options:
  - Matematika (blue)
  - Bahasa Indonesia (green)
  - Bahasa Inggris (yellow)
  - Sejarah (orange)
  - PAI (purple)
  - PJOK (pink)
  - BK (brown)
  - MP 1 (red)
  - MP 2 (red)
  - MP 3 (red)
  - MP 4 (red)
  - MK 1 (red)
  - MK 2 (red)
  - MK 3 (red)
  - MK 4 (red)
  - Bahasa Jawa (gray)
  - Lainnya (default)
```

#### 3. Deskripsi (Rich Text)
```
Type: Rich Text
Required: Yes
Validation: 5-2000 karakter
Example: "Mengerjakan soal latihan halaman 45-50, 
          dikumpulkan dalam bentuk PDF"
```

#### 4. Deadline (Date)
```
Type: Date
Required: Yes
Include time: Yes
Validation: Minimal 1 jam dari sekarang
Example: 2026-02-15 23:59
```

#### 5. Tipe (Select)
```
Type: Select
Required: Yes
Options:
  - Individu (blue) - Tugas dikerjakan sendiri
  - Kelompok (green) - Tugas dikerjakan berkelompok
  - Ujian (red) - Ujian/test
```

#### 6. Prioritas (Select)
```
Type: Select
Required: Yes
Auto-calculated by bot based on deadline:
  - Urgent (red) - Deadline ≤ 24 jam
  - Penting (yellow) - Deadline ≤ 72 jam (3 hari)
  - Normal (gray) - Deadline > 72 jam
```

#### 7. Status (Select)
```
Type: Select
Required: Yes
Default: Aktif
Options:
  - Aktif (blue) - Tugas masih aktif
  - Selesai (green) - Tugas sudah selesai
```

#### 8. Link Pengumpulan (URL)
```
Type: URL
Required: No
Example: https://drive.google.com/drive/folders/xxx
         https://classroom.google.com/c/xxx
```

#### 9. Catatan (Rich Text)
```
Type: Rich Text
Required: No
Validation: Max 1000 karakter
Example: "Materi ini akan diujikan secara lisan pada 
          Selasa, 10 Februari 2026"
```

#### 10. Created By (Rich Text)
```
Type: Rich Text
Required: Yes
Format: User ID (Discord/WhatsApp)
Example: "628994630519" (WhatsApp)
         "582071122225528842" (Discord)
```

#### 11. Created At (Created time)
```
Type: Created time
Auto-filled by Notion
Format: ISO 8601 datetime
```

#### 12. Updated At (Last edited time)
```
Type: Last edited time
Auto-updated by Notion
Format: ISO 8601 datetime
```

## 🎨 Recommended Views

### 1. Board View (Kanban)
```
Name: Status Board
Group by: Status
Sort by: Deadline (ascending)
Filter: Status is Aktif
Cards show: Mata Pelajaran, Deadline, Prioritas
```

### 2. Calendar View
```
Name: Deadline Calendar
Show: Deadline
Filter: Status is Aktif
Color by: Prioritas
```

### 3. Table View (Default)
```
Name: All Tasks
Sort by: Deadline (ascending)
Filter: None (show all)
Group by: None
Visible properties: All
```

### 4. List View (Urgent)
```
Name: Urgent Tasks
Filter: Prioritas is Urgent AND Status is Aktif
Sort by: Deadline (ascending)
```

### 5. Timeline View
```
Name: Task Timeline
Show: Deadline
Filter: Status is Aktif
Group by: Mata Pelajaran
```

## 📋 Sample Data

### Sample Task 1
```
Judul: Latihan Soal Matematika Bab 5
Mata Pelajaran: Matematika
Deskripsi: Mengerjakan soal latihan halaman 45-50, dikumpulkan dalam bentuk PDF
Deadline: 2026-02-15 23:59
Tipe: Individu
Prioritas: Normal
Status: Aktif
Link Pengumpulan: https://drive.google.com/drive/folders/xxx
Catatan: -
Created By: 628994630519
```

### Sample Task 2
```
Judul: Resume Teknik Lompat Jauh
Mata Pelajaran: PJOK
Deskripsi: 1. Mempelajari teknik-teknik dalam lompat jauh
2. Membuat resume 2 lembar berisi:
   a. Pengertian atletik dan lompat jauh
   b. Menjelaskan gaya-gaya dalam lompat jauh
   c. Menjelaskan cara melakukan salah satu teknik lompat jauh beserta gambarnya
3. Dikumpulkan dalam bentuk PDF
Deadline: 2026-02-10 23:59
Tipe: Individu
Prioritas: Urgent
Status: Aktif
Link Pengumpulan: https://drive.google.com/drive/folders/xxx
Catatan: -
Created By: 628994630519
```

### Sample Task 3
```
Judul: Ujian Lisan 7 Kabinet Demokrasi Liberal
Mata Pelajaran: Sejarah
Deskripsi: Penilaian secara lisan materi 7 kabinet pada masa Demokrasi Liberal
Deadline: 2026-02-10 08:00
Tipe: Ujian
Prioritas: Urgent
Status: Aktif
Link Pengumpulan: -
Catatan: Ujian dilakukan di kelas, persiapkan materi dengan baik
Created By: 628994630519
```

## 🔄 Data Flow

### Create Task
```
Bot Command → MongoDB → Notion API → Notion Database
```

### Update Task
```
Bot Command → MongoDB → Notion API → Update Notion Entry
```

### Delete Task
```
Bot Command → MongoDB (soft delete) → Notion API → Archive/Delete Entry
```

### Sync from Notion (Future)
```
Notion Database → Notion API → Bot → MongoDB
```

## 🛠️ Setup Instructions

### Automatic Setup (Recommended)
```bash
# 1. Test koneksi
npm run test:notion

# 2. Buat database otomatis
node scripts/test-notion.js create <PAGE_ID>

# 3. Copy Database ID ke .env
NOTION_DATABASE_ID=xxx

# 4. Test dengan sample task
node scripts/test-notion.js sample
```

### Manual Setup
1. Buka Notion
2. Buat database baru (Table)
3. Tambahkan semua properties sesuai tabel di atas
4. Share dengan integration
5. Copy Database ID ke .env

## 📊 Database Schema Mapping

### MongoDB → Notion

| MongoDB Field | Notion Property | Type Conversion |
|--------------|----------------|-----------------|
| judul | Judul | String → Title |
| mata_pelajaran | Mata Pelajaran | String → Select |
| deskripsi | Deskripsi | String → Rich Text |
| deadline | Deadline | Date → Date |
| tipe | Tipe | String → Select |
| prioritas | Prioritas | String → Select |
| status | Status | String → Select |
| link_pengumpulan | Link Pengumpulan | String → URL |
| catatan | Catatan | String → Rich Text |
| created_by | Created By | String → Rich Text |
| created_at | Created At | Date → Created time |
| updated_at | Updated At | Date → Last edited time |

## 🎯 Use Cases

### 1. Daily Reminder
Bot akan query tasks dengan deadline hari ini dari Notion dan kirim reminder ke grup.

### 2. Weekly Summary
Bot akan query semua tasks minggu ini dari Notion dan buat summary.

### 3. Priority Alert
Bot akan monitor tasks dengan prioritas Urgent dan kirim alert.

### 4. Completion Tracking
Bot akan update status di Notion saat task selesai.

### 5. Team Collaboration
Semua anggota kelas bisa lihat dan edit tasks di Notion.

## 💡 Tips

1. **Gunakan Template**: Buat template untuk task yang sering muncul
2. **Filter View**: Buat view khusus untuk setiap mata pelajaran
3. **Reminder**: Set Notion reminder untuk deadline penting
4. **Archive**: Archive completed tasks setiap bulan
5. **Backup**: Export database secara berkala

## 🔗 Related Files

- `scripts/test-notion.js` - Script untuk test dan setup
- `NOTION_SETUP.md` - Panduan setup lengkap
- `src/models/Task.ts` - MongoDB schema
- `.env` - Configuration file
