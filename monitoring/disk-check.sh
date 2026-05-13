#!/usr/bin/env bash
# =============================================================================
# Disk Space Monitor for Uptime Kuma Push
# Cron: */5 * * * * /opt/scripts/disk-check.sh
# =============================================================================

WARN_THRESHOLD=80
CRIT_THRESHOLD=90
PUSH_URL=""  # Uptime Kuma push URL (e.g., http://localhost:3001/api/push/xxxxx)
ALERT_WEBHOOK=""  # Slack/Discord webhook for alerts

USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')

# Push to Uptime Kuma (heartbeat)
if [[ -n "$PUSH_URL" ]]; then
    if [[ "$USAGE" -lt "$WARN_THRESHOLD" ]]; then
        curl -s "${PUSH_URL}?status=up&msg=Disk%20${USAGE}%25" > /dev/null
    else
        curl -s "${PUSH_URL}?status=down&msg=Disk%20${USAGE}%25" > /dev/null
    fi
fi

# Alert if thresholds exceeded
if [[ "$USAGE" -ge "$CRIT_THRESHOLD" ]]; then
    MSG="🚨 CRITICAL: Disk usage at ${USAGE}% on $(hostname)"
    echo "$MSG"
    [[ -n "$ALERT_WEBHOOK" ]] && curl -s -X POST "$ALERT_WEBHOOK" \
        -H "Content-Type: application/json" -d "{\"text\": \"$MSG\"}"
elif [[ "$USAGE" -ge "$WARN_THRESHOLD" ]]; then
    MSG="⚠️ WARNING: Disk usage at ${USAGE}% on $(hostname)"
    echo "$MSG"
    [[ -n "$ALERT_WEBHOOK" ]] && curl -s -X POST "$ALERT_WEBHOOK" \
        -H "Content-Type: application/json" -d "{\"text\": \"$MSG\"}"
fi
