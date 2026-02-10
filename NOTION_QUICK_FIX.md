# ⚡ Notion Quick Fix - Error "object_not_found"

## 🎯 Problem
```
Could not find page with ID: 3030a8e2-4bf6-80cb-ac8c-d2aed65ea3da
Make sure the relevant pages and databases are shared with your integration.
```

## ✅ Solution (5 Steps)

### 1️⃣ Buka Page di Notion
```
https://www.notion.so/Tugas-Kelas-XI-PPLG-3-3030a8e24bf680cbac8cd2aed65ea3da
```

### 2️⃣ Klik `...` (pojok kanan atas)
```
┌─────────────────────────────────┐
│  Tugas Kelas XI PPLG 3    [...] │ ← Klik ini
└─────────────────────────────────┘
```

### 3️⃣ Hover ke "Connections"
```
┌─────────────────┐
│ Connections  ▶  │ ← Hover (jangan klik)
└─────────────────┘
```

### 4️⃣ Klik "Add connections"
```
┌──────────────────────┐
│ Add connections      │ ← Klik ini
│                      │
│ Active Connections   │
│ (none yet)           │
└──────────────────────┘
```

### 5️⃣ Pilih Integration & Confirm
```
┌────────────────────────────┐
│ 🔍 Search connections...   │
│ ────────────────────────── │
│ 🤖 Class Reminder Bot      │ ← Klik ini
│ 📝 Notion AI               │
└────────────────────────────┘

Lalu klik "Allow access"
```

## 🧪 Test Lagi

```bash
node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da
```

## ✅ Expected Result

```
✅ Notion connection successful!
✅ Database created successfully!
📊 Database ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

💡 Copy Database ID ke .env:
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔍 Masih Error?

### Cek Integration Name
1. Buka: https://www.notion.so/my-integrations
2. Lihat nama integration kamu
3. Search dengan nama yang benar

### Cek API Key
```bash
# Lihat API key di .env
cat .env | grep NOTION_API_KEY

# Format harus: ntn_xxxxxxxx...
```

### Tunggu & Retry
```bash
# Tunggu 10 detik, lalu coba lagi
sleep 10
node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da
```

## 📚 Panduan Lengkap

- **Visual Guide**: `NOTION_VISUAL_GUIDE.md` (dengan screenshot ASCII)
- **Quick Start**: `NOTION_QUICK_START.md` (step by step detail)
- **Full Setup**: `NOTION_SETUP.md` (setup dari awal)

---

**TL;DR**: Klik `...` → Hover "Connections" → "Add connections" → Pilih integration → Confirm
