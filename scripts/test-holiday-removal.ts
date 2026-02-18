
import mongoose from 'mongoose';
import { HolidayService } from '../src/services/HolidayService';
import { AIService } from '../src/services/AIService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const groqConfig = {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama3-8b-8192',
    timeout: 30
};

const geminiConfig = {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    timeout: 30
};

async function runTest() {
    try {
        console.log('Connecting to DB...');
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const holidayService = new HolidayService();
        const aiService = new AIService(groqConfig, geminiConfig);

        // Setup: Add holidays for May 20-22, 2026
        const start = new Date('2026-05-20');
        const end = new Date('2026-05-22');
        console.log(`Adding holidays from ${start.toDateString()} to ${end.toDateString()}...`);
        await holidayService.addHoliday(start, end, "Test Holiday Range");

        // Verify added
        const h1 = await holidayService.isHoliday(new Date('2026-05-20'));
        const h2 = await holidayService.isHoliday(new Date('2026-05-21'));
        const h3 = await holidayService.isHoliday(new Date('2026-05-22'));
        console.log('Holidays added:', h1 && h2 && h3);

        // Test AI Parsing
        const input = "Hapus libur dari tanggal 20 sampai 22 mei 2026";
        console.log(`Testing AI parsing with input: "${input}"`);
        const parsed = await aiService.parseHolidayRemoval(input);
        console.log('Parsed:', parsed);

        // Test Range Removal
        console.log('Removing holidays via service...');
        const count = await holidayService.removeHolidaysInRange(new Date(parsed.startDate), new Date(parsed.endDate));
        console.log(`Removed ${count} holidays.`);

        // Verify removed
        const h1_after = await holidayService.isHoliday(new Date('2026-05-20'));
        const h2_after = await holidayService.isHoliday(new Date('2026-05-21'));
        const h3_after = await holidayService.isHoliday(new Date('2026-05-22'));
        console.log('Holidays exist after removal:', h1_after || h2_after || h3_after);

        await mongoose.disconnect();
        console.log('Done.');
    } catch (e) {
        console.error(e);
        await mongoose.disconnect();
    }
}

runTest();
