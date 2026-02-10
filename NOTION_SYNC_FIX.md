# Notion Sync Fix - Detailed Solution

## Problem
The bot was failing to fetch data from Notion with the error:
```
databases.query is not a function
```

## Root Cause
The code was incorrectly trying to extract the `databases` property from the Notion client before calling `query()`:

```typescript
// ❌ INCORRECT - This doesn't work
const databases: any = this.notion.databases;
const response = await databases.query({...});
```

The issue was that `databases` is a property object on the Notion client, not a standalone object with methods.

## Solution Applied

### 1. Fixed API Call Syntax
Changed to call `query()` directly on `this.notion.databases`:

```typescript
// ✅ CORRECT
const response: any = await (this.notion.databases as any).query({
  database_id: this.databaseId,
  filter: {
    property: 'Status',
    select: {
      equals: 'Aktif'
    }
  }
});
```

**Note:** Type assertion `as any` is needed because `@notionhq/client` v5.9.0 has incomplete TypeScript definitions that don't include the `query` method, even though it exists in the runtime API.

### 2. Added Retry Logic with Exponential Backoff
To handle transient network errors:

- **Max retries:** 3 attempts
- **Backoff delays:** 1s, 2s, 4s (exponential)
- **Detailed logging:** Tracks attempt number and retry timing

```typescript
const maxRetries = 3;
const baseDelay = 1000; // 1 second

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // ... sync logic
    return { synced, errors };
  } catch (error) {
    if (attempt === maxRetries) throw error;
    
    const delay = baseDelay * Math.pow(2, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

### 3. Added Timeout Protection
Prevents the sync from hanging indefinitely:

```typescript
private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Usage with 10 second timeout
const response = await this.withTimeout(
  (this.notion.databases as any).query({...}),
  10000
);
```

## Files Modified
- `src/services/NotionService.ts`
  - Fixed `syncFromNotion()` method (line ~69)
  - Fixed `getSyncStats()` method (line ~425)
  - Added `withTimeout()` helper method
  - Added retry logic with exponential backoff

## Testing
To test the fix:

```bash
# Build the project
npm run build

# Test Notion connection
npm run test:notion

# Or restart the bot and try the command
/tugas_hari_ini
```

## Why This Happened
The Notion SDK's TypeScript definitions are incomplete in version 5.9.0. The `query` method exists at runtime but isn't properly typed, which led to confusion about the correct API usage.

## Prevention
- Always refer to official Notion API documentation when in doubt
- Use type assertions (`as any`) when TypeScript types are incomplete
- Add comprehensive error handling and retry logic for external API calls
- Implement timeouts to prevent hanging operations

## Related Documentation
- [Notion API - Query a Database](https://developers.notion.com/reference/post-database-query)
- [@notionhq/client npm package](https://www.npmjs.com/package/@notionhq/client)
