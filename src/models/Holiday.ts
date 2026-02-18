import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
    date: Date;
    reason: string;
    description?: string; // Optional raw input from user
}

const HolidaySchema: Schema = new Schema({
    date: { type: Date, required: true, unique: true }, // Ensure one entry per date
    reason: { type: String, required: true },
    description: { type: String }
});

export default mongoose.model<IHoliday>('Holiday', HolidaySchema);
