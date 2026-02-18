# Discord Activity Status Guide

Panduan lengkap untuk mengkonfigurasi Activity Status bot Discord.

## 📖 Apa itu Activity Status?

Activity Status adalah status yang muncul di profil bot Discord, seperti:
- 👀 Watching 5 tugas aktif
- 🎮 Playing with tasks
- 🎧 Listening to deadline alerts
- 🏆 Competing in task management

Bot akan **rotate** (bergantian) menampilkan berbagai activity sesuai interval yang Anda set.

## 🎯 Template Variables

Template variables adalah placeholder yang akan diganti dengan data real-time dari database:

### `{total}` - Total Tugas Aktif

**Penjelasan:**
- Menghitung semua tugas dengan status "aktif" di database
- Update setiap kali activity rotation

**Contoh:**
```typescript
{
  text: '{total} tugas aktif',
  dynamic: true
}
```

**Output:**
- Jika ada 5 tugas aktif: "5 tugas aktif"
- Jika ada 0 tugas: "0 tugas aktif"

### `{active}` - Jumlah Tugas Aktif

**Penjelasan:**
- Sama persis dengan `{total}`
- Hanya beda nama untuk variasi kalimat

**Contoh:**
```typescript
{
  text: '{active} tugas menunggu',
  dynamic: true
}
```

**Output:**
- Jika ada 3 tugas: "3 tugas menunggu"

### `{nearest}` - Deadline Terdekat

**Penjelasan:**
- Mengambil tugas dengan deadline paling dekat
- Format: dd MMM (contoh: 16 Feb, 25 Mar)
- Jika tidak ada tugas: "tidak ada"

**Contoh:**
```typescript
{
  text: 'Deadline terdekat: {nearest}',
  dynamic: true
}
```

**Output:**
- Jika ada tugas deadline 16 Feb: "Deadline terdekat: 16 Feb"
- Jika tidak ada tugas: "Deadline terdekat: tidak ada"

## 🎨 Activity Types

Discord mendukung 4 tipe activity:

### 1. WATCHING (Default)
```
👀 Watching 5 tugas aktif
```

**Cocok untuk:**
- Monitoring/tracking
- Status informasi
- Jumlah/statistik

**Contoh:**
- "Watching 5 tugas aktif"
- "Watching deadline terdekat: 16 Feb"
- "Watching tugas kuliah"

### 2. PLAYING
```
🎮 Playing with 5 tugas
```

**Cocok untuk:**
- Aktivitas interaktif
- Game-like status
- Fun/casual tone

**Contoh:**
- "Playing with 5 tugas"
- "Playing task manager"
- "Playing deadline chase"

### 3. LISTENING
```
🎧 Listening to deadline alerts
```

**Cocok untuk:**
- Notifikasi/alerts
- Passive monitoring
- Audio-related metaphors

**Contoh:**
- "Listening to 5 task alerts"
- "Listening to deadline warnings"
- "Listening to student requests"

### 4. COMPETING
```
🏆 Competing in task management
```

**Cocok untuk:**
- Challenge/competition
- Achievement-focused
- Motivational tone

**Contoh:**
- "Competing in 5 tasks"
- "Competing in deadline race"
- "Competing in productivity"

## ⚙️ Configuration Options

### Basic Configuration (via .env)

Edit file `.env`:

```env
# Enable/disable activity rotation
DISCORD_ACTIVITY_ENABLED=true

# Rotation interval in minutes (default: 5)
DISCORD_ACTIVITY_INTERVAL=5

# Activity type (WATCHING, PLAYING, LISTENING, COMPETING)
DISCORD_ACTIVITY_TYPE=WATCHING
```

### Advanced Configuration (via config file)

Edit `src/config/discord.config.ts`:

```typescript
activity: {
  enabled: true,
  interval: 5, // minutes
  type: 'WATCHING',
  templates: [
    {
      text: '{total} tugas aktif',
      dynamic: true
    }
  ]
}
```

## 📝 Contoh Konfigurasi

### Contoh 1: Monitoring Style (WATCHING)

```typescript
activity: {
  enabled: true,
  interval: 5,
  type: 'WATCHING',
  templates: [
    {
      text: '{total} tugas aktif',
      dynamic: true
    },
    {
      text: 'deadline terdekat: {nearest}',
      dynamic: true
    },
    {
      text: 'tugas kuliah kelas',
      dynamic: false
    }
  ]
}
```

**Output Rotation:**
1. "👀 Watching 5 tugas aktif"
2. "👀 Watching deadline terdekat: 16 Feb"
3. "👀 Watching tugas kuliah kelas"

### Contoh 2: Gaming Style (PLAYING)

```typescript
activity: {
  enabled: true,
  interval: 3,
  type: 'PLAYING',
  templates: [
    {
      text: 'with {total} tasks',
      dynamic: true
    },
    {
      text: 'deadline chase',
      dynamic: false
    },
    {
      text: 'task manager 2026',
      dynamic: false
    }
  ]
}
```

**Output Rotation:**
1. "🎮 Playing with 5 tasks"
2. "🎮 Playing deadline chase"
3. "🎮 Playing task manager 2026"

### Contoh 3: Alert Style (LISTENING)

```typescript
activity: {
  enabled: true,
  interval: 10,
  type: 'LISTENING',
  templates: [
    {
      text: '{active} task alerts',
      dynamic: true
    },
    {
      text: 'deadline warnings',
      dynamic: false
    },
    {
      text: 'student requests',
      dynamic: false
    }
  ]
}
```

**Output Rotation:**
1. "🎧 Listening to 5 task alerts"
2. "🎧 Listening to deadline warnings"
3. "🎧 Listening to student requests"

### Contoh 4: Competition Style (COMPETING)

```typescript
activity: {
  enabled: true,
  interval: 7,
  type: 'COMPETING',
  templates: [
    {
      text: '{total} tasks challenge',
      dynamic: true
    },
    {
      text: 'deadline race',
      dynamic: false
    },
    {
      text: 'productivity contest',
      dynamic: false
    }
  ]
}
```

**Output Rotation:**
1. "🏆 Competing in 5 tasks challenge"
2. "🏆 Competing in deadline race"
3. "🏆 Competing in productivity contest"

### Contoh 5: Mixed Variables

```typescript
activity: {
  enabled: true,
  interval: 5,
  type: 'WATCHING',
  templates: [
    {
      text: '{total} tugas | Next: {nearest}',
      dynamic: true
    },
    {
      text: '{active} tasks pending',
      dynamic: true
    },
    {
      text: 'Class Reminder Bot',
      dynamic: false
    }
  ]
}
```

**Output Rotation:**
1. "👀 Watching 5 tugas | Next: 16 Feb"
2. "👀 Watching 5 tasks pending"
3. "👀 Watching Class Reminder Bot"

## 🔧 Cara Mengubah Configuration

### Method 1: Via Environment Variables (Simple)

1. Edit `.env`:
```env
DISCORD_ACTIVITY_TYPE=PLAYING
DISCORD_ACTIVITY_INTERVAL=10
```

2. Restart bot

### Method 2: Via Config File (Advanced)

1. Edit `src/config/discord.config.ts`

2. Ubah bagian `activity`:
```typescript
activity: {
  enabled: true,
  interval: 5,
  type: 'PLAYING', // ← Ubah di sini
  templates: [
    // ← Tambah/edit templates di sini
    {
      text: 'your custom text',
      dynamic: false
    }
  ]
}
```

3. Restart bot

## 📊 Dynamic vs Static Templates

### Dynamic Template (dynamic: true)

**Karakteristik:**
- Fetch data dari database setiap rotation
- Bisa pakai template variables
- Update real-time

**Contoh:**
```typescript
{
  text: '{total} tugas aktif',
  dynamic: true
}
```

**Kapan Pakai:**
- Ingin tampilkan data real-time
- Ingin tampilkan statistik
- Ingin tampilkan deadline

### Static Template (dynamic: false)

**Karakteristik:**
- Text tetap, tidak berubah
- Tidak fetch data dari database
- Lebih ringan

**Contoh:**
```typescript
{
  text: 'Tugas kuliah kelas',
  dynamic: false
}
```

**Kapan Pakai:**
- Text branding/nama bot
- Text informasi umum
- Text yang tidak perlu update

## ⏱️ Rotation Interval

**Interval** adalah berapa menit sekali bot ganti activity.

**Contoh:**
```typescript
interval: 5  // Ganti activity setiap 5 menit
```

**Rekomendasi:**
- **3-5 menit**: Untuk variasi tinggi (banyak templates)
- **5-10 menit**: Untuk variasi sedang (3-5 templates)
- **10-15 menit**: Untuk variasi rendah (1-3 templates)

**Jangan terlalu cepat:**
- < 2 menit: Terlalu sering ganti, mengganggu
- > 30 menit: Terlalu lama, kurang variasi

## 🎯 Best Practices

### 1. Kombinasi Dynamic & Static

Gunakan mix dynamic dan static untuk variasi:

```typescript
templates: [
  { text: '{total} tugas aktif', dynamic: true },      // Dynamic
  { text: 'deadline: {nearest}', dynamic: true },      // Dynamic
  { text: 'Class Reminder Bot', dynamic: false }       // Static
]
```

### 2. Sesuaikan Type dengan Context

- **WATCHING**: Untuk monitoring/tracking
- **PLAYING**: Untuk fun/casual
- **LISTENING**: Untuk alerts/notifications
- **COMPETING**: Untuk challenges/motivation

### 3. Jangan Terlalu Banyak Templates

**Rekomendasi:**
- 3-5 templates optimal
- Terlalu banyak: User tidak sempat baca semua
- Terlalu sedikit: Kurang variasi

### 4. Test Empty State

Pastikan template tetap bagus saat tidak ada tugas:

```typescript
{
  text: '{total} tugas aktif',  // "0 tugas aktif" ← Masih OK
  dynamic: true
}

{
  text: 'Deadline: {nearest}',  // "Deadline: tidak ada" ← Masih OK
  dynamic: true
}
```

## 🐛 Troubleshooting

### Activity tidak muncul

**Solusi:**
1. Check `.env`: `DISCORD_ACTIVITY_ENABLED=true`
2. Check bot sudah connect
3. Check logs untuk error

### Variables tidak diganti

**Solusi:**
1. Pastikan `dynamic: true`
2. Check database connection
3. Check TaskService berjalan

### Activity tidak rotate

**Solusi:**
1. Check interval setting
2. Check logs untuk error
3. Restart bot

### Empty state tidak bagus

**Solusi:**
Tambahkan fallback text:

```typescript
{
  text: '{total} tugas | Tidak ada tugas',
  dynamic: true
}
```

## 📚 Examples Library

### Bahasa Indonesia

```typescript
templates: [
  { text: '{total} tugas aktif', dynamic: true },
  { text: 'Deadline: {nearest}', dynamic: true },
  { text: 'Bot Pengingat Tugas', dynamic: false }
]
```

### English

```typescript
templates: [
  { text: '{total} active tasks', dynamic: true },
  { text: 'Next deadline: {nearest}', dynamic: true },
  { text: 'Task Reminder Bot', dynamic: false }
]
```

### Mixed

```typescript
templates: [
  { text: '{total} tasks | {nearest}', dynamic: true },
  { text: 'Tugas kuliah kelas', dynamic: false },
  { text: 'Class Task Manager', dynamic: false }
]
```

### Fun/Casual

```typescript
type: 'PLAYING',
templates: [
  { text: 'with {total} tasks 🎮', dynamic: true },
  { text: 'deadline chase 🏃', dynamic: false },
  { text: 'task manager 2026 ⚡', dynamic: false }
]
```

### Professional

```typescript
type: 'WATCHING',
templates: [
  { text: '{total} active assignments', dynamic: true },
  { text: 'upcoming deadline: {nearest}', dynamic: true },
  { text: 'Academic Task Monitor', dynamic: false }
]
```

## 🚀 Quick Start

**Untuk pemula, gunakan config default:**

```env
DISCORD_ACTIVITY_ENABLED=true
DISCORD_ACTIVITY_INTERVAL=5
DISCORD_ACTIVITY_TYPE=WATCHING
```

**Untuk advanced, edit config file sesuai kebutuhan!**

## 📝 Summary

- **Template Variables**: `{total}`, `{active}`, `{nearest}`
- **Activity Types**: WATCHING, PLAYING, LISTENING, COMPETING
- **Dynamic**: Fetch data dari database
- **Static**: Text tetap
- **Interval**: Berapa menit sekali rotate
- **Default**: Enabled, 5 minutes, WATCHING

Happy customizing! 🎉
