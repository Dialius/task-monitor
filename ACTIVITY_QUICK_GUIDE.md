# Activity Status - Quick Guide

Panduan cepat untuk setting activity status dalam 3 langkah! ⚡

## 🎯 3 Langkah Mudah

### 1️⃣ Aktifkan Activity Rotation

**File:** `.env` (di root folder)

```env
DISCORD_ACTIVITY_ENABLED=true
```

✅ `true` = Aktif (bot akan rotate activity)
❌ `false` = Nonaktif (bot tidak rotate)

---

### 2️⃣ Set Delay Rotation

**File:** `.env` (di root folder)

```env
DISCORD_ACTIVITY_INTERVAL=5
```

**Angka = Menit**
- `3` = Ganti setiap 3 menit
- `5` = Ganti setiap 5 menit (recommended)
- `10` = Ganti setiap 10 menit
- `15` = Ganti setiap 15 menit

---

### 3️⃣ Edit Templates (Opsional)

**File:** `src/config/discord.config.ts`

**Cari bagian ini:**
```typescript
templates: [
  {
    text: 'dengan {total} tugas',
    dynamic: true,
    type: 'PLAYING'
  }
]
```

**Edit sesuai keinginan!**

---

## 📍 Lokasi File

```
project-root/
├── .env                           ← Edit di sini (aktifkan & delay)
└── src/
    └── config/
        └── discord.config.ts      ← Edit di sini (templates)
```

---

## 🎨 Template Variables

| Variable | Arti | Contoh |
|----------|------|--------|
| `{total}` | Total tugas aktif | "5 tugas" |
| `{active}` | Jumlah tugas aktif | "5 misi" |
| `{nearest}` | Deadline terdekat | "16 Feb" |

---

## 🎮 Activity Types

| Type | Icon | Contoh Output |
|------|------|---------------|
| `PLAYING` | 🎮 | "Playing dengan 5 tugas" |
| `WATCHING` | 👀 | "Watching 5 misi aktif" |
| `LISTENING` | 🎧 | "Listening to 5 notifikasi" |
| `COMPETING` | 🏆 | "Competing in tantangan 5 tugas" |

---

## ⚙️ Contoh Setting

### Setting 1: Simple (Recommended)

**`.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
```

**`discord.config.ts`:**
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

**Output:**
- 🎮 Playing dengan 5 tugas
- 👀 Watching 5 misi aktif
- 🎮 Playing kejar deadline 🏃

---

### Setting 2: Fast Rotation

**`.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=3
```

**Output:** Ganti setiap 3 menit

---

### Setting 3: Slow Rotation

**`.env`:**
```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=10
```

**Output:** Ganti setiap 10 menit

---

## 🔄 Cara Apply Changes

1. Edit file `.env` atau `discord.config.ts`
2. Save file
3. **Restart bot** ← PENTING!
4. Check console log
5. Tunggu interval untuk lihat rotation

---

## ✅ Checklist

- [ ] Edit `.env` → Set `DISCORD_ACTIVITY_ENABLED=true`
- [ ] Edit `.env` → Set `DISCORD_ACTIVITY_INTERVAL=5`
- [ ] (Opsional) Edit `discord.config.ts` → Customize templates
- [ ] Save semua file
- [ ] Restart bot
- [ ] ✨ Done!

---

## 💡 Tips Cepat

✅ **DO:**
- Gunakan 3-10 templates
- Mix dynamic & static
- Gunakan emoji untuk visual
- Test dengan restart bot

❌ **DON'T:**
- Jangan < 2 menit interval (terlalu cepat)
- Jangan > 30 menit interval (terlalu lama)
- Jangan lupa restart bot setelah edit
- Jangan pakai text terlalu panjang (> 30 karakter)

---

## 🆘 Troubleshooting

**Activity tidak muncul?**
→ Check `.env`: `DISCORD_ACTIVITY_ENABLED=true`

**Activity tidak rotate?**
→ Restart bot

**Variables tidak diganti?**
→ Pastikan `dynamic: true`

**Delay tidak sesuai?**
→ Restart bot (perubahan tidak apply tanpa restart)

---

## 📚 Dokumentasi Lengkap

Lihat file lain untuk panduan detail:
- `CARA_SETTING_ACTIVITY.md` - Tutorial lengkap
- `DISCORD_ACTIVITY_GUIDE.md` - Penjelasan detail
- `DISCORD_ACTIVITY_EXAMPLES.md` - Contoh-contoh kreatif

---

**Happy customizing! 🎉**
