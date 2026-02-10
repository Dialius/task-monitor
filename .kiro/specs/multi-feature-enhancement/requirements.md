# Multi-Feature Enhancement Spec

## Overview
This spec covers three major enhancements to the WhatsApp Class Reminder Bot:
1. Multi-line description support from Notion
2. Auto-edit messages when tasks are updated
3. Natural language task creation

## 1. Multi-line Description Support

### User Story
As a user, I want to write multi-line descriptions in Notion with bullets and paragraphs, so that the bot displays them correctly in WhatsApp/Discord with proper formatting preserved.

### Acceptance Criteria
1.1. Bot must parse ALL rich_text segments from Notion (not just first element)
1.2. Newlines and formatting must be preserved exactly as written in Notion
1.3. Bullets (`-`, `•`, `1.`, etc.) must be preserved
1.4. Paragraphs with blank lines must be preserved
1.5. No character limit beyond existing 2000 char limit

### Technical Implementation
- Update `NotionService.parseNotionPage()` to join all `rich_text` array elements
- Use `.map(rt => rt.plain_text).join('').trim()`

---

## 2. Auto-Edit Messages on Task Update

### User Story
As a user, when I update a task in Notion or database, I want the bot to automatically edit the previously sent messages in WhatsApp/Discord, so that everyone sees the latest information without manual updates.

### Acceptance Criteria
2.1. Bot must track all sent messages (message ID, platform, chat ID)
2.2. Cron job runs every 1 hour to check for task changes
2.3. Bot must detect significant changes (judul, deskripsi, deadline, prioritas, status)
2.4. Bot must edit messages on both WhatsApp and Discord
2.5. WhatsApp channel/group messages can be edited anytime (no 15-min limit)
2.6. Discord messages can be edited anytime
2.7. If sync fails, retry with exponential backoff (max 3 attempts)
2.8. Log all edit operations for debugging
2.9. Track edit count and last_edited timestamp

### Technical Implementation

#### Database Schema
```typescript
sent_messages: [{
  platform: 'whatsapp' | 'discord',
  message_id: string,
  chat_id: string,
  sent_at: Date,
  last_edited: Date,
  edit_count: number
}]
```

#### Cron Job
- Schedule: Every 1 hour (`0 * * * *`)
- Steps:
  1. Sync from Notion with retry logic
  2. Find tasks updated in last hour with sent messages
  3. For each task, edit all tracked messages
  4. Update edit tracking in database

#### WhatsApp Edit (Baileys)
```typescript
await sock.sendMessage(jid, {
  edit: messageKey,
  text: updatedMessage
});
```

#### Discord Edit (Discord.js)
```typescript
const message = await channel.messages.fetch(messageId);
await message.edit({ embeds: [updatedEmbed] });
```

---

## 3. Natural Language Task Creation

### User Story
As a user, I want to create tasks using natural language (e.g., "Besok ada tugas matematika halaman 45-50 deadline jam 10"), so that I don't need to remember the strict command format.

### Acceptance Criteria
3.1. New command `/add_tugas_cepat <natural language input>`
3.2. AI must parse and extract: judul, mata_pelajaran, deskripsi, deadline, tipe, prioritas
3.3. AI must handle relative dates: "besok", "lusa", "minggu depan"
3.4. AI must detect keywords: "ujian" → tipe ujian, "kelompok" → tipe kelompok, "urgent" → prioritas urgent
3.5. Bot must show preview and ask for confirmation before saving
3.6. User can confirm with "ya" or edit with "edit [field] [value]"
3.7. User can cancel with "batal"
3.8. If AI fails to parse, show error message and suggest format
3.9. Support both WhatsApp and Discord platforms

### AI Prompt Strategy
```
Extract task information from natural language input.

Input: "{userInput}"

Current date: {currentDate}

Extract JSON with fields:
- judul: Task title
- mata_pelajaran: Subject (must be from valid list)
- deskripsi: Task description
- deadline: ISO format (YYYY-MM-DDTHH:mm:ss)
- tipe: individu/kelompok/ujian
- prioritas: urgent/penting/normal

Rules:
1. Parse relative dates: "besok" = tomorrow, "lusa" = day after tomorrow
2. If time not mentioned, use 23:59
3. Detect keywords for tipe and prioritas
4. Default: tipe=individu, prioritas=normal, mata_pelajaran=Lainnya

Return only valid JSON.
```

### Confirmation Flow
```
User: /add_tugas_cepat Besok ada tugas matematika halaman 45-50 deadline jam 10

Bot: 
🤖 Saya deteksi informasi berikut:

📝 Judul: Tugas Matematika
📚 Mata Pelajaran: Matematika
📄 Deskripsi: Halaman 45-50
📅 Deadline: 11 Feb 2026, 10:00
🏷️ Tipe: Individu
⚡ Prioritas: Normal

Apakah sudah benar?
- Ketik 'ya' untuk simpan
- Ketik 'edit [field] [value]' untuk ubah
- Ketik 'batal' untuk cancel

User: ya

Bot: ✅ Tugas berhasil ditambahkan! ID: 12345
```

### Error Handling
- AI parse fails → Show error with format example
- Missing critical info → Ask user to provide
- Invalid date → Ask for clarification
- Timeout (30s) → Auto-cancel

---

## Implementation Order

1. ✅ Phase 1: Fix multi-line description (DONE)
2. ✅ Phase 2: Update database schema (DONE)
3. 🔄 Phase 3: Message tracking system
4. 🔄 Phase 4: Change detection & auto-edit
5. 🔄 Phase 5: Natural language task creation

## Testing Scenarios

### Multi-line Description
- Single line description
- Multi-line with bullets
- Multi-line with paragraphs
- Mixed bullets and paragraphs
- Very long description (near 2000 char limit)

### Auto-Edit Messages
- Update task in Notion → Message edited in WhatsApp/Discord
- Multiple messages for same task → All edited
- Update within 1 hour → Detected and edited
- Sync fails → Retry with backoff
- Message too old (Discord only) → Still editable

### Natural Language
- Simple: "Besok tugas matematika"
- Complex: "Ujian fisika minggu depan jam 10, bawa kalkulator, urgent"
- Ambiguous: "Ada tugas besok" → Ask for more info
- Invalid: "asdfghjkl" → Show error
- Edit flow: User edits field before confirming

## Performance Considerations

- Cron job: Max 3 retry attempts with exponential backoff
- Batch edit: Process max 50 messages per run
- AI timeout: 10 seconds per parse
- Database queries: Use indexes on updated_at and sent_messages

## Security & Safety

- Rate limiting: Max 10 AI parse requests per user per hour
- Input validation: Sanitize all user inputs
- Error logging: Log all failures for debugging
- Graceful degradation: If edit fails, log but don't crash

---

## Success Metrics

- Multi-line descriptions display correctly 100% of time
- Auto-edit success rate > 95%
- Natural language parse accuracy > 90%
- Cron job completion time < 5 minutes
- Zero crashes or data loss
