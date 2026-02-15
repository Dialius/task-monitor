# Status Bot Update - Animated Emoji & Duplicate Embed Fix

## Perubahan yang Dilakukan

### 1. Konfigurasi Emoji Baru
File: `src/config/emoji.config.ts`

Menambahkan konfigurasi untuk animated emoji yang digunakan di status bot:
- `SYSTEM` (1472589040430612480) - Icon system/satellite
- `INFO` (1472589035947032608) - Icon info/chart  
- `ONLINE` (1472589043752767548) - Green circle/pulse
- `SUCCESS` (1472589046554427392) - Checkmark
- `DATABASE` (1472589046554427392) - Database icon

### 2. Update Command `/status`
File: `src/handlers/MemberCommandHandler.ts` - Method `handleStatus`

Perubahan format embed status bot:

#### Format Lama:
```
🤖 Status Bot
✅ Bot aktif
⏱️ Uptime: 0h 24m
📊 Platform: Multi-platform
🔧 Version: 1.0.0

MongoDB Status:
✅ Connected
📊 Database: task_monitor_bot

Notion Status:
✅ Connected
```

#### Format Baru (Sesuai Mockup):
```
<animated:system> System Status Monitor
`System operational. Monitoring active tasks.`

<animated:info> General Information
> Status
> <animated:online> Active (Online)
> 
> Uptime
> `0h 24m`
> 
> Version
> `v1.0.0`

<animated:database> Database & Integrations
> MongoDB
> <animated:success> Connected
> └ `DB: task_monitor_bot`
> 
> Notion API
> <animated:success> Connected
```

Fitur baru:
- Menggunakan animated emoji custom
- Format dengan quote blocks (>) untuk tampilan lebih rapi
- Inline fields untuk layout side-by-side
- Footer dengan timestamp
- Warna embed berubah merah jika ada koneksi yang gagal

### 3. Fix Duplicate Embed pada Command Tugas
File: `src/handlers/MemberCommandHandler.ts`

#### Masalah:
Ketika menggunakan command `/tugas`, `/tugas_hari_ini`, atau `/tugas_minggu_ini` dengan pagination, muncul 2 embed:
1. Message sync status: "🔄 Synced from Notion: X tasks"
2. Embed pagination dengan daftar tugas

#### Solusi:
Menghapus `syncStatus` dari `message` ketika menggunakan pagination:

**Command yang diperbaiki:**
- `handleTugas` - Line 30
- `handleTugasHariIni` - Line 138  
- `handleTugasMingguIni` - Line 244

**Perubahan:**
```typescript
// SEBELUM (dengan duplicate)
if (tasks.length > 5) {
  return {
    success: true,
    message: syncStatus, // ❌ Ini menyebabkan duplicate
    data: {
      usePagination: true,
      ...
    }
  };
}

// SESUDAH (tanpa duplicate)
if (tasks.length > 5) {
  return {
    success: true,
    message: '', // ✅ Kosong untuk pagination
    data: {
      usePagination: true,
      ...
    }
  };
}
```

**Catatan:** Sync status tetap ditampilkan untuk:
- WhatsApp (ditambahkan ke message text)
- Discord dengan ≤5 tasks (tidak menggunakan pagination)

### 4. Verifikasi Command Lain

Semua command lain sudah diperiksa dan tidak memiliki masalah duplicate embed karena:
- Command yang mengembalikan `embedData` selalu menggunakan `message: ''`
- Command yang mengembalikan `message` tidak menggunakan `embedData`
- Hanya command tugas yang menggunakan pagination

## Testing

### Test Status Command
```
/status
```
Expected: Embed dengan animated emoji dan format baru

### Test Tugas Commands (Pagination)
```
/tugas
/tugas_hari_ini
/tugas_minggu_ini
```
Expected: 
- Jika >5 tasks: Hanya 1 embed dengan pagination buttons
- Jika ≤5 tasks: 1 embed tanpa pagination
- Tidak ada duplicate message/embed

### Test Tugas Commands (WhatsApp)
```
/tugas
```
Expected: Text message dengan sync status di akhir

## Emoji IDs yang Digunakan

Pastikan emoji berikut sudah di-upload ke Discord server:
- `database`: 1472589046554427392
- `online`: 1472589043752767548  
- `success`: 1472589046554427392
- `system`: 1472589040430612480
- `info`: 1472589035947032608

## File yang Diubah

1. `src/config/emoji.config.ts` - BARU
   - Konfigurasi animated emoji dan warna embed

2. `src/handlers/MemberCommandHandler.ts` - DIUBAH
   - Method `handleStatus` (Line 746) - Format baru dengan animated emoji
   - Method `handleTugas` (Line 30) - Fix duplicate embed
   - Method `handleTugasHariIni` (Line 138) - Fix duplicate embed
   - Method `handleTugasMingguIni` (Line 244) - Fix duplicate embed

3. `src/utils/CommandRouter.ts` - DIUBAH
   - Interface `CommandResponse` - Tambah support untuk footer dan timestamp di embedData

4. `src/bot.ts` - DIUBAH
   - Slash command handler - Support custom footer dan timestamp
   - Message command handler - Support custom footer dan timestamp

## Rollback Instructions

Jika perlu rollback:
1. Hapus file `src/config/emoji.config.ts`
2. Revert perubahan di `src/handlers/MemberCommandHandler.ts` ke commit sebelumnya
