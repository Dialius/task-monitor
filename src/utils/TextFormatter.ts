/**
 * Text Formatter Utility
 * Convert text to Unicode bold, italic, and other styles
 */

/**
 * Unicode Mathematical Bold Characters
 * These characters appear bolder than WhatsApp's native bold
 */
const BOLD_MAP: Record<string, string> = {
  // Uppercase A-Z
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛',
  'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣',
  'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫',
  'Y': '𝗬', 'Z': '𝗭',
  
  // Lowercase a-z
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
  'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽',
  'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅',
  'y': '𝘆', 'z': '𝘇',
  
  // Numbers 0-9
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
  '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

/**
 * Convert text to Unicode bold
 * Example: "Hello" → "𝗛𝗲𝗹𝗹𝗼"
 */
export function toBold(text: string): string {
  return text.split('').map(char => BOLD_MAP[char] || char).join('');
}

/**
 * Convert text to WhatsApp italic (using underscore)
 * Example: "Hello" → "_Hello_"
 */
export function toItalic(text: string): string {
  return `_${text}_`;
}

/**
 * Convert text to WhatsApp bold (using asterisk)
 * Example: "Hello" → "*Hello*"
 */
export function toWhatsAppBold(text: string): string {
  return `*${text}*`;
}

/**
 * Convert text to WhatsApp strikethrough (using tilde)
 * Example: "Hello" → "~Hello~"
 */
export function toStrikethrough(text: string): string {
  return `~${text}~`;
}

/**
 * Convert text to WhatsApp monospace (using backticks)
 * Example: "Hello" → "```Hello```"
 */
export function toMonospace(text: string): string {
  return `\`\`\`${text}\`\`\``;
}

/**
 * Combine Unicode bold with WhatsApp italic
 * Example: "Hello" → "_𝗛𝗲𝗹𝗹𝗼_"
 */
export function toBoldItalic(text: string): string {
  return toItalic(toBold(text));
}

/**
 * Format header with Unicode bold
 * Example: "INFO TUGAS" → "🌟 𝗜𝗡𝗙𝗢 𝗧𝗨𝗚𝗔𝗦"
 */
export function formatHeader(text: string, emoji?: string): string {
  const boldText = toBold(text);
  return emoji ? `${emoji} ${boldText}` : boldText;
}

/**
 * Format section title with Unicode bold
 * Example: "DAFTAR TUGAS" → "🗓 𝗗𝗔𝗙𝗧𝗔𝗥 𝗧𝗨𝗚𝗔𝗦"
 */
export function formatSectionTitle(text: string, emoji?: string): string {
  return formatHeader(text, emoji);
}

/**
 * Format subject name with Unicode bold
 * Example: "B. Inggris" → "🌍 𝗕. 𝗜𝗻𝗴𝗴𝗿𝗶𝘀"
 */
export function formatSubject(text: string, emoji?: string): string {
  const boldText = toBold(text);
  return emoji ? `${emoji} ${boldText}` : boldText;
}

/**
 * Format label with Unicode bold
 * Example: "Tugas:" → "📌 𝗧𝘂𝗴𝗮𝘀:"
 */
export function formatLabel(text: string, emoji?: string): string {
  const boldText = toBold(text);
  return emoji ? `${emoji} ${boldText}` : boldText;
}
