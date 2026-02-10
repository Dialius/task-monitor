# 📚 Notion Integration - Documentation Index

## 🎯 Pilih Panduan yang Sesuai

### 🆘 Sedang Error? Butuh Fix Cepat?
👉 **Baca:** `NOTION_QUICK_FIX.md`
- ⚡ 5 langkah singkat
- 🎯 Fokus pada error "object_not_found"
- ⏱️ 2 menit baca

### 🚀 First Time Setup?
👉 **Baca:** `NOTION_QUICK_START.md`
- ✅ Step-by-step dengan checklist
- 🔍 Troubleshooting common issues
- ⏱️ 5 menit baca

### 📸 Butuh Visual Guide?
👉 **Baca:** `NOTION_VISUAL_GUIDE.md`
- 🖼️ ASCII art screenshots
- 📝 Penjelasan detail setiap step
- 🎨 Visual untuk setiap menu
- ⏱️ 10 menit baca

### 📖 Setup dari Awal?
👉 **Baca:** `NOTION_SETUP.md`
- 🏗️ Complete setup guide
- 📊 Database structure detail
- 🔧 Configuration options
- ⏱️ 15 menit baca

### 🔍 Butuh Penjelasan Teknis?
👉 **Baca:** `NOTION_TROUBLESHOOTING_SUMMARY.md`
- 🧠 Root cause analysis
- 📚 Referensi lengkap
- 🎓 Penjelasan teknis
- ⏱️ 20 menit baca

### 📊 Bingung Database vs Page?
👉 **Baca:** `NOTION_DATABASE_VS_PAGE.md`
- 🎯 Perbedaan database dan page
- 🔄 Cara bot insert data
- ✅ Best practices
- ⏱️ 10 menit baca

---

## 📋 File Overview

| File | Purpose | When to Use | Length |
|------|---------|-------------|--------|
| `NOTION_QUICK_FIX.md` | Quick error fix | Saat error "object_not_found" | 2 min |
| `NOTION_QUICK_START.md` | Step-by-step guide | First time setup | 5 min |
| `NOTION_VISUAL_GUIDE.md` | Visual walkthrough | Butuh visual reference | 10 min |
| `NOTION_DATABASE_VS_PAGE.md` | Database vs Page | Bingung konsep database | 10 min |
| `NOTION_SETUP.md` | Complete setup | Setup dari nol | 15 min |
| `NOTION_TROUBLESHOOTING_SUMMARY.md` | Technical deep dive | Butuh penjelasan detail | 20 min |
| `NOTION_DATABASE_STRUCTURE.md` | Database schema | Customize database | 10 min |
| `WORKFLOW_GUIDE.md` | Bot workflow | Understand bot behavior | 15 min |

---

## 🎬 Quick Start (TL;DR)

### Error "object_not_found"?

```bash
# 1. Buka page di Notion
https://www.notion.so/Tugas-Kelas-XI-PPLG-3-3030a8e24bf680cbac8cd2aed65ea3da

# 2. Klik ... → Hover "Connections" → "Add connections" → Pilih integration

# 3. Test lagi
node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da

# 4. Copy Database ID ke .env
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 5. Test sync
node scripts/test-notion-sync.js

# 6. Run bot
npm start
```

**Detail:** Lihat `NOTION_QUICK_FIX.md`

---

## 🗺️ Learning Path

### Path 1: Quick Fix (Recommended untuk Error)
```
NOTION_QUICK_FIX.md
    ↓
Test koneksi
    ↓
Berhasil? → WORKFLOW_GUIDE.md
    ↓
Gagal? → NOTION_VISUAL_GUIDE.md
```

### Path 2: First Time Setup
```
NOTION_SETUP.md
    ↓
NOTION_QUICK_START.md
    ↓
Test koneksi
    ↓
NOTION_DATABASE_STRUCTURE.md
    ↓
WORKFLOW_GUIDE.md
```

### Path 3: Visual Learner
```
NOTION_VISUAL_GUIDE.md
    ↓
Test koneksi
    ↓
Berhasil? → WORKFLOW_GUIDE.md
    ↓
Gagal? → NOTION_TROUBLESHOOTING_SUMMARY.md
```

### Path 4: Technical Deep Dive
```
NOTION_TROUBLESHOOTING_SUMMARY.md
    ↓
NOTION_SETUP.md
    ↓
NOTION_DATABASE_STRUCTURE.md
    ↓
Test & customize
```

---

## 🎯 Common Scenarios

### Scenario 1: "Saya baru pertama kali setup"
1. Baca `NOTION_SETUP.md` (15 min)
2. Follow steps
3. Jika stuck, buka `NOTION_VISUAL_GUIDE.md`

### Scenario 2: "Saya dapat error object_not_found"
1. Buka `NOTION_QUICK_FIX.md` (2 min)
2. Follow 5 langkah
3. Jika masih error, buka `NOTION_VISUAL_GUIDE.md`

### Scenario 3: "Saya butuh visual guide"
1. Buka `NOTION_VISUAL_GUIDE.md` (10 min)
2. Follow step-by-step dengan visual
3. Test koneksi

### Scenario 4: "Saya ingin customize database"
1. Baca `NOTION_DATABASE_STRUCTURE.md` (10 min)
2. Modify properties sesuai kebutuhan
3. Update `src/services/NotionService.ts` jika perlu

### Scenario 5: "Saya ingin understand workflow"
1. Baca `WORKFLOW_GUIDE.md` (15 min)
2. Understand bot behavior
3. Customize scheduler jika perlu

---

## 🔧 Troubleshooting Decision Tree

```
Error?
  │
  ├─ object_not_found
  │   └─ NOTION_QUICK_FIX.md
  │
  ├─ unauthorized
  │   └─ NOTION_SETUP.md (Section: API Key)
  │
  ├─ invalid_request
  │   └─ NOTION_VISUAL_GUIDE.md (Section: Page ID)
  │
  ├─ Integration not found
  │   └─ NOTION_QUICK_START.md (Section: Integration)
  │
  └─ Other errors
      └─ NOTION_TROUBLESHOOTING_SUMMARY.md
```

---

## 📊 File Comparison

### Quick Reference

| Feature | Quick Fix | Quick Start | Visual Guide | Setup | Troubleshooting |
|---------|-----------|-------------|--------------|-------|-----------------|
| Error fix | ✅✅✅ | ✅✅ | ✅✅ | ✅ | ✅✅✅ |
| Step-by-step | ✅ | ✅✅✅ | ✅✅✅ | ✅✅ | ✅ |
| Visual aids | ❌ | ❌ | ✅✅✅ | ❌ | ❌ |
| Technical depth | ❌ | ✅ | ✅ | ✅✅ | ✅✅✅ |
| Beginner friendly | ✅✅✅ | ✅✅✅ | ✅✅ | ✅ | ❌ |
| Quick read | ✅✅✅ | ✅✅ | ✅ | ❌ | ❌ |

---

## 💡 Tips

### Tip 1: Start Simple
Jangan langsung baca semua file. Pilih satu yang sesuai kebutuhan.

### Tip 2: Use Visual Guide
Jika stuck di step tertentu, buka `NOTION_VISUAL_GUIDE.md` untuk visual reference.

### Tip 3: Keep Reference Open
Buka file panduan di tab terpisah saat setup.

### Tip 4: Follow Checklist
`NOTION_QUICK_START.md` punya checklist yang bisa di-track.

### Tip 5: Bookmark This
Simpan `NOTION_README.md` sebagai starting point.

---

## 🎓 Additional Resources

### Internal Documentation
- `WORKFLOW_GUIDE.md` - Bot workflow & schedule
- `REMINDER_FORMAT_GUIDE.md` - Message format
- `NOTION_DATABASE_STRUCTURE.md` - Database schema

### Scripts
- `scripts/test-notion.js` - Test connection & create database
- `scripts/test-notion-sync.js` - Test sync functionality
- `scripts/setup-notion-database.js` - Setup helper

### Code
- `src/services/NotionService.ts` - Notion integration logic
- `src/services/ReminderScheduler.ts` - Scheduler with Notion sync
- `src/utils/RecapFormatter.ts` - Message formatting

---

## 🆘 Still Need Help?

### Check Logs
```bash
# View recent logs
tail -f logs/bot-2026-02-10.log

# Search for Notion errors
grep -i "notion" logs/bot-2026-02-10.log
```

### Verify Configuration
```bash
# Check .env
cat .env | grep NOTION

# Should show:
# NOTION_API_KEY=ntn_...
# NOTION_DATABASE_ID=...
```

### Test Connection
```bash
# Basic connection test
node scripts/test-notion.js

# Create database test
node scripts/test-notion.js create <PAGE_ID>

# Sync test
node scripts/test-notion-sync.js
```

### Debug Mode
```bash
# Run with debug logs
LOG_LEVEL=debug npm start
```

---

## 📞 Support Checklist

Jika masih ada masalah, siapkan info berikut:

- [ ] Error message (full text)
- [ ] File yang sudah dibaca
- [ ] Steps yang sudah dicoba
- [ ] Screenshot Notion settings
- [ ] Screenshot integration settings
- [ ] `.env` config (sensor API keys)
- [ ] Log output

---

## 🎯 Success Indicators

Kamu berhasil jika:

- ✅ `node scripts/test-notion.js` → Connection successful
- ✅ Database created di Notion
- ✅ Sample task muncul di database
- ✅ `node scripts/test-notion-sync.js` → Sync successful
- ✅ Bot running tanpa error
- ✅ Reminder terkirim sesuai jadwal

---

**Happy coding! 🚀**

Jika ada pertanyaan, refer ke file yang sesuai di atas.
