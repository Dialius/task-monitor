/**
 * Baileys (WhatsApp) Client Wrapper
 * Requirements: 10.1, 10.2, 10.3, 10.6
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  WAMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

export interface BaileysConfig {
  authDir: string;
  printQRInTerminal: boolean;
}

export interface ConnectionState {
  connection: 'open' | 'close' | 'connecting';
  lastDisconnect?: {
    error: Error;
    date: Date;
  };
}

/**
 * Baileys Client wrapper for WhatsApp operations
 */
export class BaileysClient {
  private socket: WASocket | null = null;
  private config: BaileysConfig;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: BaileysConfig) {
    this.config = config;
  }

  /**
   * Connect to WhatsApp
   * Requirement: 10.1, 10.2
   */
  async connect(): Promise<void> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.config.authDir);

      this.socket = makeWASocket({
        auth: state,
        // printQRInTerminal deprecated - handle QR manually in connection.update
        logger: {
          level: 'silent',
          error: () => {},
          warn: () => {},
          info: () => {},
          debug: () => {},
          trace: () => {},
          child: () => ({
            level: 'silent',
            error: () => {},
            warn: () => {},
            info: () => {},
            debug: () => {},
            trace: () => {},
            child: () => ({} as any)
          })
        }
      });

      // Save credentials on update
      this.socket.ev.on('creds.update', saveCreds);

      // Handle connection updates
      this.socket.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(update);
      });

      logger.info('Baileys client initialized');
    } catch (error) {
      logger.error('Failed to initialize Baileys client', error as Error);
      throw error;
    }
  }

  /**
   * Handle connection state updates
   * Requirement: 10.4, 10.5, 10.7
   */
  private async handleConnectionUpdate(update: any): Promise<void> {
    const { connection, lastDisconnect, qr } = update;

    // Handle QR code manually (new Baileys way)
    if (qr) {
      console.log('\n📱 Scan QR Code dengan WhatsApp kamu:\n');
      // Import qrcode-terminal dynamically
      const QRCode = require('qrcode-terminal');
      QRCode.generate(qr, { small: true });
      console.log('\n');
      logger.info('QR Code generated for WhatsApp authentication');
    }

    if (connection === 'close') {
      this.isConnected = false;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      logger.warn('WhatsApp connection closed', {
        statusCode,
        shouldReconnect,
        reconnectAttempts: this.reconnectAttempts
      });

      if (shouldReconnect && statusCode !== DisconnectReason.connectionClosed) {
        await this.handleReconnection();
      } else if (statusCode === DisconnectReason.loggedOut) {
        logger.info('WhatsApp logged out, not reconnecting');
      } else {
        logger.info('WhatsApp connection closed normally');
      }
    } else if (connection === 'open') {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('\n✅ WhatsApp connected successfully!\n');
      logger.info('WhatsApp connection established');
    } else if (connection === 'connecting') {
      logger.info('Connecting to WhatsApp...');
    }
  }

  /**
   * Handle reconnection with exponential backoff
   * Requirement: 10.4, 10.5
   */
  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached, generating new QR code');
      this.reconnectAttempts = 0;
      await this.connect(); // Generate new QR code
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts - 1) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s, 16s

    logger.info(`Reconnecting to WhatsApp in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  /**
   * Disconnect from WhatsApp
   */
  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.socket.logout();
      this.socket = null;
      this.isConnected = false;
      logger.info('WhatsApp client disconnected');
    }
  }

  /**
   * Check if client is connected
   */
  isReady(): boolean {
    return this.isConnected && this.socket !== null;
  }

  /**
   * Get the underlying Baileys socket
   */
  getSocket(): WASocket | null {
    return this.socket;
  }

  /**
   * Send a text message
   */
  async sendMessage(jid: string, text: string): Promise<void> {
    if (!this.socket) {
      throw new Error('WhatsApp client not connected');
    }

    await this.socket.sendMessage(jid, { text });
  }

  /**
   * Send message with mentions
   * Requirement: 4.6
   */
  async sendMessageWithMentions(
    jid: string,
    text: string,
    mentions: string[]
  ): Promise<void> {
    if (!this.socket) {
      throw new Error('WhatsApp client not connected');
    }

    await this.socket.sendMessage(jid, {
      text,
      mentions
    });
  }

  /**
   * Handle incoming messages
   */
  onMessage(handler: (message: WAMessage) => void): void {
    if (!this.socket) {
      throw new Error('WhatsApp client not connected');
    }

    this.socket.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        // Only process new messages (not from history)
        if (message.key.fromMe || !message.message) continue;

        try {
          handler(message);
        } catch (error) {
          logger.error('Error handling WhatsApp message', error as Error, {
            messageId: message.key.id
          });
        }
      }
    });
  }

  /**
   * Handle connection state changes
   */
  onConnectionUpdate(handler: (update: ConnectionState) => void): void {
    if (!this.socket) {
      throw new Error('WhatsApp client not connected');
    }

    this.socket.ev.on('connection.update', (update) => {
      const state: ConnectionState = {
        connection: update.connection as 'open' | 'close' | 'connecting',
        lastDisconnect: update.lastDisconnect
          ? {
              error: (update.lastDisconnect.error as Boom).output as any,
              date: new Date()
            }
          : undefined
      };

      handler(state);
    });
  }

  /**
   * Save session data
   * Requirement: 10.6
   */
  async saveSession(): Promise<void> {
    // Session is automatically saved by useMultiFileAuthState
    logger.info('WhatsApp session saved');
  }

  /**
   * Load existing session
   * Requirement: 10.3
   */
  async loadSession(): Promise<boolean> {
    try {
      const { state } = await useMultiFileAuthState(this.config.authDir);
      return state.creds !== undefined;
    } catch (error) {
      logger.error('Failed to load WhatsApp session', error as Error);
      return false;
    }
  }
}
