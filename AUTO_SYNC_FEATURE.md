# Auto-Sync from Notion Feature

## Overview
Bot sekarang otomatis melakukan sync dari Notion sebelum menampilkan data tugas. Ini memastikan data yang ditampilkan selalu up-to-date dengan Notion database.

## Commands dengan Auto-Sync

### Member Commands
1. **`/tugas`** - Sync sebelum menampilkan semua tugas aktif
2. **`/tugas_hari_ini`** - Sync sebelum menampilkan tugas hari ini
3. **`/tugas_minggu_ini`** - Sync sebelum menampilkan tugas minggu ini

### Admin Commands
4. **`/test_reminder`** - Sync sebelum generate preview reminder

## Cara Kerja

1. User mengirim command (contoh: `/tugas`)
2. Bot mengecek apakah Notion service enabled
3. Jika enabled, bot otomatis sync dari Notion ke MongoDB
4. Bot query data dari MongoDB (yang sudah ter-update)
5. Bot menampilkan hasil ke user

## Keuntungan

✅ **Selalu Up-to-Date**: Data yang ditampilkan selalu sinkron dengan Notion
✅ **Otomatis**: Tidak perlu manual sync sebelum query
✅ **Transparent**: User tidak perlu tahu tentang proses sync
✅ **Efficient**: Hanya sync saat ada command yang membutuhkan data tugas

## Technical Details

### File yang Dimodifikasi
- `src/handlers/MemberCommandHandler.ts` - Added NotionService injection + auto-sync
- `src/handlers/AdminCommandHandler.ts` - Added auto-sync to test_reminder
- `src/bot.ts` - Pass NotionService to MemberCommandHandler

### Implementation
```typescript
// Auto-sync before querying
if (this.notionService.isEnabled()) {
  logger.info('Auto-syncing from Notion before command');
  await this.notionService.syncFromNotion();
}

// Then query from MongoDB
const tasks = await this.taskService.getTasks();
```

## Logging

Setiap auto-sync akan tercatat di log:
```
Auto-syncing from Notion before /tugas command
Starting Notion sync...
Notion sync completed { synced: 10, errors: 0, total: 10 }
```

## Error Handling

Jika sync gagal, bot akan:
1. Log error ke file log
2. Tetap menampilkan data dari MongoDB (cached data)
3. User tetap mendapat response (tidak error)

## Configuration

Auto-sync hanya berjalan jika:
- `NOTION_API_KEY` ada di `.env`
- `NOTION_DATABASE_ID` ada di `.env`
- Notion service enabled

Jika Notion disabled, command tetap berjalan normal tanpa sync.
