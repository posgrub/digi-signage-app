#!/usr/bin/env bash
# =============================================================================
# Xibo CMS Backup Script
# Run daily via cron: 0 2 * * * /opt/scripts/backup-xibo.sh
# =============================================================================
set -euo pipefail

# --- Configuration ---
XIBO_DIR="/opt/xibo"
BACKUP_DIR="/opt/backups/xibo"
RETENTION_DAILY=14
RETENTION_WEEKLY=8
RETENTION_MONTHLY=12
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)   # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)
LOG_FILE="/var/log/xibo-backup.log"

# Remote backup (optional - uncomment and configure)
# S3_BUCKET="s3://your-bucket/xibo-backups"
# REMOTE_HOST="user@backup-server.com:/backups/xibo"

# Alert on failure (optional - set webhook URL)
# ALERT_WEBHOOK=""

# --- Functions ---
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

alert_failure() {
    log "ERROR: Backup failed - $1"
    if [[ -n "${ALERT_WEBHOOK:-}" ]]; then
        curl -s -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🚨 Xibo backup FAILED: $1\"}" || true
    fi
    exit 1
}

# --- Pre-checks ---
if [[ ! -d "$XIBO_DIR" ]]; then
    alert_failure "Xibo directory not found: $XIBO_DIR"
fi

mkdir -p "$BACKUP_DIR/daily" "$BACKUP_DIR/weekly" "$BACKUP_DIR/monthly"

log "Starting Xibo backup..."

# --- Step 1: Database backup via Docker ---
log "Dumping database..."
docker exec xibo-cms-db sh -c \
    'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases --single-transaction' \
    | gzip > "$BACKUP_DIR/daily/db_${TIMESTAMP}.sql.gz" \
    || alert_failure "Database dump failed"

# --- Step 2: Archive CMS files ---
log "Archiving CMS library and config..."
ARCHIVE="$BACKUP_DIR/daily/xibo_files_${TIMESTAMP}.tar.gz"

# Get volume mount paths
CMS_LIBRARY=$(docker volume inspect xibo_cms-library --format '{{ .Mountpoint }}' 2>/dev/null || echo "")
CMS_CUSTOM=$(docker volume inspect xibo_cms-custom --format '{{ .Mountpoint }}' 2>/dev/null || echo "")

PATHS_TO_BACKUP=("$XIBO_DIR/config.env" "$XIBO_DIR/docker-compose.yml")
[[ -n "$CMS_LIBRARY" ]] && PATHS_TO_BACKUP+=("$CMS_LIBRARY")
[[ -n "$CMS_CUSTOM" ]] && PATHS_TO_BACKUP+=("$CMS_CUSTOM")

tar -czf "$ARCHIVE" "${PATHS_TO_BACKUP[@]}" 2>/dev/null \
    || alert_failure "File archive failed"

# --- Step 3: Weekly backup (Sundays) ---
if [[ "$DAY_OF_WEEK" == "7" ]]; then
    log "Creating weekly backup..."
    cp "$BACKUP_DIR/daily/db_${TIMESTAMP}.sql.gz" "$BACKUP_DIR/weekly/"
    cp "$ARCHIVE" "$BACKUP_DIR/weekly/"
fi

# --- Step 4: Monthly backup (1st of month) ---
if [[ "$DAY_OF_MONTH" == "01" ]]; then
    log "Creating monthly backup..."
    cp "$BACKUP_DIR/daily/db_${TIMESTAMP}.sql.gz" "$BACKUP_DIR/monthly/"
    cp "$ARCHIVE" "$BACKUP_DIR/monthly/"
fi

# --- Step 5: Cleanup old backups ---
log "Cleaning up old backups..."
find "$BACKUP_DIR/daily" -type f -mtime +"$RETENTION_DAILY" -delete 2>/dev/null || true
find "$BACKUP_DIR/weekly" -type f -mtime +$((RETENTION_WEEKLY * 7)) -delete 2>/dev/null || true
find "$BACKUP_DIR/monthly" -type f -mtime +$((RETENTION_MONTHLY * 30)) -delete 2>/dev/null || true

# --- Step 6: Remote upload (optional) ---
if [[ -n "${S3_BUCKET:-}" ]]; then
    log "Uploading to S3..."
    aws s3 cp "$BACKUP_DIR/daily/db_${TIMESTAMP}.sql.gz" "$S3_BUCKET/daily/" || log "WARN: S3 upload failed"
    aws s3 cp "$ARCHIVE" "$S3_BUCKET/daily/" || log "WARN: S3 upload failed"
fi

if [[ -n "${REMOTE_HOST:-}" ]]; then
    log "Syncing to remote host..."
    rsync -az "$BACKUP_DIR/" "$REMOTE_HOST/" || log "WARN: rsync failed"
fi

# --- Done ---
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/daily/db_${TIMESTAMP}.sql.gz" "$ARCHIVE" | awk '{sum += $1} END {print sum}')
log "Backup completed successfully. Files: db_${TIMESTAMP}.sql.gz, xibo_files_${TIMESTAMP}.tar.gz"
