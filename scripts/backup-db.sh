#!/bin/bash

# MongoDB Backup Script
# Creates a backup of the MongoDB database with timestamp

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="multiplatform_class_bot_${TIMESTAMP}"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup..."
echo "Backup name: $BACKUP_NAME"

# Perform backup
if [ -z "$MONGODB_URI" ]; then
    echo "Error: MONGODB_URI not set in .env"
    exit 1
fi

# Extract database name from URI
DB_NAME=$(echo "$MONGODB_URI" | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
    DB_NAME="multiplatform_class_bot"
fi

echo "Database: $DB_NAME"

# Run mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully!"
    echo "Location: $BACKUP_DIR/$BACKUP_NAME"
    
    # Compress backup
    echo "Compressing backup..."
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    
    echo "Compressed backup: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    # Keep only last 7 backups
    echo "Cleaning old backups (keeping last 7)..."
    ls -t *.tar.gz | tail -n +8 | xargs -r rm
    
    echo "Backup process completed!"
else
    echo "Backup failed!"
    exit 1
fi
