# Cara Restart Bot Setelah Fix

## Masalah
Bot masih menggunakan kode lama yang belum di-update. Error log menunjukkan:
```
this.notion.databases.query is not a function
at NotionService.syncFromNotion (D:\task-monitor\dist\services\NotionService.js:62:79)
```

Padahal kode sudah diperbaiki dan di-build ulang.

## Solusi: Restart Bot

### Opsi 1: Restart Manual (Recommended)

1. **Stop bot yang sedang berjalan:**
   ```cmd
   taskkill /F /IM node.exe
   ```
   
   Atau jika ingin lebih spesifik, cari PID bot:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"}
   ```
   
   Lalu kill PID yang sesuai:
   ```cmd
   taskkill /F /PID <PID_NUMBER>
   ```

2. **Build ulang (sudah dilakukan):**
   ```cmd
   npm run build
   ```

3. **Start bot lagi:**
   ```cmd
   npm start
   ```
   
   Atau jika menggunakan dev mode:
   ```cmd
   npm run dev
   ```

### Opsi 2: Menggunakan PM2 (Jika Terinstall)

Jika PM2 terinstall, gunakan:

```cmd
# Install PM2 global (jika belum)
npm install -g pm2

# Restart bot
npm run pm2:restart

# Atau
pm2 restart ecosystem.config.js

# Cek status
pm2 status

# Lihat logs
pm2 logs
```

### Opsi 3: Restart Script Otomatis

Buat file `restart-bot.bat`:

```batch
@echo off
echo Stopping bot...
taskkill /F /IM node.exe /T 2>nul

echo Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check errors above.
    pause
    exit /b 1
)

echo Starting bot...
start "Task Monitor Bot" cmd /k npm start

echo Bot restarted successfully!
timeout /t 2 /nobreak >nul
```

Lalu jalankan:
```cmd
restart-bot.bat
```

## Verifikasi Fix Berhasil

Setelah restart, coba command `/tugas_hari_ini` lagi. Log yang benar seharusnya:

```
✅ BENAR:
]: Starting Notion sync... {"attempt":1,"maxRetries":3}
]: Notion sync completed {"synced":5,"errors":0,"total":5}
```

```
❌ SALAH (jika masih error):
]: Notion sync failed, retrying... {"error":"this.notion.databases.query is not a function"}
```

## Troubleshooting

### Jika masih error setelah restart:

1. **Cek apakah build berhasil:**
   ```cmd
   dir dist\services\NotionService.js
   ```
   
   Buka file dan cari baris ~62, pastikan ada:
   ```javascript
   this.notion.databases.query({
   ```
   
   BUKAN:
   ```javascript
   databases.query({
   ```

2. **Cek environment variables:**
   ```cmd
   type .env | findstr NOTION
   ```
   
   Pastikan ada:
   ```
   NOTION_API_KEY=secret_...
   NOTION_DATABASE_ID=...
   ```

3. **Test Notion connection:**
   ```cmd
   npm run test:notion
   ```

4. **Cek versi package:**
   ```cmd
   npm list @notionhq/client
   ```
   
   Seharusnya: `@notionhq/client@5.9.0`

5. **Reinstall dependencies (last resort):**
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npm run build
   ```

## Penjelasan Fix

Fix yang sudah diterapkan:

1. **Perbaikan syntax API call** - Menggunakan `(this.notion.databases as any).query()` langsung
2. **Retry logic** - 3 kali percobaan dengan exponential backoff (1s, 2s, 4s)
3. **Timeout protection** - 10 detik timeout untuk mencegah hanging
4. **Better error logging** - Log yang lebih detail untuk debugging

Semua fix sudah ada di `src/services/NotionService.ts` dan sudah di-compile ke `dist/services/NotionService.js`.

**Yang kurang hanya RESTART BOT!**
