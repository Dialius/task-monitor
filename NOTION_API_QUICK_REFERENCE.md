# Notion API Quick Reference

## Common Patterns

### ✅ Correct Usage

```typescript
// Query database
const response = await (this.notion.databases as any).query({
  database_id: databaseId,
  filter: { /* filters */ }
});

// Create page
const page = await this.notion.pages.create({
  parent: { database_id: databaseId },
  properties: { /* properties */ }
});

// Update page
await this.notion.pages.update({
  page_id: pageId,
  properties: { /* properties */ }
});

// Retrieve database
const db = await this.notion.databases.retrieve({
  database_id: databaseId
});
```

### ❌ Incorrect Usage (Will Fail)

```typescript
// DON'T extract databases first
const databases: any = this.notion.databases;
const response = await databases.query({...}); // ❌ Error: query is not a function
```

## Type Assertions

The `@notionhq/client` v5.9.0 has incomplete TypeScript definitions. You need type assertions for:

- `databases.query()` - Use `(this.notion.databases as any).query()`
- Response objects - Use `const response: any = await ...`

Methods that work without assertions:
- `pages.create()`
- `pages.update()`
- `databases.retrieve()`

## Error Handling Best Practices

### 1. Always Use Try-Catch
```typescript
try {
  const response = await (this.notion.databases as any).query({...});
  // Process response
} catch (error) {
  logger.error('Notion API error', error);
  // Handle error appropriately
}
```

### 2. Implement Retry Logic
```typescript
const maxRetries = 3;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    return await notionApiCall();
  } catch (error) {
    if (attempt === maxRetries) throw error;
    await sleep(1000 * Math.pow(2, attempt - 1));
  }
}
```

### 3. Add Timeouts
```typescript
const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), ms)
  )
]);

const response = await withTimeout(
  (this.notion.databases as any).query({...}),
  10000 // 10 seconds
);
```

## Common Filters

### Filter by Status
```typescript
filter: {
  property: 'Status',
  select: {
    equals: 'Aktif'
  }
}
```

### Filter by Date Range
```typescript
filter: {
  property: 'Deadline',
  date: {
    on_or_after: '2026-02-10'
  }
}
```

### Multiple Filters (AND)
```typescript
filter: {
  and: [
    { property: 'Status', select: { equals: 'Aktif' } },
    { property: 'Prioritas', select: { equals: 'Urgent' } }
  ]
}
```

### Multiple Filters (OR)
```typescript
filter: {
  or: [
    { property: 'Tipe', select: { equals: 'Individu' } },
    { property: 'Tipe', select: { equals: 'Kelompok' } }
  ]
}
```

## Property Types

### Title
```typescript
'Judul': {
  title: [
    { text: { content: 'Task Title' } }
  ]
}
```

### Rich Text
```typescript
'Deskripsi': {
  rich_text: [
    { text: { content: 'Description text' } }
  ]
}
```

### Select
```typescript
'Status': {
  select: { name: 'Aktif' }
}
```

### Date
```typescript
'Deadline': {
  date: { start: '2026-02-10' }
}
```

### URL
```typescript
'Link Pengumpulan': {
  url: 'https://example.com'
}
```

## Troubleshooting

### Error: "databases.query is not a function"
**Solution:** Use `(this.notion.databases as any).query()` instead of extracting databases first.

### Error: "object_not_found"
**Causes:**
- Database ID is incorrect
- Integration doesn't have access to the database
- Database was deleted

**Solution:** Verify database ID and ensure it's shared with the integration.

### Error: "validation_error"
**Causes:**
- Invalid property names
- Wrong property types
- Missing required fields

**Solution:** Check property names match exactly (case-sensitive) and types are correct.

### Error: "rate_limited"
**Solution:** Implement exponential backoff retry logic (already implemented in NotionService).

## Resources

- [Notion API Reference](https://developers.notion.com/reference)
- [Query a Database](https://developers.notion.com/reference/post-database-query)
- [Create a Page](https://developers.notion.com/reference/post-page)
- [Update Page Properties](https://developers.notion.com/reference/patch-page)
