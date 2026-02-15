# Cara Update Animated Emoji

## Langkah-langkah Upload Emoji ke Discord

1. Buka Discord Server Settings
2. Pilih menu "Emoji" di sidebar
3. Klik tombol "Upload Emoji"
4. Upload file emoji animated (format .gif)
5. Beri nama emoji sesuai kebutuhan:
   - `database` - Icon database
   - `online` - Green circle/pulse
   - `success` - Checkmark
   - `system` - System/satellite icon
   - `info` - Info/chart icon
   - `error` - Error/X icon for disconnected status

## Cara Mendapatkan Emoji ID

### Method 1: Dari Discord Client
1. Ketik emoji di chat dengan format: `\:nama_emoji:`
   Contoh: `\:database:`
2. Discord akan menampilkan format lengkap: `<a:database:1472589046554427392>`
3. Copy angka ID di akhir (setelah tanda `:` terakhir)

### Method 2: Dari Developer Mode
1. Aktifkan Developer Mode di Discord:
   - User Settings → Advanced → Developer Mode (ON)
2. Klik kanan pada emoji
3. Pilih "Copy ID"

## Update Emoji ID di Kode

Edit file: `src/config/emoji.config.ts`

```typescript
export const EMOJI = {
  // Status Monitor Emojis
  SYSTEM: '<a:system:GANTI_DENGAN_ID_BARU>',
  INFO: '<a:info:GANTI_DENGAN_ID_BARU>',
  ONLINE: '<a:online:GANTI_DENGAN_ID_BARU>',
  SUCCESS: '<a:success:GANTI_DENGAN_ID_BARU>',
  DATABASE: '<:database:GANTI_DENGAN_ID_BARU>',
  ERROR: '<a:error:GANTI_DENGAN_ID_BARU>',
  
  // Pagination Emojis (already in use)
  PREV: 'GANTI_DENGAN_ID_BARU',
  NEXT: 'GANTI_DENGAN_ID_BARU'
} as const;
```

## Format Emoji

### Untuk Emoji di Text/Description
Gunakan format lengkap dengan `<a:nama:id>`:
```typescript
SYSTEM: '<a:system:1472589040430612480>'
```

### Untuk Emoji di Button
Gunakan hanya ID (tanpa `<a:nama:>`):
```typescript
PREV: '1472405030584848599'
```

## Testing

Setelah update emoji ID:

1. Restart bot
2. Test command `/status`
3. Pastikan semua emoji muncul dengan benar
4. Jika emoji tidak muncul:
   - Cek apakah bot ada di server yang sama dengan emoji
   - Cek apakah emoji ID sudah benar
   - Cek apakah emoji masih ada (tidak dihapus)

## Troubleshooting

### Emoji Tidak Muncul
- Pastikan bot ada di server yang sama dengan emoji
- Emoji custom hanya bisa digunakan di server tempat emoji di-upload
- Atau bot harus punya Nitro untuk menggunakan emoji dari server lain

### Emoji Muncul Sebagai Text
- Format emoji salah, cek kembali format `<a:nama:id>`
- ID emoji salah atau emoji sudah dihapus

### Emoji Tidak Animated
- Pastikan menggunakan format `<a:nama:id>` bukan `<:nama:id>`
- `<a:` untuk animated emoji
- `<:` untuk static emoji

## Emoji yang Digunakan

Berikut daftar emoji yang digunakan di bot:

| Nama | Kegunaan | Lokasi Penggunaan |
|------|----------|-------------------|
| system | Icon system/satellite | Status embed title |
| info | Icon info/chart | General Information field |
| online | Green circle/pulse | Status Active indicator |
| success | Checkmark | MongoDB/Notion connected |
| database | Database icon | Database & Integrations field |
| error | Error/X icon | MongoDB/Notion disconnected |
| prev | Previous arrow | Pagination button |
| next | Next arrow | Pagination button |

## Backup Emoji

Simpan file emoji animated di folder `assets/emojis/` untuk backup:
- `database.gif`
- `online.gif`
- `success.gif`
- `system.gif`
- `info.gif`
- `error.gif`
- `prev.gif`
- `next.gif`
