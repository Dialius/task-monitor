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

  // ============================================
  // Activity Status Configuration
  // ============================================
  // Default Activity Templates Configuration
  // Define rotating activity status messages for Discord bot
  //
  // Activity Types (use numbers):
  // ================================
  //   0 = Playing   (🎮 Playing ...)
  //   1 = Streaming (🎥 Streaming ...)
  //   2 = Listening (🎧 Listening to ...)
  //   3 = Watching  (👀 Watching ...)
  //   5 = Competing (🏆 Competing in ...)
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
  // Configuration:
  // ================================
  //   enabled: true/false - Enable/disable activity rotation
  //   interval: Minutes between activity changes (default: 5)
  //   type: Default activity type number (0-5, can be overridden per template)
  //   templates: Array of activity templates to rotate through
  //     - text: Text to display (can use variables)
  //     - dynamic: true = fetch data from database, false = static text
  //     - type: (optional) Override activity type for this template (use number)
  //
  // HOW TO CONFIGURE:
  // ================================
  // 1. Enable/Disable: Change DISCORD_ACTIVITY_ENABLED in .env (true/false)
  // 2. Change Interval: Change DISCORD_ACTIVITY_INTERVAL in .env (in minutes)
  // 3. Change Default Type: Change DISCORD_ACTIVITY_TYPE in .env (0, 2, 3, or 5)
  // 4. Add/Edit Templates: Edit templates array below
  //
  // Template Examples:
  // ================================
  //   Static text:
  //     { text: 'Task Manager 2026', dynamic: false, type: 0 }
  //   
  //   With single variable:
  //     { text: '{total} tasks', dynamic: true, type: 3 }
  //   
  //   With multiple variables:
  //     { text: '{urgent} urgent | {hours}h left', dynamic: true, type: 5 }
  //   
  //   Without type (uses default):
  //     { text: 'productivity mode', dynamic: false }
  activity: {
    enabled: process.env.DISCORD_ACTIVITY_ENABLED !== 'false',
    interval: parseInt(process.env.DISCORD_ACTIVITY_INTERVAL || '5'),
    type: parseInt(process.env.DISCORD_ACTIVITY_TYPE || '3') as number,
    templates: [
      {
        text: '/help untuk daftar perintah',
        dynamic: false,
        type: 2 as 2 // Listening
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
