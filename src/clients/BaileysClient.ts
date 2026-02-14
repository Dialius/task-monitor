/**
 * Baileys (WhatsApp) Client Wrapper
 * Requirements: 10.1, 10.2, 10.3, 10.6
 * Updated for Baileys 7.x
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  WAMessage,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { getLogger } from '../utils/Logger';
import QRCode from 'qrcode-terminal';
import QRCodeImage from 'qrcode';

const logger = getLogger();

export interface BaileysConfig {
  authDir: string;
  printQRInTerminal: boolean; // kept for compatibility but not used
  usePairingCode?: boolean; // Use pairing code instead of QR (better for Railway)
  phoneNumber?: string; // Phone number for pairing code (format: 628xxx)
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
  private shouldReconnect: boolean = true;
  private messageHandlerRegistered: boolean = false;
  private connectionReplacedCount: number = 0;
  private maxConnectionReplacedCount: number = 3;

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
      
      // Fetch latest Baileys version for compatibility
      const { version } = await fetchLatestBaileysVersion();

      this.socket = makeWASocket({
        version,
        auth: state,
        // printQRInTerminal deprecated - handle QR manually in connection.update
        printQRInTerminal: false,
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
        },
        // Mark as unavailable to receive notifications
        markOnlineOnConnect: false,
        // Browser config
        browser: ['Multi-Platform Bot', 'Chrome', '1.0.0'],
        // Sync full history
        syncFullHistory: false
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

    // Handle QR code or pairing code
    if (qr) {
      if (this.config.usePairingCode && this.config.phoneNumber) {
        // Use pairing code instead of QR (better for Railway/server deployment)
        if (this.socket && !this.socket.authState.creds.registered) {
          console.log('\n📱 PAIRING CODE MODE\n');
          
          // Clean phone number - remove any non-digit characters
          let cleanNumber = this.config.phoneNumber.replace(/\D/g, '');
          
          // Ensure it starts with country code (62 for Indonesia)
          if (!cleanNumber.startsWith('62')) {
            if (cleanNumber.startsWith('0')) {
              // Convert 08xxx to 628xxx
              cleanNumber = '62' + cleanNumber.substring(1);
            } else if (cleanNumber.startsWith('8')) {
              // Convert 8xxx to 628xxx
              cleanNumber = '62' + cleanNumber;
            }
          }
          
          console.log('🔢 Requesting pairing code for:', cleanNumber);
          console.log('   (Original input:', this.config.phoneNumber + ')');
          
          try {
            const code = await this.socket.requestPairingCode(cleanNumber);
            console.log('\n╔════════════════════════════════════════╗');
            console.log('║  PAIRING CODE (8 DIGIT)               ║');
            console.log('╠════════════════════════════════════════╣');
            console.log(`║  ${code}                              ║`);
            console.log('╚════════════════════════════════════════╝\n');
            console.log('📱 Cara pakai:');
            console.log('   1. Buka WhatsApp di HP kamu');
            console.log('   2. Tap Menu (⋮) atau Settings');
            console.log('   3. Tap "Linked Devices"');
            console.log('   4. Tap "Link a Device"');
            console.log('   5. Tap "Link with phone number instead"');
            console.log(`   6. Masukkan kode: ${code}\n`);
            console.log('⚠️  PENTING:');
            console.log(`   - Pastikan nomor HP yang kamu gunakan: ${cleanNumber}`);
            console.log('   - Kode berlaku 60 detik, masukkan segera!');
            console.log('   - Jika salah, tunggu kode baru di logs\n');
            console.log('⏳ Menunggu pairing...\n');
            
            logger.info('Pairing code generated', { phoneNumber: cleanNumber, code });
          } catch (error) {
            console.error('❌ Failed to request pairing code:', error);
            console.error('   Error details:', (error as Error).message);
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Pastikan nomor format: 628xxx (tanpa + atau spasi)');
            console.log('   2. Pastikan nomor aktif dan terdaftar di WhatsApp');
            console.log('   3. Coba restart deployment untuk kode baru\n');
            logger.error('Failed to request pairing code', error as Error);
          }
        }
      } else {
        // Generate QR code as image URL (better for Railway logs)
        try {
          // Generate QR code as data URL
          const qrDataURL = await QRCodeImage.toDataURL(qr, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 400,
            margin: 2
          });

          console.log('\n╔════════════════════════════════════════════════════════╗');
          console.log('║  📱 WHATSAPP QR CODE - SCAN DENGAN HP KAMU            ║');
          console.log('╚════════════════════════════════════════════════════════╝\n');
          console.log('🔗 BUKA URL INI DI BROWSER:');
          console.log('\n' + qrDataURL + '\n');
          console.log('📋 Cara pakai:');
          console.log('   1. COPY URL di atas (data:image/png;base64,...)');
          console.log('   2. PASTE di address bar browser (Chrome/Firefox/Edge)');
          console.log('   3. QR code akan muncul sebagai gambar');
          console.log('   4. Buka WhatsApp > Menu > Linked Devices');
          console.log('   5. Tap "Link a Device"');
          console.log('   6. SCAN QR code dari browser\n');
          console.log('⏳ Menunggu scan QR code...\n');
          console.log('💡 Tips:');
          console.log('   - QR code berlaku 60 detik');
          console.log('   - Jika expired, QR baru akan muncul otomatis');
          console.log('   - Pastikan koneksi internet stabil\n');

          // Also show ASCII QR as fallback
          console.log('📱 Atau scan QR ASCII di bawah (jika terminal support):\n');
          QRCode.generate(qr, { small: true });
          console.log('');

          logger.info('QR Code generated as data URL for WhatsApp authentication');
        } catch (error) {
          console.error('❌ Failed to generate QR code image:', error);
          // Fallback to ASCII QR
          console.log('\n📱 Scan QR Code dengan WhatsApp kamu:\n');
          QRCode.generate(qr, { small: true });
          console.log('\n⏳ Menunggu scan QR code...\n');
          logger.info('QR Code generated for WhatsApp authentication');
        }
      }
    }

    if (connection === 'close') {
      this.isConnected = false;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      
      logger.warn('WhatsApp connection closed', {
        statusCode,
        reason: DisconnectReason[statusCode] || 'Unknown',
        reconnectAttempts: this.reconnectAttempts
      });

      // Check if should reconnect
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('\n❌ WhatsApp logged out - please authenticate again\n');
        logger.info('WhatsApp logged out, clearing session');
        
        // Clear session files and reconnect with fresh authentication
        await this.clearSession();
        
        // Reset reconnect attempts and reconnect
        this.reconnectAttempts = 0;
        this.shouldReconnect = true;
        
        console.log('🔄 Reconnecting with fresh session...\n');
        setTimeout(async () => {
          await this.connect();
        }, 2000);
        return;
      } else if (statusCode === DisconnectReason.restartRequired) {
        console.log('\n🔄 WhatsApp restart required - restarting...\n');
        // Don't increment reconnect attempts for restart
        setTimeout(async () => {
          await this.connect();
        }, 1000);
        return; // Exit early to avoid double reconnection
      } else if (statusCode === DisconnectReason.connectionClosed) {
        console.log('\n⚠️  WhatsApp connection closed normally\n');
        await this.handleReconnection();
      } else if (statusCode === DisconnectReason.connectionLost) {
        console.log('\n⚠️  WhatsApp connection lost\n');
        await this.handleReconnection();
      } else if (statusCode === DisconnectReason.timedOut) {
        console.log('\n⏱️  WhatsApp connection timed out\n');
        await this.handleReconnection();
      } else if (statusCode === 440) {
        // connectionReplaced - Another WhatsApp Web/Bot is using the same number
        this.connectionReplacedCount++;
        
        console.log(`\n⚠️  Connection replaced (${this.connectionReplacedCount}/${this.maxConnectionReplacedCount})\n`);
        console.log('💡 Possible causes:');
        console.log('   • Another bot instance is running with the same number');
        console.log('   • WhatsApp Web is open in another browser');
        console.log('   • Multiple devices connected to the same account\n');
        
        if (this.connectionReplacedCount >= this.maxConnectionReplacedCount) {
          console.log('❌ Too many connectionReplaced errors - stopping reconnection\n');
          console.log('🔧 Solutions:');
          console.log('   1. Close all other WhatsApp Web sessions');
          console.log('   2. Stop any other bot instances using this number');
          console.log('   3. Check WhatsApp > Linked Devices and remove unused devices');
          console.log('   4. Restart bot after fixing the issue\n');
          
          this.shouldReconnect = false;
          logger.error('Too many connectionReplaced errors, stopping reconnection');
          return;
        }
        
        // Wait longer before reconnecting (10 seconds)
        console.log('🔄 Waiting 10 seconds before reconnecting...\n');
        setTimeout(async () => {
          await this.handleReconnection();
        }, 10000);
        return;
      } else if (statusCode === 405) {
        // Method Not Allowed - usually means client is outdated
        console.log('\n❌ WhatsApp client outdated (405) - updating...\n');
        this.reconnectAttempts = 0; // Reset attempts
        await this.handleReconnection();
      } else {
        // Unknown error - try to reconnect
        await this.handleReconnection();
      }
    } else if (connection === 'open') {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionReplacedCount = 0; // Reset on successful connection
      this.shouldReconnect = true;
      console.log('\n✅ WhatsApp connected successfully!\n');
      logger.info('WhatsApp connection established');
      
      // Log phone number if available
      if (this.socket?.user) {
        console.log(`📱 Connected as: ${this.socket.user.id}\n`);
      }
    } else if (connection === 'connecting') {
      console.log('🔄 Connecting to WhatsApp...');
      logger.info('Connecting to WhatsApp...');
    }
  }

  /**
   * Handle reconnection with exponential backoff
   * Requirement: 10.4, 10.5
   */
  private async handleReconnection(): Promise<void> {
    if (!this.shouldReconnect) {
      logger.info('Reconnection disabled');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('\n❌ Max reconnection attempts reached\n');
      console.log('💡 Tip: Restart bot to try again with fresh session\n');
      logger.error('Max reconnection attempts reached');
      this.shouldReconnect = false;
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(Math.pow(2, this.reconnectAttempts - 1) * 1000, 30000); // Max 30s

    console.log(`🔄 Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...\n`);
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
      this.shouldReconnect = false;
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

    // Prevent multiple handler registrations
    if (this.messageHandlerRegistered) {
      console.log('⚠️  Message handler already registered, skipping...\n');
      return;
    }

    console.log('📝 Registering message handler - waiting for messages...\n');
    this.messageHandlerRegistered = true;
    
    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      console.log(`\n🔔 messages.upsert event received (type: ${type})`);
      console.log(`   Total messages: ${messages.length}`);
      
      // Check if testing mode is enabled (allows messages from self)
      const testingMode = process.env.WHATSAPP_TESTING_MODE === 'true';
      if (testingMode) {
        console.log(`   ⚠️  TESTING MODE: Messages from self will be processed`);
      }
      
      for (const message of messages) {
        console.log(`\n   Message details:`);
        console.log(`   - From me: ${message.key.fromMe}`);
        console.log(`   - Has message: ${!!message.message}`);
        console.log(`   - Remote JID: ${message.key.remoteJid}`);
        console.log(`   - Message type: ${type}`);
        
        // Skip messages from self (unless testing mode)
        if (message.key.fromMe && !testingMode) {
          console.log(`   ⚠️  Skipped: Message from me (set WHATSAPP_TESTING_MODE=true to allow)`);
          continue;
        }
        
        if (!message.message) {
          console.log(`   ⚠️  Skipped: No message content`);
          continue;
        }

        console.log(`   ✅ Processing message...`);
        
        try {
          handler(message);
        } catch (error) {
          console.error(`   ❌ Error in handler:`, error);
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

  /**
   * Clear session files (for logout/re-authentication)
   */
  async clearSession(): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Check if auth directory exists
      if (!fs.existsSync(this.config.authDir)) {
        logger.info('Auth directory does not exist, nothing to clear');
        return;
      }

      // Delete all files in auth directory
      const files = fs.readdirSync(this.config.authDir);
      for (const file of files) {
        const filePath = path.join(this.config.authDir, file);
        fs.unlinkSync(filePath);
      }

      logger.info('WhatsApp session cleared successfully');
      console.log('✅ Session files cleared\n');
    } catch (error) {
      logger.error('Failed to clear WhatsApp session', error as Error);
      console.log('⚠️  Failed to clear session files\n');
    }
  }
}
