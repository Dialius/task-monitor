#!/bin/bash

# Log Cleanup Script
# Removes log files older than specified days

# Configuration
LOG_DIR="./logs"
DAYS_TO_KEEP=30

echo "Starting log cleanup..."
echo "Log directory: $LOG_DIR"
echo "Keeping logs from last $DAYS_TO_KEEP days"

if [ ! -d "$LOG_DIR" ]; then
    echo "Log directory does not exist: $LOG_DIR"
    exit 1
fi

# Count files before cleanup
BEFORE_COUNT=$(find "$LOG_DIR" -type f -name "*.log" | wc -l)
echo "Total log files before cleanup: $BEFORE_COUNT"

# Remove old log files
find "$LOG_DIR" -type f -name "*.log" -mtime +$DAYS_TO_KEEP -delete

# Count files after cleanup
AFTER_COUNT=$(find "$LOG_DIR" -type f -name "*.log" | wc -l)
DELETED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))

echo "Deleted $DELETED_COUNT log files"
echo "Remaining log files: $AFTER_COUNT"

# Calculate total size of remaining logs
TOTAL_SIZE=$(du -sh "$LOG_DIR" | cut -f1)
echo "Total log directory size: $TOTAL_SIZE"

echo "Log cleanup completed!"
