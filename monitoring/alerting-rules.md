# Alerting Rules

## Severity Levels

| Level | Response Time | Notification |
|-------|--------------|--------------|
| Critical | Immediate | Email + SMS/Push |
| Warning | Within 1 hour | Email |
| Info | Next business day | Dashboard only |

## Alert Definitions

### Critical Alerts

| Condition | Threshold | Action |
|-----------|-----------|--------|
| CMS down | > 2 minutes | Investigate immediately, check Docker containers |
| Database container stopped | Immediate | Restart container, check logs |
| Disk usage > 90% | Immediate | Free space, expand volume |
| Backup failed | Daily check | Re-run backup, check disk space, check credentials |
| SSL certificate expires | < 7 days | Renew certificate immediately |

### Warning Alerts

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Disk usage > 80% | Check daily | Plan cleanup or expansion |
| Display offline | > 15 minutes | Check network, try remote access |
| SSL certificate expires | < 14 days | Schedule renewal |
| Server CPU > 90% | > 5 minutes sustained | Investigate processes |
| Server RAM > 90% | > 5 minutes sustained | Check for memory leaks |
| CMS response time | > 5 seconds | Check server load |

### Info/Ticket

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Display offline | > 1 hour | Create support ticket, contact client |
| Display offline | > 4 hours | Escalate — possible hardware/network failure |
| Library storage > 50GB | Check monthly | Review old media, archive unused |
| Player version outdated | On CMS upgrade | Schedule player updates |

## Display Monitoring

Xibo CMS tracks display check-in times natively.

### Check display status:
1. CMS → Displays → sort by "Last Accessed"
2. Any display not checked in within 15 minutes = investigate

### Automated display check script:

```bash
#!/usr/bin/env bash
# Check Xibo display status via API
# Add to cron: */15 * * * * /opt/scripts/check-displays.sh

CMS_URL="https://menus.poseztech.com"
API_KEY="your-api-key-here"
ALERT_WEBHOOK=""  # Slack/Discord webhook URL
OFFLINE_THRESHOLD=900  # 15 minutes in seconds

# Get displays via Xibo API
displays=$(curl -s -H "Authorization: Bearer $API_KEY" \
    "$CMS_URL/api/display" | jq -r '.[] | select(.loggedIn == 0) | .display')

if [[ -n "$displays" ]]; then
    message="Offline displays:\n$displays"
    if [[ -n "$ALERT_WEBHOOK" ]]; then
        curl -s -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"⚠️ $message\"}"
    fi
    echo "$message"
fi
```

## Escalation Path

1. **Automated alert** → check dashboard
2. **Self-healing** → container auto-restart (Docker restart policy)
3. **Manual intervention** → SSH to server, check logs
4. **Client notification** → if display will be down > 1 hour
5. **On-site visit** → if remote resolution fails
