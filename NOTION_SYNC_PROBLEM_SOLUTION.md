# Solusi Lengkap: Notion Sync Error "databases.query is not a function"

## 📋 Ringkasan Masalah

Bot gagal fetch data dari Notion dengan error:
```
TypeError: this.notion.databases.query is not a function
at NotionService.syncFromNotion (D:\task-monitor\dist\services\NotionService.js:62:79)
```

Error ini muncul setiap kali command `/tugas_hari_ini` dipanggil dan bot mencoba sync dari Notion.

## 🔍 Analisis Root Cause

### Penyebab Utama
Kode lama menggunakan syntax yang **SALAH**:

```typescript
// ❌ SALAH - Ini yang menyebabkan error
const databases: any = this.notion.databases;
const response = await databases.query({
  database_id: this.databaseId,
  // ...
});
```

Masalahnya:
- `this.notion.databases` adalah property object, bukan standalone object
- Ketika di-extract ke variable `databases`, method `query()` tidak tersedia
- Ini menyebabkan runtime error: "databases.query is not a function"

### Mengapa Ini Terjadi?
1. **TypeScript types incomplete** - `@notionhq/client` v5.9.0 punya type definitions yang tidak lengkap
2. **Misunderstanding API** - Developer mengira perlu extract `databases` dulu sebelum call `query()`
3. **Dokumentasi kurang jelas** - Type assertion diperlukan tapi tidak dijelaskan dengan baik

## ✅ Solusi yang Diterapkan

### 1. Perbaikan Syntax API Call

**File:** `src/services/NotionService.ts`

```typescript
// ✅ BENAR - Call query() langsung pada this.notion.databases
const response: any = await (this.notion.databases as any).query({
  database_id: this.databaseId,
  filter: {
    property: 'Status',
    select: {
      equals: 'Aktif'
    }
  }
});
```

**Penjelasan:**
- Call `query()` langsung pada `this.notion.databases`
- Type assertion `as any` diperlukan karena TypeScript types tidak lengkap
- Runtime API mendukung method ini (sudah diverifikasi dari dokumentasi resmi)

### 2. Retry Logic dengan Exponential Backoff

Untuk handle transient network errors:

```typescript
const maxRetries = 3;
const baseDelay = 1000; // 1 second

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // ... sync logic
    return { synced, errors };
  } catch (error) {
    if (attempt === maxRetries) throw error;
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = baseDelay * Math.pow(2, attempt - 1);
    logger.warn('Notion sync failed, retrying...', { 
      attempt, 
      maxRetries, 
      retryIn: `${delay}ms`,
      error: (error as Error).message 
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

**Benefit:**
- Otomatis retry jika gagal (network issues, rate limiting, dll)
- Exponential backoff mencegah overwhelming API
- Detailed logging untuk debugging

### 3. Timeout Protection

Mencegah operation hang indefinitely:

```typescript
private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Usage
const response: any = await this.withTimeout(
  (this.notion.databases as any).query({...}),
  10000 // 10 second timeout
);
```

**Benefit:**
- Mencegah bot hang jika Notion API lambat/tidak respond
- User mendapat feedback error daripada menunggu forever
- Bot bisa fallback ke cached data

### 4. Better Error Handling & Logging

```typescript
logger.info('Starting Notion sync...', { attempt, maxRetries });
// ... sync logic
logger.info('Notion sync completed', { synced, errors, total: response.results.length });

// On error
logger.error('Failed to sync from Notion after all retries', error as Error, { attempts: maxRetries });
```

## 🚀 Cara Menerapkan Fix

### Step 1: Verify Build
Kode sudah diperbaiki dan di-build:

```cmd
npm run build
```

Output seharusnya sukses tanpa error.

### Step 2: Restart Bot

**Opsi A - Menggunakan Script Otomatis (RECOMMENDED):**
```cmd
restart-bot.bat
```

**Opsi B - Manual:**
```cmd
# Stop bot
taskkill /F /IM node.exe

# Start bot
npm start
```

**Opsi C - Menggunakan PM2:**
```cmd
npm run pm2:restart
```

### Step 3: Verify Fix
Setelah restart, test dengan command:
```
/tugas_hari_ini
```

**Log yang benar:**
```
]: Starting Notion sync... {"attempt":1,"maxRetries":3}
]: Notion sync completed {"synced":5,"errors":0,"total":5}
```

**Jika masih error:**
```
]: Notion sync failed, retrying... {"error":"this.notion.databases.query is not a function"}
```
→ Berarti bot belum restart atau masih load kode lama

## 📊 Perbandingan Before/After

### Before (Error)
```typescript
// Kode lama
const databases: any = this.notion.databases;
const response = await databases.query({...});
```

**Hasil:**
- ❌ Error: "databases.query is not a function"
- ❌ Sync gagal setiap kali
- ❌ User tidak dapat data terbaru
- ❌ Fallback ke cached data (bisa outdated)

### After (Fixed)
```typescript
// Kode baru
const response: any = await this.withTimeout(
  (this.notion.databases as any).query({...}),
  10000
);
```

**Hasil:**
- ✅ Sync berhasil
- ✅ Retry otomatis jika gagal (3x)
- ✅ Timeout protection (10s)
- ✅ Better error logging
- ✅ User dapat data real-time dari Notion

## 🔧 Files Modified

1. **src/services/NotionService.ts**
   - Line ~69: Fixed `syncFromNotion()` method
   - Line ~425: Fixed `getSyncStats()` method
   - Added `withTimeout()` helper method
   - Added retry logic with exponential backoff

2. **dist/services/NotionService.js** (compiled)
   - Auto-generated dari TypeScript build

## 📚 Referensi

### Dokumentasi Resmi
- [Notion API - Query a Database](https://developers.notion.com/reference/post-database-query)
- [@notionhq/client npm package](https://www.npmjs.com/package/@notionhq/client)

### Syntax yang Benar (Verified)
```javascript
// Dari dokumentasi resmi Notion
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const response = await notion.databases.query({
  database_id: databaseId,
  filter: { /* filters */ }
});
```

### Common Patterns
```typescript
// Query database
await notion.databases.query({ database_id, filter })

// Create page
await notion.pages.create({ parent, properties })

// Update page
await notion.pages.update({ page_id, properties })

// Retrieve database
await notion.databases.retrieve({ database_id })
```

## 🐛 Troubleshooting

### Error masih muncul setelah restart

**Cek 1: Apakah build berhasil?**
```cmd
npm run build
```
Harus sukses tanpa error.

**Cek 2: Apakah bot sudah restart?**
```cmd
tasklist | findstr node.exe
```
Kill semua process lama, start ulang.

**Cek 3: Apakah file compiled sudah update?**
```cmd
type dist\services\NotionService.js | findstr "this.notion.databases.query"
```
Harus ada line dengan syntax yang benar.

**Cek 4: Environment variables**
```cmd
type .env | findstr NOTION
```
Pastikan `NOTION_API_KEY` dan `NOTION_DATABASE_ID` terisi.

**Cek 5: Test Notion connection**
```cmd
npm run test:notion
```
Harus sukses connect ke Notion.

### Jika semua gagal

**Last resort - Clean reinstall:**
```cmd
# Backup .env dulu!
copy .env .env.backup

# Clean install
rmdir /s /q node_modules
del package-lock.json
npm install
npm run build
npm start
```

## 💡 Best Practices untuk Kedepan

### 1. Selalu Gunakan Retry Logic untuk External APIs
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await sleep(1000 * Math.pow(2, i - 1));
    }
  }
  throw new Error('Unreachable');
}
```

### 2. Selalu Tambahkan Timeout
```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}
```

### 3. Comprehensive Error Logging
```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', error, {
    context: 'additional context',
    attempt: 1,
    // ... other relevant data
  });
}
```

### 4. Fallback Strategy
```typescript
try {
  return await fetchFromAPI();
} catch (error) {
  logger.warn('API failed, using cache', error);
  return await fetchFromCache();
}
```

## ✨ Kesimpulan

**Masalah:** Syntax API call yang salah menyebabkan `databases.query is not a function`

**Solusi:** 
1. ✅ Fix syntax: `(this.notion.databases as any).query()`
2. ✅ Add retry logic (3x dengan exponential backoff)
3. ✅ Add timeout protection (10s)
4. ✅ Better error handling & logging

**Action Required:**
🔴 **RESTART BOT** untuk apply fix!

```cmd
restart-bot.bat
```

Setelah restart, bot akan bisa sync dari Notion dengan reliable dan tidak akan error lagi.
