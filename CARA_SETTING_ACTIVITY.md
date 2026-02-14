# Cara Setting Activity Status Discord Bot

Panduan lengkap untuk mengatur activity status rotation bot Discord. 🎮

## 📍 Lokasi File yang Perlu Diubah

### 1. File `.env` (Untuk Setting Dasar)
**Lokasi:** Root folder project (sejajar dengan `package.json`)

**Isi file `.env`:**
```env
# Discord Activity Status Configuration
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
DISCORD_ACTIVITY_TYPE=WATCHING
```

### 2. File `src/config/discord.config.ts` (Untuk Custom Templates)
**Lokasi:** `src/config/discord.config.ts`

**Bagian yang perlu diubah:**
```typescript
activity: {
  enabled: process.env.DISCORD_ACTIVITY_ENABLED !== 'false',
  interval: parseInt(process.env.DISCORD_ACTIVITY_INTERVAL || '5'),
  type: (process.env.DISCORD_ACTIVITY_TYPE as any) || 'WATCHING',
  templates: [
    // Edit templates di sini
  ]
}
```

## ⚙️ Cara Mengatur Activity Rotation

### 1️⃣ Aktifkan/Nonaktifkan Activity Rotation

**Lokasi:** File `.env`

**Untuk AKTIFKAN:**
```env
DISCORD_ACTIVITY_ENABLED=true
```

**Untuk NONAKTIFKAN:**
```env
DISCORD_ACTIVITY_ENABLED=false
```

**Default:** `true` (aktif)

---

### 2️⃣ Ubah Delay/Interval Rotation

**Lokasi:** File `.env`

**Format:** Dalam menit (minutes)

**Contoh:**
```env
# Ganti setiap 3 menit
DISCORD_ACTIVITY_INTERVAL=3

# Ganti setiap 5 menit (default)
DISCORD_ACTIVITY_INTERVAL=5

# Ganti setiap 10 menit
DISCORD_ACTIVITY_INTERVAL=10

# Ganti setiap 15 menit
DISCORD_ACTIVITY_INTERVAL=15
```

**Rekomendasi:**
- **3-5 menit**: Untuk banyak templates (8-10 templates)
- **5-10 menit**: Untuk templates sedang (4-7 templates)
- **10-15 menit**: Untuk sedikit templates (2-4 templates)

**Jangan terlalu cepat:**
- < 2 menit: Terlalu sering ganti, mengganggu
- > 30 menit: Terlalu lama, kurang variasi

---

### 3️⃣ Ubah Default Activity Type

**Lokasi:** File `.env`

**Pilihan:**
```env
# Monitoring/tracking style
DISCORD_ACTIVITY_TYPE=WATCHING

# Gaming/fun style
DISCORD_ACTIVITY_TYPE=PLAYING

# Alert/notification style
DISCORD_ACTIVITY_TYPE=LISTENING

# Competition/challenge style
DISCORD_ACTIVITY_TYPE=COMPETING
```

**Note:** Ini hanya default type. Setiap template bisa punya type sendiri!

---

### 4️⃣ Edit Templates

**Lokasi:** File `src/config/discord.config.ts`

**Cari bagian ini:**
```typescript
activity: {
  enabled: process.env.DISCORD_ACTIVITY_ENABLED !== 'false',
  interval: parseInt(process.env.DISCORD_ACTIVITY_INTERVAL || '5'),
  type: (process.env.DISCORD_ACTIVITY_TYPE as any) || 'WATCHING',
  templates: [
    // ← Edit di sini
  ]
}
```

**Format Template:**
```typescript
{
  text: 'text yang ditampilkan',
  dynamic: true,  // true = pakai variables, false = static
  type: 'PLAYING' // PLAYING, WATCHING, LISTENING, COMPETING
}
```

**Contoh Edit:**
```typescript
templates: [
  // Template 1
  {
    text: 'dengan {total} tugas',
    dynamic: true,
    type: 'PLAYING'
  },
  // Template 2
  {
    text: 'memantau {total} misi',
    dynamic: true,
    type: 'WATCHING'
  },
  // Template 3
  {
    text: 'kejar deadline 🏃',
    dynamic: false,
    type: 'PLAYING'
  }
]
```

---

## 📝 Step-by-Step Tutorial

### Tutorial 1: Aktifkan Activity Rotation

**Langkah:**
1. Buka file `.env`
2. Cari baris `DISCORD_ACTIVITY_ENABLED`
3. Ubah menjadi `DISCORD_ACTIVITY_ENABLED=true`
4. Save file
5. Restart bot

**Hasil:**
Bot akan mulai rotate activity status setiap 5 menit (default).

---

### Tutorial 2: Ubah Delay Menjadi 10 Menit

**Langkah:**
1. Buka file `.env`
2. Cari baris `DISCORD_ACTIVITY_INTERVAL`
3. Ubah menjadi `DISCORD_ACTIVITY_INTERVAL=10`
4. Save file
5. Restart bot

**Hasil:**
Bot akan ganti activity setiap 10 menit.

---

### Tutorial 3: Tambah Template Baru

**Langkah:**
1. Buka file `src/config/discord.config.ts`
2. Cari bagian `templates: [`
3. Tambah template baru:
```typescript
templates: [
  // Template existing...
  
  // Template baru
  {
    text: 'berburu pencapaian 🎯',
    dynamic: false,
    type: 'COMPETING'
  }
]
```
4. Save file
5. Restart bot

**Hasil:**
Bot akan menambahkan template baru ke rotation.

---

### Tutorial 4: Ubah Semua Template ke Bahasa Indonesia

**Langkah:**
1. Buka file `src/config/discord.config.ts`
2. Cari bagian `templates: [`
3. Replace semua template dengan yang bahasa Indonesia:
```typescript
templates: [
  {
    text: 'dengan {total} tugas',
    dynamic: true,
    type: 'PLAYING'
  },
  {
    text: 'tantangan {total} tugas',
    dynamic: true,
    type: 'COMPETING'
  },
  {
    text: '{total} misi aktif',
    dynamic: true,
    type: 'WATCHING'
  },
  {
    text: '{active} notifikasi tugas',
    dynamic: true,
    type: 'LISTENING'
  },
  {
    text: 'kejar deadline 🏃‍♂️',
    dynamic: false,
    type: 'PLAYING'
  },
  {
    text: 'pertarungan produktivitas',
    dynamic: false,
    type: 'COMPETING'
  },
  {
    text: 'berikutnya: {nearest}',
    dynamic: true,
    type: 'WATCHING'
  },
  {
    text: 'pengingat & notifikasi',
    dynamic: false,
    type: 'LISTENING'
  },
  {
    text: 'Task Manager 2026 ⚡',
    dynamic: false,
    type: 'PLAYING'
  },
  {
    text: 'berburu pencapaian 🎯',
    dynamic: false,
    type: 'COMPETING'
  }
]
```
4. Save file
5. Restart bot

**Hasil:**
Semua activity status akan dalam bahasa Indonesia.

---

## 🎯 Contoh Konfigurasi Lengkap

### Konfigurasi 1: Fast Rotation (3 menit)

**File `.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=3
DISCORD_ACTIVITY_TYPE=PLAYING
```

**File `src/config/discord.config.ts`:**
```typescript
templates: [
  {
    text: 'dengan {total} tugas',
    dynamic: true,
    type: 'PLAYING'
  },
  {
    text: 'kejar deadline 🏃',
    dynamic: false,
    type: 'PLAYING'
  },
  {
    text: 'Task Manager ⚡',
    dynamic: false,
    type: 'PLAYING'
  }
]
```

**Output:**
- Ganti setiap 3 menit
- 3 templates
- Semua type PLAYING

---

### Konfigurasi 2: Slow Rotation (15 menit)

**File `.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=15
DISCORD_ACTIVITY_TYPE=WATCHING
```

**File `src/config/discord.config.ts`:**
```typescript
templates: [
  {
    text: '{total} misi aktif',
    dynamic: true,
    type: 'WATCHING'
  },
  {
    text: 'berikutnya: {nearest}',
    dynamic: true,
    type: 'WATCHING'
  }
]
```

**Output:**
- Ganti setiap 15 menit
- 2 templates
- Semua type WATCHING

---

### Konfigurasi 3: Mixed Types (5 menit)

**File `.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
DISCORD_ACTIVITY_TYPE=WATCHING
```

**File `src/config/discord.config.ts`:**
```typescript
templates: [
  {
    text: 'dengan {total} tugas',
    dynamic: true,
    type: 'PLAYING'
  },
  {
    text: '{total} misi aktif',
    dynamic: true,
    type: 'WATCHING'
  },
  {
    text: '{active} notifikasi',
    dynamic: true,
    type: 'LISTENING'
  },
  {
    text: 'tantangan produktivitas',
    dynamic: false,
    type: 'COMPETING'
  }
]
```

**Output:**
- Ganti setiap 5 menit
- 4 templates
- Mixed types (PLAYING, WATCHING, LISTENING, COMPETING)

---

## 🔍 Troubleshooting

### Activity tidak muncul

**Solusi:**
1. Check `.env`: `DISCORD_ACTIVITY_ENABLED=true`
2. Restart bot
3. Check console log untuk error

### Activity tidak rotate

**Solusi:**
1. Check `.env`: `DISCORD_ACTIVITY_INTERVAL` ada nilai
2. Pastikan ada minimal 2 templates
3. Restart bot

### Variables tidak diganti ({total} tetap {total})

**Solusi:**
1. Pastikan `dynamic: true`
2. Check database connection
3. Check TaskService berjalan

### Delay tidak sesuai

**Solusi:**
1. Check `.env`: `DISCORD_ACTIVITY_INTERVAL` dalam menit
2. Restart bot (perubahan tidak apply tanpa restart)

---

## 📋 Checklist Setting Activity

- [ ] Buka file `.env`
- [ ] Set `DISCORD_ACTIVITY_ENABLED=true`
- [ ] Set `DISCORD_ACTIVITY_INTERVAL=5` (atau sesuai keinginan)
- [ ] Set `DISCORD_ACTIVITY_TYPE=WATCHING` (atau sesuai keinginan)
- [ ] Buka file `src/config/discord.config.ts`
- [ ] Edit templates sesuai keinginan
- [ ] Save semua file
- [ ] Restart bot
- [ ] Check console log untuk konfirmasi
- [ ] Tunggu interval untuk lihat rotation

---

## 💡 Tips

1. **Jangan terlalu banyak templates**: 4-10 templates optimal
2. **Mix dynamic & static**: Variasi lebih menarik
3. **Test empty state**: Pastikan bagus saat tidak ada tugas
4. **Use emojis**: Lebih menarik visual
5. **Keep it short**: Max 30 karakter
6. **Restart after changes**: Perubahan tidak apply tanpa restart

---

## 🚀 Quick Start

**Untuk pemula, gunakan setting ini:**

**File `.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
DISCORD_ACTIVITY_TYPE=WATCHING
```

**File `src/config/discord.config.ts`:**
```typescript
templates: [
  {
    text: 'dengan {total} tugas',
    dynamic: true,
    type: 'PLAYING'
  },
  {
    text: '{total} misi aktif',
    dynamic: true,
    type: 'WATCHING'
  },
  {
    text: 'kejar deadline 🏃',
    dynamic: false,
    type: 'PLAYING'
  }
]
```

**Restart bot dan lihat hasilnya!** 🎉
