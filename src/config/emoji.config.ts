/**
 * Emoji Configuration
 * Custom animated emojis for bot status and UI
 */

export const EMOJI = {
  // Status Monitor Emojis
  SYSTEM: '<a:system:1472589040430612480>',        // System/Satellite icon
  INFO: '<a:info:1472589035947032608>',            // Info/Chart icon
  ONLINE: '<a:online:1472202442664972392>',        // Green circle/pulse
  SUCCESS: '<a:success:1472202445244469278>',      // Checkmark
  DATABASE: '<:database:1472589046554427392>',     // Database icon
  ERROR: '<a:error:1472202434591064157>',          // Error/X icon for disconnected status
  
  // Pagination Emojis (already in use)
  PREV: '1472405030584848599',
  NEXT: '1472405032594051104'
} as const;

export const EMBED_COLORS = {
  SUCCESS: 0x57F287,  // Green
  ERROR: 0xED4245,    // Red
  WARNING: 0xFEE75C,  // Yellow
  INFO: 0x5865F2,     // Blurple
  NEUTRAL: 0x99AAB5   // Gray
} as const;
