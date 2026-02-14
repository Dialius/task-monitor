/**
 * Fix Database ID format
 * Convert from: 3030a8e24bf6807bb826d8667d0764b0
 * To: 3030a8e2-4bf6-807b-b826-d8667d0764b0
 */

const dbId = '3030a8e24bf6807bb826d8667d0764b0';

function formatDatabaseId(id) {
  // Remove any existing dashes
  const clean = id.replace(/-/g, '');
  
  // Add dashes in UUID format: 8-4-4-4-12
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

const formatted = formatDatabaseId(dbId);

console.log('Original:', dbId);
console.log('Formatted:', formatted);
console.log('\nUpdate your .env file:');
console.log(`NOTION_DATABASE_ID=${formatted}`);
