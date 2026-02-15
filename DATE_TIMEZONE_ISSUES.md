# Analisis Masalah Tanggal & Timezone

## Masalah yang Ditemukan

### 1. Bug di `getTasksForToday()` - TaskService.ts (Line 197-210)

**Kode Saat Ini:**
```typescript
async getTasksForToday(): Promise<ITask[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.getTasks({
    deadline: {
      $gte: today,      // >= hari ini jam 00:00
      $lte: tomorrow    // <= besok jam 00:00  ❌ BUG!
    }
  });
}
```

**Masalah:**
- Filter menggunakan `$lte: tomorrow` yang berarti **TERMASUK** tugas besok jam 00:00
- Seharusnya menggunakan `$lt: tomorrow` (less than, bukan less than or equal)
- Atau set tomorrow ke jam 23:59:59.999 hari ini

**Contoh:**
- Hari ini: 15 Feb 2026
- Filter saat ini: `>= 15 Feb 00:00` AND `<= 16 Feb 00:00`
- Hasil: Tugas tanggal 15 Feb + tugas tanggal 16 Feb jam 00:00 ✅ SALAH!
- Seharusnya: `>= 15 Feb 00:00` AND `< 16 Feb 00:00`

### 2. Timezone Inconsistency

**Masalah:**
- `TaskService.getTasksForToday()` menggunakan `new Date()` tanpa timezone handling
- `DateTimeHelper` punya method `now()` yang sudah handle WIB timezone
- Tapi `TaskService` TIDAK menggunakan `DateTimeHelper.now()`

**Dampak:**
- Jika server di timezone berbeda (misal UTC), tanggal "hari ini" bisa berbeda dengan WIB
- Server UTC jam 18:00 = WIB jam 01:00 (hari berikutnya)
- Query "tugas hari ini" akan salah karena pakai tanggal UTC, bukan WIB

### 3. Deadline Storage di MongoDB

**Pertanyaan Kritis:**
- Apakah deadline disimpan sebagai UTC atau WIB?
- Ketika user input "2026-02-15", apakah disimpan sebagai:
  - `2026-02-15T00:00:00.000Z` (UTC)
  - `2026-02-14T17:00:00.000Z` (UTC, tapi represent 2026-02-15 WIB)

**Dari Kode:**
```typescript
// AdminCommandHandler.ts Line 92
deadline: new Date(deadlineStr)  // Langsung convert tanpa timezone handling
```

Ini akan create Date dengan timezone lokal server, bukan WIB!

### 4. Comparison Logic di ButtonInteractionHandler

**Kode di Line 358-360:**
```typescript
const deadline = new Date(task.deadline);
return deadline >= weekStart && deadline <= weekEnd;
```

**Masalah:**
- Tidak ada timezone conversion
- `weekStart` dan `weekEnd` dibuat dengan `new Date()` tanpa WIB handling

## Root Cause Analysis

### Skenario Bug:

1. **Server di timezone UTC**
2. **User di Indonesia (WIB = UTC+7)**
3. **Waktu sekarang: 15 Feb 2026, 02:00 WIB (14 Feb 2026, 19:00 UTC)**

**Apa yang terjadi:**

```typescript
// Di TaskService.getTasksForToday()
const today = new Date();  // 14 Feb 2026, 19:00 UTC
today.setHours(0, 0, 0, 0);  // 14 Feb 2026, 00:00 UTC

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);  // 15 Feb 2026, 00:00 UTC

// Query MongoDB
deadline: {
  $gte: 14 Feb 2026 00:00 UTC,  // Seharusnya 15 Feb 00:00 WIB
  $lte: 15 Feb 2026 00:00 UTC   // Seharusnya 16 Feb 00:00 WIB
}
```

**Hasil:**
- User minta "tugas hari ini" (15 Feb WIB)
- Bot query tugas tanggal 14-15 Feb UTC
- Yang keluar: tugas tanggal 14 Feb WIB (kemarin!) dan 15 Feb WIB (hari ini)

## Solusi yang Diperlukan

### 1. Fix `getTasksForToday()` - Immediate Fix

```typescript
async getTasksForToday(): Promise<ITask[]> {
  const { DateTimeHelper } = await import('../utils/DateTimeHelper');
  
  const today = DateTimeHelper.now();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setHours(23, 59, 59, 999);  // End of today, not start of tomorrow

  return this.getTasks({
    deadline: {
      $gte: today,
      $lte: tomorrow
    }
  });
}
```

### 2. Fix `getTasksForWeek()` - Similar Issue

```typescript
async getTasksForWeek(): Promise<ITask[]> {
  const { DateTimeHelper } = await import('../utils/DateTimeHelper');
  
  const today = DateTimeHelper.now();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  return this.getTasks({
    deadline: {
      $gte: today,
      $lte: nextWeek
    }
  });
}
```

### 3. Fix `getTasksForDate()` - Already Correct Logic

```typescript
async getTasksForDate(date: Date): Promise<ITask[]> {
  const { DateTimeHelper } = await import('../utils/DateTimeHelper');
  
  const startOfDay = DateTimeHelper.toWIB(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  return this.getTasks({
    deadline: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
}
```

### 4. Fix Deadline Input - AdminCommandHandler

```typescript
// Saat create task
const { DateTimeHelper } = await import('../utils/DateTimeHelper');
const deadline = DateTimeHelper.parseDate(deadlineStr);

// Create task
const task = await this.taskService.createTask({
  judul,
  deskripsi: enhancedDesc,
  deadline: deadline,  // Now properly in WIB
  mata_pelajaran,
  tipe: tipe as any,
  created_by: userId
});
```

### 5. Fix ButtonInteractionHandler Comparisons

```typescript
// Line 358-360
const { DateTimeHelper } = await import('../../utils/DateTimeHelper');
const deadline = DateTimeHelper.toWIB(task.deadline);
return deadline >= weekStart && deadline <= weekEnd;
```

## Testing Checklist

### Test Case 1: Tugas Hari Ini
- [ ] Buat tugas dengan deadline hari ini
- [ ] Jalankan `/tugas_hari_ini`
- [ ] Pastikan HANYA tugas hari ini yang muncul (tidak ada tugas besok)

### Test Case 2: Tugas Besok
- [ ] Buat tugas dengan deadline besok
- [ ] Jalankan `/tugas_hari_ini`
- [ ] Pastikan tugas besok TIDAK muncul

### Test Case 3: Timezone Edge Case
- [ ] Set waktu server ke 23:50 WIB
- [ ] Buat tugas deadline besok jam 00:10
- [ ] Tunggu sampai jam 00:10
- [ ] Jalankan `/tugas_hari_ini`
- [ ] Pastikan tugas tersebut muncul (karena sekarang sudah "hari ini")

### Test Case 4: Tugas Minggu Ini
- [ ] Buat tugas untuk 7 hari ke depan
- [ ] Jalankan `/tugas_minggu_ini`
- [ ] Pastikan semua tugas dalam 7 hari muncul
- [ ] Pastikan tugas hari ke-8 TIDAK muncul

### Test Case 5: Task Monitor Button
- [ ] Klik button "Tasks Tomorrow"
- [ ] Pastikan hanya tugas besok yang muncul
- [ ] Klik button "Tasks This Week"
- [ ] Pastikan tugas minggu ini muncul dengan benar

## Priority

1. **HIGH**: Fix `getTasksForToday()` - Bug paling critical
2. **HIGH**: Fix `getTasksForWeek()` - Bug serupa
3. **MEDIUM**: Add timezone handling di semua date operations
4. **LOW**: Refactor untuk konsistensi menggunakan DateTimeHelper

## Notes

- Semua fix harus menggunakan `DateTimeHelper` untuk konsistensi timezone
- Perlu testing menyeluruh setelah fix
- Consider migration script jika ada data deadline yang salah di database
