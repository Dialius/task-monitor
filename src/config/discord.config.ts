/**
 * Discord Configuration File
 * Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 8.1
 * 
 * IMPORTANT: Replace all emoji IDs with your actual Discord emoji IDs
 * Format: <a:name:ID> for animated emojis
 * 
 * How to get emoji IDs:
 * 1. Go to Discord Developer Portal > Your App > Emojis
 * 2. Copy the emoji ID from the list
 * 3. Format: <a:emoji_name:emoji_id>
 */

import { DiscordConfig } from '../types/discord.types';

export const discordConfig: DiscordConfig = {
  // Channel Configuration
  // Get channel IDs by right-clicking channel in Discord (Developer Mode must be enabled)
  channels: {
    info: process.env.DISCORD_INFO_CHANNEL_ID || '', // Channel for Task Monitor embed
    command: process.env.DISCORD_COMMAND_CHANNEL_ID || '' // Channel for member commands
  },

  // Animated Emoji Configuration
  // Replace these with your actual emoji IDs from Discord Developer Portal
  emojis: {
    // Status emojis
    online: process.env.DISCORD_EMOJI_ONLINE || '<a:online:1472202442664972392>',
    offline: process.env.DISCORD_EMOJI_OFFLINE || '<a:offline:1472202439997526262>',
    
    // Time emoji
    clock: process.env.DISCORD_EMOJI_CLOCK || '<a:clock:1472202437338206282>',
    
    // Action emojis
    loading: process.env.DISCORD_EMOJI_LOADING || '<a:loading:1472202449728307312>',
    calendar: process.env.DISCORD_EMOJI_CALENDAR || '<a:calendar:1472202454606020904>',
    task: process.env.DISCORD_EMOJI_TASK || '<a:task:1472202447274508348>',
    
    // Type emojis
    individual: process.env.DISCORD_EMOJI_INDIVIDUAL || '<a:individu:1472202431151607951>',
    group: process.env.DISCORD_EMOJI_GROUP || '<a:group:1472202456690720880>',
    
    // Result emojis
    success: process.env.DISCORD_EMOJI_SUCCESS || '<a:success:1472202445244469278>',
    error: process.env.DISCORD_EMOJI_ERROR || '<a:error:1472202434591064157>'
  },

  // Embed Styling Configuration
  embed: {
    color: process.env.DISCORD_EMBED_COLOR || '#5865F2', // Discord Blurple color
    footer: {
      icon: process.env.DISCORD_FOOTER_ICON || 'https://i.imgur.com/AfFp7pu.png', // Replace with your icon URL
      text: 'Made By VinTheGreat' // Will be appended with • {server_name}
    }
  },

  // Activity Status Configuration
  // ================================
  // enabled: true/false - Enable/disable activity rotation
  // interval: How many minutes between activity changes (default: 5 minutes)
  // type: Default activity type (can be overridden per template)
  //   - WATCHING: "👀 Watching ..."
  //   - PLAYING: "🎮 Playing ..."
  //   - LISTENING: "🎧 Listening to ..."
  //   - COMPETING: "🏆 Competing in ..."
  // templates: Array of activity templates to rotate through
  //   - text: Text to display (can use variables)
  //   - dynamic: true = fetch data from database, false = static text
  //   - type: (optional) Override activity type for this template
  //
  // Template Variables (Dynamic Data):
  // ================================
  //   {total}    = Total active tasks (example: "5")
  //   {active}   = Same as {total}, total active tasks (example: "5")
  //   {nearest}  = Nearest deadline date (example: "16 Feb")
  //   {today}    = Tasks due today (example: "3")
  //   {percent}  = Completion rate percentage (example: "75")
  //   {urgent}   = Urgent tasks with < 24 hours left (example: "2")
  //   {hours}    = Hours until nearest deadline (example: "5")
  //
  // Activity Types:
  // ================================
  //   'PLAYING'    = 🎮 Playing ...
  //   'WATCHING'   = 👀 Watching ...
  //   'LISTENING'  = 🎧 Listening to ...
  //   'COMPETING'  = 🏆 Competing in ...
  //
  // HOW TO CONFIGURE:
  // ================================
  // 1. Enable/Disable: Change DISCORD_ACTIVITY_ENABLED in .env (true/false)
  // 2. Change Delay: Change DISCORD_ACTIVITY_INTERVAL in .env (in minutes)
  // 3. Change Default Type: Change DISCORD_ACTIVITY_TYPE in .env (WATCHING/PLAYING/LISTENING/COMPETING)
  // 4. Add/Edit Templates: Edit templates array below
  //
  // Template Examples:
  // ================================
  //   Static text:
  //     { text: 'Task Manager 2026', dynamic: false, type: 'PLAYING' }
  //   
  //   With single variable:
  //     { text: '{total} tasks', dynamic: true, type: 'WATCHING' }
  //   
  //   With multiple variables:
  //     { text: '{urgent} urgent | {hours}h left', dynamic: true, type: 'COMPETING' }
  //   
  //   Without type (uses default):
  //     { text: 'productivity mode', dynamic: false }
  activity: {
    enabled: process.env.DISCORD_ACTIVITY_ENABLED !== 'false', // Default: true (active)
    interval: parseInt(process.env.DISCORD_ACTIVITY_INTERVAL || '5'), // Default: 5 minutes
    type: (process.env.DISCORD_ACTIVITY_TYPE as any) || 'WATCHING', // Default type
    templates: [
      // ========================================
      // 🎮 PLAYING Templates
      // ========================================
      {
        text: 'dengan {total} tugas numpuk',
        dynamic: true,
        type: 'PLAYING'
      },
      {
        text: 'kejar deadline sekolah',
        dynamic: false,
        type: 'PLAYING'
      },
      {
        text: '{today} tugas harus dikumpul hari ini',
        dynamic: true,
        type: 'PLAYING'
      },
      {
        text: 'Homework Manager 2026',
        dynamic: false,
        type: 'PLAYING'
      },
      {
        text: 'mode SKS sejati',
        dynamic: false,
        type: 'PLAYING'
      },

      // ========================================
      // 👀 WATCHING Templates
      // ========================================
      {
        text: '{active} tugas belum dikerjain',
        dynamic: true,
        type: 'WATCHING'
      },
      {
        text: 'deadline terdekat: {nearest}',
        dynamic: true,
        type: 'WATCHING'
      },
      {
        text: 'jadwal pelajaran hari ini',
        dynamic: false,
        type: 'WATCHING'
      },
      {
        text: 'progress belajar: {percent}%',
        dynamic: true,
        type: 'WATCHING'
      },
      {
        text: 'nasib {urgent} tugas yang terlupakan',
        dynamic: true,
        type: 'WATCHING'
      },
      {
        text: 'drama pengumpulan tugas last minute',
        dynamic: false,
        type: 'WATCHING'
      },

      // ========================================
      // 🎧 LISTENING Templates
      // ========================================
      {
        text: 'alarm deadline {hours} jam lagi',
        dynamic: true,
        type: 'LISTENING'
      },
      {
        text: 'notif tugas masuk terus',
        dynamic: false,
        type: 'LISTENING'
      },
      {
        text: '{active} reminder belum dibalas guru',
        dynamic: true,
        type: 'LISTENING'
      },
      {
        text: 'lo-fi sambil belajar',
        dynamic: false,
        type: 'LISTENING'
      },
      {
        text: 'curhatan murid soal PR senin',
        dynamic: false,
        type: 'LISTENING'
      },

      // ========================================
      // 🏆 COMPETING Templates
      // ========================================
      {
        text: '{hours} jam lagi — masih bisa dikebut',
        dynamic: true,
        type: 'COMPETING'
      },
      {
        text: 'kebut {today} tugas dalam sehari',
        dynamic: true,
        type: 'COMPETING'
      },
      {
        text: 'capai {percent}% sebelum {nearest}',
        dynamic: true,
        type: 'COMPETING'
      },
      {
        text: 'siapa cepat dia lulus',
        dynamic: false,
        type: 'COMPETING'
      },
      {
        text: 'sprint ujian akhir semester',
        dynamic: false,
        type: 'COMPETING'
      },
      {
        text: '{total} tugas, 1 malam, bismillah',
        dynamic: true,
        type: 'COMPETING'
      }
    ]
  },

  // Rate Limiting Configuration
  // NOTE: Rate limits only apply to non-admin users. Admins bypass all rate limits.
  rateLimits: {
    general: parseInt(process.env.DISCORD_RATE_LIMIT_GENERAL || '30'), // seconds (for non-admin)
    command: parseInt(process.env.DISCORD_RATE_LIMIT_COMMAND || '7200') // seconds (2 hours, for non-admin)
  }
};

/**
 * Get Discord configuration
 */
export function getDiscordConfig(): DiscordConfig {
  return discordConfig;
}
