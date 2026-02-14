# Progress Messages Feature

## Overview

Bot sekarang menampilkan "loading message" yang akan di-edit dengan hasil akhir saat memproses command. Ini membuat bot terasa lebih responsif dan modern!

## How It Works

### Before (Old Behavior):
```
User: /tugas
[wait 3-5 seconds...]
Bot: [hasil lengkap]
```

### After (New Behavior):
```
User: /tugas
Bot: ⏳ Memproses perintah...
[bot edits message]
Bot: 🔄 Sinkronisasi dengan Notion...
[bot edits message]
Bot: 📚 Mengambil daftar tugas...
[bot edits message]
Bot: 📝 Memformat hasil...
[bot edits message]
Bot: [hasil lengkap]
```

## Supported Platforms

✅ **WhatsApp** - Full support for message editing
✅ **Discord** - Full support for message editing (text & embeds)

## Implementation

### Core Components

1. **ProgressMessage** (`src/utils/ProgressMessage.ts`)
   - Handles sending and editing messages
   - Platform-agnostic (works for both WhatsApp & Discord)
   - Supports text messages and Discord embeds

2. **CommandWithProgress** (`src/utils/CommandWithProgress.ts`)
   - Wrapper for easy progress message integration
   - Automatic error handling
   - Progress steps helper

### Example Usage

#### Simple Progress Message:

```typescript
return await executeWithProgress(context, async (update) => {
  update('🔍 Mencari data...');
  const data = await fetchData();
  
  update('📊 Memproses...');
  const result = await processData(data);
  
  return {
    success: true,
    message: '✅ Selesai! ' + result
  };
});
```

#### With Progress Steps:

```typescript
const steps = createProgressSteps([
  '🔍 Step 1: Mencari data...',
  '📊 Step 2: Memproses...',
  '✅ Step 3: Selesai!'
]);

return await executeWithProgress(context, async (update) => {
  await steps.next(update); // Show step 1
  const data = await fetchData();
  
  await steps.next(update); // Show step 2
  const result = await processData(data);
  
  await steps.next(update); // Show step 3
  
  return {
    success: true,
    message: result
  };
});
```

## Commands with Progress Messages

Currently implemented for:
- ✅ `/tugas` - Shows sync progress and data fetching

Can be easily added to:
- `/tugas_hari_ini`
- `/tugas_minggu_ini`
- `/jadwal`
- `/jadwal_besok`
- `/jadwal_minggu_ini`
- `/piket`
- `/piket_minggu_ini`
- `/add_tugas`
- `/add_tugas_cepat`
- And any other command!

## Benefits

1. **Better UX**: Users know the bot is working
2. **Transparency**: Users see what's happening
3. **Debugging**: Easier to identify where failures occur
4. **Professional**: Modern bot behavior

## Technical Details

### WhatsApp Message Editing

Uses Baileys `sendMessage` with `edit` parameter:

```typescript
await socket.sendMessage(chatId, {
  text: newMessage,
  edit: originalMessageKey
});
```

### Discord Message Editing

Uses Discord.js `message.edit()`:

```typescript
await message.edit(newMessage);
// or for embeds:
await message.edit({ embeds: [embed] });
```

### Error Handling

If progress message fails to send:
- Command continues without progress updates
- No impact on functionality
- Logged for debugging

If progress message fails to edit:
- Error is logged
- Original message remains
- Final result still sent

## Configuration

No configuration needed! Progress messages work automatically when:
1. Command handler supports it (has `chatId` parameter)
2. ProgressMessage service is initialized
3. Platform supports message editing (WhatsApp & Discord do)

## Fallback Behavior

If progress messages are not available:
- Commands work normally without progress
- No errors thrown
- Seamless fallback

## Future Enhancements

Potential improvements:
1. **Progress Bar**: Visual progress indicator
2. **Estimated Time**: Show estimated completion time
3. **Cancel Button**: Allow users to cancel long operations
4. **Percentage**: Show percentage complete (0-100%)
5. **Animated Emoji**: Rotating loading emoji

## Example Output

### WhatsApp:
```
⏳ Memproses perintah...
↓ (edited)
🔄 Sinkronisasi dengan Notion...
↓ (edited)
📚 Mengambil daftar tugas...
↓ (edited)
📝 Memformat hasil...
↓ (edited)
📝 *Daftar Tugas*

1. 📝 Tugas Matematika
   Mata Pelajaran: Matematika
   Deadline: Sen, 17 Feb
   ...

✅ Synced: 5 tugas dari Notion
```

### Discord:
```
⏳ Memproses perintah...
↓ (edited)
🔄 Sinkronisasi dengan Notion...
↓ (edited)
📚 Mengambil daftar tugas...
↓ (edited)
📝 Memformat hasil...
↓ (edited)
[Embed with formatted task list]
```

## Testing

To test progress messages:

1. **Local Testing**:
   ```bash
   npm run build
   npm start
   ```

2. **Send Command**:
   - WhatsApp: Send `/tugas` in channel
   - Discord: Use `/tugas` slash command

3. **Observe**:
   - Initial "⏳ Memproses..." message
   - Message edits with progress updates
   - Final result

## Troubleshooting

### Progress message not showing:
- Check if `chatId` is passed to command handler
- Verify ProgressMessage is initialized in bot.ts
- Check logs for errors

### Message not editing:
- WhatsApp: Ensure message key is valid
- Discord: Ensure bot has edit permissions
- Check if message is too old (Discord has 15min limit for some operations)

### Progress updates too fast:
- Add delays between updates if needed
- Combine multiple steps into one update

## Summary

Progress messages make the bot feel more responsive and professional. Users can see what's happening in real-time, and it's easy to add to any command!

🎉 **Result**: Better user experience with minimal code changes!
