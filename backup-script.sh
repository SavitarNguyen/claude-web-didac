#!/bin/bash

# Backup script for CuteVocab LMS Supabase database
# Usage: ./backup-script.sh

# Create backup directory if it doesn't exist
mkdir -p backups

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/supabase_backup_${TIMESTAMP}.sql"

echo "Creating Supabase backup: ${BACKUP_FILE}"

# Create the backup
supabase db dump --linked > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: ${BACKUP_FILE}"
    echo "📊 Backup size: $(du -h "${BACKUP_FILE}" | cut -f1)"
    
    # Keep only last 10 backups
    echo "🧹 Cleaning old backups (keeping last 10)..."
    ls -t backups/supabase_backup_*.sql | tail -n +11 | xargs -r rm
    
    echo "📋 Recent backups:"
    ls -la backups/supabase_backup_*.sql | tail -5
else
    echo "❌ Backup failed!"
    exit 1
fi 