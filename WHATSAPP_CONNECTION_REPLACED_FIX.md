# WhatsApp Connection Replaced (440) Fix

## 🐛 Problem

Bot terus-menerus reconnect dengan error **status 440 `connectionReplaced`**:

```
✅ WhatsApp connected successfully!
📱 Connected as: 628994630519:40@s.whatsapp.net

]: WhatsApp connection closed {"statusCode":440,"reason":"connectionReplaced"}
🔄 Reconnecting in 1s (attempt 1/5)...

✅ WhatsApp connected successfully!
📱 Connected as: 628994630519:40@s.whatsapp.net

]: WhatsApp connection closed {"statusCode":440,"reason":"connectionReplaced"}
🔄 Reconnecting in 1s (attempt 1/5)...

[LOOP CONTINUES FOREVER]
```

## 🔍 Root Causes

Status code **440 (connectionReplaced)** terjadi ketika:

1. **Multiple Bot Instances** - Ada 2+ bot yang running dengan nomor yang sama
2. **WhatsApp Web Open** - WhatsApp Web dibuka di browser lain
3. **Multiple Devices** - Terlalu banyak device yang connected ke akun yang sama
4. **Quick Restart** - Bot di-restart terlalu cepat (session conflict)
5. **PM2/Process Manager** - Process manager restart bot otomatis

## ✅ Solution

### 1. Prevent Infinite Loop

Bot sekarang akan **stop reconnection** setelah 3x connectionReplaced:

**File:** `src/clients/BaileysClient.ts`

**Added:**
```typescript
private connectionReplacedCount: number = 0;
private maxConnectionReplacedCount: number = 3;
```

**Logic:**
```typescript
if (statusCode === 440) {
  this.connectionReplacedCount++;
  
  if (this.connectionReplacedCount >= this.maxConnectionReplacedCount) {
    console.log('❌ Too many connectionReplaced errors - stopping reconnection');
    this.shouldReconnect = false;
    return;
  }
  
  // Wait 10 seconds before reconnecting
  setTimeout(async () => {
    await this.handleReconnection();
  }, 10000);
}
```

### 2. Better Error Messages

Bot sekarang menampilkan **helpful error messages**:

```
⚠️  Connection replaced (1/3)

💡 Possible causes:
   • Another bot instance is running with the same number
   • WhatsApp Web is open in another browser
   • Multiple devices connected to the same account

🔄 Waiting 10 seconds before reconnecting...
```

**After 3 attempts:**
```
❌ Too many connectionReplaced errors - stopping reconnection

🔧 Solutions:
   1. Close all other WhatsApp Web sessions
   2. Stop any other bot instances using this number
   3. Check WhatsApp > Linked Devices and remove unused devices
   4. Restart bot after fixing the issue
```

### 3. Check Running Instances

**New Script:** `scripts/check-running-instances.js`

```bash
node scripts/check-running-instances.js
```

**Output:**
```
🔍 Checking for running bot instances...

⚠️  Found 2 Node.js process(es):

   1. PID: 12345 - node.exe
   2. PID: 67890 - node.exe

💡 If you see multiple instances, stop them with:
   taskkill /F /IM node.exe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Common causes of connectionReplaced (440):

   1. Multiple bot instances running
   2. WhatsApp Web open in browser
   3. Another device using the same WhatsApp account
   4. Bot restarted too quickly (session conflict)

🔧 Solutions:

   1. Stop all bot instances: npm run stop (or Ctrl+C)
   2. Close WhatsApp Web in all browsers
   3. Check WhatsApp > Linked Devices > Remove unused
   4. Wait 10-15 seconds before restarting bot
```

## 🔧 How to Fix

### Step 1: Check for Multiple Instances

```bash
# Check running instances
node scripts/check-running-instances.js
```

### Step 2: Stop All Bot Instances

**Windows:**
```bash
# Stop all Node.js processes
taskkill /F /IM node.exe

# Or stop specific PID
taskkill /F /PID 12345
```

**Linux/Mac:**
```bash
# Stop all Node.js processes
pkill -f node

# Or stop specific PID
kill -9 12345
```

### Step 3: Close WhatsApp Web

1. Open WhatsApp on your phone
2. Go to **Settings** > **Linked Devices**
3. Remove all **WhatsApp Web** sessions
4. Keep only the bot session

### Step 4: Wait Before Restarting

```bash
# Wait 10-15 seconds
timeout /t 15 /nobreak  # Windows
# or
sleep 15  # Linux/Mac

# Then start bot
npm start
```

### Step 5: Verify Single Instance

```bash
# After starting bot, check again
node scripts/check-running-instances.js

# Should show only 1 instance
✅ Found 1 Node.js process
```

## 🧪 Testing

### Test 1: Single Instance

```bash
# Start bot
npm start

# In another terminal, check instances
node scripts/check-running-instances.js

# Expected: 1 instance
✅ Found 1 Node.js process
```

### Test 2: Multiple Instances (Simulate Problem)

```bash
# Terminal 1
npm start

# Terminal 2 (DON'T DO THIS!)
npm start

# Result: connectionReplaced loop
⚠️  Connection replaced (1/3)
⚠️  Connection replaced (2/3)
⚠️  Connection replaced (3/3)
❌ Too many connectionReplaced errors - stopping reconnection
```

### Test 3: Auto-Stop After 3 Attempts

```bash
# Start bot with WhatsApp Web already open
npm start

# Bot will try 3 times then stop
⚠️  Connection replaced (1/3)
🔄 Waiting 10 seconds before reconnecting...

⚠️  Connection replaced (2/3)
🔄 Waiting 10 seconds before reconnecting...

⚠️  Connection replaced (3/3)
❌ Too many connectionReplaced errors - stopping reconnection

🔧 Solutions:
   1. Close all other WhatsApp Web sessions
   2. Stop any other bot instances using this number
   ...
```

## 📊 Comparison

### Before Fix:

```
Connected → Replaced → Reconnect (1s) → Connected → Replaced → Reconnect (1s)
[INFINITE LOOP - Never stops]
```

### After Fix:

```
Connected → Replaced (1/3) → Wait 10s → Reconnect
Connected → Replaced (2/3) → Wait 10s → Reconnect
Connected → Replaced (3/3) → STOP

❌ Too many connectionReplaced errors - stopping reconnection
🔧 [Shows helpful solutions]
```

## 🎯 Benefits

✅ **No Infinite Loop** - Bot stops after 3 connectionReplaced errors
✅ **Helpful Messages** - Shows possible causes and solutions
✅ **Longer Wait Time** - 10 seconds instead of 1 second between reconnects
✅ **Check Script** - Easy way to find multiple instances
✅ **Auto-Reset** - Counter resets on successful connection

## 🔧 Configuration

You can adjust the limits in `src/clients/BaileysClient.ts`:

```typescript
// Maximum connectionReplaced errors before stopping
private maxConnectionReplacedCount: number = 3;  // Change to 5 or 10 if needed

// Wait time before reconnecting (in handleConnectionUpdate)
setTimeout(async () => {
  await this.handleReconnection();
}, 10000);  // Change to 15000 (15s) or 20000 (20s) if needed
```

## 🐛 Troubleshooting

### Issue 1: Still Getting connectionReplaced

**Check:**
```bash
# 1. Check running instances
node scripts/check-running-instances.js

# 2. Check WhatsApp Linked Devices
# Open WhatsApp > Settings > Linked Devices
# Remove all except bot

# 3. Check browser
# Close all WhatsApp Web tabs in all browsers

# 4. Restart bot
npm start
```

### Issue 2: Bot Stops Too Quickly

**Solution:** Increase max count:
```typescript
// In src/clients/BaileysClient.ts
private maxConnectionReplacedCount: number = 5;  // Increased from 3
```

### Issue 3: Using PM2 or Process Manager

**Problem:** PM2 auto-restarts bot, causing multiple instances

**Solution:** Configure PM2 properly:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: './dist/index.js',
    instances: 1,  // ⚠️ MUST be 1, not 'max' or 2+
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 15000  // Wait 15s before restart
  }]
};
```

### Issue 4: Multiple Servers/VPS

**Problem:** Bot running on multiple servers with same number

**Solution:**
1. Stop bot on all servers
2. Choose ONE server to run bot
3. Start bot only on that server
4. Use different numbers for different servers

## 📝 Files Modified

### `src/clients/BaileysClient.ts`

**Added:**
- `connectionReplacedCount` counter
- `maxConnectionReplacedCount` limit
- Special handling for status 440
- Helpful error messages
- 10-second wait before reconnect
- Auto-stop after 3 attempts

### `scripts/check-running-instances.js`

**New script to:**
- Check for multiple bot instances
- Show running Node.js processes
- Display helpful solutions
- Works on Windows, Linux, Mac

## 📋 Quick Reference

### Commands

```bash
# Check running instances
node scripts/check-running-instances.js

# Stop all Node.js (Windows)
taskkill /F /IM node.exe

# Stop all Node.js (Linux/Mac)
pkill -f node

# Start bot
npm start

# Start with PM2 (single instance)
pm2 start ecosystem.config.js
pm2 logs whatsapp-bot
```

### WhatsApp Linked Devices

1. Open WhatsApp on phone
2. Settings > Linked Devices
3. Remove unused devices
4. Keep only bot session

### Wait Times

- **After stopping bot:** Wait 10-15 seconds
- **Between reconnects:** 10 seconds (automatic)
- **After 3 failures:** Bot stops, fix issue, then restart

## 📝 Summary

**Problem:** Bot stuck in infinite connectionReplaced (440) loop

**Root Cause:** Multiple instances or WhatsApp Web sessions using same number

**Solution:**
1. ✅ Stop after 3 connectionReplaced errors
2. ✅ Wait 10 seconds between reconnects
3. ✅ Show helpful error messages
4. ✅ Provide check script for multiple instances
5. ✅ Auto-reset counter on successful connection

**Result:**
- ✅ No more infinite loops
- ✅ Clear error messages
- ✅ Easy troubleshooting
- ✅ Bot stops gracefully when issue detected

**Bot sekarang bisa detect dan handle connectionReplaced dengan baik!** 🚀
