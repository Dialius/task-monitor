# 🧪 Testing Guide - Multi-Feature Enhancement

## 📋 Status Bot

Bot sudah running! Lihat output di atas untuk QR code WhatsApp.

**Status:**
- ✅ Build: Success
- ✅ Bot: Running (Process ID: 4)
- ⏳ WhatsApp: Waiting for QR scan
- ❌ Discord: Disabled

---

## 🎯 Fitur yang Akan Ditest

### 1. Multi-line Description Support ✅
Deskripsi dari Notion dengan bullets dan paragraphs akan ditampilkan dengan format yang benar.

### 2. Auto-Edit Messages ✅
Bot akan otomatis edit pesan yang sudah dikirim jika ada perubahan di Notion (cron setiap 1 jam).

### 3. Natural Language Task Creation ✅
Buat tugas dengan bahasa natural menggunakan `/add_tugas_cepat`.

---

## 📱 Cara Setup WhatsApp

1. **Scan QR Code** yang muncul di terminal dengan WhatsApp kamu
2. Tunggu sampai muncul "✅ WhatsApp connected"
3. Bot siap menerima command!

---

## 🧪 Test Scenarios

### Test 1: Multi-line Description dari Notion

**Langkah:**
1. Buka Notion database kamu
2. Edit task yang sudah ada, ubah deskripsi jadi multi-line:
   ```
   - Tugas halaman 45-50
   - Kerjakan soal nomor 1-10
   - Deadline besok jam 10
   ```
3. Kirim command di WhatsApp:
   ```
   /tugas_hari_ini
   ```

**Expected Result:**
- Deskripsi ditampilkan dengan bullets dan newlines
- Format preserved exactly seperti di Notion

---

### Test 2: Natural Language Task Creation

#### Test 2.1: Simple Task
**Command:**
```
/add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10
```

**Expected Result:**
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

Contoh edit:
• edit prioritas urgent
• edit deadline 2026-02-15 10:00
• edit tipe kelompok

⏱️ Konfirmasi akan expired dalam 60 detik
```

**Lanjutan - Confirm:**
```
ya
```

**Expected Result:**
```
✅ Tugas berhasil ditambahkan!

📝 Tugas Matematika
🟢 Matematika • 11 Feb
🆔 `[task_id]`
✨ Synced to Notion
```

---

#### Test 2.2: Complex Task with Keywords
**Command:**
```
/add_tugas_cepat Ujian fisika minggu depan jam 9, bawa kalkulator, urgent
```

**Expected Result:**
- Tipe: Ujian (detected from "ujian")
- Prioritas: Urgent (detected from "urgent")
- Deadline: Next week at 09:00

---

#### Test 2.3: Edit Before Confirm
**Command:**
```
/add_tugas_cepat Besok tugas bahasa indonesia bikin puisi
```

**Bot Response:**
```
🤖 Saya deteksi informasi berikut:
...
```

**Edit Command:**
```
edit prioritas penting
```

**Expected Result:**
```
✅ prioritas berhasil diubah!

🤖 Saya deteksi informasi berikut:
...
🟡 Prioritas: Penting  ← Updated!
...
```

**Then Confirm:**
```
ya
```

---

#### Test 2.4: Cancel Task
**Command:**
```
/add_tugas_cepat Test cancel
```

**Cancel:**
```
batal
```

**Expected Result:**
```
❌ Pembuatan tugas dibatalkan.
```

---

#### Test 2.5: Timeout Test
**Command:**
```
/add_tugas_cepat Test timeout
```

**Wait 60+ seconds, then type:**
```
ya
```

**Expected Result:**
```
⏱️ Konfirmasi sudah expired. Silakan gunakan /add_tugas_cepat lagi.
```

---

### Test 3: Auto-Edit Messages

**Setup:**
1. Kirim command untuk create task:
   ```
   /add_tugas Tugas Test | Deskripsi awal | 2026-02-15 | Matematika | individu
   ```

2. Bot akan reply dengan task ID, contoh:
   ```
   ✅ Tugas ditambahkan!
   
   📝 Tugas Test
   🟢 Matematika • 15 Feb
   🆔 `67890abcdef`
   ```

3. **Update task di Notion:**
   - Buka Notion database
   - Cari task "Tugas Test"
   - Ubah deskripsi jadi: "Deskripsi yang sudah diupdate"
   - Ubah prioritas jadi: "urgent"

4. **Tunggu cron job (1 jam) ATAU trigger manual:**
   - Cron akan run otomatis setiap jam (00:00, 01:00, 02:00, dst)
   - Atau restart bot untuk trigger sync

5. **Expected Result:**
   - Pesan yang sudah dikirim akan di-edit otomatis
   - Deskripsi berubah jadi "Deskripsi yang sudah diupdate"
   - Prioritas berubah jadi 🚨 (urgent)

**Cara Verify:**
- Scroll up ke pesan task yang tadi
- Pesan akan ada label "edited" di WhatsApp
- Isi pesan sudah berubah sesuai update di Notion

---

## 🎨 Contoh Command Lengkap

### Admin Commands (16 total)

#### Task Management
```bash
# 1. Add task (manual format)
/add_tugas | Essay Sejarah | Tulis essay tentang kemerdekaan | 2026-02-25 | Sejarah | individu

# 2. Add task (natural language) ⭐ NEW!
/add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10

# 3. Edit task
/edit_tugas | [task_id] | prioritas | urgent

# 4. Delete task
/hapus_tugas | [task_id]

# 5. Mark complete
/tandai_selesai | [task_id]
```

#### Schedule Management
```bash
# 6. Add schedule
/add_jadwal | Senin | 08:00 | 09:30 | Matematika | R.101 | Pak Budi

# 7. Edit schedule
/edit_jadwal | [schedule_id] | ruangan | R.202

# 8. Delete schedule
/hapus_jadwal | [schedule_id]

# 9. Change schedule with announcement
/ganti_jadwal | [schedule_id] | ruangan | R.202 | Ruangan lama sedang renovasi
```

#### Piket Management
```bash
# 10. Set piket
/set_piket | Senin | Budi,081234567890 | Ani,081234567891

# 11. Edit piket
/edit_piket | Senin | Citra,081234567892 | Doni,081234567893
```

#### Announcement & Broadcast
```bash
# 12. Add announcement
/add_pengumuman | 2026-02-15 | Libur Nasional | acara | Sekolah libur

# 13. Delete announcement
/hapus_pengumuman | [announcement_id]

# 14. Broadcast
/broadcast | Pengumuman penting untuk semua

# 15. Broadcast urgent
/broadcast_urgent | SEGERA! Jadwal berubah hari ini

# 16. Test reminder
/test_reminder | daily
/test_reminder | weekly
/test_reminder | monday
```

---

### Member Commands (12 total)

```bash
# 1. Help
/help
/bantuan

# 2. Status
/status

# 3. View tasks
/tugas                    # All active tasks
/tugas_hari_ini          # Today's tasks
/tugas_minggu_ini        # This week's tasks

# 4. View schedule
/jadwal                  # Today's schedule
/jadwal_hari_ini         # Today's schedule
/jadwal_besok            # Tomorrow's schedule
/jadwal_minggu_ini       # This week's schedule

# 5. View piket
/piket                   # Today's piket
/piket_minggu_ini        # This week's piket
```

---

## 🔍 Verification Checklist

### Feature 1: Multi-line Description
- [ ] Single line description works
- [ ] Multi-line with bullets works
- [ ] Multi-line with paragraphs works
- [ ] Mixed bullets and paragraphs work
- [ ] Special characters preserved

### Feature 2: Auto-Edit Messages
- [ ] Message tracking saves after sending
- [ ] Cron job runs every hour
- [ ] Task update detected
- [ ] WhatsApp message edited
- [ ] Edit count incremented
- [ ] Logs show edit operations

### Feature 3: Natural Language
- [ ] Simple input parsed correctly
- [ ] Complex input with keywords works
- [ ] Relative dates calculated correctly
- [ ] Confirmation flow works
- [ ] Edit command works
- [ ] Cancel works
- [ ] Timeout works
- [ ] Task created and synced to Notion

---

## 📊 Expected Logs

### Successful Natural Language Parse
```
]: Parsing natural language for add_tugas_cepat {"userId":"628994630519","input":"Besok ada tugas matematika"}
]: Stored pending confirmation {"userId":"628994630519","platform":"whatsapp"}
```

### Successful Task Creation
```
]: Task synced to Notion {"taskId":"67890abcdef","notionId":"abc123"}
]: Removed pending confirmation {"userId":"628994630519"}
```

### Successful Auto-Edit
```
]: Starting change detection...
]: Notion sync successful {"attempt":1,"synced":5,"errors":0}
]: Found tasks needing edit {"count":2}
]: Task messages edited {"taskId":"67890abcdef","success":2,"failed":0}
]: Change detection completed {"synced":5,"edited":4,"errors":0}
```

---

## 🐛 Troubleshooting

### Issue: Bot tidak respond
**Solution:**
1. Check bot masih running: `npm run pm2:status`
2. Check WhatsApp connected
3. Check command format benar (pakai `/` di awal)

### Issue: Natural language parsing gagal
**Solution:**
1. Check AI service configured (GROQ_API_KEY atau GEMINI_API_KEY)
2. Input harus cukup detail (min 10 karakter)
3. Coba format lebih jelas: "Besok tugas [mapel] [deskripsi] deadline [waktu]"

### Issue: Auto-edit tidak jalan
**Solution:**
1. Check cron job started: Lihat log "Change detection cron started"
2. Tunggu 1 jam untuk cron run otomatis
3. Atau restart bot untuk trigger sync
4. Check task ada sent_messages di database

### Issue: Notion sync gagal
**Solution:**
1. Check NOTION_API_KEY dan NOTION_DATABASE_ID di .env
2. Check internet connection
3. Check Notion database accessible
4. Lihat log untuk error details

---

## 🎯 Success Criteria

✅ **All features working if:**
1. Multi-line descriptions display correctly
2. Natural language creates tasks with 90%+ accuracy
3. Auto-edit updates messages within 1 hour
4. No crashes or errors in logs
5. All commands respond correctly

---

## 📝 Notes

- **Cron Schedule:** Every hour at minute 0 (00:00, 01:00, 02:00, etc.)
- **Confirmation Timeout:** 60 seconds
- **AI Timeout:** 10 seconds
- **Notion Retry:** Max 3 attempts with exponential backoff (2s, 4s, 8s)
- **Message Edit:** No time limit on WhatsApp channels/groups

---

## 🚀 Quick Start Testing

1. **Scan QR code** di terminal
2. **Test natural language:**
   ```
   /add_tugas_cepat Besok tugas matematika halaman 10-15 deadline jam 10
   ```
3. **Confirm:**
   ```
   ya
   ```
4. **View task:**
   ```
   /tugas_hari_ini
   ```
5. **Update di Notion** (ubah deskripsi atau prioritas)
6. **Tunggu 1 jam** atau restart bot
7. **Check pesan** - should be auto-edited!

---

**Happy Testing! 🎉**
