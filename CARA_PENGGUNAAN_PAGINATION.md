# Cara Penggunaan Fitur Pagination & Fixes

## 🎯 Fitur Baru

### 1. Pagination untuk Discord

Ketika ada banyak tugas (> 5), bot akan otomatis menampilkan pagination dengan button navigasi.

#### Cara Menggunakan:

**Di Discord:**
```
/tugas
/tugas_hari_ini
/tugas_minggu_ini
```

**Hasil:**
- Jika tugas ≤ 5: Tampil normal tanpa pagination
- Jika tugas > 5: Tampil dengan button animated ⏪ (previous) dan ⏩ (next)

**Navigasi:**
- Klik ⏪ (animated) untuk halaman sebelumnya
- Klik ⏩ (animated) untuk halaman berikutnya
- Button akan disabled jika sudah di halaman pertama/terakhir
- Nomor halaman ditampilkan di tengah (contoh: "2 / 4")

**Catatan:**
- Hanya user yang mengirim command yang bisa klik button
- Button akan disabled setelah 2 menit (timeout)
- Setiap halaman menampilkan maksimal 5 tugas

### 2. Activity Status yang Benar

Activity Discord bot sekarang menampilkan data real-time dengan benar.

#### Placeholder yang Didukung:

```
{total}    - Total tugas aktif (contoh: "5")
{active}   - Total tugas aktif (sama dengan {total})
{today}    - Tugas deadline hari ini (contoh: "2")
{urgent}   - Tugas urgent < 24 jam (contoh: "3")
{hours}    - Jam sampai deadline terdekat (contoh: "12")
{nearest}  - Tanggal deadline terdekat (contoh: "15 Feb")
{percent}  - Persentase tugas selesai (contoh: "75")
```

#### Contoh Activity:

```
👀 Watching 5 tugas aktif
👀 Watching deadline 12 jam lagi
👀 Watching tugas terdekat: 15 Feb
👀 Watching 3 tugas urgent!
```

**Konfigurasi:**

Edit file `.kiro/settings/discord.config.json`:

```json
{
  "activity": {
    "enabled": true,
    "rotationInterval": 5,
    "templates": [
      {
        "type": 3,
        "text": "{total} tugas aktif",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "deadline {hours} jam lagi",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "tugas terdekat: {nearest}",
        "dynamic": true
      }
    ]
  }
}
```

### 3. Command WhatsApp yang Benar

Semua command sekarang tampil dengan benar di WhatsApp (tidak kosong lagi).

#### Command yang Diperbaiki:

**1. /help atau /bantuan**
```
/help
```

**Output:**
```
📖 *Daftar Perintah*

👥 *Perintah Member*
• /tugas - Lihat semua tugas aktif
• /tugas_hari_ini - Tugas hari ini
• /tugas_minggu_ini - Tugas minggu ini
• /jadwal - Jadwal hari ini
• /jadwal_besok - Jadwal besok
• /jadwal_minggu_ini - Jadwal minggu ini
• /piket - Piket hari ini
• /piket_minggu_ini - Piket minggu ini
• /status - Status bot
• /help - Bantuan

👨‍💼 *Perintah Admin*
• /add_tugas - Tambah tugas
• /add_tugas_cepat - Tambah tugas cepat
• /edit_tugas - Edit tugas
• /hapus_tugas - Hapus tugas
• /tandai_selesai - Tandai selesai
• /add_jadwal - Tambah jadwal
• /set_piket - Atur piket
• /add_pengumuman - Tambah pengumuman

👑 *Perintah Ketua/Wakil*
• /broadcast - Broadcast pesan
• /broadcast_urgent - Broadcast urgent
```

**2. /status**
```
/status
```

**Output:**
```
🤖 *Status Bot*

✅ Bot aktif
⏱️ Uptime: 2h 15m
📊 Platform: Multi-platform (Discord + WhatsApp)
🔧 Version: 1.0.0

MongoDB Status:
✅ Connected
📊 Database: class_reminder

Notion Status:
✅ Connected
📊 Tasks in Notion: 15
💾 Tasks in MongoDB: 15
```

### 4. Timezone WIB yang Benar

Bot sekarang menggunakan timezone WIB (Asia/Jakarta) untuk semua operasi date/time.

#### Fitur DateTimeHelper:

**1. Get Current Time (WIB)**
```typescript
const now = DateTimeHelper.now();
// Returns: Date object in WIB timezone
```

**2. Format Date in Indonesian**
```typescript
const fullDate = DateTimeHelper.formatFullDate(date);
// Returns: "Senin, 15 Februari 2026"

const shortDate = DateTimeHelper.formatShortDate(date);
// Returns: "Sen, 15 Feb"
```

**3. Check Date**
```typescript
const isToday = DateTimeHelper.isToday(deadline);
const isTomorrow = DateTimeHelper.isTomorrow(deadline);
const isThisWeek = DateTimeHelper.isThisWeek(deadline);
const isUrgent = DateTimeHelper.isUrgent(deadline); // < 24 hours
```

**4. Calculate Time**
```typescript
const hours = DateTimeHelper.getHoursUntil(deadline);
const minutes = DateTimeHelper.getMinutesUntil(deadline);
```

**5. Relative Time in Indonesian**
```typescript
const relative = DateTimeHelper.formatRelativeTime(deadline);
// Returns: "2 jam lagi", "besok", "3 hari lagi", "1 minggu lagi"
```

**6. Priority Emoji**
```typescript
const emoji = DateTimeHelper.getPriorityEmoji(deadline);
// Returns:
// ⏰ - Overdue (sudah lewat)
// 🚨 - Very urgent (< 6 hours)
// ⚠️ - Urgent (< 24 hours)
// 📌 - Soon (< 72 hours)
// ℹ️ - Normal (> 72 hours)
```

## 🔧 Konfigurasi

### Discord Activity

Edit `.kiro/settings/discord.config.json`:

```json
{
  "activity": {
    "enabled": true,
    "rotationInterval": 5,
    "templates": [
      {
        "type": 3,
        "text": "{total} tugas aktif",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "deadline {hours} jam lagi",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "{urgent} tugas urgent!",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "tugas terdekat: {nearest}",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "{today} tugas hari ini",
        "dynamic": true
      },
      {
        "type": 3,
        "text": "completion: {percent}%",
        "dynamic": true
      }
    ]
  }
}
```

**Activity Types:**
- `0` = Playing
- `1` = Streaming
- `2` = Listening to
- `3` = Watching (recommended)
- `5` = Competing in

### Timezone

Timezone sudah di-hardcode ke WIB (Asia/Jakarta). Jika ingin ubah, edit `src/utils/DateTimeHelper.ts`:

```typescript
export class DateTimeHelper {
  private static readonly TIMEZONE = 'Asia/Jakarta'; // Ubah ini
  // ...
}
```

## 📊 Testing

### Test Pagination

1. **Tambah banyak tugas (> 5)**
```
/add_tugas | Tugas 1 | Deskripsi 1 | 2026-02-20 | Matematika | individu
/add_tugas | Tugas 2 | Deskripsi 2 | 2026-02-21 | Fisika | individu
/add_tugas | Tugas 3 | Deskripsi 3 | 2026-02-22 | Kimia | individu
/add_tugas | Tugas 4 | Deskripsi 4 | 2026-02-23 | Biologi | individu
/add_tugas | Tugas 5 | Deskripsi 5 | 2026-02-24 | Sejarah | individu
/add_tugas | Tugas 6 | Deskripsi 6 | 2026-02-25 | Geografi | individu
```

2. **Test pagination**
```
/tugas
```

3. **Klik button ⏪ dan ⏩ (animated)**
   - Pastikan navigasi bekerja
   - Pastikan nomor halaman update
   - Pastikan button disabled di halaman pertama/terakhir
   - Pastikan emoji animated tampil dengan benar

### Test Activity Status

1. **Pastikan ada tugas aktif**
```
/tugas
```

2. **Tunggu activity update** (sesuai interval di config)

3. **Check activity bot**
   - Buka Discord
   - Lihat activity bot di member list
   - Pastikan tidak ada placeholder `{hours}` atau `{nearest}`
   - Pastikan nilai yang ditampilkan benar

### Test WhatsApp Commands

1. **Test /help**
```
/help
```
Pastikan output tampil lengkap (tidak kosong)

2. **Test /status**
```
/status
```
Pastikan output tampil lengkap dengan info bot

3. **Test /tugas**
```
/tugas
```
Pastikan output tampil dengan format reminder yang rapi

## 🐛 Troubleshooting

### Pagination tidak muncul

**Masalah:** Button pagination tidak muncul meskipun ada > 5 tugas

**Solusi:**
1. Check console log untuk error
2. Pastikan Discord.js version support button (v14+)
3. Restart bot
4. Check apakah response.data.usePagination = true

### Activity masih menampilkan placeholder

**Masalah:** Activity menampilkan `{hours}` atau `{nearest}` tanpa diganti

**Solusi:**
1. Restart bot
2. Check apakah ada tugas aktif di database
3. Check console log untuk error di ActivityStatusService
4. Pastikan DateTimeHelper di-import dengan benar

### WhatsApp output kosong

**Masalah:** Command di WhatsApp tidak menampilkan output

**Solusi:**
1. Check apakah handler return `message` field (bukan hanya `embedData`)
2. Check console log untuk error
3. Pastikan platform = 'whatsapp' di handler
4. Pastikan `formatEmbedForWhatsApp()` dipanggil dengan benar

### Timezone salah

**Masalah:** Waktu yang ditampilkan tidak sesuai WIB

**Solusi:**
1. Check apakah DateTimeHelper digunakan untuk semua operasi date/time
2. Pastikan tidak ada `new Date()` langsung tanpa convert ke WIB
3. Check environment variable `TZ=Asia/Jakarta`
4. Restart bot

## 📝 Catatan Penting

1. **Pagination hanya untuk Discord** - WhatsApp tetap menggunakan format reminder yang panjang
2. **Button timeout 2 menit** - Setelah 2 menit, button akan disabled
3. **User-specific button** - Hanya user yang mengirim command yang bisa klik button
4. **Timezone WIB** - Semua waktu menggunakan Asia/Jakarta (UTC+7)
5. **Activity rotation** - Activity akan rotate sesuai interval yang dikonfigurasi

## 🎓 Best Practices

### Untuk Admin:

1. **Gunakan pagination untuk tugas banyak**
   - Jangan tambah terlalu banyak tugas sekaligus
   - Gunakan `/tandai_selesai` untuk tugas yang sudah selesai
   - Hapus tugas lama yang tidak relevan

2. **Konfigurasi activity yang informatif**
   - Gunakan placeholder yang relevan
   - Jangan terlalu banyak template (5-10 cukup)
   - Set interval yang wajar (3-5 menit)

3. **Monitor timezone**
   - Pastikan deadline tugas sesuai WIB
   - Check reminder time sesuai WIB
   - Gunakan format tanggal yang jelas

### Untuk User:

1. **Gunakan command yang tepat**
   - `/tugas` untuk semua tugas
   - `/tugas_hari_ini` untuk tugas hari ini saja
   - `/tugas_minggu_ini` untuk tugas minggu ini saja

2. **Navigasi pagination**
   - Klik button dengan sabar (jangan spam)
   - Tunggu sampai embed update
   - Button akan disabled setelah 2 menit

3. **Check activity bot**
   - Lihat activity bot untuk info cepat
   - Activity update otomatis sesuai interval
   - Jangan panic jika ada placeholder (tunggu update berikutnya)

---

**Dibuat oleh:** Kiro AI Assistant  
**Tanggal:** 15 Februari 2026  
**Status:** ✅ Ready to Use
