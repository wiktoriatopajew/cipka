#!/bin/bash

# Quick backup script for AutoMentor database
# Run this periodically to backup your data

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
DB_FILE="database.sqlite"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "📦 Creating backup: ${DB_FILE}_${DATE}.sqlite"
cp $DB_FILE "$BACKUP_DIR/${DB_FILE}_${DATE}.sqlite"

# Compress backup
echo "🗜️ Compressing backup..."
gzip "$BACKUP_DIR/${DB_FILE}_${DATE}.sqlite"

# Clean old backups (keep last 7 days)
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.sqlite.gz" -mtime +7 -delete

# Show backup info
echo "✅ Backup completed!"
echo "📁 Backup location: $BACKUP_DIR/${DB_FILE}_${DATE}.sqlite.gz"
echo "📊 Backup size: $(du -h $BACKUP_DIR/${DB_FILE}_${DATE}.sqlite.gz | cut -f1)"

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lh $BACKUP_DIR/ | tail -5