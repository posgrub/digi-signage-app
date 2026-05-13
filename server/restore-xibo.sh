#!/usr/bin/env bash
# =============================================================================
# Xibo CMS Restore Script
# Usage: ./restore-xibo.sh <db_backup.sql.gz> <files_backup.tar.gz>
# =============================================================================
set -euo pipefail

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <db_backup.sql.gz> <files_backup.tar.gz>"
    echo "Example: $0 /opt/backups/xibo/daily/db_20260513.sql.gz /opt/backups/xibo/daily/xibo_files_20260513.tar.gz"
    exit 1
fi

DB_BACKUP="$1"
FILES_BACKUP="$2"
XIBO_DIR="/opt/xibo"

echo "=== Xibo CMS Restore ==="
echo "Database backup: $DB_BACKUP"
echo "Files backup:    $FILES_BACKUP"
echo ""
echo "WARNING: This will overwrite the current Xibo CMS data."
read -p "Continue? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "Aborted."
    exit 0
fi

# --- Step 1: Stop CMS web container (keep DB running) ---
echo "[1/5] Stopping CMS web container..."
cd "$XIBO_DIR"
docker compose stop cms-web cms-xmr

# --- Step 2: Restore database ---
echo "[2/5] Restoring database..."
gunzip -c "$DB_BACKUP" | docker exec -i xibo-cms-db sh -c \
    'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD"'
echo "Database restored."

# --- Step 3: Restore files ---
echo "[3/5] Restoring CMS files..."
tar -xzf "$FILES_BACKUP" -C /
echo "Files restored."

# --- Step 4: Restart all containers ---
echo "[4/5] Restarting Xibo CMS..."
docker compose up -d

# --- Step 5: Verify ---
echo "[5/5] Waiting for CMS to start..."
sleep 10
if curl -sf http://127.0.0.1:9505 > /dev/null 2>&1; then
    echo "Restore complete. CMS is responding."
else
    echo "WARNING: CMS did not respond on port 9505. Check: docker compose logs cms-web"
fi
