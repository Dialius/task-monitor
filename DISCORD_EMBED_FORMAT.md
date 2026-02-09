# Discord Embed Format

## Overview
Bot sekarang menggunakan Discord Embeds untuk menampilkan list tugas, jadwal, dan piket. Embed memberikan tampilan yang lebih rapi dengan kotak berwarna dan field yang terpisah.

## Commands yang Menggunakan Embed

### Tugas Commands
- `/tugas` - Semua tugas aktif
- `/tugas_hari_ini` - Tugas hari ini
- `/tugas_minggu_ini` - Tugas minggu ini

**Format Embed:**
- Title: "📝 Daftar Tugas" / "📅 Tugas Hari Ini" / "📊 Tugas Minggu Ini"
- Color: Blue (#3498db)
- Fields: Setiap tugas ditampilkan sebagai field terpisah dengan:
  - Name: `1. 👤 Judul Tugas`
  - Value: `🚨 Mata Pelajaran • Deadline\nDeskripsi\n🆔 task_id`

### Jadwal Commands
- `/jadwal` atau `/jadwal_hari_ini` - Jadwal hari ini
- `/jadwal_besok` - Jadwal besok
- `/jadwal_minggu_ini` - Jadwal minggu ini

**Format Embed:**
- Title: "📅 Jadwal Hari Ini" / "📅 Jadwal Besok" / "📊 Jadwal Minggu Ini"
- Color: Blue (#3498db)
- Fields: Setiap jadwal ditampilkan sebagai field terpisah dengan:
  - Name: `1. 📖 Mata Pelajaran`
  - Value: `⏰ 08:00-09:30 • 🏫 Ruangan • 👨‍🏫 Guru\n🆔 schedule_id`

### Piket Commands
- `/piket` - Piket hari ini
- `/piket_minggu_ini` - Piket minggu ini

**Format Embed:**
- Title: "🧹 Piket Senin" / "🧹 Jadwal Piket Minggu Ini"
- Color: Green (#2ecc71)
- Fields: Daftar nama siswa yang piket

## Keuntungan Embed

1. **Lebih Rapi**: Setiap item ditampilkan dalam field terpisah dengan border
2. **Mudah Dibaca**: Tidak ada masalah dengan line break yang hilang
3. **Visual Menarik**: Warna dan struktur yang jelas
4. **Konsisten**: Format yang sama untuk semua list commands

## Platform Support

- **Discord**: Menggunakan Embed format (kotak berwarna)
- **WhatsApp**: Tetap menggunakan plain text format (tidak support embed)

Bot secara otomatis mendeteksi platform dan menggunakan format yang sesuai.

## Technical Details

### Response Structure
```typescript
interface CommandResponse {
  success: boolean;
  message: string;  // For WhatsApp or error messages
  embedData?: {     // For Discord list commands
    title: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  };
}
```

### Implementation
- `MemberCommandHandler`: Mendeteksi platform dan return embedData untuk Discord
- `CommandRouter`: Support embedData dalam response
- `bot.ts`: Membuat EmbedBuilder dari embedData dan send ke Discord
