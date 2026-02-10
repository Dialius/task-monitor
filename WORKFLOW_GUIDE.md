# 📋 Workflow Guide - WhatsApp Reminder Bot

## 🎯 Konsep

Bot ini dirancang untuk:
1. **Notion** = Input & manage tugas (via web/mobile app)
2. **Bot** = Sync data dari Notion & kirim reminder otomatis
3. **WhatsApp** = Terima reminder (read-only, no commands)

## 🔄 Workflow

```
┌─────────────┐
│   Notion    │  ← Input tugas di sini (web/mobile)
│  Database   │
└──────┬──────┘
       │
       │ Sync (otomatis sebelum reminder)
       ▼
┌─────────────┐
│   MongoDB   │  ← Bot simpan data di sini
│  (Cache)    │
└──────┬──────┘
       │
       │ Format & kirim
       ▼
┌─────────────┐
│  WhatsApp   │  ← Terima reminder (read-only)
│   Channel   │
└─────────────┘
```

## 📅 Schedule Reminder

### Senin - Kamis (16:00)
**Reminder Harian** - Tugas besok
```
🌟 INFO TUGAS HARIAN
📅 Hari ini | Selasa, 11 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
...
```

### Jumat (16:00)
**Reminder Mingguan** - Tugas minggu depan
```
🌟 INFO TUGAS MINGGUAN
📅 Minggu ke-2 | Feb 2026

🌈 Halo halo teman teman XI PPLG 3!
...
```

### Minggu (16:00)
**Reminder Senin** - Tugas hari Senin
```
🌟 INFO TUGAS HARI SENIN
📅 Senin, 10 Februari 2026
...
```

## 🗂️ Cara Pakai

### 1. Setup Notion Database

#### A. Share Database yang Sudah Ada
```
1. Buka database di Notion
2. Klik "Share" (kanan atas)
3. Klik "Invite"
4. Pilih integration "Class Reminder Bot"
5. Klik "Invite"
```

#### B. Atau Buat Database Baru
```bash
# 1. Buat page kosong di Notion
# 2. Share page dengan integration
# 3. Copy Page ID dari URL
# 4. Run script:
node scripts/test-notion.js create <PAGE_ID>

# 5. Copy Database ID ke .env
NOTION_DATABASE_ID=xxx
```

### 2. Input Tugas di Notion

Buka Notion database dan tambah tugas baru:

| Field | Value | Required |
|-------|-------|----------|
| Judul | Latihan Soal Matematika | ✅ |
| Mata Pelajaran | Matematika | ✅ |
| Deskripsi | Mengerjakan soal hal 45-50 | ✅ |
| Deadline | 2026-02-15 23:59 | ✅ |
| Tipe | Individu | ✅ |
| Prioritas | Normal | ✅ (auto) |
| Status | Aktif | ✅ |
| Link Pengumpulan | https://drive.google.com/... | ❌ |
| Catatan | Dikumpulkan dalam PDF | ❌ |

### 3. Bot Otomatis Sync & Kirim

Bot akan:
1. **Sync dari Notion** sebelum kirim reminder
2. **Format pesan** sesuai template
3. **Kirim ke WhatsApp** channel pada jadwal yang ditentukan

## 📝 Format Pesan

### Daily Reminder
```
🌟 INFO TUGAS HARIAN

📅 Hari ini | Selasa, 3 Februari 2026

🌈 Halo halo teman-teman XI PPLG 3!
Semoga hari ini tetap sehat, semangat, dan gak ketinggalan info tugas ya 💪

Setelah sekian lama, admin hadir lagi bawa update tugas hari ini. Yuk, disimak baik-baik 👇

━━━━━━━━━━━━━━━━━━
🗓 DAFTAR TUGAS HARI INI
━━━━━━━━━━━━━━━━━━

🏃 PJOK
📌 Tugas:
1️⃣ Mempelajari teknik-teknik dalam lompat jauh
2️⃣ Membuat resume 2 lembar, berisi:
   a. Pengertian atletik dan lompat jauh
   b. Menjelaskan gaya-gaya dalam lompat jauh
   c. Menjelaskan cara melakukan salah satu teknik lompat jauh beserta gambarnya
3️⃣ Dikumpulkan dalam bentuk PDF
📥 Link Pengumpulan:
https://drive.google.com/drive/folders/xxx

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
```

### Weekly Reminder
```
🌟 INFO TUGAS MINGGUAN

📅 Minggu ke-2 | Feb 2026

🌈 Halo halo teman teman XI PPLG 3!
Gimana kabarnya minggu ini? Semoga tetap semangat dan produktif ya 💪

Nih admin bawain update tugas mingguan biar kalian gak ketinggalan info!
Yuk, cek dari hari Senin sampai Ahad 👇

🗓 Daftar Tugas Mingguan

📖 Senin (10/02/26)
[Matematika] → Persiapan PAS MATEMATIKA
Kelompok mtk:
1. Inka, Vanesha
2. Mita, Calysta
...

[BK] → Membuat Curriculum Vitae (CV)

[MK3] → Menyelesaikan tugas modul
Link: https://docs.google.com/document/d/xxx

💻 Selasa (11/02/26)
[PAI] → Menulis di buku tentang kitab kitab yang diturunkan Allah
[MK4] → Melanjutkan membuat xml dari design yang telah dibuat

📚 Rabu (12/02/26)
[MK2] → Menyelesaikan tugas sesuai tutorial
Link: https://youtu.be/xxx

🌿 Kamis (13/02/26)
[Sejarah] → Membuat PPT tentang pemberontakan yang ada di Indonesia
[Bahasa Jawa] → Menentukan PJ dan peran dalam prosesi adat mantu

🎨 Jumat (14/02/26)
→ Belum ada tugas

Udah segitu dulu tugasnya untuk minggu ini yaa 🌻

Kalau ada yang kelewat atau salah ketik, tolong kasih tahu admin ya~
CMIIW

Tetap semangat ngerjain tugasnya, masukan dari kalian sangat berarti supaya info tetap akurat 🤗
```

## ⚙️ Configuration

### .env File
```env
# WhatsApp
WHATSAPP_ENABLED=true
WHATSAPP_GROUP_ID=120363424833026714@newsletter

# Notion
NOTION_API_KEY=ntn_xxx
NOTION_DATABASE_ID=xxx

# Schedule (Asia/Jakarta)
TIMEZONE=Asia/Jakarta
DAILY_REMINDER_TIME=16:00
WEEKLY_REMINDER_DAY=5
WEEKLY_REMINDER_TIME=16:00
```

### Scheduler
- **Daily**: Senin-Kamis 16:00 (tugas besok)
- **Weekly**: Jumat 16:00 (tugas minggu depan)
- **Monday**: Minggu 16:00 (tugas hari Senin)

## 🔧 Maintenance

### Manual Sync
Jika perlu sync manual (tidak perlu tunggu jadwal):
```bash
# Coming soon: Manual sync command
npm run sync:notion
```

### Check Sync Status
```bash
npm run test:notion
```

Output:
```
✅ Notion connection successful!
✅ Database access successful!
📊 Found 15 item(s) in database

Sync Stats:
- Notion tasks: 15
- MongoDB tasks: 15
- Last sync: 2026-02-10 15:30:00
```

### Logs
```bash
# View logs
tail -f logs/bot-2026-02-10.log

# Search for sync events
grep "Notion sync" logs/bot-2026-02-10.log
```

## 🐛 Troubleshooting

### Reminder tidak terkirim
1. Cek bot running: `pm2 status`
2. Cek logs: `pm2 logs`
3. Cek Notion connection: `npm run test:notion`
4. Cek WHATSAPP_GROUP_ID di `.env`

### Tugas tidak muncul di reminder
1. Pastikan Status = "Aktif" di Notion
2. Pastikan Deadline sesuai
3. Cek sync logs
4. Manual sync jika perlu

### Format pesan salah
1. Cek template di `src/utils/RecapFormatter.ts`
2. Cek data di Notion (field names harus match)
3. Restart bot setelah perubahan

## 💡 Tips

### Notion Best Practices
1. **Gunakan template** untuk tugas yang sering muncul
2. **Set reminder** di Notion juga (backup)
3. **Archive completed tasks** setiap bulan
4. **Backup database** secara berkala

### WhatsApp Channel
1. **Pin important messages** (reminder harian)
2. **Mute notifications** jika terlalu banyak
3. **Save to favorites** untuk referensi cepat

### Bot Management
1. **Use PM2** untuk auto-restart
2. **Monitor logs** secara berkala
3. **Update dependencies** setiap bulan
4. **Backup database** sebelum update

## 📚 Related Files

- `src/services/NotionService.ts` - Notion sync logic
- `src/services/ReminderScheduler.ts` - Scheduler logic
- `src/utils/RecapFormatter.ts` - Message formatting
- `NOTION_SETUP.md` - Notion setup guide
- `NOTION_DATABASE_STRUCTURE.md` - Database structure
