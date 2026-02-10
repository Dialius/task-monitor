# Implementation Status: Multi-Feature Enhancement

## ✅ Completed (Phase 1-2)

### 1. Multi-line Description Support
- ✅ Updated `NotionService.parseNotionPage()` to join all rich_text segments
- ✅ Preserves newlines, bullets, and paragraphs exactly as written in Notion
- ✅ No changes needed to database schema

**File Modified:**
- `src/services/NotionService.ts` (line 177)

### 2. Database Schema Update
- ✅ Added `sent_messages` array to track message IDs
- ✅ Added `last_synced_from_notion` and `notion_last_edited` timestamps
- ✅ Schema supports both WhatsApp and Discord platforms

**File Modified:**
- `src/models/Task.ts`

### 3. Core Services Created
- ✅ `MessageTrackingService.ts` - Track sent messages
- ✅ `MessageEditService.ts` - Edit messages on WhatsApp/Discord
- ✅ `ChangeDetectionService.ts` - Cron job for change detection
- ✅ `TaskFormatter.ts` - Format tasks for display

**Files Created:**
- `src/services/MessageTrackingService.ts`
- `src/services/MessageEditService.ts`
- `src/services/ChangeDetectionService.ts`
- `src/utils/TaskFormatter.ts`

---

## 🔄 In Progress (Phase 3-5)

### Phase 3: Integration with Existing Code

**Need to integrate:**

1. **Track messages when sending** - Update all places where bot sends task messages:
   - `src/handlers/MemberCommandHandler.ts` - `/tugas_hari_ini`, `/tugas_minggu_ini`, etc.
   - `src/handlers/AdminCommandHandler.ts` - `/add_tugas`
   - `src/services/ReminderScheduler.ts` - Reminder messages

2. **Initialize MessageEditService** - In `src/index.ts` or `src/bot.ts`:
   ```typescript
   import MessageEditService from './services/MessageEditService';
   import { ChangeDetectionService } from './services/ChangeDetectionService';
   
   // After WhatsApp and Discord clients are ready
   MessageEditService.initialize(sock, discordClient);
   
   // Start change detection cron
   const changeDetection = new ChangeDetectionService(notionService);
   changeDetection.start();
   ```

3. **Update message sending functions** - Add tracking after sending:
   ```typescript
   // Example in MemberCommandHandler
   const sentMsg = await sock.sendMessage(jid, { text: message });
   
   // Track the message
   await MessageTrackingService.trackSentMessage(task._id.toString(), {
     platform: 'whatsapp',
     message_id: sentMsg.key.id!,
     chat_id: jid
   });
   ```

### Phase 4: Natural Language Task Creation

**Need to create:**

1. **AI Parsing Service** - `src/services/AITaskParserService.ts`
   - Parse natural language input
   - Extract task fields (judul, deskripsi, deadline, etc.)
   - Handle relative dates ("besok", "lusa", "minggu depan")

2. **Confirmation Handler** - `src/handlers/ConfirmationHandler.ts`
   - Show preview of parsed task
   - Handle "ya", "edit [field] [value]", "batal" responses
   - Timeout after 30 seconds

3. **New Command** - Add `/add_tugas_cepat` to:
   - `src/handlers/AdminCommandHandler.ts`
   - `COMMANDS.md` documentation

### Phase 5: Testing & Refinement

**Need to test:**

1. Multi-line descriptions from Notion
2. Message editing on WhatsApp (channel/group)
3. Message editing on Discord
4. Cron job execution every hour
5. Retry logic when sync fails
6. Natural language parsing accuracy
7. Confirmation flow

---

## 📝 Next Steps

### Step 1: Integrate Message Tracking (30 minutes)

**File: `src/handlers/MemberCommandHandler.ts`**

Find all places where messages are sent and add tracking:

```typescript
// After sending message
import MessageTrackingService from '../services/MessageTrackingService';

// Example for WhatsApp
const sentMsg = await this.whatsappClient.sendMessage(jid, { text: message });
await MessageTrackingService.trackSentMessage(task._id.toString(), {
  platform: 'whatsapp',
  message_id: sentMsg.key.id!,
  chat_id: jid
});

// Example for Discord
const sentMsg = await channel.send({ embeds: [embed] });
await MessageTrackingService.trackSentMessage(task._id.toString(), {
  platform: 'discord',
  message_id: sentMsg.id,
  chat_id: channel.id
});
```

### Step 2: Initialize Services (15 minutes)

**File: `src/index.ts` or `src/bot.ts`**

Add initialization code:

```typescript
import MessageEditService from './services/MessageEditService';
import { ChangeDetectionService } from './services/ChangeDetectionService';
import { NotionService } from './services/NotionService';

// After clients are ready
MessageEditService.initialize(sock, discordClient);

// Start change detection
const notionService = new NotionService();
const changeDetection = new ChangeDetectionService(notionService);
changeDetection.start();

logger.info('All services initialized');
```

### Step 3: Create AI Parser Service (1 hour)

**File: `src/services/AITaskParserService.ts`**

```typescript
import { AIService } from './AIService';

export interface ParsedTask {
  judul: string;
  mata_pelajaran: string;
  deskripsi: string;
  deadline: Date;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
}

export class AITaskParserService {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async parseNaturalLanguage(input: string): Promise<ParsedTask | null> {
    const prompt = `
Extract task information from this natural language input.

Input: "${input}"

Current date: ${new Date().toISOString()}

Extract and return JSON with these fields:
- judul: Task title (string)
- mata_pelajaran: Subject name (string)
- deskripsi: Task description (string)
- deadline: Deadline (ISO format: YYYY-MM-DDTHH:mm:ss)
- tipe: Task type (individu/kelompok/ujian)
- prioritas: Priority (urgent/penting/normal)

Rules:
1. Parse relative dates: "besok" = tomorrow, "lusa" = day after tomorrow
2. If time not mentioned, use 23:59
3. Detect keywords: "ujian" = tipe ujian, "kelompok" = tipe kelompok, "urgent" = prioritas urgent
4. Default: tipe=individu, prioritas=normal, mata_pelajaran=Lainnya

Return only valid JSON, no explanation.
`;

    try {
      const response = await this.aiService.generateText(prompt);
      const parsed = JSON.parse(response);
      
      // Validate and convert deadline to Date
      parsed.deadline = new Date(parsed.deadline);
      
      return parsed as ParsedTask;
    } catch (error) {
      logger.error('Failed to parse natural language', error);
      return null;
    }
  }
}
```

### Step 4: Add `/add_tugas_cepat` Command (1 hour)

**File: `src/handlers/AdminCommandHandler.ts`**

Add new command handler:

```typescript
async handleAddTugasCepat(args: string[], platform: 'whatsapp' | 'discord', userId: string) {
  const input = args.join(' ');
  
  if (!input) {
    return {
      success: false,
      message: '❌ Format: /add_tugas_cepat <deskripsi natural>\n\nContoh: /add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10'
    };
  }

  // Parse with AI
  const parsed = await aiTaskParser.parseNaturalLanguage(input);
  
  if (!parsed) {
    return {
      success: false,
      message: '❌ Maaf, saya tidak bisa memahami input kamu.\n\nCoba format seperti ini:\n"Besok ada tugas matematika halaman 45-50 deadline jam 10"'
    };
  }

  // Show preview and ask for confirmation
  const preview = `
🤖 Saya deteksi informasi berikut:

📝 Judul: ${parsed.judul}
📚 Mata Pelajaran: ${parsed.mata_pelajaran}
📄 Deskripsi: ${parsed.deskripsi}
📅 Deadline: ${parsed.deadline.toLocaleString('id-ID')}
🏷️ Tipe: ${parsed.tipe}
⚡ Prioritas: ${parsed.prioritas}

Apakah sudah benar?
- Ketik 'ya' untuk simpan
- Ketik 'edit [field] [value]' untuk ubah
- Ketik 'batal' untuk cancel
`;

  // Store parsed data in temporary storage (Redis or memory)
  // Wait for user confirmation...
  
  return {
    success: true,
    message: preview
  };
}
```

### Step 5: Build & Test (30 minutes)

```bash
# Build
npm run build

# Test multi-line description
# 1. Add task in Notion with multi-line description
# 2. Run sync
# 3. Check if formatting preserved

# Test message editing
# 1. Send task message
# 2. Update task in Notion
# 3. Wait for cron (or run manually)
# 4. Check if message edited

# Test natural language
# 1. Run /add_tugas_cepat Besok tugas matematika
# 2. Check if parsed correctly
# 3. Confirm and save
```

---

## 🐛 Known Issues & TODOs

1. **Circular dependency** - TaskFormatter imports from models, services import TaskFormatter
   - Solution: Use dynamic imports in ChangeDetectionService

2. **Confirmation state management** - Need to store pending confirmations
   - Solution: Use Map or Redis for temporary storage

3. **Rate limiting** - AI parsing could be expensive
   - Solution: Add rate limiting (max 10 requests per user per hour)

4. **Error recovery** - If edit fails, should we retry?
   - Solution: Log and continue, don't block other edits

5. **Migration** - Existing tasks don't have sent_messages field
   - Solution: Field is optional, will be populated for new messages

---

## 📊 Testing Checklist

- [ ] Multi-line description displays correctly in WhatsApp
- [ ] Multi-line description displays correctly in Discord
- [ ] Message tracking saves correctly after sending
- [ ] Cron job runs every hour
- [ ] Notion sync with retry works
- [ ] WhatsApp message edit works (channel/group)
- [ ] Discord message edit works
- [ ] Edit tracking updates correctly
- [ ] Natural language parsing works for simple input
- [ ] Natural language parsing works for complex input
- [ ] Confirmation flow works
- [ ] Edit command works in confirmation
- [ ] Cancel command works in confirmation
- [ ] Timeout works (30s)
- [ ] Error messages are helpful
- [ ] Logs are comprehensive

---

## 🚀 Deployment Steps

1. **Backup database** before deploying
2. **Test in development** environment first
3. **Monitor logs** after deployment
4. **Check cron job** is running
5. **Verify message edits** are working
6. **Test natural language** command

---

## 📚 Documentation Updates Needed

- [ ] Update `COMMANDS.md` with `/add_tugas_cepat`
- [ ] Update `README.md` with new features
- [ ] Add examples of multi-line descriptions
- [ ] Document message editing behavior
- [ ] Add troubleshooting guide

---

## 💡 Future Enhancements

1. **Batch editing** - Edit multiple messages in parallel
2. **Smart scheduling** - Run cron more frequently for urgent tasks
3. **Edit history** - Track all edits for audit
4. **Rollback** - Ability to revert edits
5. **Preview** - Show what will be edited before applying
6. **Selective edit** - Edit only specific platforms
7. **AI improvements** - Better parsing accuracy
8. **Voice input** - Parse voice messages to tasks
9. **Image OCR** - Extract tasks from images
10. **Calendar integration** - Sync with Google Calendar

---

## 🎯 Success Criteria

- ✅ Multi-line descriptions work 100% of time
- ✅ Message editing success rate > 95%
- ✅ Natural language parsing accuracy > 90%
- ✅ Cron job completes in < 5 minutes
- ✅ Zero data loss or corruption
- ✅ Comprehensive error logging
- ✅ User-friendly error messages

---

**Status:** Foundation complete, integration in progress
**Next Action:** Integrate message tracking in handlers
**Estimated Time to Complete:** 3-4 hours
