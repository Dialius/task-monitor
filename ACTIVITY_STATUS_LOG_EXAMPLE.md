# Contoh Log Activity Status

## 📋 Log Saat Bot Start

Ketika bot pertama kali dijalankan dan activity status diaktifkan:

```
📋 Step 6/7: Connecting to platforms...
   → Connecting to Discord...
      ✓ Discord bot online
      ✓ Server: 123456789012345678
      ✓ Channel: 987654321098765432
      ✓ Activity rotation: Enabled
      ✓ Rotation interval: 5 minutes

✅ Activity status rotation started
   → Interval: 5 minutes
   → Total activities: 6

🔄 Activity Status: 👀 Watching Tugas hari ini: 3
```

## 🔄 Log Saat Status Berganti

Setiap 5 menit (atau sesuai interval yang dikonfigurasi), Anda akan melihat log seperti ini:

### Contoh 1: Status dengan Data Dinamis
```
🔄 Activity Status: 👀 Watching Tugas minggu ini: 8
```

### Contoh 2: Status Statis
```
🔄 Activity Status: 🎧 Listening to Perintah dari kelas
```

### Contoh 3: Status Playing
```
🔄 Activity Status: 🎮 Playing Total tugas aktif: 15
```

### Contoh 4: Status Urgent
```
🔄 Activity Status: 👀 Watching Tugas urgent: 2
```

## 📊 Log Lengkap dalam 30 Menit

Berikut contoh log lengkap yang akan Anda lihat dalam 30 menit pertama:

```
[2026-02-09 14:00:00] ✅ Activity status rotation started
[2026-02-09 14:00:00]    → Interval: 5 minutes
[2026-02-09 14:00:00]    → Total activities: 6
[2026-02-09 14:00:00] 🔄 Activity Status: 👀 Watching Tugas hari ini: 3

[2026-02-09 14:05:00] 🔄 Activity Status: 👀 Watching Tugas minggu ini: 8

[2026-02-09 14:10:00] 🔄 Activity Status: 🎮 Playing Total tugas aktif: 15

[2026-02-09 14:15:00] 🔄 Activity Status: 👀 Watching Tugas urgent: 2

[2026-02-09 14:20:00] 🔄 Activity Status: 🎧 Listening to Perintah dari kelas

[2026-02-09 14:25:00] 🔄 Activity Status: 🎮 Playing Reminder Bot v1.0

[2026-02-09 14:30:00] 🔄 Activity Status: 👀 Watching Tugas hari ini: 4
```

## ⏹️ Log Saat Bot Stop

Ketika bot dihentikan:

```
Received SIGINT, shutting down gracefully...
⏹️  Activity status rotation stopped
Discord client disconnected
Bot stopped
```

## ❌ Log Error (Jika Terjadi)

### Error Saat Fetch Data
```
❌ Failed to update activity status: Error: Database connection lost
```

### Warning Jika Client Tidak Ready
```
⚠️  Client user not available, skipping status update
```

## 🔍 Log Detail di File Log

Di file log (`logs/bot-YYYY-MM-DD.log`), Anda akan melihat informasi lebih detail:

```json
{
  "level": "info",
  "message": "Activity status updated",
  "timestamp": "2026-02-09T14:00:00.000Z",
  "metadata": {
    "type": 3,
    "typeName": "👀 Watching",
    "text": "Tugas hari ini: 3",
    "index": 0,
    "nextIndex": 1
  }
}
```

## 🎯 Tips Monitoring

### 1. Grep untuk Activity Status
```bash
# Windows (PowerShell)
Select-String -Path "logs\bot-*.log" -Pattern "Activity Status"

# Linux/Mac
grep "Activity Status" logs/bot-*.log
```

### 2. Monitor Real-time
```bash
# Windows (PowerShell)
Get-Content -Path "logs\bot-2026-02-09.log" -Wait | Select-String "Activity"

# Linux/Mac
tail -f logs/bot-2026-02-09.log | grep "Activity"
```

### 3. Count Status Changes
```bash
# Windows (PowerShell)
(Select-String -Path "logs\bot-*.log" -Pattern "Activity Status").Count

# Linux/Mac
grep -c "Activity Status" logs/bot-*.log
```

## 📈 Interpretasi Log

### Status Normal
Jika Anda melihat log seperti ini secara konsisten, berarti semuanya berjalan normal:
```
🔄 Activity Status: 👀 Watching Tugas hari ini: 3
🔄 Activity Status: 👀 Watching Tugas minggu ini: 8
🔄 Activity Status: 🎮 Playing Total tugas aktif: 15
```

### Perlu Perhatian
Jika Anda melihat angka 0 terus-menerus:
```
🔄 Activity Status: 👀 Watching Tugas hari ini: 0
🔄 Activity Status: 👀 Watching Tugas minggu ini: 0
🔄 Activity Status: 🎮 Playing Total tugas aktif: 0
```
**Kemungkinan**: Database kosong atau tidak ada tugas yang ditambahkan

### Error
Jika Anda melihat error berulang:
```
❌ Failed to update activity status: Error: ...
❌ Failed to update activity status: Error: ...
```
**Action**: Cek koneksi database dan pastikan bot memiliki permission yang cukup

## 🎨 Customizing Log Format

Jika Anda ingin mengubah format log, edit file `src/services/ActivityStatusService.ts`:

### Contoh: Tambah Timestamp
```typescript
console.log(`🔄 [${new Date().toLocaleTimeString()}] Activity Status: ${activityTypeName} ${statusText}`);
```

Output:
```
🔄 [14:00:00] Activity Status: 👀 Watching Tugas hari ini: 3
```

### Contoh: Tambah Index
```typescript
console.log(`🔄 Activity Status [${this.currentIndex + 1}/${this.config.activities.length}]: ${activityTypeName} ${statusText}`);
```

Output:
```
🔄 Activity Status [1/6]: 👀 Watching Tugas hari ini: 3
```

### Contoh: Minimal Log
```typescript
console.log(`🔄 ${statusText}`);
```

Output:
```
🔄 Tugas hari ini: 3
```

## 📝 Best Practices

1. **Monitor Regularly**: Cek log setiap hari untuk memastikan status berganti dengan normal
2. **Set Alerts**: Gunakan monitoring tool untuk alert jika ada error berulang
3. **Log Rotation**: Pastikan log rotation aktif agar file log tidak terlalu besar
4. **Archive Old Logs**: Backup dan archive log lama secara berkala

---

**Tip**: Gunakan log ini untuk debugging dan monitoring kesehatan bot Anda! 🚀
