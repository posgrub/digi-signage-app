# Troubleshooting Guide

## Display Issues

### Display shows "Waiting for content" or splash screen

1. Check display status in CMS → Displays
2. If "Offline" — check network at location
3. If "Online" but no content — verify a layout is assigned:
   - Check display group membership
   - Check schedule events targeting that display group
4. Force a content sync: CMS → Displays → select display → "Collect Now"

### Display shows wrong content

1. Check which layout is scheduled: CMS → Schedule → filter by display group
2. Check schedule priority — higher priority overrides lower
3. Check schedule date/time — ensure timezone matches
4. Check display group membership — display may be in wrong group

### Display is offline

1. **Remote check**: Try connecting via RustDesk
2. **Network**: Ping the device IP if on same network
3. **On-site**:
   - Is the mini PC powered on? Check power LED
   - Is Ethernet cable connected? Check link lights
   - Is Wi-Fi connected? (if applicable)
   - Reboot the mini PC
4. **CMS side**: Check Displays → last check-in time

### Black screen on TV

1. Check HDMI cable connection
2. Check TV input source (correct HDMI port)
3. Check if mini PC is running (connect keyboard/mouse)
4. Check if Xibo Player is running: `snap services xibo-player`
5. Check display resolution settings

## CMS Issues

### CMS not loading

```bash
# Check containers
docker compose ps

# Check logs
docker compose logs cms-web --tail 50
docker compose logs cms-db --tail 50

# Restart
docker compose restart
```

### CMS loading slowly

```bash
# Check server resources
htop
df -h

# Check database
docker exec xibo-cms-db mysqladmin -u root -p"$MYSQL_ROOT_PASSWORD" status
```

### Cannot upload media (file too large)

1. Check `config.env`: `CMS_PHP_UPLOAD_MAX_FILESIZE` and `CMS_PHP_POST_MAX_SIZE`
2. Check nginx: `client_max_body_size` in reverse proxy config
3. Restart after changes: `docker compose restart cms-web`

### Player not checking in

1. Verify CMS URL is correct on player
2. Verify CMS key matches (CMS → Settings → CMS Key)
3. Check DNS resolution: `nslookup menus.poseztech.com` from player
4. Check SSL: `curl -v https://menus.poseztech.com` from player
5. Check firewall — port 443 must be open outbound

## Backup Issues

### Backup script fails

```bash
# Check log
tail -50 /var/log/xibo-backup.log

# Test database dump manually
docker exec xibo-cms-db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --all-databases' | head

# Check disk space
df -h /opt/backups
```

### Restore fails

1. Verify backup files are not corrupted: `gunzip -t backup.sql.gz`
2. Ensure CMS containers are in correct state (web stopped, db running)
3. Check database logs: `docker compose logs cms-db`

## Network Issues

### Player loses content after internet outage

This is normal behavior — Xibo caches content locally. Content should resume automatically when the connection returns. If it doesn't:

1. Restart the Xibo Player snap
2. Check player logs: `snap logs xibo-player`
3. Verify CMS URL is still reachable from the player

### SSL certificate expired

```bash
# Renew Let's Encrypt
sudo certbot renew

# Or check Cloudflare tunnel status
cloudflared tunnel info xibo-cms
```

## Remote Access

### RustDesk cannot connect

1. Check if RustDesk is running on the player: `systemctl status rustdesk`
2. Verify the RustDesk ID hasn't changed
3. Check if player has internet access
4. Try restarting RustDesk: `sudo systemctl restart rustdesk`
