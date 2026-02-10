# 🤖 Bot Add Task Guide - WhatsApp Command

## ✅ Fitur Baru: Bot Bisa Add Tugas!

Bot sekarang bisa menerima command untuk add tugas via WhatsApp dan otomatis sync ke Notion!

## 📝 Cara Add Tugas via WhatsApp

### Format Command

```
/add_tugas | judul | deskripsi | deadline | mata_pelajaran | tipe
```

### Parameter

| Parameter | Deskripsi | Format | Contoh |
|-----------|-----------|--------|--------|
| judul | Judul tugas | Text | Latihan Matematika |
| deskripsi | Deskripsi tugas | Text | Mengerjakan soal hal 45-50 |
| deadline | Tanggal deadline | YYYY-MM-DD | 2026-02-15 |
| mata_pelajaran | Nama mata pelajaran | Text | Matematika |
| tipe | Tipe tugas | individu/kelompok/ujian | individu |

### Contoh Command

#### Contoh 1: Tugas Individu
```
/add_tugas | Latihan Matematika | Mengerjakan soal hal 45-50 tentang integral | 2026-02-15 | Matematika | individu
```

#### Contoh 2: Tugas Kelompok
```
/add_tugas | Presentasi Sejarah | Membuat PPT tentang kemerdekaan Indonesia | 2026-02-20 | Sejarah | kelompok
```

#### Contoh 3: Ujian
```
/add_tugas | Ujian PAI | Ujian lisan tentang kitab-kitab Allah | 2026-02-18 | PAI | ujian
```

## 🔄 Workflow

```
1. Kamu kirim command /add_tugas di WhatsApp
   ↓
2. Bot validate input (format, tanggal, tipe)
   ↓
3. Bot enhance deskripsi dengan AI (optional)
   ↓
4. Bot save ke MongoDB
   ↓
5. Bot sync ke Notion database (otomatis)
   ↓
6. Bot reply dengan konfirmasi + Task ID
```

## ✨ Fitur Otomatis

### 1. AI Enhancement
Bot akan enhance deskripsi tugas agar lebih jelas dan ringkas (menggunakan Groq AI).

**Input:**
```
Mengerjakan soal hal 45-50 tentang integral dan turunan ya teman-teman
```

**Output (Enhanced):**
```
Mengerjakan soal hal 45-50 tentang integral dan turunan.
```

### 2. Auto Priority
Bot otomatis calculate prioritas berdasarkan deadline:
- **Urgent** (🔴): Deadline ≤ 24 jam
- **Penting** (🟡): Deadline ≤ 72 jam
- **Normal** (⚪): Deadline > 72 jam

### 3. Auto Sync to Notion
Setelah save ke MongoDB, bot otomatis create page di Notion database dengan semua properties.

## 📊 Response Bot

### Success Response
```
✅ Tugas ditambahkan!

📝 Latihan Matematika
⚪ Matematika • Rab, 15 Feb
🆔 `67890abcdef1234567890abc`

💡 Gunakan ID untuk edit/hapus
✨ Synced to Notion
```

### Error Response

#### Format Salah
```
❌ Format salah!

Gunakan: /add_tugas | judul | deskripsi | deadline (YYYY-MM-DD) | mata_pelajaran | tipe

Contoh: /add_tugas | Essay Sejarah | Tulis essay tentang kemerdekaan | 2024-12-25 | Sejarah | individu
```

#### Tanggal Invalid
```
❌ Format tanggal salah! Gunakan format YYYY-MM-DD (contoh: 2024-12-25)
```

#### Tipe Invalid
```
❌ Tipe tugas tidak valid! Gunakan: individu, kelompok, atau ujian
```

## 🎯 Mata Pelajaran yang Tersedia

Bot support semua mata pelajaran, tapi yang umum:
- Matematika
- Bahasa Indonesia
- Bahasa Inggris
- Sejarah
- PAI
- PJOK
- BK
- MP 1, MP 2, MP 3, MP 4
- MK 1, MK 2, MK 3, MK 4
- Bahasa Jawa

## 🔍 Cek Tugas di Notion

Setelah add tugas via bot, kamu bisa:

1. **Buka Notion database**
2. **Lihat task baru** yang baru saja ditambahkan
3. **Edit di Notion** jika perlu (tambah link, catatan, dll)
4. **Bot akan sync** saat kirim reminder

## 💡 Tips

### Tip 1: Gunakan Separator yang Benar
Gunakan **pipe** `|` untuk separator, bukan koma atau titik koma.

✅ **BENAR:**
```
/add_tugas | Judul | Deskripsi | 2026-02-15 | Matematika | individu
```

❌ **SALAH:**
```
/add_tugas, Judul, Deskripsi, 2026-02-15, Matematika, individu
```

### Tip 2: Format Tanggal Harus YYYY-MM-DD
✅ **BENAR:** `2026-02-15`
❌ **SALAH:** `15-02-2026`, `15/02/2026`, `2026/02/15`

### Tip 3: Tipe Harus Lowercase
✅ **BENAR:** `individu`, `kelompok`, `ujian`
❌ **SALAH:** `Individu`, `KELOMPOK`, `Ujian`

### Tip 4: Deskripsi Boleh Panjang
Bot akan enhance dan ringkas deskripsi otomatis, jadi boleh tulis panjang.

### Tip 5: Simpan Task ID
Bot akan kasih Task ID setelah add tugas. Simpan ID ini untuk edit/hapus nanti.

## 🔧 Command Lainnya

### Edit Tugas
```
/edit_tugas | <task_id> | field | value
```

Contoh:
```
/edit_tugas | 67890abcdef1234567890abc | deadline | 2026-02-20
```

### Hapus Tugas
```
/hapus_tugas | <task_id>
```

### Tandai Selesai
```
/tandai_selesai | <task_id>
```

### Lihat Semua Tugas
```
/tugas
```

### Lihat Tugas Hari Ini
```
/tugas_hari_ini
```

### Lihat Tugas Minggu Ini
```
/tugas_minggu_ini
```

## 🎬 Workflow Lengkap

### Scenario 1: Add Tugas via Bot
```
1. Kirim /add_tugas di WhatsApp
2. Bot save ke MongoDB + Notion
3. Bot reply konfirmasi
4. Cek di Notion (optional)
5. Bot kirim reminder sesuai jadwal
```

### Scenario 2: Add Tugas Manual di Notion
```
1. Buka Notion database
2. Klik "New" → Isi form
3. Save
4. Bot sync saat reminder
5. Bot kirim reminder sesuai jadwal
```

### Scenario 3: Hybrid (Bot + Manual)
```
1. Add tugas via bot (quick)
2. Edit di Notion (tambah link, catatan)
3. Bot sync saat reminder
4. Bot kirim reminder dengan data terbaru
```

## 🔐 Permission

### WhatsApp Channel
Semua member di channel bisa:
- ✅ Add tugas via command
- ✅ Edit tugas
- ✅ Hapus tugas
- ✅ Lihat tugas

### Notion Database
Semua yang punya akses ke database bisa:
- ✅ Add tugas manual
- ✅ Edit tugas
- ✅ Hapus tugas
- ✅ Lihat tugas

## 📊 Sync Behavior

### Bot → Notion
- Add tugas via bot → Otomatis create page di Notion
- Edit tugas via bot → Otomatis update page di Notion
- Hapus tugas via bot → Otomatis update status di Notion

### Notion → Bot
- Add tugas di Notion → Bot sync saat reminder
- Edit tugas di Notion → Bot sync saat reminder
- Hapus tugas di Notion → Bot sync saat reminder

**Note:** Sync dari Notion ke Bot hanya terjadi saat reminder, tidak real-time.

## 🐛 Troubleshooting

### Bot Tidak Respond
1. Cek bot running: `pm2 status`
2. Cek logs: `pm2 logs`
3. Restart bot: `pm2 restart all`

### Tugas Tidak Muncul di Notion
1. Cek Notion database ID di `.env`
2. Cek integration sudah di-share dengan database
3. Cek logs untuk error: `pm2 logs | grep -i notion`

### Error "Notion service disabled"
1. Pastikan `NOTION_API_KEY` ada di `.env`
2. Pastikan `NOTION_DATABASE_ID` ada di `.env`
3. Restart bot

## 📚 Related Files

- `src/handlers/AdminCommandHandler.ts` - Command handler logic
- `src/services/NotionService.ts` - Notion sync logic
- `src/services/TaskService.ts` - Task management logic
- `src/bot.ts` - Bot initialization & message handler

## 🎯 Summary

**Bot sekarang bisa:**
- ✅ Terima command `/add_tugas` via WhatsApp
- ✅ Validate input (format, tanggal, tipe)
- ✅ Enhance deskripsi dengan AI
- ✅ Save ke MongoDB
- ✅ Sync ke Notion database otomatis
- ✅ Reply dengan konfirmasi + Task ID
- ✅ Kirim reminder sesuai jadwal

**Kamu bisa:**
- ✅ Add tugas via bot (quick & easy)
- ✅ Add tugas manual di Notion (full control)
- ✅ Edit di Notion setelah add via bot
- ✅ Lihat semua tugas di Notion
- ✅ Terima reminder otomatis di WhatsApp

---

**Happy task managing! 🚀**
