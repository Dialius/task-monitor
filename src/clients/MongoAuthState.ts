/**
 * MongoDB-based Auth State for Baileys
 * Replaces useMultiFileAuthState to persist WhatsApp sessions in MongoDB.
 * This ensures sessions survive container restarts/redeployments.
 *
 * Compatible with @whiskeysockets/baileys 7.x
 */

import { proto } from '@whiskeysockets/baileys';
import { initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import WhatsAppSession from '../models/WhatsAppSession';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

/**
 * Read session data from MongoDB
 */
async function readData(sessionId: string): Promise<any | null> {
    try {
        const session = await WhatsAppSession.findOne({ sessionId });
        if (session) {
            return JSON.parse(session.data, BufferJSON.reviver);
        }
        return null;
    } catch (error) {
        logger.error(`Failed to read session data: ${sessionId}`, error as Error);
        return null;
    }
}

/**
 * Write session data to MongoDB
 */
async function writeData(sessionId: string, data: any): Promise<void> {
    try {
        const serialized = JSON.stringify(data, BufferJSON.replacer);
        await WhatsAppSession.updateOne(
            { sessionId },
            { sessionId, data: serialized },
            { upsert: true }
        );
    } catch (error) {
        logger.error(`Failed to write session data: ${sessionId}`, error as Error);
    }
}

/**
 * Remove session data from MongoDB
 */
async function removeData(sessionId: string): Promise<void> {
    try {
        await WhatsAppSession.deleteOne({ sessionId });
    } catch (error) {
        logger.error(`Failed to remove session data: ${sessionId}`, error as Error);
    }
}

/**
 * MongoDB-based auth state for Baileys
 * Drop-in replacement for useMultiFileAuthState
 *
 * Usage:
 *   const { state, saveCreds } = await useMongoDBAuthState();
 *   const sock = makeWASocket({ auth: state, ... });
 *   sock.ev.on('creds.update', saveCreds);
 */
export async function useMongoDBAuthState() {
    // Load or initialize credentials
    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData('creds', creds);
        logger.info('MongoDB Auth: Initialized new credentials');
    } else {
        logger.info('MongoDB Auth: Loaded existing credentials from MongoDB');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type: string, ids: string[]) => {
                    const data: { [key: string]: any } = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data: any) => {
                    const tasks: Promise<void>[] = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const sessionId = `${category}-${id}`;
                            tasks.push(
                                value ? writeData(sessionId, value) : removeData(sessionId)
                            );
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData('creds', creds)
    };
}

/**
 * Clear all WhatsApp sessions from MongoDB
 * Used when logging out or re-authenticating
 */
export async function clearMongoDBAuthState(): Promise<void> {
    try {
        const result = await WhatsAppSession.deleteMany({});
        logger.info(`MongoDB Auth: Cleared ${result.deletedCount} session entries`);
        console.log(`✅ Cleared ${result.deletedCount} WhatsApp session entries from MongoDB`);
    } catch (error) {
        logger.error('Failed to clear MongoDB auth state', error as Error);
        console.log('⚠️  Failed to clear WhatsApp session from MongoDB');
    }
}
