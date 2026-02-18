import Holiday, { IHoliday } from '../models/Holiday';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export class HolidayService {
    /**
     * Add a range of holidays
     */
    async addHoliday(startDate: Date, endDate: Date, reason: string, description?: string): Promise<IHoliday[]> {
        const holidays: IHoliday[] = [];
        const currentDate = new Date(startDate);
        // Normalize time to start of day
        currentDate.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        // Safety limit: prevented adding holidays for more than 365 days accidentally
        let daysCount = 0;
        while (currentDate <= end && daysCount < 365) {
            // Clone date for storage
            const holidayDate = new Date(currentDate);

            try {
                // Upsert to handle existing dates (overwrite if exists)
                // Using 'any' cast for update if needed, but standard model should work
                const holiday = await Holiday.findOneAndUpdate(
                    { date: holidayDate },
                    {
                        date: holidayDate,
                        reason,
                        description
                    },
                    { new: true, upsert: true }
                );

                if (holiday) holidays.push(holiday);

            } catch (error) {
                logger.error(`Error adding holiday for ${holidayDate.toDateString()}`, error as Error);
            }

            currentDate.setDate(currentDate.getDate() + 1);
            daysCount++;
        }
        return holidays;
    }

    /**
     * Get holiday info for a specific date
     */
    async getHoliday(date: Date): Promise<IHoliday | null> {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return Holiday.findOne({ date: d });
    }

    /**
     * Check if specific date is holiday
     */
    async isHoliday(date: Date): Promise<boolean> {
        const holiday = await this.getHoliday(date);
        return !!holiday;
    }

    /**
     * Get upcoming holidays
     */
    async getUpcomingHolidays(limit: number = 5): Promise<IHoliday[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Holiday.find({ date: { $gte: today } })
            .sort({ date: 1 })
            .limit(limit);
    }

    /**
     * Remove holiday on specific date
     */
    async removeHoliday(date: Date): Promise<boolean> {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const result = await Holiday.deleteOne({ date: d });
        return result.deletedCount ? result.deletedCount > 0 : false;
    }

    /**
     * Remove holidays in a date range (inclusive)
     */
    async removeHolidaysInRange(startDate: Date, endDate: Date): Promise<number> {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        const result = await Holiday.deleteMany({
            date: {
                $gte: start,
                $lte: end
            }
        });

        return result.deletedCount || 0;
    }
}
