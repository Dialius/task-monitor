# Notion Integration Setup Guide

## 📋 Overview

Bot ini bisa sync tugas ke Notion database secara otomatis. Setiap kali ada tugas baru, bot akan create entry di Notion.

## 🚀 Quick Start

### 1. Buat Notion Integration

1. Buka https://www.notion.so/my-integrations
2. Klik **"+ New integration"**
3. Isi form:
   - **Name**: Class Reminder Bot (atau nama lain)
   - **Associated workspace**: Pilih workspace kamu
   - **Type**: Internal
4. Klik **"Submit"**
5. Copy **"Internal Integration Token"** (format: `secret_...`)
6. Paste ke `.env` file:
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2. Test Koneksi

```bash
node scripts/test-notion.js
```

Output yang diharapkan:
```
✅ Notion connection successful!
📊 Found X user(s) in workspace
```

### 3. Buat Database

#### Option A: Buat Otomatis via Script (Recommended)

1. Buka Notion dan buat **page baru** (bisa di workspace root atau di dalam page lain)
2. Beri nama page (contoh: "Tugas Kelas XI PPLG 3")
3. **Share page** dengan integration:
   
   **⚠️ PENTING: Notion UI terbaru (2024-2025) menggunakan menu "Connections" bukan "Share"**
   
   - Klik tombol **`...`** (tiga titik) di pojok kanan atas
   - **Hover mouse** ke menu **"Connections"**
   - Klik **"Add connections"**
   - Cari dan pilih integration kamu (Class Reminder Bot)
   - Klik **"Confirm"** atau **"Allow access"**
   
   📖 **Lihat panduan visual lengkap di:** `NOTION_VISUAL_GUIDE.md`
4. Copy **Page ID** dari URL:
   - URL format: `https://www.notion.so/My-Page-1234567890abcdef1234567890abcdef`
   - Page ID: `1234567890abcdef1234567890abcdef` (32 karakter)
5. Jalankan script:
   ```bash
   node scripts/test-notion.js create 1234567890abcdef1234567890abcdef
   ```
6. Copy Database ID yang muncul ke `.env`:
   ```env
   NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef
   ```

#### Option B: Buat Manual

1. Buka Notion dan buat **database baru** (Table view)
2. Beri nama: "Tugas Kelas XI PPLG 3"
3. Tambahkan properties berikut:

| Property Name | Type | Options/Config |
|--------------|------|----------------|
| Judul | Title | - |
| Mata Pelajaran | Select | Matematika, Bahasa Indonesia, Bahasa Inggris, Sejarah, PAI, PJOK, BK, MP 1-4, MK 1-4, Bahasa Jawa |
| Deskripsi | Text | - |
| Deadline | Date | - |
| Tipe | Select | Individu, Kelompok, Ujian |
| Prioritas | Select | Urgent (red), Penting (yellow), Normal (gray) |
| Status | Select | Aktif (blue), Selesai (green) |
| Link Pengumpulan | URL | - |
| Catatan | Text | - |
| Created By | Text | - |
| Created At | Created time | - |
| Updated At | Last edited time | - |

4. **Share database** dengan integration:
   - Klik tombol **`...`** (tiga titik) di pojok kanan atas
   - Hover ke **"Connections"** → Klik **"Add connections"**
   - Pilih integration kamu
5. Copy **Database ID** dari URL:
   - URL format: `https://www.notion.so/1234567890abcdef1234567890abcdef?v=...`
   - Database ID: `1234567890abcdef1234567890abcdef` (32 karakter sebelum `?v=`)
6. Paste ke `.env`:
   ```env
   NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef
   ```

### 4. Test Database Access

```bash
node scripts/test-notion.js
```

Output yang diharapkan:
```
✅ Notion connection successful!
✅ Database access successful!
📊 Found X item(s) in database
```

### 5. Test Add Sample Task

```bash
node scripts/test-notion.js sample
```

Cek Notion database kamu, seharusnya ada task baru dengan judul "Sample Task - Test Notion Integration".

## 🔧 Troubleshooting

### Error: "API token is invalid"

**Penyebab:** API key salah atau expired

**Solusi:**
1. Cek `.env` file, pastikan `NOTION_API_KEY` benar
2. Pastikan format: `secret_...` (harus ada prefix `secret_`)
3. Buat integration baru jika perlu

### Error: "Could not find database"

**Penyebab:** Database ID salah atau database belum di-share

**Solusi:**
1. Cek `NOTION_DATABASE_ID` di `.env`
2. Pastikan database sudah di-share dengan integration:
   - Buka database di Notion
   - Klik **`...`** (tiga titik) → Hover ke **"Connections"**
   - Klik **"Add connections"** → Pilih integration
3. Pastikan ID benar (32 karakter, tanpa dash)

### Error: "Insufficient permissions"

**Penyebab:** Integration tidak punya akses ke page/database

**Solusi:**
1. Buka page/database di Notion
2. Klik **`...`** (tiga titik) di pojok kanan atas
3. Hover ke **"Connections"** dan pastikan integration kamu ada di "Active Connections"
4. Jika belum, klik **"Add connections"** dan pilih integration

### Database ID tidak ketemu di URL

**Cara dapat Database ID:**
1. Buka database di Notion (full page view)
2. Lihat URL di browser
3. Format URL: `notion.so/workspace/DATABASE_ID?v=VIEW_ID`
4. Copy 32 karakter setelah workspace name dan sebelum `?v=`
5. Contoh:
   - URL: `https://www.notion.so/myworkspace/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...`
   - Database ID: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

## 📊 Database Structure

### Properties Detail

#### Judul (Title)
- Type: Title
- Required: Yes
- Description: Judul tugas

#### Mata Pelajaran (Select)
- Type: Select
- Required: Yes
- Options:
  - Matematika (blue)
  - Bahasa Indonesia (green)
  - Bahasa Inggris (yellow)
  - Sejarah (orange)
  - PAI (purple)
  - PJOK (pink)
  - BK (brown)
  - MP 1, MP 2, MP 3, MP 4 (red)
  - MK 1, MK 2, MK 3, MK 4 (red)
  - Bahasa Jawa (gray)

#### Deskripsi (Text)
- Type: Rich Text
- Required: Yes
- Description: Deskripsi lengkap tugas

#### Deadline (Date)
- Type: Date
- Required: Yes
- Description: Tanggal deadline tugas

#### Tipe (Select)
- Type: Select
- Required: Yes
- Options:
  - Individu (blue)
  - Kelompok (green)
  - Ujian (red)

#### Prioritas (Select)
- Type: Select
- Required: Yes
- Auto-calculated by bot based on deadline
- Options:
  - Urgent (red) - Deadline ≤ 24 jam
  - Penting (yellow) - Deadline ≤ 72 jam
  - Normal (gray) - Deadline > 72 jam

#### Status (Select)
- Type: Select
- Required: Yes
- Default: Aktif
- Options:
  - Aktif (blue)
  - Selesai (green)

#### Link Pengumpulan (URL)
- Type: URL
- Required: No
- Description: Link Google Drive, Classroom, dll

#### Catatan (Text)
- Type: Rich Text
- Required: No
- Description: Catatan tambahan

#### Created By (Text)
- Type: Rich Text
- Required: Yes
- Description: User ID yang membuat tugas

#### Created At (Created time)
- Type: Created time
- Auto-filled by Notion

#### Updated At (Last edited time)
- Type: Last edited time
- Auto-updated by Notion

## 🔄 How It Works

### 1. Create Task
```
User: /add_tugas | Matematika | Latihan Soal | 2026-02-15 | individu

Bot:
1. Validate input
2. Create task in MongoDB
3. Sync to Notion database
4. Reply with success message
```

### 2. Update Task
```
User: /edit_tugas | <task_id> | deadline | 2026-02-20

Bot:
1. Update task in MongoDB
2. Update corresponding entry in Notion
3. Reply with success message
```

### 3. Mark as Complete
```
User: /tandai_selesai | <task_id>

Bot:
1. Update status in MongoDB
2. Update status in Notion (Aktif → Selesai)
3. Reply with success message
```

### 4. Delete Task
```
User: /hapus_tugas | <task_id>

Bot:
1. Soft delete in MongoDB (status = deleted)
2. Archive in Notion (move to archive or delete)
3. Reply with success message
```

## 💡 Tips

### View Recommendations

**Board View (Kanban)**
- Group by: Status
- Sort by: Deadline (ascending)
- Filter: Status is Aktif

**Calendar View**
- Show: Deadline
- Filter: Status is Aktif

**Table View (Default)**
- Sort by: Deadline (ascending)
- Filter: Status is Aktif
- Group by: Mata Pelajaran

### Automation Ideas

1. **Reminder Automation**
   - Notion reminder 1 hari sebelum deadline
   - Email notification untuk urgent tasks

2. **Status Tracking**
   - Auto-archive completed tasks after 7 days
   - Weekly summary of completed tasks

3. **Team Collaboration**
   - Share database dengan teman sekelas
   - Assign tasks to specific members
   - Comment on tasks for discussion

## 🆘 Need Help?

Jika masih ada masalah:

1. Cek console log saat run script
2. Screenshot error message
3. Cek Notion integration settings
4. Pastikan semua permissions sudah benar
5. Contact developer dengan info:
   - Error message
   - Screenshot Notion settings
   - `.env` config (sensor API keys)

## 📚 Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion Integration Guide](https://www.notion.so/help/create-integrations-with-the-notion-api)
- [Database Properties](https://developers.notion.com/reference/property-object)
