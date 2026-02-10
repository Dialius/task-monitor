# 🧪 Test Reminder Command - Preview Output

## ✅ Command Baru: /test_reminder

Command untuk preview output reminder sebelum reminder otomatis terkirim!

## 📝 Format Command

```
/test_reminder | type
```

### Parameter

| Parameter | Deskripsi | Options | Default |
|-----------|-----------|---------|---------|
| type | Tipe reminder | daily/weekly/monday | daily |

## 🎯 Tipe Reminder

### 1. Daily Reminder (Senin-Kamis 16:00)
Preview reminder harian untuk tugas besok

```
/test_reminder | daily
```

**Output:**
- Format: INFO TUGAS HARIAN
- Tanggal: Besok
- Tugas: Yang deadline besok
- Greeting: Halo halo teman-teman XI PPLG 3!
- Format: Sesuai template user

### 2. Weekly Reminder (Jumat 16:00)
Preview reminder mingguan untuk tugas minggu depan

```
/test_reminder | weekly
```

**Output:**
- Format: INFO TUGAS MINGGUAN
- Periode: Minggu depan (7 hari)
- Tugas: Dikelompokkan per hari (Senin-Jumat)
- Format: Sesuai template user

### 3. Monday Reminder (Minggu 16:00)
Preview reminder khusus untuk tugas hari Senin

```
/test_reminder | monday
```

**Output:**
- Format: INFO TUGAS HARI SENIN
- Tanggal: Senin depan
- Tugas: Yang deadline hari Senin
- Format: Sesuai template user

## 💡 Contoh Penggunaan

### Test Daily Reminder
```
/test_reminder | daily
```

**Response:**
```
🧪 TEST REMINDER OUTPUT

Tipe: DAILY
Total tugas di DB: 5

━━━━━━━━━━━━━━━━━━

🌟 INFO TUGAS HARIAN

📅 Hari ini | Rabu, 12 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
Semoga hari ini tetap sehat, semangat, dan gak ketinggalan info tugas ya 💪

Setelah sekian lama, admin hadir lagi bawa update tugas hari ini. Yuk, disimak baik-baik 👇

━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS HARI INI
━━━━━━━━━━━━━━━━━━

🏃 PJOK
📌 Tugas:
1️⃣ Mempelajari teknik-teknik dalam lompat jauh
2️⃣ Membuat resume 2 lembar
📥 Link Pengumpulan:
https://drive.google.com/...

━━━━━━━━━━━━━━━━━━

💻 MP 1
📌 Tugas:
1️⃣ Mencari dataset baru (angka) di Kaggle
2️⃣ Diprediksi sesuai materi yang sudah diterangkan
⚠️ Catatan:
Materi ini akan diujikan secara lisan pada
📅 Selasa, 10 Februari 2026

━━━━━━━━━━━━━━━━━━

🌟 Penutup

Tetap semangat mengerjakan tugas ya, teman-teman 💪
Terima kasih sudah membaca sampai akhir 🙏

Kalau ada info yang kurang atau salah ketik, silakan kabari admin.
CMIIW 🤗

━━━━━━━━━━━━━━━━━━

✅ Preview berhasil!
💡 Ini adalah preview format reminder yang akan dikirim otomatis.
```

### Test Weekly Reminder
```
/test_reminder | weekly
```

**Response:**
```
🧪 TEST REMINDER OUTPUT

Tipe: WEEKLY
Total tugas di DB: 12

━━━━━━━━━━━━━━━━━━

🌟 INFO TUGAS MINGGUAN

📅 Minggu ke-2 | Feb 2026

🌈 Halo halo teman teman XI PPLG 3!
Gimana kabarnya minggu ini? Semoga tetap semangat dan produktif ya 💪

Nih admin bawain update tugas mingguan biar kalian gak ketinggalan info!
Yuk, cek dari hari Senin sampai Ahad 👇

🗓 Daftar Tugas Mingguan

📖 Senin (10/02/26)
[Matematika] → Persiapan PAS MATEMATIKA
[BK] → Membuat Curriculum Vitae (CV)
[MK3] → Menyelesaikan tugas modul

💻 Selasa (11/02/26)
[PAI] → Menulis di buku tentang kitab kitab yang diturunkan Allah
[MK4] → Melanjutkan membuat xml dari design yang telah dibuat

📚 Rabu (12/02/26)
[MK2] → Menyelesaikan tugas sesuai tutorial

🌿 Kamis (13/02/26)
[Sejarah] → Membuat PPT tentang pemberontakan yang ada di Indonesia
[Bahasa Jawa] → Menentukan PJ dan peran dalam prosesi adat mantu

🎨 Jumat (14/02/26)
→ Belum ada tugas

Udah segitu dulu tugasnya untuk minggu ini yaa 🌻

Kalau ada yang kelewat atau salah ketik, tolong kasih tahu admin ya~
CMIIW

Tetap semangat ngerjain tugasnya, masukan dari kalian sangat berarti supaya info tetap akurat 🤗

━━━━━━━━━━━━━━━━━━

✅ Preview berhasil!
💡 Ini adalah preview format reminder yang akan dikirim otomatis.
```

### Test Monday Reminder
```
/test_reminder | monday
```

**Response:**
```
🧪 TEST REMINDER OUTPUT

Tipe: MONDAY
Total tugas di DB: 3

━━━━━━━━━━━━━━━━━━

🌟 INFO TUGAS HARI SENIN

📅 Senin, 10 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
...

━━━━━━━━━━━━━━━━━━

✅ Preview berhasil!
💡 Ini adalah preview format reminder yang akan dikirim otomatis.
```

## 🔍 Kapan Pakai Command Ini?

### Use Case 1: Test Format Setelah Add Tugas
```
1. Add tugas baru: /add_tugas | ...
2. Test preview: /test_reminder | daily
3. Cek apakah format sudah sesuai
```

### Use Case 2: Verify Data Sebelum Reminder
```
1. Hari Kamis sore (sebelum reminder Jumat)
2. Test: /test_reminder | weekly
3. Pastikan semua tugas minggu depan sudah ada
```

### Use Case 3: Debug Format Issues
```
1. Ada komplain format reminder salah
2. Test: /test_reminder | daily
3. Lihat output dan fix jika perlu
```

### Use Case 4: Preview Setelah Sync Notion
```
1. Add banyak tugas di Notion
2. Bot sync (manual atau auto)
3. Test: /test_reminder | daily
4. Verify semua tugas ter-sync
```

## ⚠️ Catatan Penting

### 1. Butuh Data di Database
Command ini butuh tugas di database. Jika database kosong:
```
❌ Tidak ada tugas di database!

💡 Tambah tugas dulu dengan /add_tugas
```

### 2. Filter Berdasarkan Deadline
- **Daily**: Hanya tugas yang deadline besok
- **Weekly**: Tugas dalam 7 hari ke depan
- **Monday**: Hanya tugas yang deadline hari Senin depan

### 3. Tidak Kirim ke Channel
Command ini **HANYA PREVIEW**, tidak kirim ke channel WhatsApp. Hanya kamu yang lihat output-nya.

### 4. Format Sama dengan Reminder Otomatis
Output command ini **100% sama** dengan yang akan dikirim otomatis oleh scheduler.

## 🎯 Workflow Testing

### Before Production
```
1. Add sample tasks
2. Test all reminder types:
   - /test_reminder | daily
   - /test_reminder | weekly
   - /test_reminder | monday
3. Verify format sesuai
4. Deploy to production
```

### After Changes
```
1. Update RecapFormatter.ts
2. Rebuild: npm run build
3. Restart bot: pm2 restart all
4. Test: /test_reminder | daily
5. Verify changes applied
```

### Regular Checks
```
Setiap hari Kamis:
1. /test_reminder | weekly
2. Pastikan tugas minggu depan lengkap
3. Add tugas yang kurang (jika ada)
```

## 🔧 Troubleshooting

### Output Kosong
**Problem:** Preview tidak menampilkan tugas

**Solution:**
1. Cek database: `db.tasks.find({ status: 'aktif' })`
2. Pastikan ada tugas dengan deadline yang sesuai
3. Add tugas test: `/add_tugas | Test | Test | 2026-02-12 | Matematika | individu`

### Format Salah
**Problem:** Format tidak sesuai template

**Solution:**
1. Cek `src/utils/RecapFormatter.ts`
2. Update format sesuai kebutuhan
3. Rebuild: `npm run build`
4. Restart: `pm2 restart all`
5. Test lagi: `/test_reminder | daily`

### Error "Type not valid"
**Problem:** Tipe reminder salah

**Solution:**
Gunakan salah satu dari:
- `daily`
- `weekly`
- `monday`

(lowercase, no typo)

## 📊 Comparison: Test vs Auto Reminder

| Aspect | /test_reminder | Auto Reminder |
|--------|----------------|---------------|
| Trigger | Manual command | Scheduler (cron) |
| Target | Hanya kamu | Semua di channel |
| Timing | Kapan saja | Sesuai jadwal |
| Data | Real-time dari DB | Sync dari Notion dulu |
| Purpose | Testing/Preview | Production |

## 💡 Tips

### Tip 1: Test Sebelum Deadline
Test reminder sebelum waktu reminder otomatis untuk pastikan data lengkap.

### Tip 2: Use for Documentation
Screenshot output test reminder untuk dokumentasi format.

### Tip 3: Verify After Notion Sync
Setelah add banyak tugas di Notion, test untuk verify sync berhasil.

### Tip 4: Debug Tool
Gunakan untuk debug jika ada komplain format reminder salah.

### Tip 5: Training Tool
Gunakan untuk training admin baru tentang format reminder.

## 🎬 Summary

**Command `/test_reminder` berguna untuk:**
- ✅ Preview format reminder sebelum terkirim
- ✅ Verify data tugas di database
- ✅ Debug format issues
- ✅ Test setelah perubahan code
- ✅ Training dan dokumentasi

**Tidak untuk:**
- ❌ Kirim reminder ke channel (gunakan scheduler)
- ❌ Add tugas (gunakan `/add_tugas`)
- ❌ Edit format (edit `RecapFormatter.ts`)

---

**Happy testing! 🧪**
