# Design Document: Multi-Platform Class Reminder Bot

## Overview

The Multi-Platform Class Reminder Bot is a unified messaging bot system that operates simultaneously on Discord and WhatsApp platforms. The architecture follows a layered approach with platform-specific adapters at the edges and shared business logic in the core.

**Key Design Principles:**
- Platform abstraction: Business logic is completely independent of messaging platforms
- Single source of truth: MongoDB database shared across all platforms
- Unified command interface: Same commands work identically on both platforms
- Graceful degradation: One platform's failure doesn't affect the other
- Extensibility: New platforms can be added by implementing the adapter interface

**Technology Stack:**
- **Discord**: discord.js library for Discord API integration
- **WhatsApp**: Baileys library for WhatsApp Web API integration
- **Database**: MongoDB for persistent storage
- **AI**: Groq or Gemini API for natural language processing
- **Sync**: Notion API for external synchronization
- **Runtime**: Node.js with TypeScript for type safety

## Architecture

The system follows a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Platform Layer                          │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Discord Adapter  │         │ WhatsApp Adapter │         │
│  │  (discord.js)    │         │   (Baileys)      │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    Service Layer                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐        │
│  │ TaskService │  │ScheduleService│  │ PiketService│        │
│  └─────────────┘  └──────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐        │
│  │ UserService │  │AnnouncementSvc│  │CommandParser│        │
│  └─────────────┘  └──────────────┘  └─────────────┘        │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐        │
│  │   MongoDB    │  │  AI Service  │  │ Notion Sync │        │
│  │   Database   │  │ (Groq/Gemini)│  │             │        │
│  └──────────────┘  └──────────────┘  └─────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

**Layer Responsibilities:**

1. **Platform Layer**: Handles platform-specific communication
   - Receives messages from Discord/WhatsApp
   - Translates to unified message format
   - Sends responses back through appropriate platform
   - Manages platform-specific authentication and connection

2. **Service Layer**: Implements business logic
   - Processes commands independent of platform
   - Enforces role-based access control
   - Coordinates between different services
   - Manages application state and workflows

3. **Data Layer**: Handles persistence and external integrations
   - MongoDB for primary data storage
   - AI service for natural language processing
   - Notion API for external synchronization

## Components and Interfaces

### Platform Adapter Interface

All platform adapters must implement this interface:

```typescript
interface PlatformAdapter {
  // Initialize the platform client
  initialize(): Promise<void>;
  
  // Send a message to a user or channel
  sendMessage(target: MessageTarget, content: MessageContent): Promise<void>;
  
  // Register command handlers
  onCommand(handler: CommandHandler): void;
  
  // Get platform-specific user identifier
  getUserId(platformUser: any): string;
  
  // Shutdown the platform client
  shutdown(): Promise<void>;
}

interface MessageTarget {
  type: 'user' | 'channel' | 'group';
  id: string;
  platform: 'discord' | 'whatsapp';
}

interface MessageContent {
  text?: string;
  embeds?: Embed[];
  attachments?: Attachment[];
  formatting?: FormattingOptions;
}

interface CommandHandler {
  (command: UnifiedCommand): Promise<CommandResponse>;
}

interface UnifiedCommand {
  command: string;
  args: string[];
  userId: string;
  platform: 'discord' | 'whatsapp';
  channelId: string;
  timestamp: Date;
}

interface CommandResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

### Discord Adapter Implementation

```typescript
class DiscordAdapter implements PlatformAdapter {
  private client: Discord.Client;
  private commandHandler?: CommandHandler;
  
  async initialize(): Promise<void> {
    // Initialize discord.js client
    // Set up event listeners for messages
    // Handle Discord-specific authentication
  }
  
  async sendMessage(target: MessageTarget, content: MessageContent): Promise<void> {
    // Convert MessageContent to Discord message format
    // Handle Discord embeds and attachments
    // Send through Discord API
  }
  
  onCommand(handler: CommandHandler): void {
    // Register handler for processing commands
    // Parse Discord messages into UnifiedCommand format
  }
  
  getUserId(platformUser: Discord.User): string {
    return platformUser.id;
  }
  
  async shutdown(): Promise<void> {
    await this.client.destroy();
  }
}
```

### WhatsApp Adapter Implementation

```typescript
class WhatsAppAdapter implements PlatformAdapter {
  private client: WASocket; // Baileys client
  private commandHandler?: CommandHandler;
  
  async initialize(): Promise<void> {
    // Initialize Baileys client
    // Handle WhatsApp authentication (QR code or session)
    // Set up message listeners
  }
  
  async sendMessage(target: MessageTarget, content: MessageContent): Promise<void> {
    // Convert MessageContent to WhatsApp message format
    // Handle WhatsApp-specific formatting
    // Send through Baileys API
  }
  
  onCommand(handler: CommandHandler): void {
    // Register handler for processing commands
    // Parse WhatsApp messages into UnifiedCommand format
  }
  
  getUserId(platformUser: any): string {
    // Extract phone number from WhatsApp user
    return platformUser.id.split('@')[0];
  }
  
  async shutdown(): Promise<void> {
    await this.client.end();
  }
}
```

### Service Layer Components

#### TaskService

```typescript
class TaskService {
  constructor(private db: Database) {}
  
  async createTask(task: TaskInput, creatorId: string): Promise<Task> {
    // Validate creator has permission (Ketua or Wakil role)
    // Create task document in database
    // Return created task
  }
  
  async listTasks(filters?: TaskFilters): Promise<Task[]> {
    // Query tasks from database
    // Sort by deadline
    // Return filtered and sorted tasks
  }
  
  async completeTask(taskId: string, userId: string): Promise<Task> {
    // Mark task as complete
    // Record completion time and user
    // Update database
  }
  
  async deleteTask(taskId: string, deleterId: string): Promise<void> {
    // Validate deleter has permission
    // Remove task from database
  }
}

interface TaskInput {
  title: string;
  description: string;
  deadline: Date;
  subject?: string;
}

interface Task extends TaskInput {
  id: string;
  creatorId: string;
  createdAt: Date;
  completedBy?: string[];
  completedAt?: Date;
  status: 'active' | 'completed';
}
```

#### ScheduleService

```typescript
class ScheduleService {
  constructor(private db: Database) {}
  
  async createSchedule(schedule: ScheduleInput, creatorId: string): Promise<Schedule> {
    // Validate creator has Koordinator role or higher
    // Create schedule entry in database
    // Return created schedule
  }
  
  async getScheduleForDay(date: Date): Promise<Schedule[]> {
    // Query schedules for specific day
    // Sort by time
    // Return schedules
  }
  
  async getWeeklySchedule(startDate: Date): Promise<Map<string, Schedule[]>> {
    // Query schedules for week starting from startDate
    // Group by day
    // Return map of day -> schedules
  }
  
  async updateSchedule(scheduleId: string, updates: Partial<ScheduleInput>): Promise<Schedule> {
    // Update schedule in database
    // Return updated schedule
  }
}

interface ScheduleInput {
  day: string; // 'Monday', 'Tuesday', etc.
  time: string; // '08:00'
  subject: string;
  location: string;
  instructor: string;
}

interface Schedule extends ScheduleInput {
  id: string;
  createdBy: string;
  createdAt: Date;
}
```

#### PiketService

```typescript
class PiketService {
  constructor(private db: Database) {}
  
  async createPiketAssignment(assignment: PiketInput, creatorId: string): Promise<Piket> {
    // Validate creator has Koordinator role or higher
    // Validate assigned members exist
    // Create piket assignment in database
    // Return created assignment
  }
  
  async getPiketForDate(date: Date): Promise<Piket | null> {
    // Query piket assignment for specific date
    // Return assignment or null
  }
  
  async getUpcomingPiket(days: number): Promise<Piket[]> {
    // Query piket assignments for next N days
    // Sort by date
    // Return assignments
  }
}

interface PiketInput {
  date: Date;
  assignedMembers: string[]; // User IDs
}

interface Piket extends PiketInput {
  id: string;
  createdBy: string;
  createdAt: Date;
}
```

#### UserService

```typescript
class UserService {
  constructor(private db: Database) {}
  
  async registerUser(userData: UserRegistration): Promise<User> {
    // Create user document in database
    // Set default role to 'Member'
    // Return created user
  }
  
  async getUserByPlatformId(platform: 'discord' | 'whatsapp', platformId: string): Promise<User | null> {
    // Query user by discord_id or whatsapp_number
    // Return user or null
  }
  
  async linkPlatform(userId: string, platform: 'discord' | 'whatsapp', platformId: string): Promise<User> {
    // Update user document with additional platform ID
    // Return updated user
  }
  
  async updateUserRole(userId: string, role: Role): Promise<User> {
    // Update user role
    // Return updated user
  }
  
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    // Get user from database
    // Check if user's role has required permission
    // Return boolean
  }
}

interface UserRegistration {
  name: string;
  studentId: string;
  platform: 'discord' | 'whatsapp';
  platformId: string;
}

interface User {
  id: string;
  name: string;
  studentId: string;
  discord_id?: string;
  whatsapp_number?: string;
  role: Role;
  createdAt: Date;
}

type Role = 'Ketua' | 'Wakil' | 'Koordinator' | 'Member';
type Permission = 'create_task' | 'delete_task' | 'create_schedule' | 'create_piket' | 'create_announcement';
```

#### AnnouncementService

```typescript
class AnnouncementService {
  constructor(
    private db: Database,
    private adapters: Map<string, PlatformAdapter>
  ) {}
  
  async createAnnouncement(announcement: AnnouncementInput, creatorId: string): Promise<void> {
    // Validate creator has Ketua or Wakil role
    // Store announcement in database
    // Send to all configured platforms
    // Log delivery status
  }
  
  async sendToPlatforms(content: MessageContent): Promise<void> {
    // Iterate through all active platform adapters
    // Send message through each adapter
    // Handle platform-specific failures gracefully
  }
}

interface AnnouncementInput {
  title: string;
  content: string;
  attachments?: Attachment[];
}
```

#### CommandParser

```typescript
class CommandParser {
  private commands: Map<string, CommandDefinition>;
  
  constructor(private services: ServiceContainer) {
    this.registerCommands();
  }
  
  async parseAndExecute(cmd: UnifiedCommand): Promise<CommandResponse> {
    // Extract command name and arguments
    // Look up command definition
    // Validate user permissions
    // Execute command with appropriate service
    // Return response
  }
  
  private registerCommands(): void {
    // Register all available commands
    // Map command names to service methods
    // Define required permissions for each command
  }
}

interface CommandDefinition {
  name: string;
  aliases: string[];
  description: string;
  requiredPermission?: Permission;
  execute: (args: string[], userId: string) => Promise<CommandResponse>;
}
```

### Reminder System

```typescript
class ReminderService {
  constructor(
    private db: Database,
    private adapters: Map<string, PlatformAdapter>
  ) {}
  
  async startReminderLoop(): Promise<void> {
    // Run every 15 minutes
    setInterval(() => this.checkReminders(), 15 * 60 * 1000);
  }
  
  private async checkReminders(): Promise<void> {
    await Promise.all([
      this.checkTaskReminders(),
      this.checkScheduleReminders(),
      this.checkPiketReminders()
    ]);
  }
  
  private async checkTaskReminders(): Promise<void> {
    // Query tasks with deadline within 24 hours
    // Send reminders through all platforms
  }
  
  private async checkScheduleReminders(): Promise<void> {
    // Query schedules starting within 30 minutes
    // Send reminders through all platforms
  }
  
  private async checkPiketReminders(): Promise<void> {
    // Check if current time is 6:00 AM
    // Query today's piket assignment
    // Send reminder through all platforms
  }
}
```

### AI Integration

```typescript
interface AIService {
  generateResponse(prompt: string, context: ConversationContext): Promise<string>;
}

class GroqAIService implements AIService {
  constructor(private apiKey: string) {}
  
  async generateResponse(prompt: string, context: ConversationContext): Promise<string> {
    // Call Groq API with prompt and context
    // Return generated response
  }
}

class GeminiAIService implements AIService {
  constructor(private apiKey: string) {}
  
  async generateResponse(prompt: string, context: ConversationContext): Promise<string> {
    // Call Gemini API with prompt and context
    // Return generated response
  }
}

interface ConversationContext {
  userId: string;
  userRole: Role;
  recentMessages: string[];
  currentCommand?: string;
}
```

### Notion Synchronization

```typescript
class NotionSyncService {
  constructor(
    private notionClient: Client,
    private db: Database,
    private config: NotionConfig
  ) {}
  
  async startSyncLoop(): Promise<void> {
    // Run every 5 minutes
    setInterval(() => this.syncData(), 5 * 60 * 1000);
  }
  
  private async syncData(): Promise<void> {
    await Promise.all([
      this.syncTasks(),
      this.syncSchedules()
    ]);
  }
  
  private async syncTasks(): Promise<void> {
    // Query tasks modified since last sync
    // Create or update corresponding Notion pages
    // Update sync timestamp
  }
  
  private async syncSchedules(): Promise<void> {
    // Query schedules modified since last sync
    // Update Notion calendar database
    // Update sync timestamp
  }
}

interface NotionConfig {
  apiKey: string;
  taskDatabaseId: string;
  scheduleDatabaseId: string;
}
```

## Data Models

### MongoDB Collections

#### Users Collection

```typescript
{
  _id: ObjectId,
  name: string,
  studentId: string,
  discord_id?: string,
  whatsapp_number?: string,
  role: 'Ketua' | 'Wakil' | 'Koordinator' | 'Member',
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ discord_id: 1 }, { unique: true, sparse: true });
db.users.createIndex({ whatsapp_number: 1 }, { unique: true, sparse: true });
db.users.createIndex({ studentId: 1 }, { unique: true });
```

#### Tasks Collection

```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  deadline: Date,
  subject?: string,
  creatorId: ObjectId, // Reference to users collection
  createdAt: Date,
  status: 'active' | 'completed',
  completedBy: ObjectId[], // Array of user IDs
  completedAt?: Date,
  updatedAt: Date
}

// Indexes
db.tasks.createIndex({ deadline: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ creatorId: 1 });
```

#### Schedules Collection

```typescript
{
  _id: ObjectId,
  day: string, // 'Monday', 'Tuesday', etc.
  time: string, // '08:00'
  subject: string,
  location: string,
  instructor: string,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.schedules.createIndex({ day: 1, time: 1 });
```

#### Piket Collection

```typescript
{
  _id: ObjectId,
  date: Date,
  assignedMembers: ObjectId[], // Array of user IDs
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.piket.createIndex({ date: 1 }, { unique: true });
```

#### Announcements Collection

```typescript
{
  _id: ObjectId,
  title: string,
  content: string,
  attachments: [{
    type: string,
    url: string,
    filename: string
  }],
  createdBy: ObjectId,
  createdAt: Date,
  deliveryStatus: {
    discord: 'sent' | 'failed' | 'pending',
    whatsapp: 'sent' | 'failed' | 'pending'
  }
}

// Indexes
db.announcements.createIndex({ createdAt: -1 });
```

