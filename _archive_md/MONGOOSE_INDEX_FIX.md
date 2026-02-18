# 🔧 Mongoose Duplicate Index Fix

## ❌ Masalah

Warning muncul di logs:
```
[MONGOOSE] Warning: Duplicate schema index on {"key":1} found. 
This is often due to declaring an index using both "index: true" and "schema.index()". 
Please remove the duplicate index definition.

[MONGOOSE] Warning: Duplicate schema index on {"hari":1} found.
```

## 🔍 Penyebab

Mongoose membuat index secara otomatis ketika field memiliki `unique: true`, tapi kita juga mendefinisikan index secara manual dengan `schema.index()`. Ini menyebabkan duplicate index.

### Contoh Masalah

**BotConfig.ts (SEBELUM):**
```typescript
const BotConfigSchema = new Schema<IBotConfig>({
  key: {
    type: String,
    unique: true,  // ← Index otomatis dibuat di sini
    // ...
  }
});

// Index manual dibuat di sini (DUPLICATE!)
BotConfigSchema.index({ key: 1 }, { unique: true });
```

**Piket.ts (SEBELUM):**
```typescript
const PiketSchema = new Schema<IPiket>({
  hari: {
    type: String,
    unique: true,  // ← Index otomatis dibuat di sini
    // ...
  }
});

// Index manual dibuat di sini (DUPLICATE!)
PiketSchema.index({ hari: 1 }, { unique: true });
```

## ✅ Solusi

Hapus `unique: true` dari field definition, biarkan hanya di `schema.index()`.

### BotConfig.ts (SETELAH)

```typescript
const BotConfigSchema = new Schema<IBotConfig>({
  key: {
    type: String,
    required: [true, 'Config key wajib diisi'],
    // unique: true removed - defined in index below to avoid duplicate
    trim: true,
    // ...
  }
});

// Index hanya didefinisikan di sini (TIDAK DUPLICATE)
BotConfigSchema.index({ key: 1 }, { unique: true });
```

### Piket.ts (SETELAH)

```typescript
const PiketSchema = new Schema<IPiket>({
  hari: {
    type: String,
    required: [true, 'Hari wajib dipilih'],
    // unique: true removed - defined in index below to avoid duplicate
    trim: true,
    // ...
  }
});

// Index hanya didefinisikan di sini (TIDAK DUPLICATE)
PiketSchema.index({ hari: 1 }, { unique: true });
```

## 📊 Perbandingan

| Approach | Duplicate Warning | Index Created | Recommended |
|----------|-------------------|---------------|-------------|
| `unique: true` only | ❌ No | ✅ Yes | ✅ Simple cases |
| `schema.index()` only | ❌ No | ✅ Yes | ✅ Complex indexes |
| Both | ⚠️ YES | ✅ Yes (2x) | ❌ Avoid |

## 🎯 Best Practice

### Simple Unique Index
```typescript
// Option 1: Use unique: true (simple)
const Schema = new Schema({
  email: {
    type: String,
    unique: true  // Simple, recommended for single field
  }
});
```

### Complex Index
```typescript
// Option 2: Use schema.index() (complex)
const Schema = new Schema({
  email: {
    type: String
    // No unique here
  }
});

// Recommended for compound indexes or custom options
Schema.index({ email: 1 }, { 
  unique: true,
  sparse: true,
  background: true
});
```

### Compound Unique Index
```typescript
// Always use schema.index() for compound indexes
const Schema = new Schema({
  user_id: String,
  platform: String
  // No unique on individual fields
});

// Compound unique index
Schema.index({ user_id: 1, platform: 1 }, { unique: true });
```

## 🔍 Verify Fix

### Before Fix
```bash
npm start

# Logs show:
[MONGOOSE] Warning: Duplicate schema index on {"key":1} found.
[MONGOOSE] Warning: Duplicate schema index on {"hari":1} found.
```

### After Fix
```bash
npm run build
npm start

# No warnings! ✅
```

## 📝 Files Changed

1. **src/models/BotConfig.ts**
   - Removed `unique: true` from `key` field
   - Kept `BotConfigSchema.index({ key: 1 }, { unique: true })`

2. **src/models/Piket.ts**
   - Removed `unique: true` from `hari` field
   - Kept `PiketSchema.index({ hari: 1 }, { unique: true })`

## ✅ Testing

```bash
# 1. Build
npm run build

# 2. Start bot
npm start

# 3. Check logs - should NOT see warnings
# ✅ No duplicate index warnings
```

## 🎉 Result

- ✅ No more duplicate index warnings
- ✅ Indexes still work correctly
- ✅ Unique constraints still enforced
- ✅ Cleaner logs

## 📚 References

- [Mongoose Indexes](https://mongoosejs.com/docs/guide.html#indexes)
- [Mongoose Schema Index Options](https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-index)
- [MongoDB Index Documentation](https://docs.mongodb.com/manual/indexes/)

---

**Note:** This fix does NOT affect functionality - it only removes duplicate warnings. The unique constraints still work exactly the same way.
