# Xibo CMS Upgrade Checklist

## Before Upgrading

- [ ] Check current Xibo version: `docker exec xibo-cms-web cat /var/www/cms/web/install/index.php | grep VERSION`
- [ ] Read release notes for target version
- [ ] Check for breaking changes or required migrations
- [ ] Verify disk space: `df -h`

## Pre-Upgrade Backup

- [ ] Run full backup: `sudo /opt/scripts/backup-xibo.sh`
- [ ] Verify database backup exists and is not empty
- [ ] Verify files backup exists and is not empty
- [ ] Copy backups to a separate location (not on same server)
- [ ] Test restore on staging server first (if available)

## Test on Staging (if available)

- [ ] Clone production backup to staging
- [ ] Run upgrade on staging
- [ ] Verify layouts render correctly
- [ ] Verify player check-in works
- [ ] Verify scheduled content displays
- [ ] Verify user permissions still work
- [ ] Run for 24 hours before upgrading production

## Production Upgrade

```bash
cd /opt/xibo

# Pull new images
docker compose pull

# Stop and recreate containers
docker compose down
docker compose up -d

# Watch logs for migration
docker compose logs -f cms-web
```

- [ ] CMS loads at https://menus.poseztech.com
- [ ] Admin can log in
- [ ] Layouts are intact
- [ ] Media library is intact
- [ ] Displays are checking in
- [ ] Scheduled content is correct
- [ ] Client users can still log in

## Post-Upgrade

- [ ] Monitor for 24 hours
- [ ] Check player logs for errors
- [ ] Verify all display groups still work
- [ ] Take a fresh backup of upgraded system
- [ ] Update version in internal documentation

## Rollback Plan

If upgrade fails:
```bash
cd /opt/xibo
docker compose down
# Restore from backup
sudo /opt/xibo/restore-xibo.sh <db_backup> <files_backup>
# Pin to previous image version in docker-compose.yml
docker compose up -d
```
