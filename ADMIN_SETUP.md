# Admin Setup Guide

Panduan lengkap untuk setup admin pertama dan mengelola admin di bot.

## 🎯 Kenapa Perlu Admin Pertama?

Bot ini menggunakan sistem permission berbasis role. Untuk bisa menggunakan admin commands, user harus terdaftar sebagai admin di database. Namun, untuk mendaftarkan admin pertama, kita perlu cara bootstrap karena belum ada admin yang bisa menjalankan command.

Solusinya: **First Admin Configuration** di `.env`

## 📝 Setup Admin Pertama

### Step 1: Dapatkan User ID

#### Untuk Discord:
1. Buka Discord
2. Aktifkan Developer Mode:
   - Settings > Advanced > Developer Mode (ON)
3. Klik kanan pada username Anda
4. Klik "Copy User ID"
5. Hasilnya seperti: `123456789012345678`

#### Untuk WhatsApp:
1. Nomor HP Anda dalam format internasional
2. Tanpa tanda `+` dan tanpa spasi
3. Contoh: `6281234567890` (untuk +62 812-3456-7890)

### Step 2: Edit File `.env`

Buka file `.env` dan isi konfigurasi admin pertama:

```env
# First Admin Configuration
FIRST_ADMIN_DISCORD_ID=123456789012345678
FIRST_ADMIN_WHATSAPP_ID=6281234567890
FIRST_ADMIN_ROLE=ketua
```

**Pilihan:**
- Isi `FIRST_ADMIN_DISCORD_ID` jika menggunakan Discord
- Isi `FIRST_ADMIN_WHATSAPP_ID` jika menggunakan WhatsApp
- Isi keduanya jika menggunakan kedua platform
- Minimal isi salah satu

**Role yang tersedia:**
- `ketua` - Full access ke semua command
- `wakil` - Full access ke semua command
- `koordinator` - Terbatas, tidak bisa broadcast dan manage users

### Step 3: Jalankan Bot

```bash
npm run build
npm start
```

Bot akan otomatis membuat admin pertama saat startup. Anda akan melihat pesan:

```
✅ Admin Discord berhasil dibuat!
   User ID: 123456789012345678
   Platform: Discord
   Role: ketua
```

### Step 4: Verifikasi

Setelah bot running, test dengan command admin:

**Discord:**
```
/status
```

**WhatsApp:**
```
/status
```

Jika berhasil, Anda akan melihat status bot. Sekarang Anda bisa menggunakan semua admin commands!

## 👥 Menambah Admin Lain

Setelah admin pertama berhasil dibuat, Anda bisa menambah admin lain menggunakan command (fitur ini akan ditambahkan nanti) atau langsung ke database.

### Cara 1: Via Database (Manual)

```javascript
// Connect ke MongoDB
use multiplatform_class_bot

// Tambah admin Discord
db.admins.insertOne({
  user_identifier: "987654321098765432",
  platform: "discord",
  role: "wakil",
  nama: "Nama Admin",
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
})

// Tambah admin WhatsApp
db.admins.insertOne({
  user_identifier: "6281234567891",
  platform: "whatsapp",
  role: "koordinator",
  nama: "Nama Admin",
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
})
```

### Cara 2: Via Command (Coming Soon)

Command untuk manage admin akan ditambahkan di update berikutnya:
- `/add_admin` - Tambah admin baru
- `/remove_admin` - Hapus admin
- `/list_admin` - Lihat daftar admin
- `/change_role` - Ubah role admin

## 🔐 Role dan Permission

### Ketua & Wakil
Full access ke semua command:
- ✅ Manage tugas (add, edit, hapus, tandai selesai)
- ✅ Manage jadwal (add, edit, hapus, ganti)
- ✅ Manage piket (set, edit)
- ✅ Manage pengumuman (add, hapus)
- ✅ Broadcast (normal & urgent)
- ✅ Manage users (add/remove admin) - Coming soon
- ✅ Sync Notion - Coming soon

### Koordinator
Terbatas, tidak bisa:
- ❌ Broadcast
- ❌ Manage users
- ❌ Sync Notion

Bisa:
- ✅ Manage tugas
- ✅ Manage jadwal
- ✅ Manage piket
- ✅ Manage pengumuman

## ❓ Troubleshooting

### Admin tidak bisa menggunakan command

**Cek 1: Apakah admin sudah terdaftar?**
```javascript
// Di MongoDB
db.admins.find({ user_identifier: "your_user_id" })
```

**Cek 2: Apakah is_active = true?**
```javascript
db.admins.updateOne(
  { user_identifier: "your_user_id" },
  { $set: { is_active: true } }
)
```

**Cek 3: Apakah platform benar?**
- Discord user harus punya entry dengan `platform: "discord"`
- WhatsApp user harus punya entry dengan `platform: "whatsapp"`

### Bot tidak membuat admin pertama

**Cek 1: Apakah .env sudah benar?**
```bash
# Pastikan ada salah satu atau keduanya
FIRST_ADMIN_DISCORD_ID=123456789012345678
FIRST_ADMIN_WHATSAPP_ID=6281234567890
```

**Cek 2: Cek log bot**
```bash
# Lihat di console atau di file logs/bot-YYYY-MM-DD.log
# Cari pesan "Admin Discord berhasil dibuat" atau error
```

**Cek 3: Restart bot**
```bash
# Stop bot (Ctrl+C)
# Start lagi
npm start
```

### User ID salah

**Discord:**
- Pastikan Developer Mode aktif
- User ID adalah angka panjang (18 digit)
- Bukan username atau display name

**WhatsApp:**
- Format: kode negara + nomor (tanpa +, tanpa spasi)
- Contoh benar: `6281234567890`
- Contoh salah: `+62 812-3456-7890`, `081234567890`

### Admin terduplikasi

Jika admin sudah ada, bot tidak akan membuat duplikat. Pesan yang muncul:
```
Discord admin already exists: 123456789012345678
```

Ini normal dan tidak masalah.

## 🔄 Mengubah Admin Pertama

Jika ingin mengubah admin pertama:

1. Edit `.env`:
```env
FIRST_ADMIN_DISCORD_ID=new_user_id
```

2. Hapus admin lama dari database (opsional):
```javascript
db.admins.deleteOne({ user_identifier: "old_user_id" })
```

3. Restart bot:
```bash
npm start
```

Bot akan membuat admin baru dengan ID yang baru.

## 📊 Melihat Daftar Admin

Via MongoDB:

```javascript
// Semua admin
db.admins.find().pretty()

// Admin Discord saja
db.admins.find({ platform: "discord" }).pretty()

// Admin WhatsApp saja
db.admins.find({ platform: "whatsapp" }).pretty()

// Admin aktif saja
db.admins.find({ is_active: true }).pretty()

// Admin berdasarkan role
db.admins.find({ role: "ketua" }).pretty()
```

## 🎓 Best Practices

1. **Minimal 2 Admin** - Selalu punya backup admin jika admin utama tidak tersedia
2. **Role Sesuai Kebutuhan** - Gunakan role koordinator untuk admin yang tidak perlu full access
3. **Backup Database** - Selalu backup database sebelum menghapus admin
4. **Dokumentasi** - Catat siapa saja yang jadi admin dan role mereka
5. **Review Berkala** - Cek dan update daftar admin secara berkala

## 🔗 Related Documentation

- [DISCORD_SETUP.md](./DISCORD_SETUP.md) - Setup Discord bot
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup guide lengkap
- [COMMANDS.md](./COMMANDS.md) - Daftar semua command
