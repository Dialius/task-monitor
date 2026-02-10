# 📸 Notion Visual Guide - Step by Step

## 🎯 Tujuan
Menghubungkan page Notion dengan integration bot agar bot bisa membuat database di page tersebut.

---

## 📋 Langkah-Langkah Detail

### Step 1: Buka Page di Notion

```
🔗 URL: https://www.notion.so/Tugas-Kelas-XI-PPLG-3-3030a8e24bf680cbac8cd2aed65ea3da
```

1. Copy URL di atas
2. Paste di browser
3. Login ke Notion jika belum

**Yang kamu lihat:**
- Page dengan judul "Tugas Kelas XI PPLG 3"
- Mungkin masih kosong atau ada konten

---

### Step 2: Buka Menu Connections

**Lokasi tombol:**
```
┌─────────────────────────────────────────────┐
│  Tugas Kelas XI PPLG 3          [Share] [...] │ ← Klik tombol [...] ini
└─────────────────────────────────────────────┘
```

**Apa yang harus dilakukan:**
1. Lihat ke **pojok kanan atas** page
2. Cari tombol **`...`** (tiga titik vertikal)
3. **Klik** tombol tersebut

**Menu yang muncul:**
```
┌─────────────────────────┐
│ Add to Favorites        │
│ Copy link               │
│ Move to                 │
│ ───────────────────     │
│ Connections          ▶  │ ← Hover mouse ke sini
│ ───────────────────     │
│ Style                   │
│ Customize page          │
│ ...                     │
└─────────────────────────┘
```

---

### Step 3: Hover ke "Connections"

**Apa yang harus dilakukan:**
1. **Jangan klik** "Connections"
2. **Hover mouse** (arahkan kursor) ke "Connections"
3. Tunggu submenu muncul di samping

**Submenu yang muncul:**
```
┌─────────────────────────┐     ┌──────────────────────────┐
│ Connections          ▶  │ ──▶ │ 🔍 Search connections... │
│                         │     │ ──────────────────────── │
│                         │     │ Add connections          │
│                         │     │                          │
│                         │     │ Active Connections       │
│                         │     │ (none yet)               │
│                         │     └──────────────────────────┘
└─────────────────────────┘
```

---

### Step 4: Klik "Add connections"

**Apa yang harus dilakukan:**
1. Klik **"Add connections"** di submenu
2. Search box akan muncul

**Search box:**
```
┌──────────────────────────────────────┐
│ 🔍 Search connections...             │
│ ──────────────────────────────────── │
│                                      │
│ Available Connections:               │
│                                      │
│ 🤖 Class Reminder Bot                │ ← Integration kamu
│ 📝 Notion AI                         │
│ 🔗 Slack                             │
│ ...                                  │
└──────────────────────────────────────┘
```

---

### Step 5: Cari Integration Kamu

**Apa yang harus dilakukan:**
1. **Ketik nama integration** di search box
   - Contoh: "Class Reminder Bot", "Task Monitor", dll
2. **Klik nama integration** yang muncul

**Jika tidak tahu nama integration:**
1. Buka tab baru: https://www.notion.so/my-integrations
2. Lihat list integration yang sudah dibuat
3. Copy nama integration
4. Kembali ke page dan search dengan nama tersebut

---

### Step 6: Konfirmasi Akses

**Dialog konfirmasi:**
```
┌─────────────────────────────────────────────┐
│  Allow "Class Reminder Bot" to access       │
│  this page?                                 │
│                                             │
│  This integration will be able to:          │
│  ✓ Read content                             │
│  ✓ Update content                           │
│  ✓ Insert content                           │
│                                             │
│  [Cancel]              [Allow access]       │ ← Klik ini
└─────────────────────────────────────────────┘
```

**Apa yang harus dilakukan:**
1. Baca permission yang diminta
2. Klik **"Allow access"** atau **"Confirm"**

---

### Step 7: Verifikasi Connection Berhasil

**Setelah konfirmasi, kamu akan lihat:**

```
┌─────────────────────────┐     ┌──────────────────────────┐
│ Connections          ▶  │ ──▶ │ 🔍 Search connections... │
│                         │     │ ──────────────────────── │
│                         │     │ Add connections          │
│                         │     │                          │
│                         │     │ Active Connections       │
│                         │     │ 🤖 Class Reminder Bot ✓  │ ← Berhasil!
│                         │     │    [Disconnect]          │
│                         │     └──────────────────────────┘
└─────────────────────────┘
```

**Tanda berhasil:**
- Integration muncul di "Active Connections"
- Ada checkmark (✓) atau icon connection
- Ada tombol "Disconnect" (untuk revoke akses nanti)

---

## ✅ Test Koneksi

Sekarang jalankan command ini di terminal:

```bash
node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da
```

**Expected output (BERHASIL):**
```
╔════════════════════════════════════════════════════════╗
║   📝 CREATE NOTION DATABASE                           ║
╚════════════════════════════════════════════════════════╝

🔍 Testing Notion connection...

✅ Notion connection successful!
📊 Found 3 user(s) in workspace

📝 Creating new task database...

✅ Database created successfully!
📊 Database ID: 1234567890abcdef1234567890abcdef
🔗 URL: https://notion.so/...

💡 Copy Database ID ini ke .env file:
   NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef

✅ Sample task added successfully!
🔗 URL: https://notion.so/...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Setup complete!

📝 Jangan lupa:
   1. Copy Database ID ke .env: NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef
   2. Restart bot untuk apply changes
   3. Test dengan command /add_tugas
```

---

## 🔍 Troubleshooting

### ❌ Integration tidak muncul di search

**Kemungkinan penyebab:**
1. Integration belum dibuat
2. Integration tidak di-associate dengan workspace ini

**Solusi:**

#### Cek Integration Exists
```bash
# Buka di browser:
https://www.notion.so/my-integrations
```

**Yang harus kamu lihat:**
```
┌─────────────────────────────────────────┐
│ My integrations                         │
│ ─────────────────────────────────────── │
│                                         │
│ 🤖 Class Reminder Bot                   │ ← Integration kamu
│    Internal Integration                 │
│    Associated workspace: My Workspace   │
│    [View details]                       │
│                                         │
└─────────────────────────────────────────┘
```

**Jika tidak ada integration:**
1. Klik **"New integration"**
2. Isi form:
   - Name: `Class Reminder Bot`
   - Associated workspace: Pilih workspace kamu
   - Logo: (optional)
3. Klik **"Submit"**
4. **Copy "Internal Integration Token"**
5. Paste ke `.env`: `NOTION_API_KEY=ntn_...`

**Jika integration ada tapi workspace salah:**
1. Klik integration
2. Scroll ke "Associated workspace"
3. Klik "Change"
4. Pilih workspace yang benar
5. Save

---

### ❌ Masih error "object_not_found" setelah share

**Kemungkinan penyebab:**
1. Notion butuh waktu untuk propagate permission
2. Browser cache
3. API key salah

**Solusi:**

#### 1. Tunggu & Retry
```bash
# Tunggu 10-30 detik, lalu coba lagi:
node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da
```

#### 2. Refresh Notion
1. Refresh page Notion (F5 atau Cmd+R)
2. Cek "Connections" lagi
3. Pastikan integration masih ada di "Active Connections"

#### 3. Verify API Key
```bash
# Cek API key di .env
cat .env | grep NOTION_API_KEY

# Harus format: ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Jika API key salah:**
1. Buka https://www.notion.so/my-integrations
2. Klik integration kamu
3. Klik "Show" di "Internal Integration Token"
4. Copy token baru
5. Update `.env`

---

### ❌ Error "unauthorized"

**Penyebab:** API key tidak valid

**Solusi:**
1. Buka https://www.notion.so/my-integrations
2. Klik integration kamu
3. Scroll ke "Internal Integration Token"
4. Klik **"Show"** untuk lihat token
5. Klik **"Copy"** untuk copy token
6. Paste ke `.env`:
   ```env
   NOTION_API_KEY=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Save file
8. Coba lagi

---

### ❌ Error "invalid_request"

**Penyebab:** Page ID salah format

**Solusi:**

Page ID harus **32 karakter** tanpa dash.

**Dari URL:**
```
https://www.notion.so/Tugas-Kelas-XI-PPLG-3-3030a8e24bf680cbac8cd2aed65ea3da
                                            └─────────────────────────────────┘
                                                     32 karakter
```

**Format yang benar:**
```
3030a8e24bf680cbac8cd2aed65ea3da  ✅ (32 karakter, no dash)
```

**Format yang salah:**
```
3030a8e2-4bf6-80cb-ac8c-d2aed65ea3da  ❌ (ada dash)
Tugas-Kelas-XI-PPLG-3                ❌ (bukan ID)
```

---

## 🎬 Next Steps

Setelah database berhasil dibuat:

### 1. Copy Database ID ke .env

```bash
# Output dari script:
NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef

# Copy ke .env file
```

**Edit `.env`:**
```env
# Notion Integration
NOTION_API_KEY=ntn_o28334028706DwckTVC4km0iW0rwepXtHFN0lWX07jmdyA
NOTION_DATABASE_ID=1234567890abcdef1234567890abcdef  ← Update ini
```

### 2. Test Sync

```bash
node scripts/test-notion-sync.js
```

**Expected output:**
```
✅ Notion connection successful!
✅ Database access successful!
📊 Found 1 item(s) in database

Sync Stats:
- Notion tasks: 1
- MongoDB tasks: 1
- Last sync: 2026-02-10 16:00:00
```

### 3. Tambah Task di Notion

1. Buka database di Notion
2. Klik **"New"** untuk tambah task baru
3. Isi form:
   - **Judul**: Latihan Matematika
   - **Mata Pelajaran**: Matematika
   - **Deskripsi**: Mengerjakan soal hal 45-50
   - **Deadline**: Besok
   - **Tipe**: Individu
   - **Status**: Aktif
4. Save

### 4. Run Bot

```bash
npm start
```

**Bot akan:**
- Connect ke WhatsApp (scan QR)
- Connect ke MongoDB
- Connect ke Notion
- Setup scheduler
- Kirim reminder otomatis sesuai jadwal

### 5. Tunggu Reminder

**Jadwal reminder:**
- **Senin-Kamis 16:00**: Reminder harian (tugas besok)
- **Jumat 16:00**: Reminder mingguan (tugas minggu depan)
- **Minggu 16:00**: Reminder Senin (tugas hari Senin)

---

## 📚 File Referensi

- `NOTION_SETUP.md` - Setup lengkap dari awal
- `NOTION_DATABASE_STRUCTURE.md` - Struktur database detail
- `NOTION_QUICK_START.md` - Quick start guide
- `WORKFLOW_GUIDE.md` - Cara kerja bot
- `REMINDER_FORMAT_GUIDE.md` - Format pesan reminder

---

## 💡 Tips & Tricks

### Tip 1: Share Parent Page = Share All Children
Jika kamu share parent page dengan integration, semua child pages di dalamnya otomatis ter-share juga.

### Tip 2: Multiple Databases
Kamu bisa punya multiple databases di satu page. Bot hanya akan sync dari database yang ID-nya ada di `.env`.

### Tip 3: Revoke Access
Untuk revoke access integration:
1. Klik `...` → Connections
2. Hover integration
3. Klik "Disconnect"

### Tip 4: Check Permissions
Integration permissions bisa diatur di:
https://www.notion.so/my-integrations → Click integration → Capabilities

**Permissions yang dibutuhkan:**
- ✅ Read content
- ✅ Update content
- ✅ Insert content

### Tip 5: Backup Database
Sebelum test, backup database dulu:
1. Klik `...` → Export
2. Pilih format (Markdown atau CSV)
3. Download

---

**Selamat! Bot kamu sekarang sudah terhubung dengan Notion! 🎉**
