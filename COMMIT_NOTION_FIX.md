# Notion Integration Fix - API v2025-09-03 Migration

## Problem
Notion status menunjukkan "Disabled" meskipun `NOTION_ENABLED=true` sudah di-set di `.env`.

## Root Cause
Notion SDK v5.9.0 menggunakan API version 2025-09-03 yang memiliki perubahan breaking:
- **Database** sekarang adalah container untuk satu atau lebih **Data Sources**
- Method `databases.query()` sudah tidak ada lagi
- Diganti dengan `dataSources.query()` yang memerlukan `data_source_id` bukan `database_id`

## Solution Implemented

### 1. Database ID Format Fix
Updated `.env` dengan format UUID yang benar (8-4-4-4-12):
```
NOTION_DATABASE_ID=3030a8e2-4bf6-807b-b826-d8667d0764b0
```

### 2. NotionService.ts Refactoring
- Added `formatDatabaseId()` method untuk auto-format database ID
- Added `getDataSourceId()` method untuk fetch data source ID dari database
- Updated `syncFromNotion()` untuk menggunakan `dataSources.query()`
- Updated `getSyncStats()` untuk menggunakan `dataSources.query()`
- Updated type definitions untuk include `dataSources` API

### 3. API Migration Details
**Before (API v2022-06-28):**
```typescript
await notion.databases.query({
  database_id: databaseId,
  filter: { ... }
});
```

**After (API v2025-09-03):**
```typescript
// Step 1: Get data source ID from database
const database = await notion.databases.retrieve({
  database_id: databaseId
});
const dataSourceId = database.data_sources[0].id;

// Step 2: Query data source
await notion.dataSources.query({
  data_source_id: dataSourceId,
  filter: { ... }
});
```

## Test Results
```
✅ isEnabled(): true
✅ Database ID formatted: 3030a8e2-4bf6-807b-b826-d8667d0764b0
✅ Data source ID retrieved: 3030a8e2-4bf6-8078-84cd-000b442d099d
✅ getSyncStats() successful
✅ Notion is fully functional!
```

## Files Modified
- `.env` - Updated database ID format
- `src/services/NotionService.ts` - Migrated to API v2025-09-03
- `scripts/verify-notion-status.js` - Test script
- `scripts/test-databases-query-direct.js` - Debug script (new)

## References
- [Notion API Upgrade Guide 2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03)
- [Query a Data Source](https://developers.notion.com/reference/query-a-data-source)
- [@notionhq/client v5.9.0](https://www.npmjs.com/package/@notionhq/client)

## Notes
- For legacy databases (created before the update), there's one default data source
- The service automatically fetches and caches the data source ID on first use
- All Notion API calls now use the new `dataSources` endpoints
- Database ID format is auto-corrected to UUID format if needed
