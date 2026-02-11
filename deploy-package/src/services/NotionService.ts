/**
 * Notion Service
 * Sync tasks from Notion database to MongoDB
 */

import { Client } from '@notionhq/client';
import Task from '../models/Task';
import { getLogger } from '../utils/Logger';

const logger = getLogger();

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
 * Notion Service for syncing tasks
 */
export class NotionService {
  private notion!: Client;
  private databaseId!: string;
  private enabled: boolean;

  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;

    this.enabled = !!(apiKey && databaseId);

    if (this.enabled) {
      this.notion = new Client({ auth: apiKey });
      this.databaseId = databaseId!;
      logger.info('Notion service initialized', { databaseId });
    } else {
      logger.warn('Notion service disabled - missing API key or database ID');
    }
  }

  /**
   * Check if Notion is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Helper method to add timeout to promises
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Sync all tasks from Notion to MongoDB with retry logic
   */
  async syncFromNotion(): Promise<{ synced: number; errors: number }> {
    if (!this.enabled) {
      logger.warn('Notion sync skipped - service disabled');
      return { synced: 0, errors: 0 };
    }

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info('Starting Notion sync...', { attempt, maxRetries });

        // Query all tasks from Notion Database with 10 second timeout
        // Type assertion needed as @notionhq/client v5.9.0 types are incomplete
        const response: any = await this.withTimeout(
          (this.notion.databases as any).query({
            database_id: this.databaseId,
            filter: {
              property: 'Status',
              select: {
                equals: 'Aktif'
              }
            }
          }),
          10000 // 10 second timeout
        );

        let synced = 0;
        let errors = 0;

        for (const page of response.results) {
          try {
            const task = this.parseNotionPage(page as any);
            
            // Update or create in MongoDB
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
          } catch (error) {
            logger.error('Failed to sync task from Notion', error as Error, {
              pageId: (page as any).id
            });
            errors++;
          }
        }

        logger.info('Notion sync completed', { synced, errors, total: response.results.length });
        return { synced, errors };
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        if (isLastAttempt) {
          logger.error('Failed to sync from Notion after all retries', error as Error, { attempts: maxRetries });
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt - 1);
        logger.warn('Notion sync failed, retrying...', { 
          attempt, 
          maxRetries, 
          retryIn: `${delay}ms`,
          error: (error as Error).message 
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // This should never be reached due to throw in last attempt
    return { synced: 0, errors: 0 };
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
    const deadlineStr = properties.Deadline?.date?.start;
    const deadline = deadlineStr ? new Date(deadlineStr) : new Date();

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
   * Add task to Notion database
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

      // Create page in Notion database
      const response: any = await this.notion.pages.create({
        parent: {
          database_id: this.databaseId
        },
        properties: {
          'Judul': {
            title: [
              {
                text: {
                  content: task.judul
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
                  content: task.deskripsi
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
          ...(task.link_pengumpulan && {
            'Link Pengumpulan': {
              url: task.link_pengumpulan
            }
          }),
          ...(task.catatan && {
            'Catatan': {
              rich_text: [
                {
                  text: {
                    content: task.catatan
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

      logger.info('Task added to Notion successfully', { 
        notionId: response.id,
        judul: task.judul 
      });

      return response.id;
    } catch (error) {
      logger.error('Failed to add task to Notion', error as Error, {
        judul: task.judul
      });
      return null;
    }
  }

  /**
   * Update task in Notion database
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
          title: [{ text: { content: updates.judul } }]
        };
      }

      if (updates.mata_pelajaran) {
        properties['Mata Pelajaran'] = {
          select: { name: updates.mata_pelajaran }
        };
      }

      if (updates.deskripsi) {
        properties['Deskripsi'] = {
          rich_text: [{ text: { content: updates.deskripsi } }]
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
          url: updates.link_pengumpulan || null
        };
      }

      if (updates.catatan !== undefined) {
        properties['Catatan'] = {
          rich_text: updates.catatan ? [{ text: { content: updates.catatan } }] : []
        };
      }

      await this.notion.pages.update({
        page_id: notionId,
        properties
      });

      logger.info('Task updated in Notion successfully', { notionId });
      return true;
    } catch (error) {
      logger.error('Failed to update task in Notion', error as Error, { notionId });
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
   * Get sync statistics
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
      // Count tasks in Notion Database
      // Type assertion needed as @notionhq/client v5.9.0 types are incomplete
      const notionResponse = await (this.notion.databases as any).query({
        database_id: this.databaseId,
        filter: {
          property: 'Status',
          select: {
            equals: 'Aktif'
          }
        }
      });

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
