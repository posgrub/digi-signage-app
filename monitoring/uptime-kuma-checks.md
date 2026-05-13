# Uptime Kuma Monitoring Checks

## Install Uptime Kuma

```bash
docker run -d \
    --name uptime-kuma \
    --restart always \
    -p 3001:3001 \
    -v uptime-kuma-data:/app/data \
    louislam/uptime-kuma:latest
```

Access at `http://server-ip:3001` — create admin account on first visit.

## Checks to Configure

### 1. CMS Website Uptime

| Setting | Value |
|---------|-------|
| Type | HTTP(s) |
| URL | `https://menus.poseztech.com` |
| Interval | 60 seconds |
| Retries | 3 |
| Expected Status | 200 |
| Alert After | 2 minutes down |

### 2. CMS Web Container

| Setting | Value |
|---------|-------|
| Type | Docker Container |
| Container | `xibo-cms-web` |
| Interval | 60 seconds |

### 3. Database Container

| Setting | Value |
|---------|-------|
| Type | Docker Container |
| Container | `xibo-cms-db` |
| Interval | 60 seconds |

### 4. XMR Container

| Setting | Value |
|---------|-------|
| Type | Docker Container |
| Container | `xibo-cms-xmr` |
| Interval | 60 seconds |

### 5. Disk Space

| Setting | Value |
|---------|-------|
| Type | Push (use cron script below) |
| Interval | 300 seconds |
| Script | See disk-check.sh below |

### 6. SSL Certificate

| Setting | Value |
|---------|-------|
| Type | HTTP(s) - Keyword |
| URL | `https://menus.poseztech.com` |
| Certificate Expiry | Alert at 14 days |

### 7. Backup Status

| Setting | Value |
|---------|-------|
| Type | Push |
| Interval | 86400 seconds (24h) |
| Integration | Add push URL to backup script |

## Notification Channels

Configure at least one:
- Email (SMTP)
- Slack webhook
- Discord webhook
- Telegram bot
- Pushover

## Status Page (Optional)

Create a public or private status page in Uptime Kuma showing:
- CMS Status
- Per-client display status (if desired)
