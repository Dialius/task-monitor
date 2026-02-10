# 🚀 Notion Quick Start Guide

## ❌ Error yang Muncul

```
Could not find page with ID: 3030a8e2-4bf6-80cb-ac8c-d2aed65ea3da. 
Make sure the relevant pages and databases are shared with your integration.
```

## ✅ Solusi: Share Page dengan Integration

### Langkah 1: Buka Page di Notion

1. Buka link ini di browser: https://www.notion.so/Tugas-Kelas-XI-PPLG-3-3030a8e24bf680cbac8cd2aed65ea3da
2. Pastikan kamu sudah login ke Notion

### Langkah 2: Share dengan Integration

**PENTING**: Notion UI terbaru (2024-2025) menggunakan menu "Connections" bukan "Share"

#### Cara 1: Melalui Page Settings (RECOMMENDED)

1. **Klik tombol `...` (tiga titik)** di pojok kanan atas page
2. **Hover mouse** ke menu **"Connections"**
3. **Klik "Add connections"**
4. **Cari nama integration** kamu (kemungkinan namanya seperti "Class Reminder Bot" atau nama yang kamu buat saat setup)
5. **Klik nama integration** tersebut
6. **Konfirmasi** dengan klik "Confirm" atau "Allow access"
7. ✅ Integration sekarang punya akses ke page ini!

#### Cara 2: Melalui Workspace Settings (Alternative)

1. **Klik nama workspace** di pojok kiri atas
2. **Klik "Settings"**
3. **Pilih "Connections"** dari menu samping
4. **Cari integration** kamu di list
5. **Klik tombol `...`** di samping nama integration
6. **Pilih "Access selected pages"**
7. **Centang page** "Tugas Kelas XI PPLG 3"
8. **Save**

### Langkah 3: Verifikasi Integration Name

Jika kamu lupa nama integration yang kamu buat:

1. Buka https://www.notion.so/my-integrations
2. Lihat list integration yang sudah kamu buat
3. Nama integration ada di sana (contoh: "Class Reminder Bot", "Task Monitor", dll)

### Langkah 4: Test Koneksi Lagi

Setelah share page dengan integration, jalankan command ini lagi:

```bash
node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da
```

Seharusnya sekarang berhasil! ✅

## 📋 Checklist

- [ ] Buka page di Notion
- [ ] Klik `...` (tiga titik) di pojok kanan atas
- [ ] Hover ke "Connections"
- [ ] Klik "Add connections"
- [ ] Cari dan pilih integration kamu
- [ ] Konfirmasi akses
- [ ] Jalankan `node scripts/test-notion.js create 3030a8e24bf680cbac8cd2aed65ea3da`
- [ ] Copy Database ID ke `.env`
- [ ] Restart bot

## 🎯 Expected Output

Setelah berhasil, kamu akan lihat output seperti ini:

```
✅ Notion connection successful!
📊 Found 3 user(s) in workspace

📝 Creating new task database...

✅ Database created successfully!
📊 Database ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
🔗 URL: https://notion.so/...

💡 Copy Database ID ini ke .env file:
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔍 Troubleshooting

### Integration tidak muncul di search

**Penyebab**: Integration belum ditambahkan ke workspace

**Solusi**:
1. Buka https://www.notion.so/my-integrations
2. Klik integration kamu
3. Pastikan "Associated workspace" sudah diset
4. Jika belum, pilih workspace yang benar

### Masih error "object_not_found"

**Penyebab**: Page belum di-share dengan integration

**Solusi**:
1. Pastikan kamu sudah klik "Add connections" di page
2. Tunggu beberapa detik (kadang butuh refresh)
3. Coba jalankan script lagi
4. Jika masih error, coba logout-login Notion

### Error "unauthorized"

**Penyebab**: API Key salah atau expired

**Solusi**:
1. Buka https://www.notion.so/my-integrations
2. Klik integration kamu
3. Copy "Internal Integration Token" yang baru
4. Update di `.env`: `NOTION_API_KEY=ntn_...`

## 📚 Referensi

- [Notion API Documentation](https://developers.notion.com/)
- [How to Share Pages with Integration](https://www.notion.com/help/add-and-manage-connections-with-the-api)
- [Notion Integration Setup](https://developers.notion.com/docs/create-a-notion-integration)

## 💡 Tips

1. **Satu kali share = semua child pages juga ter-share**
   - Jika kamu share parent page, semua page di dalamnya otomatis ter-share

2. **Bisa share multiple pages**
   - Kamu bisa share banyak page dengan integration yang sama

3. **Bisa revoke access kapan saja**
   - Klik "Connections" → Hover integration → Klik "Disconnect"

4. **Integration bisa punya permission berbeda**
   - Read content, Update content, Insert content, dll
   - Set di https://www.notion.so/my-integrations

## 🎬 Next Steps

Setelah database berhasil dibuat:

1. ✅ Copy Database ID ke `.env`
2. ✅ Test sync: `node scripts/test-notion-sync.js`
3. ✅ Tambah sample task di Notion
4. ✅ Run bot: `npm start`
5. ✅ Tunggu reminder otomatis terkirim!

---

**Butuh bantuan?** Cek file lain:
- `NOTION_SETUP.md` - Setup lengkap dari awal
- `NOTION_DATABASE_STRUCTURE.md` - Struktur database
- `WORKFLOW_GUIDE.md` - Cara kerja bot
