# 📱 WhatsApp Connection Guide

## 🔐 QR Code Behavior

Bot sudah diupdate untuk menampilkan QR code **HANYA** saat benar-benar diperlukan.

### ✅ QR Code AKAN Muncul Saat:

1. **First Time Connection** - Belum ada session
   ```
   📱 Scan QR Code dengan WhatsApp kamu:
   [QR CODE]
   ⏳ Menunggu scan QR code...
   ```

2. **Logged Out (Status 401)** - Session expired atau logout
   ```
   ❌ WhatsApp logged out - please scan QR code again
   
   📱 Scan QR Code dengan WhatsApp kamu:
   [QR CODE]
   ⏳ Menunggu scan QR code...
   ```

### ❌ QR Code TIDAK Akan Muncul Saat:

1. **Restart Required (Status 515)** - Normal restart
   ```
   🔄 Restarting connection...
   ✅ WhatsApp connected successfully!
   ```

2. **Connection Lost** - Temporary network issue
   ```
   ⚠️  Connection lost, reconnecting...
   🔄 Reconnecting in 1s (attempt 1/5)...
   ✅ WhatsApp connected successfully!
   ```

3. **Connection Replaced (Status 440)** - Another device logged in
   ```
   ⚠️  Connection replaced by another device, reconnecting...
   🔄 Reconnecting in 1s (attempt 1/5)...
   ```

4. **Client Version Issue (Status 405)** - Outdated client
   ```
   ⚠️  Client version issue, reconnecting...
   🔄 Reconnecting in 1s (attempt 1/5)...
   ```

5. **Connection Timeout** - Network timeout
   ```
   ⏱️  Connection timed out, reconnecting...
   🔄 Reconnecting in 2s (attempt 2/5)...
   ```

## 🔄 Connection States

### 1. Connecting
```
🔄 Connecting to WhatsApp...
```
Bot sedang mencoba connect ke WhatsApp server.

### 2. Connected
```
✅ WhatsApp connected successfully!
📱 Connected as: 628994630519:36@s.whatsapp.net
👤 Name: [Your Name]
```
Bot berhasil connect dan siap menerima pesan.

### 3. Disconnected (Auto Reconnect)
```
⚠️  Connection lost, reconnecting...
🔄 Reconnecting in 1s (attempt 1/5)...
```
Bot akan otomatis reconnect tanpa perlu scan QR lagi.

### 4. Logged Out (Need QR)
```
❌ WhatsApp logged out - please scan QR code again

📱 Scan QR Code dengan WhatsApp kamu:
[QR CODE]
```
Perlu scan QR code untuk login ulang.

## 📊 Connection Status Codes

| Code | Reason | Action | QR Code? |
|------|--------|--------|----------|
| 401 | Logged Out | Show QR | ✅ Yes |
| 405 | Client Outdated | Auto reconnect | ❌ No |
| 440 | Connection Replaced | Auto reconnect | ❌ No |
| 515 | Restart Required | Auto reconnect | ❌ No |
| - | Connection Lost | Auto reconnect | ❌ No |
| - | Connection Closed | Auto reconnect | ❌ No |
| - | Timeout | Auto reconnect | ❌ No |

## 🚀 Starting Bot

### First Time (No Session)
```bash
npm start
```

Output:
```
📋 Step 6/7: Connecting to platforms...
   → Connecting to WhatsApp...
      → Initializing Baileys client...
      → Connecting to WhatsApp...
      → Scan QR code with your phone if this is first time

📱 Scan QR Code dengan WhatsApp kamu:

[QR CODE APPEARS HERE]

⏳ Menunggu scan QR code...
```

**Action:** Scan QR code dengan WhatsApp di HP kamu.

### Subsequent Starts (Has Session)
```bash
npm start
```

Output:
```
📋 Step 6/7: Connecting to platforms...
   → Connecting to WhatsApp...
      → Initializing Baileys client...
      → Connecting to WhatsApp...

🔄 Connecting to WhatsApp...
✅ WhatsApp connected successfully!

📱 Connected as: 628994630519:36@s.whatsapp.net
👤 Name: [Your Name]

      ✓ WhatsApp connected
      ✓ Commands enabled - bot can add tasks
      ✓ Reminders enabled - auto sync from Notion
      ✓ Target channel: 120363424833026714@newsletter
```

**No QR code needed!** Bot auto-login dengan session yang tersimpan.

## 🔧 Troubleshooting

### QR Code Tidak Muncul Padahal Logged Out

**Symptom:**
```
❌ WhatsApp logged out - please scan QR code again
🔄 Reconnecting in 1s (attempt 1/5)...
[No QR code appears]
```

**Solution:**
1. Stop bot (Ctrl+C)
2. Delete auth_info folder:
   ```bash
   rmdir /s /q auth_info
   ```
3. Start bot again:
   ```bash
   npm start
   ```
4. QR code akan muncul

### Bot Stuck di "Connecting..."

**Symptom:**
```
🔄 Connecting to WhatsApp...
[Stuck, no progress]
```

**Solution:**
1. Check internet connection
2. Stop bot (Ctrl+C)
3. Wait 10 seconds
4. Start bot again

### Max Reconnection Attempts Reached

**Symptom:**
```
❌ Max reconnection attempts reached
💡 Tip: Restart bot to try again
```

**Solution:**
1. Stop bot (Ctrl+C)
2. Check internet connection
3. Start bot again:
   ```bash
   npm start
   ```

### Connection Replaced by Another Device

**Symptom:**
```
⚠️  Connection replaced by another device, reconnecting...
```

**Cause:** Kamu scan QR code di device lain atau WhatsApp Web aktif di tempat lain.

**Solution:**
- Bot akan auto-reconnect
- Jika gagal terus, logout dari WhatsApp Web/Desktop lain
- Restart bot

## 📝 Session Management

### Session Location
```
auth_info/
  ├── creds.json          # Credentials
  ├── app-state-sync-*.json  # Sync state
  └── pre-key-*.json      # Encryption keys
```

### Clear Session (Force Re-login)
```bash
# Windows
rmdir /s /q auth_info

# Linux/Mac
rm -rf auth_info
```

Setelah hapus, start bot akan minta scan QR lagi.

### Backup Session
```bash
# Windows
xcopy auth_info auth_info_backup /E /I

# Linux/Mac
cp -r auth_info auth_info_backup
```

Backup session untuk restore nanti jika perlu.

### Restore Session
```bash
# Windows
rmdir /s /q auth_info
xcopy auth_info_backup auth_info /E /I

# Linux/Mac
rm -rf auth_info
cp -r auth_info_backup auth_info
```

## 🔐 Security Notes

### Session Files
- **JANGAN** commit `auth_info/` ke Git
- **JANGAN** share session files ke orang lain
- Session files = akses penuh ke WhatsApp kamu

### .gitignore
```
auth_info/
```
Sudah ada di `.gitignore` untuk keamanan.

### Multiple Devices
- Bot count sebagai 1 device
- WhatsApp support max 4 linked devices
- Jika sudah 4 devices, logout salah satu dulu

## 📊 Connection Logs

### Normal Connection
```
2026-02-10 12:53:12 [INFO]: Baileys client initialized
2026-02-10 12:53:12 [INFO]: Connecting to WhatsApp...
2026-02-10 12:53:15 [INFO]: WhatsApp connection established
2026-02-10 12:53:15 [INFO]: WhatsApp user info {"id":"628994630519:36@s.whatsapp.net","name":"Your Name"}
```

### Logged Out
```
2026-02-10 12:49:40 [WARN]: WhatsApp connection closed {"statusCode":401,"reason":"loggedOut","reconnectAttempts":0}
2026-02-10 12:49:40 [INFO]: WhatsApp logged out, need to re-authenticate
2026-02-10 12:49:41 [INFO]: QR Code generated for WhatsApp authentication
```

### Auto Reconnect
```
2026-02-10 09:13:40 [WARN]: WhatsApp connection closed {"statusCode":440,"reason":"connectionReplaced","reconnectAttempts":0}
2026-02-10 09:13:40 [INFO]: Reconnecting to WhatsApp in 1000ms (attempt 1/5)
2026-02-10 09:13:42 [INFO]: Baileys client initialized
2026-02-10 09:13:44 [INFO]: WhatsApp connection established
```

## 🎯 Best Practices

### 1. Keep Session Alive
- Jangan logout dari WhatsApp Web/Desktop lain
- Jangan scan QR di device lain
- Bot akan maintain session otomatis

### 2. Monitor Logs
```bash
# Real-time logs
tail -f logs/bot-2026-02-10.log

# Or with PM2
pm2 logs
```

### 3. Graceful Shutdown
```bash
# Stop bot properly
Ctrl+C

# Or with PM2
pm2 stop task-monitor
```

Jangan force kill (Ctrl+Z atau kill -9) karena bisa corrupt session.

### 4. Regular Backup
Backup `auth_info/` folder secara berkala untuk recovery.

## 🎉 Summary

**QR Code Logic:**
- ✅ Muncul HANYA saat logged out (401) atau first time
- ❌ TIDAK muncul saat restart/reconnect biasa

**Auto Reconnect:**
- Bot otomatis reconnect untuk semua error kecuali logged out
- Max 5 attempts dengan exponential backoff
- Tidak perlu scan QR lagi

**Session Management:**
- Session tersimpan di `auth_info/`
- Backup session untuk recovery
- Jangan share session files

**Bot siap digunakan dengan connection management yang smart!** 🚀
