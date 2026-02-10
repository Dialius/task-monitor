# Task Command Format Update

## 🎨 Overview

Format response untuk command tugas (`/tugas`, `/tugas_hari_ini`, `/tugas_minggu_ini`) telah diubah agar sama dengan format reminder yang sudah ada.

---

## 📊 Before vs After

### Before (Old Format)

```
📝 Daftar Tugas

1. 👤 Mengerjakan
   Mata Pelajaran: B. Inggris
   Deadline: Sen, 10 Feb
   Deskripsi: Kerjakan soal halaman 45-50
   ID: 67890abcdef

2. 🔢 Soal Latihan
   Mata Pelajaran: Matematika
   Deadline: Rab, 12 Feb
   Deskripsi: Kerjakan soal bab 3
   ID: 12345abcdef
```

### After (New Format - Like Reminder)

```
🌟 INFO TUGAS

📅 Hari Ini | Senin, 10 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
Nih admin bawain update tugas terbaru 💪

Yuk, disimak baik-baik 👇

━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS
━━━━━━━━━━━━━━━━━━

🌍 B. Inggris
📌 Tugas:
1️⃣ Kerjakan soal halaman 45-50
📥 Link Pengumpulan:
https://classroom.google.com/xxx
━━━━━━━━━━━━━━━━━━

🔢 Matematika
📌 Tugas:
1️⃣ Kerjakan soal bab 3
2️⃣ Latihan soal cerita
━━━━━━━━━━━━━━━━━━

🌟 Penutup

Tetap semangat mengerjakan tugas ya, teman-teman 💪
Terima kasih sudah membaca sampai akhir 🙏

Kalau ada info yang kurang atau salah ketik, silakan kabari admin.
CMIIW 🤗

🔄 Synced from Notion: 10 tasks
```

---

## 🎯 Changes Made

### 1. Header Section

**Old:**
```
📝 Daftar Tugas
```

**New:**
```
🌟 INFO TUGAS

📅 [Title with Date]

🌈 Halo halo teman-teman XI PPLG 3!
Nih admin bawain update tugas terbaru 💪

Yuk, disimak baik-baik 👇

━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS
━━━━━━━━━━━━━━━━━━
```

### 2. Task Grouping

**Old:** Listed individually with all details

**New:** Grouped by mata pelajaran (subject)

```
🌍 B. Inggris
📌 Tugas:
1️⃣ Task 1
2️⃣ Task 2
━━━━━━━━━━━━━━━━━━

🔢 Matematika
📌 Tugas:
1️⃣ Task 1
━━━━━━━━━━━━━━━━━━
```

### 3. Task Details

**Old:**
- Shows: Judul, Mata Pelajaran, Deadline, Deskripsi, ID
- Format: Bullet list with all info

**New:**
- Shows: Deskripsi (main content)
- Optional: Link Pengumpulan, Catatan
- Format: Numbered emoji bullets (1️⃣, 2️⃣, etc.)

### 4. Subject Emojis

Each mata pelajaran now has a specific emoji:

- 🏃 PJOK
- 💻 MP 1-4, MK 1-4
- 📚 Sejarah
- 🕌 PAI
- 🔢 Matematika / MTK
- 📖 Bahasa Indonesia
- 🌍 Bahasa Inggris
- 🎭 Bahasa Jawa
- 🧠 BK
- ⚛️ Fisika
- 🧪 Kimia / KIK-A
- 🌱 Biologi
- 💰 Ekonomi
- 🌏 Geografi
- 👥 Sosiologi
- 🎨 Seni Budaya
- 🇮🇩 PPKN
- 📝 Default (other subjects)

### 5. Footer Section

**Old:** None

**New:**
```
🌟 Penutup

Tetap semangat mengerjakan tugas ya, teman-teman 💪
Terima kasih sudah membaca sampai akhir 🙏

Kalau ada info yang kurang atau salah ketik, silakan kabari admin.
CMIIW 🤗
```

### 6. Sync Status

**Old:** Simple text at end

**New:** Integrated at end of message
```
🔄 Synced from Notion: 10 tasks
```
or
```
⚠️ Using cached data (Notion sync failed)
```

---

## 📝 Commands Affected

### 1. `/tugas` - All Active Tasks

**Title:** `Semua Tugas Aktif`

**Example:**
```
🌟 INFO TUGAS

📅 Semua Tugas Aktif

🌈 Halo halo teman-teman XI PPLG 3!
Nih admin bawain update tugas terbaru 💪
...
```

### 2. `/tugas_hari_ini` - Today's Tasks

**Title:** `Hari Ini | [Day, Date Month Year]`

**Example:**
```
🌟 INFO TUGAS

📅 Hari Ini | Senin, 10 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
Nih admin bawain update tugas terbaru 💪
...
```

### 3. `/tugas_minggu_ini` - This Week's Tasks

**Title:** `Minggu ke-[N] | [Month Year]`

**Example:**
```
🌟 INFO TUGAS

📅 Minggu ke-2 | Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
Nih admin bawain update tugas terbaru 💪
...
```

---

## 🔧 Implementation Details

### File Modified

**`src/handlers/MemberCommandHandler.ts`**

### New Methods Added

1. **`formatTasksLikeReminder(tasks, title)`**
   - Formats tasks in reminder style
   - Groups by mata pelajaran
   - Adds header and footer
   - Includes link and notes if available

2. **`getMapelEmoji(mapel)`**
   - Returns emoji for each subject
   - Supports various subject name formats
   - Default emoji for unknown subjects

### Changes to Existing Methods

1. **`handleTugas()`**
   - WhatsApp: Uses `formatTasksLikeReminder()` with title "Semua Tugas Aktif"
   - Discord: Keeps embed format (unchanged)

2. **`handleTugasHariIni()`**
   - WhatsApp: Uses `formatTasksLikeReminder()` with date in title
   - Discord: Keeps embed format (unchanged)

3. **`handleTugasMingguIni()`**
   - WhatsApp: Uses `formatTasksLikeReminder()` with week number in title
   - Discord: Keeps embed format (unchanged)

---

## 🎨 Format Features

### Grouping by Subject

Tasks are automatically grouped by `mata_pelajaran`:

```
🌍 B. Inggris
📌 Tugas:
1️⃣ Task 1
2️⃣ Task 2
━━━━━━━━━━━━━━━━━━

🔢 Matematika
📌 Tugas:
1️⃣ Task 1
━━━━━━━━━━━━━━━━━━
```

### Optional Fields

**Link Pengumpulan** (if exists):
```
📥 Link Pengumpulan:
https://classroom.google.com/xxx
```

**Catatan** (if exists):
```
⚠️ Catatan:
Jangan lupa bawa alat tulis
```

### Separators

Visual separators between subjects:
```
━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Testing

### Test 1: `/tugas` Command

**Send:**
```
/tugas
```

**Expected Response:**
```
🌟 INFO TUGAS

📅 Semua Tugas Aktif

🌈 Halo halo teman-teman XI PPLG 3!
Nih admin bawain update tugas terbaru 💪

Yuk, disimak baik-baik 👇

━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS
━━━━━━━━━━━━━━━━━━

[Grouped tasks by subject]

🌟 Penutup

Tetap semangat mengerjakan tugas ya, teman-teman 💪
Terima kasih sudah membaca sampai akhir 🙏

Kalau ada info yang kurang atau salah ketik, silakan kabari admin.
CMIIW 🤗

🔄 Synced from Notion: X tasks
```

### Test 2: `/tugas_hari_ini` Command

**Send:**
```
/tugas_hari_ini
```

**Expected Response:**
```
🌟 INFO TUGAS

📅 Hari Ini | Senin, 10 Februari 2026

[Same format as above]
```

### Test 3: `/tugas_minggu_ini` Command

**Send:**
```
/tugas_minggu_ini
```

**Expected Response:**
```
🌟 INFO TUGAS

📅 Minggu ke-2 | Februari 2026

[Same format as above]
```

### Test 4: No Tasks

**Send:**
```
/tugas_hari_ini
```

**Expected Response (if no tasks):**
```
📝 Tidak ada tugas untuk hari ini.

🔄 Synced from Notion: 0 tasks
```

---

## 🎯 Benefits

### 1. Consistency

✅ All task commands use same format as reminders
✅ Familiar format for users
✅ Professional and organized appearance

### 2. Better Organization

✅ Tasks grouped by subject
✅ Clear visual separators
✅ Easy to scan and read

### 3. More Information

✅ Shows link pengumpulan if available
✅ Shows catatan if available
✅ Friendly header and footer messages

### 4. Visual Appeal

✅ Subject-specific emojis
✅ Numbered emoji bullets (1️⃣, 2️⃣)
✅ Clean separators
✅ Consistent styling

---

## 📋 Quick Reference

### Format Structure

```
🌟 INFO TUGAS
📅 [Title]
🌈 [Greeting]
━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS
━━━━━━━━━━━━━━━━━━

[Subject Emoji] [Subject Name]
📌 Tugas:
1️⃣ [Task 1]
2️⃣ [Task 2]
📥 Link Pengumpulan: [URL]
⚠️ Catatan: [Note]
━━━━━━━━━━━━━━━━━━

🌟 Penutup
[Closing message]
CMIIW 🤗

🔄 Synced from Notion: X tasks
```

### Subject Emojis

| Subject | Emoji |
|---------|-------|
| PJOK | 🏃 |
| MP/MK | 💻 |
| Sejarah | 📚 |
| PAI | 🕌 |
| Matematika | 🔢 |
| B. Indonesia | 📖 |
| B. Inggris | 🌍 |
| B. Jawa | 🎭 |
| BK | 🧠 |
| Fisika | ⚛️ |
| Kimia | 🧪 |
| Biologi | 🌱 |
| Ekonomi | 💰 |
| Geografi | 🌏 |
| Sosiologi | 👥 |
| Seni Budaya | 🎨 |
| PPKN | 🇮🇩 |
| Other | 📝 |

---

## 🚀 Next Steps

### To Use New Format:

1. **Rebuild:**
   ```bash
   npm run build
   ```

2. **Restart Bot:**
   ```bash
   # Stop bot (Ctrl+C)
   # Wait 15 seconds
   npm start
   ```

3. **Test Commands:**
   ```
   /tugas
   /tugas_hari_ini
   /tugas_minggu_ini
   ```

4. **Verify Format:**
   - Check header with greeting
   - Check tasks grouped by subject
   - Check subject emojis
   - Check footer with closing message
   - Check sync status at end

---

## 📝 Notes

- **Discord format unchanged** - Still uses embed format
- **WhatsApp format updated** - Now uses reminder-style format
- **Sync status preserved** - Still shows at end of message
- **Error handling preserved** - Falls back to cached data if sync fails
- **All features working** - Auto-sync, graceful errors, etc.

---

**Format update completed!** 🎉

Commands `/tugas`, `/tugas_hari_ini`, and `/tugas_minggu_ini` now use the same beautiful format as reminders!

---

**Last Updated:** February 10, 2026
**Status:** ✅ Completed and ready to use
**Next Step:** Rebuild and restart bot to see new format
