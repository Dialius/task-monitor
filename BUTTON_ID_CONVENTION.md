# Button ID Convention

Untuk menghindari konflik antara berbagai button handler, gunakan konvensi berikut:

## Button ID Prefixes

### 1. Command Pagination (`cmd_page_*`)
Digunakan oleh `PaginationHelper` untuk pagination pada command responses.
- `cmd_page_prev` - Previous page button
- `cmd_page_info` - Page info display (disabled)
- `cmd_page_next` - Next page button

**Handler:** `PaginationHelper` (internal collector)

### 2. Task Monitor Buttons
Digunakan untuk Task Monitor embed di info channel.
- `tasks_week` - Show tasks this week (ephemeral)
- `tasks_tomorrow` - Show tasks tomorrow (ephemeral)

**Handler:** `ButtonInteractionHandler.handleButtonClick()`

### 3. Ephemeral Pagination (`task_page_*`)
Digunakan untuk pagination pada ephemeral responses dari Task Monitor.
- `task_page_prev_week` - Previous page for weekly tasks
- `task_page_next_week` - Next page for weekly tasks
- `task_page_prev_tomorrow` - Previous page for tomorrow tasks
- `task_page_next_tomorrow` - Next page for tomorrow tasks

**Handler:** `ButtonInteractionHandler.handleEphemeralPagination()`

### 4. Other Buttons
- `refresh_tasks` - Refresh task list (DiscordAdapter)
- `filter_urgent` - Filter urgent tasks (DiscordAdapter)

## Implementation Rules

1. **PaginationHelper buttons** (`cmd_page_*`) are handled by their own collector and should be ignored by `ButtonInteractionHandler`
2. **Task Monitor buttons** (`tasks_week`, `tasks_tomorrow`) trigger new ephemeral responses with pagination
3. **Ephemeral pagination buttons** (`task_page_*`) navigate through ephemeral response pages
4. Always use unique prefixes to avoid conflicts between different button handlers

## Button Interaction Flow

```
User clicks button
    ↓
DiscordClient.interactionCreate
    ↓
ButtonInteractionHandler.handleButtonClick()
    ↓
    ├─ cmd_page_* → Return (let PaginationHelper handle)
    ├─ task_page_* → handleEphemeralPagination()
    └─ tasks_week/tasks_tomorrow → Query tasks + send ephemeral response
```

## Emoji Configuration

All pagination buttons use animated custom emojis:
- Previous: `1472405030584848599`
- Next: `1472405032594051104`

Button style: `ButtonStyle.Secondary` (gray color)
