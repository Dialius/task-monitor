# ⚡ Quick Test Commands

## ✅ Bot Status
- ✅ Build: Success
- ✅ Bot: Running (Process ID: 5)
- ✅ WhatsApp: Connected
- ✅ Command Parser: Fixed (supports natural language)

---

## 🎯 Test Natural Language Task Creation (NEW!)

### Test 1: Simple Task
```
/add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10
```
**Then reply:** `ya`

---

### Test 2: Complex with Keywords
```
/add_tugas_cepat Ujian fisika minggu depan jam 9, bawa kalkulator, urgent
```
**Then reply:** `ya`

---

### Test 3: Edit Before Confirm
```
/add_tugas_cepat Besok tugas bahasa indonesia bikin puisi
```
**Then reply:** `edit prioritas penting`
**Then reply:** `ya`

---

### Test 4: Cancel
```
/add_tugas_cepat Test cancel
```
**Then reply:** `batal`

---

### Test 5: Relative Dates
```
/add_tugas_cepat Lusa ada tugas kelompok IPA, deadline jam 14:00
```
**Then reply:** `ya`

---

## 📋 Test Multi-line Description

### View Today's Tasks
```
/tugas_hari_ini
```
**Expected:** Multi-line descriptions with bullets preserved

---

### View All Tasks
```
/tugas
```

---

## 🔄 Test Auto-Edit (Manual Trigger)

### Step 1: Create Task
```
/add_tugas | Test Auto Edit | Deskripsi awal | 2026-02-15 | Matematika | individu
```
**Note the task ID from response**

---

### Step 2: Update in Notion
1. Open Notion database
2. Find task "Test Auto Edit"
3. Change description to: "Deskripsi sudah diupdate!"
4. Change priority to: "urgent"

---

### Step 3: Wait or Restart
- **Option A:** Wait 1 hour for cron
- **Option B:** Restart bot to trigger sync now

---

### Step 4: Verify
- Scroll up to original message
- Should show "edited" label
- Content should be updated

---

## 🧪 Other Useful Commands

### Check Status
```
/status
```

---

### View Help
```
/help
```

---

### Test Reminder Format
```
/test_reminder | daily
```

---

## 📊 Expected Responses

### Natural Language Success
```
🤖 Saya deteksi informasi berikut:

📝 Judul: Tugas Matematika
📚 Mata Pelajaran: Matematika
📄 Deskripsi: Halaman 45-50
📅 Deadline: 11 Feb 2026, 10:00
👤 Tipe: Individu
🟢 Prioritas: Normal

Apakah sudah benar?
• Ketik ya untuk simpan
• Ketik edit [field] [value] untuk ubah
• Ketik batal untuk cancel
```

---

### Task Created
```
✅ Tugas berhasil ditambahkan!

📝 Tugas Matematika
🟢 Matematika • 11 Feb
🆔 `67890abcdef`
✨ Synced to Notion
```

---

### Edit Applied
```
✅ prioritas berhasil diubah!

🤖 Saya deteksi informasi berikut:
...
🟡 Prioritas: Penting  ← Updated!
...
```

---

## 🎨 Emoji Reference

### Priority
- 🚨 Urgent
- ⚠️ Penting
- ℹ️ Normal

### Type
- 👤 Individu
- 👥 Kelompok
- 📝 Ujian

### Status
- ✅ Success
- ❌ Error
- ⏱️ Timeout
- 🤖 AI Response

---

## 💡 Pro Tips

1. **Natural Language Tips:**
   - Mention subject name clearly
   - Use relative dates: "besok", "lusa", "minggu depan"
   - Use keywords: "ujian", "kelompok", "urgent"
   - Be specific with time: "jam 10", "deadline 14:00"

2. **Edit Tips:**
   - Can edit multiple fields before confirming
   - Each edit shows updated preview
   - Timeout is 60 seconds from last interaction

3. **Auto-Edit Tips:**
   - Only significant changes trigger edits
   - Cron runs every hour at :00
   - Check logs for edit operations
   - Messages show "edited" label in WhatsApp

---

**Ready to test! 🚀**
