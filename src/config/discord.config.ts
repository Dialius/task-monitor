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
  activity: {
    enabled: process.env.DISCORD_ACTIVITY_ENABLED !== 'false',
    interval: parseInt(process.env.DISCORD_ACTIVITY_INTERVAL || '5'), // minutes
    type: (process.env.DISCORD_ACTIVITY_TYPE as any) || 'WATCHING',
    templates: [
      {
        text: '{total} tugas aktif',
        dynamic: true
      },
      {
        text: '{active} tugas menunggu',
        dynamic: true
      },
      {
        text: 'Deadline terdekat: {nearest}',
        dynamic: true
      },
      {
        text: 'Tugas kuliah kelas',
        dynamic: false
      }
    ]
  },

  // Rate Limiting Configuration
  rateLimits: {
    general: parseInt(process.env.DISCORD_RATE_LIMIT_GENERAL || '30'), // seconds
    command: parseInt(process.env.DISCORD_RATE_LIMIT_COMMAND || '7200') // seconds (2 hours)
  }
};

/**
 * Get Discord configuration
 */
export function getDiscordConfig(): DiscordConfig {
  return discordConfig;
}
