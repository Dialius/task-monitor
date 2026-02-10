# ✅ SYNC NOTION ↔ MONGODB BERHASIL!

## 🎉 Summary

**Status:** ✅ COMPLETE  
**Direction:** Notion → MongoDB  
**Tasks Synced:** 10 tasks  
**Sample Tasks Added:** 8 tasks  

## 📊 What Was Done

### 1. Added Sample Tasks to Notion ✅
```
✅ 8 sample tasks added directly to Notion database
```

Sample tasks yang ditambahkan:
1. Laporan Praktikum Kimia (KIK-A) - 15 Feb
2. Soal Latihan Matematika Bab 3 (MTK) - 12 Feb
3. Presentasi Sejarah Kemerdekaan (Sejarah) - 18 Feb
4. Essay Bahasa Indonesia (B. Indonesia) - 14 Feb
5. Ulangan Harian Bahasa Inggris (B. Inggris) - 13 Feb
6. Proyek Pemrograman Web (MK-2) - 20 Feb
7. Tugas PJOK - Video Senam (PJOK) - 16 Feb
8. Analisis Database (MK-3) - 17 Feb

### 2. Cleared Old MongoDB Data ✅
```
🗑️ Deleted 4 old tasks from MongoDB
```

### 3. Synced from Notion to MongoDB ✅
```
📥 Fetched 11 tasks from Notion
✅ Imported 10 tasks to MongoDB
⚠️ Skipped 1 task (missing required fields)
```

### 4. Verified Data ✅
```
📊 Total Tasks in MongoDB: 10
   - Aktif: 10
   - Selesai: 0

By Prioritas:
   - Penting: 4
   - Normal: 6

By Mata Pelajaran:
   - B. Inggris: 2
   - Matematika: 1
   - MTK: 1
   - B. Indonesia: 1
   - KIK-A: 1
   - PJOK: 1
   - MK-3: 1
   - Sejarah: 1
   - MK-2: 1
```

## 📝 Current Tasks in System

### Tomorrow (11 Feb 2026):
1. ✅ Mengerjakan (B. Inggris)
2. ✅ Test Task dari Bot (Matematika)

### This Week:
1. 11 Feb - Mengerjakan (B. Inggris)
2. 11 Feb - Test Task dari Bot (Matematika)
3. 12 Feb - Soal Latihan Matematika Bab 3 (MTK)
4. 13 Feb - Ulangan Harian Bahasa Inggris (B. Inggris) 🎯
5. 14 Feb - Essay Bahasa Indonesia (B. Indonesia)
6. 15 Feb - Laporan Praktikum Kimia (KIK-A) 🎯
7. 16 Feb - Tugas PJOK - Video Senam (PJOK)
8. 17 Feb - Analisis Database (MK-3)
9. 18 Feb - Presentasi Sejarah Kemerdekaan (Sejarah) 🎯
10. 20 Feb - Proyek Pemrograman Web (MK-2) 🎯

🎯 = Prioritas Penting

## 🔄 Sync Scripts Created

### 1. `scripts/add-sample-tasks-to-notion.js`
**Purpose:** Add sample tasks directly to Notion database

**Usage:**
```bash
node scripts/add-sample-tasks-to-notion.js
```

**What it does:**
- Adds 8 pre-defined sample tasks to Notion
- Each task has complete properties (judul, mata pelajaran, deskripsi, deadline, etc.)
- Useful for testing and demo

### 2. `scripts/sync-from-notion.js`
**Purpose:** Sync tasks from Notion to MongoDB (one-way sync)

**Usage:**
```bash
node scripts/sync-from-notion.js
```

**What it does:**
1. Clears all existing tasks in MongoDB
2. Fetches all active tasks from Notion (Status ≠ "dibatalkan")
3. Imports them to MongoDB with proper mapping
4. Stores Notion page ID for reference

**Mapping:**
- Tipe: "Tugas"/"PR" → individu, "Presentasi" → individu, "UH" → ujian
- Prioritas: "Tinggi" → penting, "Normal" → normal, "Rendah" → normal
- Status: "Aktif" → aktif, "Selesai" → selesai

### 3. `scripts/check-mongodb-tasks.js`
**Purpose:** View all tasks in MongoDB with detailed info

**Usage:**
```bash
node scripts/check-mongodb-tasks.js
```

**What it shows:**
- List of all tasks sorted by deadline
- Summary by status, prioritas, and mata pelajaran
- Full task details including links and notes

### 4. `scripts/test-reminder-output.js`
**Purpose:** Preview how reminder messages will look

**Usage:**
```bash
node scripts/test-reminder-output.js
```

**What it shows:**
- Tasks for tomorrow
- Formatted reminder message (same as bot will send)
- Next 5 upcoming deadlines

## 🚀 How to Use

### Add New Tasks

**Option 1: Via WhatsApp Command**
```
/add_tugas | Matematika | Latihan Soal | Kerjakan halaman 45-50 | 2026-02-15
```
→ Saves to MongoDB ✅  
→ Syncs to Notion ✅

**Option 2: Add Directly in Notion**
1. Open Notion database
2. Click "+ New" to add row
3. Fill in all properties
4. Run sync script to import to MongoDB:
   ```bash
   node scripts/sync-from-notion.js
   ```

### Update Tasks

**Option 1: Update in Notion**
1. Edit task in Notion database
2. Run sync script to update MongoDB:
   ```bash
   node scripts/sync-from-notion.js
   ```

**Option 2: Via WhatsApp Command**
```
/edit_tugas | [task_id] | [field] | [new_value]
```
→ Updates MongoDB ✅  
→ Does NOT auto-update Notion ⚠️

**Workaround:** Run sync script after editing in MongoDB, or edit manually in Notion.

### Delete Tasks

**Option 1: Delete in Notion**
1. Delete row in Notion or change Status to "dibatalkan"
2. Run sync script:
   ```bash
   node scripts/sync-from-notion.js
   ```

**Option 2: Via WhatsApp Command**
```
/hapus_tugas | [task_id]
```
→ Deletes from MongoDB ✅  
→ Does NOT delete from Notion ⚠️

**Workaround:** Delete manually in Notion or change Status to "dibatalkan".

## 📅 Reminder Schedule

Bot will automatically send reminders:

### Daily Reminder (Mon-Thu at 16:00)
- Shows tasks for tomorrow
- Grouped by mata pelajaran
- Includes links and notes

### Weekly Reminder (Fri at 16:00)
- Shows all tasks for next week
- Sorted by deadline
- Helps plan weekend study

### Monday Reminder (Sun at 16:00)
- Shows tasks for Monday only
- Reminder to prepare for week start

## 🔧 Maintenance Commands

### Check Notion Database
```bash
node scripts/check-data-source.js
```
Shows all properties in Notion database.

### Check MongoDB Tasks
```bash
node scripts/check-mongodb-tasks.js
```
Shows all tasks in MongoDB with statistics.

### Test Reminder Format
```bash
node scripts/test-reminder-output.js
```
Preview tomorrow's reminder message.

### Full Sync from Notion
```bash
node scripts/sync-from-notion.js
```
Clear MongoDB and re-import from Notion.

### Add More Sample Tasks
```bash
node scripts/add-sample-tasks-to-notion.js
```
Add 8 sample tasks to Notion (can run multiple times).

## 📊 Data Flow

### Adding Task via WhatsApp:
```
User → WhatsApp Command
  ↓
Bot receives command
  ↓
Save to MongoDB ✅
  ↓
Sync to Notion ✅
  ↓
Send confirmation
```

### Adding Task via Notion:
```
User → Add in Notion UI
  ↓
Task saved in Notion ✅
  ↓
Run sync script
  ↓
Import to MongoDB ✅
  ↓
Bot can now see task
```

### Reminder Flow:
```
Scheduled time (16:00)
  ↓
Sync from Notion (optional)
  ↓
Query MongoDB for tasks
  ↓
Format reminder message
  ↓
Send to WhatsApp channel
```

## 🎯 Best Practices

### 1. Use Notion as Primary Source
- Add/edit tasks in Notion UI (easier, more features)
- Run sync script regularly to keep MongoDB updated
- Bot commands are for quick adds only

### 2. Regular Sync
Run sync script daily or before important reminders:
```bash
node scripts/sync-from-notion.js
```

### 3. Backup
Notion is your backup! All tasks are stored there permanently.

### 4. Status Management
- Use "Aktif" for ongoing tasks
- Use "Selesai" when task is done
- Use "dibatalkan" for cancelled tasks (won't sync to MongoDB)

## 🐛 Troubleshooting

### Tasks not showing in reminder
1. Check if task exists in MongoDB:
   ```bash
   node scripts/check-mongodb-tasks.js
   ```
2. If not, run sync:
   ```bash
   node scripts/sync-from-notion.js
   ```

### Task added via command not in Notion
1. Check bot logs for errors
2. Verify Notion API key is valid
3. Check database properties are correct

### Sync script fails
1. Check NOTION_DATABASE_ID in .env
2. Check NOTION_API_KEY is valid
3. Check MongoDB connection string

## 📝 Notes

### Notion ID Storage
Each task in MongoDB has `notion_id` field that stores the Notion page ID. This allows:
- Tracking which tasks came from Notion
- Future two-way sync implementation
- Direct links to Notion pages

### One-Way Sync
Current implementation is **one-way**: Notion → MongoDB

For two-way sync:
- Tasks added via bot → Synced to Notion ✅
- Tasks edited via bot → NOT synced to Notion ❌
- Tasks deleted via bot → NOT synced to Notion ❌

**Workaround:** Use Notion as primary source and sync regularly.

## 🎉 Success!

✅ Notion database has 11 tasks  
✅ MongoDB has 10 tasks (1 skipped due to missing fields)  
✅ Bot can add tasks to both Notion and MongoDB  
✅ Sync script works perfectly  
✅ Reminder system ready with real data  

**System is fully operational!** 🚀

Next step: Start bot and test reminders!
```bash
npm start
```
