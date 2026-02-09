# Discord Embed Format

## Overview
Bot sekarang menggunakan Discord Embeds untuk menampilkan list tugas, jadwal, dan piket. Embed memberikan tampilan yang lebih rapi dengan kotak berwarna dan spacing yang jelas antar item.

## Ephemeral Replies (Only You Can See This)
Beberapa command menggunakan **ephemeral reply** - hanya user yang menjalankan command yang bisa melihat hasilnya. Ini mengurangi spam di channel.

**Commands dengan Ephemeral:**
- `/tugas`, `/tugas_hari_ini`, `/tugas_minggu_ini`
- `/jadwal`, `/jadwal_besok`, `/jadwal_minggu_ini`
- `/piket`, `/piket_minggu_ini`
- `/help`, `/bantuan`
- `/status`

## Embed Format

### Tugas Commands
- `/tugas` - Semua tugas aktif
- `/tugas_hari_ini` - Tugas hari ini
- `/tugas_minggu_ini` - Tugas minggu ini

**Format Embed:**
- Title: "📝 Daftar Tugas" / "📅 Tugas Hari Ini" / "📊 Tugas Minggu Ini"
- Color: Blue (#3498db)
- Description: Setiap tugas dengan format:
  ```
  **1. 👤 Judul Tugas**
  🚨 Mata Pelajaran • Deadline
  Deskripsi tugas
  🆔 `task_id`
  
  **2. 👥 Judul Tugas Lain**
  ⚠️ Mata Pelajaran • Deadline
  Deskripsi tugas
  🆔 `task_id`
  ```
- Spacing: Double newline (`\n\n`) antar tugas untuk jarak yang jelas

### Jadwal Commands
- `/jadwal` atau `/jadwal_hari_ini` - Jadwal hari ini
- `/jadwal_besok` - Jadwal besok
- `/jadwal_minggu_ini` - Jadwal minggu ini

**Format Embed:**
- Title: "📅 Jadwal Hari Ini" / "📅 Jadwal Besok" / "📊 Jadwal Minggu Ini"
- Color: Blue (#3498db)
- Description: Setiap jadwal dengan format:
  ```
  **1. 📖 Mata Pelajaran**
  ⏰ 08:00-09:30 • 🏫 Ruangan • 👨‍🏫 Guru
  🆔 `schedule_id`
  
  **2. 📖 Mata Pelajaran Lain**
  ⏰ 09:30-11:00 • 🏫 Ruangan • 👨‍🏫 Guru
  🆔 `schedule_id`
  ```

### Piket Commands
- `/piket` - Piket hari ini
- `/piket_minggu_ini` - Piket minggu ini

**Format Embed:**
- Title: "🧹 Piket Senin" / "🧹 Jadwal Piket Minggu Ini"
- Color: Green (#2ecc71)
- Description: Daftar nama siswa dengan format:
  ```
  **Petugas Piket:**
  1. Nama Siswa 1
  2. Nama Siswa 2
  
  **📅 Selasa**
  1. Nama Siswa 3
  2. Nama Siswa 4
  ```

## Keuntungan Format Baru

1. **Ephemeral Replies**: Mengurangi spam di channel, hanya user yang request yang lihat
2. **Spacing Lebih Baik**: Double newline antar item membuat lebih mudah dibaca
3. **Visual Hierarchy**: Bold untuk judul, regular untuk detail
4. **Tidak Terlalu Mepet**: Jarak yang cukup antar tugas/jadwal
5. **Konsisten**: Format yang sama untuk semua list commands

## Platform Support

- **Discord**: Menggunakan Embed format dengan ephemeral reply
- **WhatsApp**: Tetap menggunakan plain text format (tidak support embed/ephemeral)

Bot secara otomatis mendeteksi platform dan menggunakan format yang sesuai.

## Technical Details

### Response Structure
```typescript
interface CommandResponse {
  success: boolean;
  message: string;  // For WhatsApp or error messages
  embedData?: {     // For Discord list commands
    title: string;
    description?: string;  // Main content with spacing
    color: number;
    fields?: Array<{       // Optional fields
      name: string;
      value: string;
      inline?: boolean;
    }>;
  };
  ephemeral?: boolean;  // Only visible to user
}
```

### Implementation
- `MemberCommandHandler`: Mendeteksi platform dan return embedData dengan description
- `CommandRouter`: Support embedData dan ephemeral flag
- `bot.ts`: Membuat EmbedBuilder dengan description dan set ephemeral flag
- Description menggunakan `\n\n` untuk spacing antar item
