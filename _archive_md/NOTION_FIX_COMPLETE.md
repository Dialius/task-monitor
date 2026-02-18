# Notion Integration Fix - Complete Guide

## ✅ Masalah yang Sudah Diperbaiki

### 1. API Method Migration (SELESAI)
**Masalah**: Code menggunakan `notion.databases.query()` yang tidak ada di Notion SDK v5

**Solusi**: Sudah diubah ke `notion.dataSources.query()` di 3 tempat:
- ✅ `syncFromNotion()` method (line ~360)
- ✅ `getSyncStats()` method (line ~770)
- ✅ Constructor validation (line ~115)

**Perubahan Parameter**:
- ❌ `database_id` (old)
- ✅ `data_source_id` (new)

### 2. Database ID Format (SELESAI)
**Format di .env**: `3030a8e2-4bf6-807b-b826-d8667d0764b0` (dengan dashes) ✅

---

## ❌ Masalah yang Masih Ada

### Error 404: "Could not find database"

**Error Message**:
```
Could not find database with ID: 3030a8e2-4bf6-807b-b826-d8667d0764b0. 
Make sure the relevant pages and databases are shared with your integration.
```

**Penyebab**: Ada 2 kemungkinan:

1. **Database belum di-share ke Integration** (paling mungkin)
2. **Database ID salah**

---

## 🔧 Cara Memperbaiki

### Opsi 1: Share Database ke Integration (RECOMMENDED)

1. **Buka Notion Database**:
   - Buka database yang ingin di-sync
   - Klik tombol "..." (three dots) di kanan atas

2. **Add Connection**:
   - Pilih "Add connections"
   - Cari integration Anda (nama yang Anda buat saat membuat API key)
   - Klik integration tersebut untuk memberikan akses

3. **Verify**:
   - Setelah di-share, database akan muncul di list "Connections"
   - Integration sekarang bisa membaca dan menulis ke database

### Opsi 2: Verifikasi Database ID

1. **Cara mendapatkan Database ID yang benar**:
   
   **Dari URL Browser**:
   ```
   https://www.notion.so/workspace/3030a8e24bf6807bb826d8667d0764b0?v=...
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                 Ini adalah Database ID (tanpa dashes)
   ```

2. **Convert ke format UUID** (dengan dashes):
   ```
   Original: 3030a8e24bf6807bb826d8667d0764b0
   UUID:     3030a8e2-4bf6-807b-b826-d8667d0764b0
            ^^^^^^^^ ^^^^ ^^^^ ^^^^ ^^^^^^^^^^^^
            8 chars  4    4    4    12 chars
   ```

3. **Update .env**:
   ```env
   NOTION_DATABASE_ID=3030a8e2-4bf6-807b-b826-d8667d0764b0
   ```

---

## 🧪 Testing

### Test 1: Verifikasi API Method
```bash
node scripts/test-notion-datasources-final.js
```

**Expected Output**:
```
✅ notion.dataSources exists
✅ dataSources.query() successful!
Found X active tasks
```

### Test 2: Test via Discord Bot
```
/status
```

**Expected Output**:
```
📊 Status Bot

✅ WhatsApp: Connected
✅ Discord: Connected  
✅ MongoDB: Connected
✅ Notion: Enabled (X tasks synced)
```

---

## 📝 Summary Perubahan Code

### File: `src/services/NotionService.ts`

**Perubahan 1**: Constructor validation
```typescript
// BEFORE
if (!this.notion.databases) { ... }

// AFTER  
if (!this.notion.dataSources) { ... }
```

**Perubahan 2**: syncFromNotion() method
```typescript
// BEFORE
return await this.notion.databases.query({
  database_id: this.databaseId,
  ...
});

// AFTER
return await this.notion.dataSources.query({
  data_source_id: this.databaseId,
  ...
});
```

**Perubahan 3**: getSyncStats() method
```typescript
// BEFORE
return await this.notion.databases.query({
  database_id: this.databaseId,
  ...
});

// AFTER
return await this.notion.dataSources.query({
  data_source_id: this.databaseId,
  ...
});
```

---

## ✅ Checklist

- [x] Update API method dari `databases.query()` ke `dataSources.query()`
- [x] Update parameter dari `database_id` ke `data_source_id`
- [x] Update constructor validation untuk check `dataSources`
- [x] Format Database ID dengan dashes di `.env`
- [x] No TypeScript errors
- [ ] **Share database ke Integration di Notion** ⬅️ LANGKAH TERAKHIR
- [ ] Test dengan `/status` command
- [ ] Test sync dengan `/test_reminder` atau manual sync

---

## 🎯 Next Steps

1. **Buka Notion** dan share database ke integration Anda
2. **Restart bot** untuk reload configuration
3. **Test** dengan command `/status` di Discord
4. Jika masih error, cek Database ID di `.env` apakah sudah benar

---

## 📚 References

- [Notion SDK v5 Documentation](https://github.com/makenotion/notion-sdk-js)
- [Notion API Reference](https://developers.notion.com/reference)
- [Database Query API](https://developers.notion.com/reference/post-database-query)
