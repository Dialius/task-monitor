# WhatsApp Class Reminder Bot

Bot WhatsApp untuk manajemen tugas dan jadwal kelas dengan fitur reminder otomatis, integrasi AI, dan sinkronisasi Notion.

## Features

- 📝 Manajemen tugas dengan prioritas otomatis
- 📅 Jadwal pelajaran harian dan mingguan
- 🧹 Jadwal piket dengan mention otomatis
- 📢 Pengumuman khusus
- ⏰ Reminder otomatis (harian & mingguan)
- 🤖 AI-powered text formatting (Groq + Gemini fallback)
- 📊 Integrasi Notion untuk sinkronisasi tugas
- 🔐 Role-based access control (Ketua, Wakil, Koordinator, Member)

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **WhatsApp**: Baileys
- **Database**: MongoDB + Mongoose
- **Scheduler**: node-cron
- **AI Services**: Groq API (primary), Google Gemini (fallback)
- **Logging**: Winston
- **Testing**: Jest + fast-check (property-based testing)

## Installation

1. Clone repository:
```bash
git clone <repository-url>
cd whatsapp-class-reminder-bot
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
copy .env.example .env
```

4. Configure environment variables in `.env`

5. Build TypeScript:
```bash
npm run build
```

6. Start bot:
```bash
npm start
```

## Development

```bash
npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
src/
├── config/       # Configuration files
├── models/       # Mongoose schemas
├── services/     # Business logic services
├── handlers/     # Command handlers
├── utils/        # Utility functions
└── templates/    # Message templates
```

## Documentation

- [Requirements](/.kiro/specs/whatsapp-class-reminder-bot/requirements.md)
- [Design](/.kiro/specs/whatsapp-class-reminder-bot/design.md)
- [Tasks](/.kiro/specs/whatsapp-class-reminder-bot/tasks.md)

## License

MIT
