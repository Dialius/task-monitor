# Discord Activity Status - Quick Reference

## 🎯 Template Variables

| Variable | Arti | Contoh Output |
|----------|------|---------------|
| `{total}` | Total tugas aktif | "5 tugas aktif" |
| `{active}` | Jumlah tugas aktif (sama dengan {total}) | "5 tugas menunggu" |
| `{nearest}` | Deadline terdekat | "Deadline: 16 Feb" |

## 🎨 Activity Types

| Type | Icon | Tampilan | Cocok Untuk |
|------|------|----------|-------------|
| `WATCHING` | 👀 | "Watching ..." | Monitoring, tracking, statistik |
| `PLAYING` | 🎮 | "Playing ..." | Fun, casual, game-like |
| `LISTENING` | 🎧 | "Listening to ..." | Alerts, notifications, passive |
| `COMPETING` | 🏆 | "Competing in ..." | Challenges, motivation, achievement |

## ⚙️ Configuration

### Via .env (Simple)

```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
DISCORD_ACTIVITY_TYPE=WATCHING
```

### Via Config File (Advanced)

Edit `src/config/discord.config.ts`:

```typescript
activity: {
  enabled: true,
  interval: 5, // minutes
  type: 'WATCHING',
  templates: [
    {
      text: '{total} tugas aktif',
      dynamic: true  // Fetch data dari database
    },
    {
      text: 'Tugas kuliah kelas',
      dynamic: false  // Text statis
    }
  ]
}
```

## 📝 Contoh Cepat

### Monitoring Style
```typescript
type: 'WATCHING',
templates: [
  { text: '{total} tugas aktif', dynamic: true },
  { text: 'deadline: {nearest}', dynamic: true }
]
```
Output: "👀 Watching 5 tugas aktif"

### Gaming Style
```typescript
type: 'PLAYING',
templates: [
  { text: 'with {total} tasks', dynamic: true },
  { text: 'deadline chase', dynamic: false }
]
```
Output: "🎮 Playing with 5 tasks"

### Alert Style
```typescript
type: 'LISTENING',
templates: [
  { text: '{active} task alerts', dynamic: true },
  { text: 'deadline warnings', dynamic: false }
]
```
Output: "🎧 Listening to 5 task alerts"

### Competition Style
```typescript
type: 'COMPETING',
templates: [
  { text: '{total} tasks challenge', dynamic: true },
  { text: 'productivity contest', dynamic: false }
]
```
Output: "🏆 Competing in 5 tasks challenge"

## 🔧 Cara Mengubah

1. **Ubah Type**: Edit `DISCORD_ACTIVITY_TYPE` di `.env`
2. **Ubah Interval**: Edit `DISCORD_ACTIVITY_INTERVAL` di `.env`
3. **Ubah Templates**: Edit `src/config/discord.config.ts`
4. **Restart Bot**

## 💡 Tips

- **Interval**: 3-10 menit optimal
- **Templates**: 3-5 templates cukup
- **Mix**: Kombinasi dynamic & static
- **Test**: Pastikan bagus saat tidak ada tugas

## 📚 Full Guide

Lihat [DISCORD_ACTIVITY_GUIDE.md](./DISCORD_ACTIVITY_GUIDE.md) untuk panduan lengkap.
