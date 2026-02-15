# Complete Timezone Audit - Semua File

## Kategori Masalah

### 🔴 CRITICAL - Date Comparison & Filtering (Harus Fix)

#### 1. TaskService.ts
```typescript
// Line 198-210: getTasksForToday()
❌ const today = new Date();  // Should use DateTimeHelper.now()
❌ today.setHours(0, 0, 0, 0);
❌ const tomorrow = new Date(today);
❌ tomorrow.setDate(tomorrow.getDate() + 1);  // Bug: includes tomorrow 00:00
❌ $lte: tomorrow  // Should be $lt or set to 23:59:59.999

// Line 217-228: getTasksForWeek()
❌ const today = new Date();  // Should use DateTimeHelper.now()
❌ Same bug as above

// Line 235-247: getTasksForDate()
❌ const startOfDay = new Date(date);  // Should use DateTimeHelper.toWIB()
❌ const endOfDay = new Date(date);

// Line 71-76: calculatePriority()
❌ const now = new Date();  // Should use DateTimeHelper.now()
```

#### 2. ButtonInteractionHandler.ts
```typescript
// Line 338-365: getTasksThisWeek()
❌ const now = new Date();  // Should use DateTimeHelper.now()
❌ weekStart.setDate(diff);
❌ weekStart.setHours(0, 0, 0, 0);

// Line 371-390: getTasksTomorrow()
❌ const tomorrow = new Date();  // Should use DateTimeHelper.now()
❌ tomorrow.setDate(tomorrow.getDate() + 1);
❌ tomorrowStart.setHours(0, 0, 0, 0);
```

#### 3. AdminCommandHandler.ts
```typescript
// Line 1217-1225: test_reminder daily
❌ const tomorrow = new Date();  // Should use DateTimeHelper.now()
❌ tomorrow.setDate(tomorrow.getDate() + 1);

// Line 1234-1242: test_reminder weekly
❌ const today = new Date();  // Should use DateTimeHelper.now()
❌ const nextWeek = new Date(today);
❌ nextWeek.setDate(nextWeek.getDate() + 7);

// Line 1275-1284: test_reminder monday
❌ const today = new Date();  // Should use DateTimeHelper.now()
❌ const nextMonday = new Date(today);
❌ nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
```

---

### 🟠 HIGH - Date Input & Storage

#### 4. AdminCommandHandler.ts
```typescript
// Line 92: handleAddTugas
❌ deadline: new Date(deadlineStr)  // Should use DateTimeHelper.parseDate()

// Line 498: handleEditTugas
❌ const finalValue = field === 'deadline' ? new Date(value) : value;
// Should use DateTimeHelper.parseDate()

// Line 995: handleGantiJadwal
❌ tanggal: new Date()  // Should use DateTimeHelper.now()

// Line 1358: handleTaskConfirmation
❌ deadline: new Date(parsed.deadline)  // Should use DateTimeHelper.parseDate()
```

#### 5. NotionService.ts
```typescript
// Line 531: parseNotionTask
❌ const deadline = deadlineStr ? new Date(deadlineStr) : new Date();
// Should use DateTimeHelper.parseDate() or DateTimeHelper.now()
```

#### 6. AITaskParserService.ts
```typescript
// Line 35: parseNaturalLanguage
❌ const currentDate = new Date();  // Should use DateTimeHelper.now()

// Line 57: parsed.deadline = new Date(parsed.deadline);
// Should use DateTimeHelper.parseDate()

// Line 183: validation
❌ } else if (parsed.deadline <= new Date()) {
// Should use DateTimeHelper.now()
```

#### 7. ConfirmationService.ts
```typescript
// Line 35: addPendingConfirmation
❌ const now = new Date();  // Should use DateTimeHelper.now()

// Line 72: getPendingConfirmation
❌ if (new Date() > pending.expiresAt) {  // Should use DateTimeHelper.now()

// Line 115: updatePendingField
❌ pending.expiresAt = new Date(Date.now() + this.TIMEOUT_MS);
// Should use DateTimeHelper.now()

// Line 222-228: deadline validation
❌ const deadline = new Date(value);  // Should use DateTimeHelper.parseDate()
❌ if (deadline <= new Date()) {  // Should use DateTimeHelper.now()
```

---

### 🟡 MEDIUM - Schedule & Piket Services

#### 8. ScheduleService.ts
```typescript
// Line 184-187: getTodaySchedule
❌ const today = new Date();  // Should use DateTimeHelper.now()

// Line 196-199: getTomorrowSchedule
❌ const tomorrow = new Date();  // Should use DateTimeHelper.now()
❌ tomorrow.setDate(tomorrow.getDate() + 1);
```

#### 9. PiketService.ts
```typescript
// Line 41: updatePiket
❌ updated_at: new Date()  // Should use DateTimeHelper.now()

// Line 133-135: getTodayPiket
❌ const today = new Date();  // Should use DateTimeHelper.now()

// Line 144-147: getTomorrowPiket
❌ const tomorrow = new Date();  // Should use DateTimeHelper.now()
❌ tomorrow.setDate(tomorrow.getDate() + 1);
```

#### 10. AnnouncementService.ts
```typescript
// Line 104-111: getTodayAnnouncements
❌ const today = new Date();  // Should use DateTimeHelper.now()
❌ today.setHours(0, 0, 0, 0);
❌ tomorrow.setDate(tomorrow.getDate() + 1);

// Line 117-125: getTomorrowAnnouncements
❌ const tomorrow = new Date();  // Should use DateTimeHelper.now()
❌ tomorrow.setDate(tomorrow.getDate() + 1);

// Line 131-138: getWeekAnnouncements
❌ const today = new Date();  // Should use DateTimeHelper.now()
❌ nextWeek.setDate(nextWeek.getDate() + 7);
```

---

### 🟢 LOW - Display & Formatting (OK - Hanya untuk display)

#### 11. MemberCommandHandler.ts
```typescript
// Line 214-217: handleTugas (WhatsApp format)
✅ const today = new Date();  // OK - hanya untuk format display
// Tapi lebih baik pakai DateTimeHelper.now() untuk konsistensi

// Line 320-323: handleTugasMingguIni (WhatsApp format)
✅ const today = new Date();  // OK - hanya untuk format display
```

#### 12. ReminderScheduler.ts
```typescript
// Line 134-138: sendDailyRecap
❌ const tomorrow = new Date();  // Should use DateTimeHelper.now()
❌ tomorrow.setDate(tomorrow.getDate() + 1);

// Line 162-164: sendWeeklyRecap
❌ const today = new Date();  // Should use DateTimeHelper.now()

// Line 181-184: sendMondayRecap
❌ const monday = new Date();  // Should use DateTimeHelper.now()
❌ monday.setDate(monday.getDate() + 1);

// Line 234-237: buildWeeklyRecap
❌ const date = new Date(nextMonday);
❌ date.setDate(date.getDate() + i);
// Should use DateTimeHelper for consistency

// Line 273-276: getNextMonday
❌ result.setDate(result.getDate() + daysUntilMonday);
// Should use DateTimeHelper
```

---

### ⚪ IGNORE - Performance/Technical (OK)

#### 13. NotionService.ts
```typescript
// Line 73, 226, 241, 253: Rate limiting
✅ Date.now()  // OK - untuk performance measurement
✅ this.requestWindow = Date.now();
✅ this.lastRequestTime = Date.now();
```

#### 14. TaskConfirmationService.ts
```typescript
// Line 31, 57: Timeout tracking
✅ timestamp: Date.now()  // OK - untuk timeout tracking
✅ if (Date.now() - data.timestamp > this.TIMEOUT) {
```

#### 15. RateLimiter.ts
```typescript
// Line 48, 82, 99: Rate limiting
✅ const now = Date.now();  // OK - untuk rate limiting
✅ userCooldowns.set(context, Date.now());
```

#### 16. LoadingMessageManager.ts
```typescript
// Line 32, 116: Loading timing
✅ this.sendTimestamps.set(interaction.id, Date.now());
✅ const elapsed = Date.now() - sendTime;
```

#### 17. AIService.ts
```typescript
// Line 55, 60, 72: Latency measurement
✅ const startTime = Date.now();
✅ const latency = Date.now() - startTime;
```

#### 18. TaskMonitorService.ts
```typescript
// Line 77: lastUpdated timestamp
✅ lastUpdated: new Date()  // OK - untuk display timestamp
```

#### 19. MessageTrackingService.ts
```typescript
// Line 35: sent_at timestamp
✅ sent_at: new Date()  // OK - untuk tracking

// Line 62: getTasksNeedingEdit
❌ const cutoffTime = new Date(Date.now() - hoursAgo * 3600000);
// Should use DateTimeHelper.now()

// Line 103: last_edited timestamp
✅ task.sent_messages[messageIndex].last_edited = new Date();
// OK - untuk tracking
```

#### 20. Task.ts Model
```typescript
// Line 59: Validation
❌ const oneHourFromNow = new Date();
❌ oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
// Should use DateTimeHelper.now()
```

---

## Summary

### Files yang HARUS Difix (Priority Order):

1. **TaskService.ts** ⭐⭐⭐⭐⭐ (CRITICAL)
   - getTasksForToday() - Bug utama
   - getTasksForWeek() - Bug serupa
   - getTasksForDate() - Timezone issue
   - calculatePriority() - Timezone issue

2. **ButtonInteractionHandler.ts** ⭐⭐⭐⭐⭐ (CRITICAL)
   - getTasksThisWeek() - Timezone issue
   - getTasksTomorrow() - Timezone issue

3. **AdminCommandHandler.ts** ⭐⭐⭐⭐ (HIGH)
   - handleAddTugas() - Deadline input
   - handleEditTugas() - Deadline update
   - handleTestReminder() - Date calculations
   - handleTaskConfirmation() - Deadline parsing

4. **NotionService.ts** ⭐⭐⭐⭐ (HIGH)
   - parseNotionTask() - Deadline parsing from Notion

5. **AITaskParserService.ts** ⭐⭐⭐ (MEDIUM)
   - parseNaturalLanguage() - Current date reference
   - Validation - Deadline comparison

6. **ConfirmationService.ts** ⭐⭐⭐ (MEDIUM)
   - All date operations for confirmation timeout

7. **ScheduleService.ts** ⭐⭐⭐ (MEDIUM)
   - getTodaySchedule()
   - getTomorrowSchedule()

8. **PiketService.ts** ⭐⭐⭐ (MEDIUM)
   - getTodayPiket()
   - getTomorrowPiket()
   - updatePiket()

9. **AnnouncementService.ts** ⭐⭐⭐ (MEDIUM)
   - getTodayAnnouncements()
   - getTomorrowAnnouncements()
   - getWeekAnnouncements()

10. **ReminderScheduler.ts** ⭐⭐ (LOW)
    - All date calculations for reminders

11. **MessageTrackingService.ts** ⭐⭐ (LOW)
    - getTasksNeedingEdit()

12. **Task.ts Model** ⭐ (LOW)
    - Validation rule

### Total Files to Fix: 12 files
### Total Locations: ~50+ locations

### Estimated Impact:
- **Critical Bugs Fixed**: 4 (getTasksForToday, getTasksForWeek, button handlers)
- **Timezone Consistency**: 100% (all date operations use WIB)
- **Future Bug Prevention**: High (consistent DateTimeHelper usage)

### Testing Required After Fix:
1. All task query commands
2. All button interactions
3. Task creation with various deadline formats
4. Reminder scheduling
5. Schedule and piket queries
6. Announcement queries
7. Edge cases around midnight
8. Edge cases around week boundaries
