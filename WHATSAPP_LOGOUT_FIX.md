# WhatsApp Logout Auto-Reconnect Fix

## 🐛 Problem

Saat WhatsApp logout (status 401), bot **stuck dan tidak melakukan apa-apa**:

```
❌ WhatsApp logged out - please scan QR code again
[Bot stops here - no QR code, no reconnection, nothing]
```

User harus **restart bot manual** untuk mendapatkan QR code baru.

## 🔍 Root Cause

**File:** `src/clients/BaileysClient.ts`

**Old Code:**
```typescript
if (statusCode === DisconnectReason.loggedOut) {
  console.log('\n❌ WhatsApp logged out - please scan QR code again\n');
  logger.info('WhatsApp logged out, clearing session');
  this.shouldReconnect = false; // ❌ Bot stops here!
}
```

**Problem:**
1. Bot sets `shouldReconnect = false`
2. Bot does nothing after that
3. Old session files still exist in `auth_info/`
4. User must manually restart bot

## ✅ Solution

Bot sekarang **otomatis clear session dan reconnect** saat logged out:

**New Code:**
```typescript
if (statusCode === DisconnectReason.loggedOut) {
  console.log('\n❌ WhatsApp logged out - please scan QR code again\n');
  logger.info('WhatsApp logged out, clearing session');
  
  // Clear session files and reconnect with fresh QR
  await this.clearSession();
  
  // Reset reconnect attempts and reconnect
  this.reconnectAttempts = 0;
  this.shouldReconnect = true;
  
  console.log('🔄 Reconnecting with fresh session...\n');
  setTimeout(async () => {
    await this.connect();
  }, 2000);
  return;
}
```

**New Method:**
```typescript
async clearSession(): Promise<void> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Check if auth directory exists
    if (!fs.existsSync(this.config.authDir)) {
      logger.info('Auth directory does not exist, nothing to clear');
      return;
    }

    // Delete all files in auth directory
    const files = fs.readdirSync(this.config.authDir);
    for (const file of files) {
      const filePath = path.join(this.config.authDir, file);
      fs.unlinkSync(filePath);
    }

    logger.info('WhatsApp session cleared successfully');
    console.log('✅ Session files cleared\n');
  } catch (error) {
    logger.error('Failed to clear WhatsApp session', error as Error);
    console.log('⚠️  Failed to clear session files\n');
  }
}
```

## 🚀 New Flow

### When Logged Out (401):

```
❌ WhatsApp logged out - please scan QR code again

✅ Session files cleared

🔄 Reconnecting with fresh session...

🔄 Connecting to WhatsApp...

📱 Scan QR Code dengan WhatsApp kamu:

[QR CODE APPEARS HERE]

⏳ Menunggu scan QR code...
```

### After Scanning:

```
✅ WhatsApp connected successfully!

📱 Connected as: 628994630519:38@s.whatsapp.net
```

## 🎯 Benefits

✅ **No Manual Restart**: Bot auto-reconnects saat logout
✅ **Auto Clear Session**: Session lama otomatis dihapus
✅ **QR Code Appears**: QR code muncul otomatis setelah clear session
✅ **User Friendly**: User tinggal scan QR, tidak perlu restart bot
✅ **Faster Recovery**: Bot kembali online dalam 2-3 detik setelah scan

## 🧪 Testing

### Test 1: Simulate Logout

1. Bot running normally
2. Force logout dari WhatsApp Web
3. Bot detects logout (401)

**Expected Output:**
```
❌ WhatsApp logged out - please scan QR code again

✅ Session files cleared

🔄 Reconnecting with fresh session...

🔄 Connecting to WhatsApp...

📱 Scan QR Code dengan WhatsApp kamu:

[QR CODE]

⏳ Menunggu scan QR code...
```

4. Scan QR code with phone

**Expected Output:**
```
✅ WhatsApp connected successfully!

📱 Connected as: 628994630519:38@s.whatsapp.net
```

### Test 2: Check Session Files

**Before Logout:**
```bash
dir auth_info
# Shows: creds.json, app-state-sync-key-*.json, etc.
```

**After Logout (Auto-cleared):**
```bash
dir auth_info
# Shows: (empty or only .gitkeep)
```

**After Reconnect:**
```bash
dir auth_info
# Shows: New creds.json, new app-state-sync-key-*.json, etc.
```

## 📊 Comparison

### Before Fix:

```
Logged Out (401)
  ↓
❌ Set shouldReconnect = false
  ↓
🛑 Bot stops (stuck)
  ↓
❌ User must manually restart bot
  ↓
⏱️  Takes 30-60 seconds to restart
```

### After Fix:

```
Logged Out (401)
  ↓
🗑️ Clear session files
  ↓
✅ Set shouldReconnect = true
  ↓
🔄 Auto reconnect after 2s
  ↓
📱 QR code appears
  ↓
✅ User scans QR
  ↓
✅ Bot online in 2-3 seconds
```

## 🔧 Files Modified

### `src/clients/BaileysClient.ts`

**Changes:**
1. Modified `handleConnectionUpdate()`:
   - Added auto-clear session on logout
   - Added auto-reconnect after clear
   - Reset reconnect attempts
   - Set shouldReconnect = true

2. Added `clearSession()` method:
   - Delete all files in auth_info/
   - Handle errors gracefully
   - Log success/failure

## 🐛 Troubleshooting

### Issue 1: Bot Still Stuck After Logout

**Symptom:**
```
❌ WhatsApp logged out - please scan QR code again
[Nothing happens]
```

**Solution:**
1. Check if you're using latest code
2. Restart bot manually once
3. Next logout should auto-reconnect

### Issue 2: Session Not Cleared

**Symptom:**
```
❌ WhatsApp logged out - please scan QR code again
⚠️  Failed to clear session files
```

**Solution:**
1. Stop bot (Ctrl+C)
2. Manually clear session:
   ```bash
   node scripts/clear-whatsapp-session.js
   ```
3. Start bot again

### Issue 3: QR Code Not Appearing

**Symptom:**
```
✅ Session files cleared
🔄 Reconnecting with fresh session...
[No QR code appears]
```

**Solution:**
1. Wait 5-10 seconds (QR generation takes time)
2. If still no QR, check logs for errors
3. Restart bot manually if needed

## 📝 Summary

**Problem:** Bot stuck saat logout, tidak reconnect, tidak clear session

**Solution:** Bot otomatis clear session dan reconnect saat logout

**Result:**
- ✅ Auto-reconnect on logout
- ✅ Auto-clear session files
- ✅ QR code appears automatically
- ✅ No manual restart needed
- ✅ Faster recovery time

**Bot sekarang bisa handle logout secara otomatis tanpa perlu restart manual!** 🚀
