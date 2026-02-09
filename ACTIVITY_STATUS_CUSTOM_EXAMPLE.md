# Contoh Menambahkan Data Source Custom untuk Activity Status

## 📋 Skenario

Misalnya Anda ingin menambahkan status yang menampilkan:
- Jumlah member yang terdaftar
- Jumlah jadwal hari ini
- Jumlah piket minggu ini

## 🔧 Langkah-langkah

### 1. Update Interface di ActivityStatusService.ts

Tambahkan data source baru di interface:

```typescript
export interface ActivityTemplate {
  type: 0 | 1 | 2 | 3 | 5; // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing
  text: string;
  dynamic?: boolean;
  dataSource?: 
    | 'tasks_today' 
    | 'tasks_week' 
    | 'tasks_total' 
    | 'tasks_urgent'
    | 'members_total'      // ← Baru
    | 'schedules_today'    // ← Baru
    | 'piket_week';        // ← Baru
}
```

### 2. Update Constructor untuk Inject Service yang Dibutuhkan

```typescript
export class ActivityStatusService {
  private client: Client;
  private taskService: TaskService;
  private scheduleService: ScheduleService;  // ← Tambahkan
  private piketService: PiketService;        // ← Tambahkan
  private config: ActivityConfig;
  private intervalId?: NodeJS.Timeout;
  private currentIndex: number = 0;

  constructor(
    client: Client, 
    taskService: TaskService,
    scheduleService: ScheduleService,  // ← Tambahkan
    piketService: PiketService,        // ← Tambahkan
    config: ActivityConfig
  ) {
    this.client = client;
    this.taskService = taskService;
    this.scheduleService = scheduleService;  // ← Tambahkan
    this.piketService = piketService;        // ← Tambahkan
    this.config = config;
  }
  
  // ... rest of the code
}
```

### 3. Update Method processActivityText

Tambahkan case baru untuk data source:

```typescript
private async processActivityText(activity: ActivityTemplate): Promise<string> {
  if (!activity.dynamic || !activity.dataSource) {
    return activity.text;
  }

  try {
    let count = 0;

    switch (activity.dataSource) {
      case 'tasks_today':
        const tasksToday = await this.taskService.getTasksForToday();
        count = tasksToday.length;
        break;

      case 'tasks_week':
        const tasksWeek = await this.taskService.getTasksForWeek();
        count = tasksWeek.length;
        break;

      case 'tasks_total':
        const tasksTotal = await this.taskService.getTasks({ status: 'aktif' });
        count = tasksTotal.length;
        break;

      case 'tasks_urgent':
        const tasksUrgent = await this.taskService.getTasks({ 
          status: 'aktif',
          prioritas: 'urgent'
        });
        count = tasksUrgent.length;
        break;

      // ========== DATA SOURCE BARU ==========
      
      case 'members_total':
        // Contoh: Hitung total member dari database
        const Member = (await import('../models/Member')).default;
        const members = await Member.countDocuments({ is_active: true });
        count = members;
        break;

      case 'schedules_today':
        // Contoh: Hitung jadwal hari ini
        const schedulesToday = await this.scheduleService.getScheduleForToday();
        count = schedulesToday.length;
        break;

      case 'piket_week':
        // Contoh: Hitung piket minggu ini
        const piketWeek = await this.piketService.getPiketForWeek();
        count = piketWeek.length;
        break;

      default:
        logger.warn(`Unknown data source: ${activity.dataSource}`);
    }

    return activity.text.replace('{count}', count.toString());
  } catch (error) {
    logger.error('Failed to process dynamic activity text', error as Error);
    return activity.text.replace('{count}', '0');
  }
}
```

### 4. Update activityTemplates.ts

Tambahkan template baru:

```typescript
export const defaultActivityTemplates: ActivityTemplate[] = [
  // Template yang sudah ada
  {
    type: 3, // Watching
    text: 'Tugas hari ini: {count}',
    dynamic: true,
    dataSource: 'tasks_today'
  },
  {
    type: 3, // Watching
    text: 'Tugas minggu ini: {count}',
    dynamic: true,
    dataSource: 'tasks_week'
  },
  
  // ========== TEMPLATE BARU ==========
  
  {
    type: 3, // Watching
    text: 'Member aktif: {count}',
    dynamic: true,
    dataSource: 'members_total'
  },
  {
    type: 3, // Watching
    text: 'Jadwal hari ini: {count}',
    dynamic: true,
    dataSource: 'schedules_today'
  },
  {
    type: 3, // Watching
    text: 'Piket minggu ini: {count}',
    dynamic: true,
    dataSource: 'piket_week'
  }
];
```

### 5. Update DiscordClient.ts

Update method `setupActivityStatus` untuk pass service tambahan:

```typescript
setupActivityStatus(
  taskService: TaskService,
  scheduleService: ScheduleService,  // ← Tambahkan
  piketService: PiketService         // ← Tambahkan
): void {
  const activityConfig: ActivityConfig = {
    enabled: this.config.activityEnabled ?? true,
    rotationInterval: this.config.activityInterval ?? 5,
    activities: getActivityTemplates()
  };

  this.activityStatusService = new ActivityStatusService(
    this.client,
    taskService,
    scheduleService,  // ← Tambahkan
    piketService,     // ← Tambahkan
    activityConfig
  );

  if (this.isConnected) {
    this.activityStatusService.start();
  }

  logger.info('Activity status service initialized', {
    enabled: activityConfig.enabled,
    interval: activityConfig.rotationInterval
  });
}
```

### 6. Update bot.ts

Update pemanggilan method:

```typescript
// Setup activity status rotation
this.discordClient.setupActivityStatus(
  this.taskService,
  this.scheduleService,  // ← Tambahkan
  this.piketService      // ← Tambahkan
);
```

## 🎯 Contoh Lain: Menampilkan Teks Custom

Jika Anda ingin menampilkan lebih dari sekedar angka, misalnya nama atau teks:

### 1. Buat Data Source dengan Format Berbeda

```typescript
case 'piket_today_name':
  const piketToday = await this.piketService.getPiketForToday();
  if (piketToday && piketToday.length > 0) {
    // Ambil nama pertama
    const firstName = piketToday[0].nama_member;
    return activity.text.replace('{name}', firstName);
  }
  return activity.text.replace('{name}', 'Tidak ada');
```

### 2. Template dengan Placeholder Berbeda

```typescript
{
  type: 3, // Watching
  text: 'Piket hari ini: {name}',
  dynamic: true,
  dataSource: 'piket_today_name'
}
```

## 🔄 Contoh: Multiple Placeholders

Jika ingin menampilkan beberapa data sekaligus:

### 1. Update processActivityText

```typescript
case 'tasks_summary':
  const today = await this.taskService.getTasksForToday();
  const urgent = await this.taskService.getTasks({ 
    status: 'aktif',
    prioritas: 'urgent'
  });
  
  return activity.text
    .replace('{today}', today.length.toString())
    .replace('{urgent}', urgent.length.toString());
```

### 2. Template

```typescript
{
  type: 3, // Watching
  text: 'Hari ini: {today} | Urgent: {urgent}',
  dynamic: true,
  dataSource: 'tasks_summary'
}
```

## 📊 Contoh: Menampilkan Persentase

```typescript
case 'tasks_completion':
  const allTasks = await this.taskService.getTasks({});
  const completedTasks = await this.taskService.getTasks({ status: 'selesai' });
  
  const percentage = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;
  
  return activity.text.replace('{percent}', percentage.toString());
```

Template:

```typescript
{
  type: 0, // Playing
  text: 'Progress: {percent}% selesai',
  dynamic: true,
  dataSource: 'tasks_completion'
}
```

## 🎨 Tips & Tricks

### 1. Caching untuk Performance

Jika data tidak perlu real-time, gunakan cache:

```typescript
private dataCache: Map<string, { value: any; timestamp: number }> = new Map();
private CACHE_TTL = 60000; // 1 menit

private async getCachedData(key: string, fetcher: () => Promise<any>): Promise<any> {
  const cached = this.dataCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
    return cached.value;
  }
  
  const value = await fetcher();
  this.dataCache.set(key, { value, timestamp: now });
  return value;
}
```

### 2. Error Handling yang Baik

```typescript
try {
  const data = await this.someService.getData();
  count = data.length;
} catch (error) {
  logger.error('Failed to fetch data', error as Error);
  // Return fallback value
  return activity.text.replace('{count}', 'N/A');
}
```

### 3. Conditional Status

Tampilkan status berbeda berdasarkan kondisi:

```typescript
case 'smart_status':
  const urgentTasks = await this.taskService.getTasks({ 
    status: 'aktif',
    prioritas: 'urgent'
  });
  
  if (urgentTasks.length > 0) {
    return `⚠️ ${urgentTasks.length} tugas urgent!`;
  } else {
    return '✅ Semua tugas terkendali';
  }
```

## 🚀 Testing

Setelah menambahkan data source baru:

1. **Compile TypeScript**
   ```bash
   npm run build
   ```

2. **Jalankan Bot**
   ```bash
   npm start
   ```

3. **Monitor Log**
   Perhatikan log untuk memastikan tidak ada error:
   ```
   Activity status updated { type: 'WATCHING', text: 'Member aktif: 25', index: 0 }
   ```

4. **Cek Discord**
   Lihat profil bot dan tunggu status berganti

## 📝 Checklist

- [ ] Update interface `ActivityTemplate`
- [ ] Update constructor `ActivityStatusService`
- [ ] Tambah case di `processActivityText`
- [ ] Tambah template di `activityTemplates.ts`
- [ ] Update `DiscordClient.setupActivityStatus`
- [ ] Update `bot.ts` untuk pass service
- [ ] Test dan verifikasi

---

**Happy Coding! 🎉**
