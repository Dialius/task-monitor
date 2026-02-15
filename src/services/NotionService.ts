/**
 * Notion Service
 * Sync tasks from Notion database to MongoDB
 * 
 * Implements robust error handling for:
 * - Rate limiting (429 errors) with exponential backoff
 * - Timeouts (504 errors) with configurable timeout
 * - Network failures with retry logic
 * - Size limits (2000 char) with truncation
 */

import { Client } from '@notionhq/client';
import { APIResponseError } from '@notionhq/client';
import Task from '../models/Task';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

// Type augmentation for Notion Client to fix TypeScript errors
// Notion SDK v5+ uses API version 2025-09-03 with dataSources.query
interface NotionDataSources {
  query: (args: any) => Promise<any>;
  retrieve: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  listTemplates: (args: any) => Promise<any>;
}

interface NotionDatabases {
  retrieve: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
}

interface NotionClientWithQuery extends Client {
  dataSources: NotionDataSources;
  databases: NotionDatabases;
}

export interface NotionTask {
  id: string;
  judul: string;
  mata_pelajaran: string;
  deskripsi: string;
  deadline: Date;
  tipe: 'individu' | 'kelompok' | 'ujian';
  prioritas: 'urgent' | 'penting' | 'normal';
  status: 'aktif' | 'selesai';
  link_pengumpulan?: string;
  catatan?: string;
  created_by: string;
}

/**
 * Notion Service for syncing tasks with robust error handling
 */
export class NotionService {
  private notion!: NotionClientWithQuery;
  private databaseId!: string;
  private dataSourceId!: string; // Store the data source ID
  private enabled: boolean;
  
  // Configuration for retry logic
  private readonly MAX_RETRIES = 5;
  private readonly BASE_DELAY = 1000; // 1 second
  private readonly MAX_DELAY = 32000; // 32 seconds
  private readonly TIMEOUT_MS = 30000; // 30 seconds
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests to avoid rate limiting
  
  // Rate limiting state
  private lastRequestTime = 0;
  private requestCount = 0;
  private requestWindow = Date.now();

  constructor() {
    const enabled = process.env.NOTION_ENABLED === 'true';
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    console.log('🔍 Notion Service Initialization Debug:');
    console.log(`   NOTION_ENABLED env: "${process.env.NOTION_ENABLED}"`);
    console.log(`   enabled (parsed): ${enabled}`);
    console.log(`   Has API Key: ${!!apiKey}`);
    console.log(`   Has Database ID: ${!!databaseId}`);

    // Check if explicitly disabled
    if (!enabled) {
      this.enabled = false;
      logger.info('Notion service disabled via NOTION_ENABLED flag');
      console.log('❌ Notion service disabled via NOTION_ENABLED flag');
      return;
    }

    // Check if credentials are provided
    if (!apiKey || !databaseId) {
      this.enabled = false;
      logger.warn('Notion service disabled - missing API key or database ID', {
        hasApiKey: !!apiKey,
        hasDatabaseId: !!databaseId
      });
      console.log('❌ Notion service disabled - missing credentials');
      console.log(`   Has API Key: ${!!apiKey}`);
      console.log(`   Has Database ID: ${!!databaseId}`);
      return;
    }

    // Try to initialize Notion client
    try {
      this.notion = new Client({ 
        auth: apiKey,
        // Increase timeout for slow connections
        timeoutMs: this.TIMEOUT_MS
      }) as NotionClientWithQuery;
      
      // Format database ID to UUID format (8-4-4-4-12)
      this.databaseId = this.formatDatabaseId(databaseId!);
      
      console.log(`   Formatted Database ID: ${this.databaseId}`);
      
      // Verify client is properly initialized
      if (!this.notion || !this.notion.databases) {
        logger.warn('Notion client not properly initialized - disabling Notion service');
        console.log('❌ Notion client not properly initialized');
        this.enabled = false;
        return;
      }
      
      // Verify dataSources API exists (for API v2025-09-03)
      if (!this.notion.dataSources || typeof this.notion.dataSources.query !== 'function') {
        logger.warn('Notion dataSources.query method is not available - disabling Notion service');
        console.log('❌ Notion dataSources.query method not available');
        this.enabled = false;
        return;
      }
      
      // All checks passed - enable Notion
      this.enabled = true;
      
      logger.info('Notion service initialized successfully', { 
        databaseId: this.databaseId,
        maxRetries: this.MAX_RETRIES,
        timeout: `${this.TIMEOUT_MS}ms`,
        clientInitialized: !!this.notion,
        dataSourcesAvailable: !!this.notion.dataSources
      });
      
      console.log('✅ Notion service enabled successfully!');
      console.log(`   Database ID: ${databaseId}`);
      console.log(`   Max Retries: ${this.MAX_RETRIES}`);
      console.log(`   Timeout: ${this.TIMEOUT_MS}ms`);
    } catch (error) {
      logger.error('Failed to initialize Notion client - disabling Notion service', error as Error);
      console.log('❌ Failed to initialize Notion client:', error);
      this.enabled = false;
    }
  }

  /**
   * Check if Notion is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Format database ID to UUID format with dashes (8-4-4-4-12)
   * Notion requires UUIDs in this format for API calls
   */
  private formatDatabaseId(id: string): string {
    // Remove any existing dashes
    const clean = id.replace(/-/g, '');
    
    // Check if it's a valid 32-character hex string
    if (clean.length !== 32 || !/^[0-9a-f]+$/i.test(clean)) {
      logger.warn('Invalid database ID format', { id });
      return id; // Return as-is if invalid
    }
    
    // Format as UUID: 8-4-4-4-12
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }

  /**
   * Get data source ID from database ID
   * In Notion API v2025-09-03, databases contain data sources
   * For legacy databases, there's one default data source
   */
  private async getDataSourceId(): Promise<string> {
    if (this.dataSourceId) {
      return this.dataSourceId;
    }

    try {
      logger.debug('Fetching data source ID from database...', { databaseId: this.databaseId });
      
      const database: any = await this.executeWithRetry(
        async () => {
          return await this.notion.databases.retrieve({
            database_id: this.databaseId
          });
        },
        'Retrieve database for data source ID'
      );

      // Get the first data source (for legacy databases, there's only one)
      if (database.data_sources && database.data_sources.length > 0) {
        this.dataSourceId = database.data_sources[0].id;
        logger.info('Data source ID retrieved successfully', { 
          databaseId: this.databaseId,
          dataSourceId: this.dataSourceId 
        });
        return this.dataSourceId;
      }

      throw new Error('No data sources found in database');
    } catch (error) {
      logger.error('Failed to get data source ID', error as Error, { databaseId: this.databaseId });
      throw error;
    }
  }

  /**
   * Rate limiting: Wait if needed to avoid hitting 3 req/sec limit
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counter every second
    if (now - this.requestWindow >= 1000) {
      this.requestCount = 0;
      this.requestWindow = now;
    }
    
    // If we've made 3 requests in this second, wait
    if (this.requestCount >= 3) {
      const waitTime = 1000 - (now - this.requestWindow);
      if (waitTime > 0) {
        logger.debug('Rate limit: waiting', { waitTime: `${waitTime}ms` });
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.requestWindow = Date.now();
      }
    }
    
    // Also ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  /**
   * Execute Notion API request with retry logic and rate limiting
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Apply rate limiting before each request
        await this.rateLimit();
        
        logger.debug(`${operationName}: attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const result = await operation();
        
        if (attempt > 1) {
          logger.info(`${operationName}: succeeded after ${attempt} attempts`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        const isLastAttempt = attempt === this.MAX_RETRIES;
        
        // Handle specific error types
        if (error instanceof APIResponseError) {
          const status = error.status;
          const code = error.code;
          
          // Rate limit error (429)
          if (status === 429) {
            // Respect Retry-After header if present
            const retryAfter = (error as any).headers?.['retry-after'];
            const delay = retryAfter 
              ? parseInt(retryAfter) * 1000 
              : Math.min(this.BASE_DELAY * Math.pow(2, attempt), this.MAX_DELAY);
            
            logger.warn(`${operationName}: rate limited (429)`, {
              attempt,
              retryIn: `${delay}ms`,
              retryAfter
            });
            
            if (!isLastAttempt) {
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // Timeout or gateway errors (502, 503, 504)
          if (status === 502 || status === 503 || status === 504) {
            const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt), this.MAX_DELAY);
            
            logger.warn(`${operationName}: gateway error (${status})`, {
              attempt,
              retryIn: `${delay}ms`
            });
            
            if (!isLastAttempt) {
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // Validation errors (400) - don't retry
          if (status === 400) {
            logger.error(`${operationName}: validation error (400)`, error as Error, {
              errorCode: code,
              message: error.message
            });
            throw error;
          }
          
          // Unauthorized (401) - don't retry
          if (status === 401) {
            logger.error(`${operationName}: unauthorized (401) - check API key`);
            throw error;
          }
          
          // Not found (404) - don't retry
          if (status === 404) {
            logger.error(`${operationName}: not found (404) - check database ID`);
            throw error;
          }
        }
        
        // Network errors or timeouts
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
          const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt), this.MAX_DELAY);
          
          logger.warn(`${operationName}: network error (${error.code})`, {
            attempt,
            retryIn: `${delay}ms`
          });
          
          if (!isLastAttempt) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // Generic error - retry with exponential backoff
        if (!isLastAttempt) {
          const delay = Math.min(this.BASE_DELAY * Math.pow(2, attempt), this.MAX_DELAY);
          
          logger.warn(`${operationName}: failed, retrying...`, {
            attempt,
            retryIn: `${delay}ms`,
            error: error.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Last attempt failed
        logger.error(`${operationName}: failed after ${this.MAX_RETRIES} attempts`, error);
        throw error;
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new Error(`${operationName}: failed after all retries`);
  }

  /**
   * Truncate text to fit Notion's 2000 character limit
   */
  private truncateText(text: string, maxLength: number = 2000): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    logger.warn('Text truncated to fit Notion limit', {
      original: text.length,
      truncated: maxLength
    });
    
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Sync all tasks from Notion to MongoDB with robust error handling
   */
  async syncFromNotion(): Promise<{ synced: number; errors: number }> {
    if (!this.enabled) {
      logger.warn('Notion sync skipped - service disabled');
      return { synced: 0, errors: 0 };
    }

    try {
      logger.info('Starting Notion sync with robust error handling...');

      // Get data source ID first (required for API v2025-09-03)
      const dataSourceId = await this.getDataSourceId();

      // Query all tasks from Notion Data Source with retry logic
      const response: any = await this.executeWithRetry(
        async () => {
          // Verify notion client is available
          if (!this.notion) {
            throw new Error('Notion client is not initialized');
          }
          if (!this.notion.dataSources) {
            throw new Error('Notion dataSources API is not available');
          }
          
          return await this.notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: {
              property: 'Status',
              select: {
                equals: 'Aktif'
              }
            },
            // Pagination: get up to 100 results per page
            page_size: 100
          });
        },
        'Notion data source query'
      );

      let synced = 0;
      let errors = 0;
      const total = response.results.length;

      logger.info(`Found ${total} tasks in Notion, syncing to MongoDB...`);

      // Process tasks in batches to avoid overwhelming MongoDB
      const batchSize = 10;
      for (let i = 0; i < response.results.length; i += batchSize) {
        const batch = response.results.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (page: any) => {
            try {
              const task = this.parseNotionPage(page);
              
              // Update or create in MongoDB with retry
              await Task.findOneAndUpdate(
                { notion_id: task.id },
                {
                  judul: task.judul,
                  mata_pelajaran: task.mata_pelajaran,
                  deskripsi: task.deskripsi,
                  deadline: task.deadline,
                  tipe: task.tipe,
                  prioritas: task.prioritas,
                  status: task.status,
                  link_pengumpulan: task.link_pengumpulan,
                  catatan: task.catatan,
                  created_by: task.created_by,
                  notion_id: task.id,
                  updated_at: new Date()
                },
                { upsert: true, new: true }
              );

              synced++;
              
              if (synced % 10 === 0) {
                logger.info(`Sync progress: ${synced}/${total} tasks`);
              }
            } catch (error) {
              logger.error('Failed to sync individual task', error as Error, {
                pageId: page.id
              });
              errors++;
            }
          })
        );
      }

      logger.info('Notion sync completed successfully', { 
        synced, 
        errors, 
        total,
        successRate: `${((synced / total) * 100).toFixed(1)}%`
      });
      
      return { synced, errors };
    } catch (error) {
      logger.error('Notion sync failed completely', error as Error);
      throw error;
    }
  }

  /**
   * Parse Notion page to task object
   */
  private parseNotionPage(page: any): NotionTask {
    const properties = page.properties;

    // Extract title
    const judul = properties.Judul?.title?.[0]?.plain_text || 'Untitled';

    // Extract select fields
    const mata_pelajaran = properties['Mata Pelajaran']?.select?.name || 'Lainnya';
    const tipe = this.mapTipe(properties.Tipe?.select?.name);
    const prioritas = this.mapPrioritas(properties.Prioritas?.select?.name);
    const status = this.mapStatus(properties.Status?.select?.name);

    // Extract rich text (support multi-line by joining all segments)
    const deskripsi = properties.Deskripsi?.rich_text
      ?.map((rt: any) => rt.plain_text)
      .join('')
      .trim() || '';
    const catatan = properties.Catatan?.rich_text?.[0]?.plain_text;
    const created_by = properties['Created By']?.rich_text?.[0]?.plain_text || 'notion';

    // Extract date
    const { DateTimeHelper } = require('../utils/DateTimeHelper');
    const deadlineStr = properties.Deadline?.date?.start;
    const deadline = deadlineStr ? DateTimeHelper.parseDate(deadlineStr) : DateTimeHelper.now();

    // Extract URL
    const link_pengumpulan = properties['Link Pengumpulan']?.url;

    return {
      id: page.id,
      judul,
      mata_pelajaran,
      deskripsi,
      deadline,
      tipe,
      prioritas,
      status,
      link_pengumpulan,
      catatan,
      created_by
    };
  }

  /**
   * Map Notion tipe to internal format
   */
  private mapTipe(notionTipe?: string): 'individu' | 'kelompok' | 'ujian' {
    if (!notionTipe) return 'individu';
    
    const lower = notionTipe.toLowerCase();
    if (lower === 'kelompok') return 'kelompok';
    if (lower === 'ujian') return 'ujian';
    return 'individu';
  }

  /**
   * Map Notion prioritas to internal format
   */
  private mapPrioritas(notionPrioritas?: string): 'urgent' | 'penting' | 'normal' {
    if (!notionPrioritas) return 'normal';
    
    const lower = notionPrioritas.toLowerCase();
    if (lower === 'urgent') return 'urgent';
    if (lower === 'penting') return 'penting';
    return 'normal';
  }

  /**
   * Map Notion status to internal format
   */
  private mapStatus(notionStatus?: string): 'aktif' | 'selesai' {
    if (!notionStatus) return 'aktif';
    
    const lower = notionStatus.toLowerCase();
    if (lower === 'selesai') return 'selesai';
    return 'aktif';
  }

  /**
   * Add task to Notion database with robust error handling
   */
  async addTaskToNotion(task: {
    judul: string;
    mata_pelajaran: string;
    deskripsi: string;
    deadline: Date;
    tipe: 'individu' | 'kelompok' | 'ujian';
    prioritas?: 'urgent' | 'penting' | 'normal';
    link_pengumpulan?: string;
    catatan?: string;
    created_by: string;
  }): Promise<string | null> {
    if (!this.enabled) {
      logger.warn('Notion add task skipped - service disabled');
      return null;
    }

    try {
      logger.info('Adding task to Notion...', { judul: task.judul });

      // Truncate text fields to fit Notion limits
      const judul = this.truncateText(task.judul, 2000);
      const deskripsi = this.truncateText(task.deskripsi, 2000);
      const catatan = task.catatan ? this.truncateText(task.catatan, 2000) : undefined;
      const link_pengumpulan = task.link_pengumpulan ? this.truncateText(task.link_pengumpulan, 2000) : undefined;

      // Create page in Notion database with retry logic
      const response: any = await this.executeWithRetry(
        async () => {
          return await this.notion.pages.create({
            parent: {
              database_id: this.databaseId
            },
            properties: {
              'Judul': {
                title: [
                  {
                    text: {
                      content: judul
                    }
                  }
                ]
              },
              'Mata Pelajaran': {
                select: {
                  name: task.mata_pelajaran
                }
              },
              'Deskripsi': {
                rich_text: [
                  {
                    text: {
                      content: deskripsi
                    }
                  }
                ]
              },
              'Deadline': {
                date: {
                  start: task.deadline.toISOString().split('T')[0]
                }
              },
              'Tipe': {
                select: {
                  name: this.capitalizeFirst(task.tipe)
                }
              },
              'Prioritas': {
                select: {
                  name: this.capitalizeFirst(task.prioritas || 'normal')
                }
              },
              'Status': {
                select: {
                  name: 'Aktif'
                }
              },
              ...(link_pengumpulan && {
                'Link Pengumpulan': {
                  url: link_pengumpulan
                }
              }),
              ...(catatan && {
                'Catatan': {
                  rich_text: [
                    {
                      text: {
                        content: catatan
                      }
                    }
                  ]
                }
              }),
              'Created By': {
                rich_text: [
                  {
                    text: {
                      content: task.created_by
                    }
                  }
                ]
              }
            }
          });
        },
        'Add task to Notion'
      );

      logger.info('Task added to Notion successfully', { 
        notionId: response.id,
        judul: task.judul 
      });

      return response.id;
    } catch (error) {
      logger.error('Failed to add task to Notion after all retries', error as Error, {
        judul: task.judul
      });
      return null;
    }
  }

  /**
   * Update task in Notion database with robust error handling
   */
  async updateTaskInNotion(notionId: string, updates: {
    judul?: string;
    mata_pelajaran?: string;
    deskripsi?: string;
    deadline?: Date;
    tipe?: 'individu' | 'kelompok' | 'ujian';
    prioritas?: 'urgent' | 'penting' | 'normal';
    status?: 'aktif' | 'selesai';
    link_pengumpulan?: string;
    catatan?: string;
  }): Promise<boolean> {
    if (!this.enabled) {
      logger.warn('Notion update task skipped - service disabled');
      return false;
    }

    try {
      logger.info('Updating task in Notion...', { notionId });

      const properties: any = {};

      if (updates.judul) {
        properties['Judul'] = {
          title: [{ text: { content: this.truncateText(updates.judul, 2000) } }]
        };
      }

      if (updates.mata_pelajaran) {
        properties['Mata Pelajaran'] = {
          select: { name: updates.mata_pelajaran }
        };
      }

      if (updates.deskripsi) {
        properties['Deskripsi'] = {
          rich_text: [{ text: { content: this.truncateText(updates.deskripsi, 2000) } }]
        };
      }

      if (updates.deadline) {
        properties['Deadline'] = {
          date: { start: updates.deadline.toISOString().split('T')[0] }
        };
      }

      if (updates.tipe) {
        properties['Tipe'] = {
          select: { name: this.capitalizeFirst(updates.tipe) }
        };
      }

      if (updates.prioritas) {
        properties['Prioritas'] = {
          select: { name: this.capitalizeFirst(updates.prioritas) }
        };
      }

      if (updates.status) {
        properties['Status'] = {
          select: { name: this.capitalizeFirst(updates.status) }
        };
      }

      if (updates.link_pengumpulan !== undefined) {
        properties['Link Pengumpulan'] = {
          url: updates.link_pengumpulan ? this.truncateText(updates.link_pengumpulan, 2000) : null
        };
      }

      if (updates.catatan !== undefined) {
        properties['Catatan'] = {
          rich_text: updates.catatan ? [{ text: { content: this.truncateText(updates.catatan, 2000) } }] : []
        };
      }

      await this.executeWithRetry(
        async () => {
          return await this.notion.pages.update({
            page_id: notionId,
            properties
          });
        },
        'Update task in Notion'
      );

      logger.info('Task updated in Notion successfully', { notionId });
      return true;
    } catch (error) {
      logger.error('Failed to update task in Notion after all retries', error as Error, { notionId });
      return false;
    }
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get sync statistics with robust error handling
   */
  async getSyncStats(): Promise<{
    notionTasks: number;
    mongoTasks: number;
    lastSync?: Date;
  }> {
    if (!this.enabled) {
      return { notionTasks: 0, mongoTasks: 0 };
    }

    try {
      // Get data source ID first
      const dataSourceId = await this.getDataSourceId();

      // Count tasks in Notion Data Source with retry logic
      const notionResponse = await this.executeWithRetry(
        async () => {
          // Verify notion client is available
          if (!this.notion) {
            throw new Error('Notion client is not initialized');
          }
          if (!this.notion.dataSources) {
            throw new Error('Notion dataSources API is not available');
          }
          
          return await this.notion.dataSources.query({
            data_source_id: dataSourceId,
            filter: {
              property: 'Status',
              select: {
                equals: 'Aktif'
              }
            }
          });
        },
        'Get Notion stats'
      );

      // Count tasks in MongoDB
      const mongoCount = await Task.countDocuments({ status: 'aktif' });

      return {
        notionTasks: notionResponse.results.length,
        mongoTasks: mongoCount
      };
    } catch (error) {
      logger.error('Failed to get sync stats', error as Error);
      return { notionTasks: 0, mongoTasks: 0 };
    }
  }
}
