import dotenv from 'dotenv';
import { connectDatabase } from '../src/config/database';
import { initializeConfig } from '../src/config/ConfigManager';
import { TaskService } from '../src/services/TaskService';
import { ReminderScheduler } from '../src/services/ReminderScheduler';
import { ScheduleService } from '../src/services/ScheduleService';
import { PiketService } from '../src/services/PiketService';
import { AnnouncementService } from '../src/services/AnnouncementService';
import { AIService } from '../src/services/AIService';
import { NotionService } from '../src/services/NotionService';
import { HolidayService } from '../src/services/HolidayService';

dotenv.config();

async function main() {
    await connectDatabase();
    await initializeConfig();

    const taskService = new TaskService();
    const scheduleService = new ScheduleService();
    const piketService = new PiketService();
    const announcementService = new AnnouncementService();
    const aiService = new AIService({ apiKey: '' }, { apiKey: '' });
    const notionService = new NotionService();
    const holidayService = new HolidayService();

    // Mock Adapters
    const discordAdapter = {
        getPlatformName: () => 'discord',
        sendMessage: async (channelId, message) => console.log(`[Discord -> ${channelId}]: ${message}`),
        sendDailyRecap: async (channelId, data) => console.log(`[Discord Daily Recap -> ${channelId}]:`, data.tasks.length, 'tasks'),
        sendWeeklyRecap: async (channelId, data) => console.log(`[Discord Weekly Recap -> ${channelId}]: week ${data.weekNumber}`),
    };

    const whatsappAdapter = {
        getPlatformName: () => 'whatsapp',
        sendMessage: async (channelId, message) => console.log(`[WhatsApp -> ${channelId}]: ${message}`),
        sendDailyRecap: async (channelId, data) => console.log(`[WhatsApp Daily Recap -> ${channelId}]:`, data.tasks.length, 'tasks'),
        sendWeeklyRecap: async (channelId, data) => console.log(`[WhatsApp Weekly Recap -> ${channelId}]: week ${data.weekNumber}`),
    };

    const scheduler = new ReminderScheduler(
        taskService,
        scheduleService,
        piketService,
        announcementService,
        aiService,
        [
            { adapter: discordAdapter as any, channelId: 'discord-channel-123' },
            { adapter: whatsappAdapter as any, channelId: 'wa-group-456' }
        ],
        {
            dailyReminderTime: '16:00',
            weeklyReminderDay: 5,
            weeklyReminderTime: '21:00',
            timezone: 'Asia/Jakarta'
        },
        notionService,
        holidayService
    );

    console.log('Sending daily recap...');
    await scheduler.sendDailyRecap();
    console.log('Sending weekly recap...');
    await scheduler.sendWeeklyRecap();
    
    console.log('Done!');
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
