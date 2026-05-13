# Backup & Restore SOP

## What Gets Backed Up

| Item | Location | Why |
|------|----------|-----|
| Database | MariaDB container | All CMS data: layouts, schedules, users, display config |
| CMS Library | `cms-library` volume | Uploaded media files (images, videos, fonts) |
| CMS Custom | `cms-custom` volume | Custom themes, modules |
| config.env | `/opt/xibo/config.env` | Database passwords, CMS key, settings |
| docker-compose.yml | `/opt/xibo/docker-compose.yml` | Container configuration |

## Automated Daily Backup

The backup cron runs at 2:00 AM daily:

```
0 2 * * * root /opt/scripts/backup-xibo.sh
```

### Retention

| Type | Kept For |
|------|----------|
| Daily | 14 days |
| Weekly (Sunday) | 8 weeks |
| Monthly (1st) | 12 months |

### Verify Backup is Running

```bash
# Check last backup
ls -lt /opt/backups/xibo/daily/ | head -5

# Check backup log
tail -20 /var/log/xibo-backup.log

# Check cron is scheduled
cat /etc/cron.d/xibo-backup
```

## Manual Backup

```bash
sudo /opt/scripts/backup-xibo.sh
```

## Restore Procedure

**Always test on a staging/test server first if possible.**

```bash
# List available backups
ls -lt /opt/backups/xibo/daily/

# Restore
sudo /opt/xibo/restore-xibo.sh \
    /opt/backups/xibo/daily/db_20260513_020000.sql.gz \
    /opt/backups/xibo/daily/xibo_files_20260513_020000.tar.gz
```

The restore script will:
1. Stop CMS web container
2. Import database backup
3. Extract file backup
4. Restart all containers
5. Verify CMS is responding

## Disaster Recovery

If the server is completely lost:

1. Provision new Ubuntu 24.04 server
2. Install Docker
3. Clone this deployment repo
4. Deploy Xibo (`docker compose up -d`)
5. Run restore script with most recent backup
6. Update DNS to point to new server
7. Verify all displays check in

## Remote Backup Verification

If using S3 or rsync remote backups:

```bash
# Check S3
aws s3 ls s3://your-bucket/xibo-backups/daily/ --human-readable | tail -5

# Check remote host
ssh user@backup-server ls -lt /backups/xibo/daily/ | head -5
```
