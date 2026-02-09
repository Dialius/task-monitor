# Discord Embed Format - Structured & Professional

## Format Baru (Dengan Label yang Jelas)

### Tugas
```
📝 Daftar Tugas

1. 👤 Soal Matematika Bab 5
Mata Pelajaran: Matematika
Deadline: Sel, 10 Feb
Deskripsi: Selesaikan soal integral di halaman 45-50.
ID: 6989fc62e52dcb6f17493d50

2. 👥 Project Kelompok Fisika
Mata Pelajaran: Fisika
Deadline: Rab, 11 Feb
Deskripsi: Buat laporan percobaan gerak parabola.
ID: 698a03549dda47605a31901c
```

### Jadwal
```
📅 Jadwal Hari Ini

1. Matematika
Waktu: 08:00-09:30
Ruangan: Lab 1
Guru: Pak Budi
ID: 6989fc62e52dcb6f17493d50

2. Fisika
Waktu: 09:30-11:00
Ruangan: Lab 2
Guru: Bu Ani
ID: 698a03549dda47605a31901c
```

### Piket
```
🧹 Piket Senin

1. Ahmad
2. Budi
3. Citra
```

## Keuntungan Format dengan Label

1. ✅ **Jelas & Terstruktur** - Setiap informasi punya label yang jelas
2. ✅ **Mudah Dibaca** - Format key: value yang familiar
3. ✅ **Professional** - Terlihat lebih rapi dan organized
4. ✅ **Konsisten** - Semua field menggunakan format yang sama
5. ✅ **Automatic Spacing** - Discord fields otomatis memberi jarak antar item

## Format Technical

### Menggunakan Discord Fields
Setiap tugas/jadwal adalah **field** terpisah dengan:
- **name**: Judul (nomor + emoji + nama)
- **value**: Detail dengan label yang jelas
- **inline**: false (full width, tidak bersebelahan)

### Label yang Digunakan

**Tugas:**
- Mata Pelajaran: [nama]
- Deadline: [tanggal]
- Deskripsi: [detail]
- ID: [id]

**Jadwal:**
- Waktu: [jam mulai-jam selesai]
- Ruangan: [nama ruangan]
- Guru: [nama guru]
- ID: [id]

**Piket:**
- Langsung list nama (tanpa label)

## Perbandingan Format

### ❌ Format Lama (Tanpa Label)
```
1. 👤 Soal Matematika Bab 5
Matematika • Sel, 10 Feb
Selesaikan soal integral di halaman 45-50.
6989fc62e52dcb6f17493d50
```
**Masalah:** Tidak jelas mana mata pelajaran, mana deadline, mana ID

### ✅ Format Baru (Dengan Label)
```
1. 👤 Soal Matematika Bab 5
Mata Pelajaran: Matematika
Deadline: Sel, 10 Feb
Deskripsi: Selesaikan soal integral di halaman 45-50.
ID: 6989fc62e52dcb6f17493d50
```
**Keuntungan:** Setiap informasi jelas dan mudah dipahami

## Best Practices Discord Embed

Format ini mengikuti best practices Discord:
1. Menggunakan **fields** untuk data terstruktur
2. Label yang **jelas dan konsisten**
3. **Automatic spacing** antar fields
4. **Full width** fields untuk readability
5. Maximum **25 fields** per embed (lebih dari cukup)
