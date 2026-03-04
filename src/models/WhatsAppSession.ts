/**
 * WhatsApp Session Model
 * Stores Baileys auth state in MongoDB for persistent sessions
 * across container restarts and deployments.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppSession extends Document {
    sessionId: string;
    data: string; // JSON stringified session data
    updatedAt: Date;
    createdAt: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        data: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true // Auto createdAt & updatedAt
    }
);

export default mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema);
