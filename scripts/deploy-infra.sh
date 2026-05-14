#!/usr/bin/env bash
# =============================================================================
# Digital Signage Infrastructure - Coolify Deployment Script
# Deploys: Xibo CMS, PostgreSQL, Uptime Kuma to Coolify
#
# Prerequisites:
#   - Coolify instance running at $COOLIFY_URL
#   - API token with full access
#   - GitHub repo must be public (or Coolify GitHub App configured)
#
# Usage: ./scripts/deploy-infra.sh
# =============================================================================
set -euo pipefail

# --- Configuration ---
COOLIFY_URL="${COOLIFY_URL:-https://coolify.poseztech.com}"
COOLIFY_TOKEN="${COOLIFY_TOKEN:-}"
SERVER_UUID="${COOLIFY_SERVER_UUID:-d044o8sw4c4kcs0cg084ss40}"
DESTINATION_UUID="${COOLIFY_DEST_UUID:-jcgwwo8c48cwg00oso0ooooc}"
GIT_REPO="https://github.com/posgrub/digi-signage-app"
GIT_BRANCH="master"

# Domains
XIBO_DOMAIN="menus.poseztech.com"
UPTIME_DOMAIN="uptime.poseztech.com"

# Database credentials
PG_USER="signage"
PG_PASSWORD="S1gnage_DB_2026!"
PG_DB="signage"

# --- Pre-checks ---
if [[ -z "$COOLIFY_TOKEN" ]]; then
    echo "ERROR: Set COOLIFY_TOKEN environment variable"
    exit 1
fi

API="$COOLIFY_URL/api/v1"
AUTH="Authorization: Bearer $COOLIFY_TOKEN"

api() {
    local method=$1 path=$2
    shift 2
    curl -sf -X "$method" -H "$AUTH" -H "Content-Type: application/json" "$@" "$API$path"
}

echo "=== Digital Signage Infrastructure Deployment ==="
echo "Coolify: $COOLIFY_URL"
echo "Server:  $SERVER_UUID"
echo ""

# --- Step 1: Create Project ---
echo "[1/4] Creating project..."
PROJECT_UUID=$(api POST /projects -d '{"name":"Digital Signage","description":"Multi-client Xibo CMS digital menu board service"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).uuid))")
echo "  Project: $PROJECT_UUID"

# --- Step 2: Deploy Xibo CMS (Docker Compose Application) ---
echo "[2/4] Deploying Xibo CMS..."
XIBO_UUID=$(api POST /applications/public -d "{
    \"name\": \"xibo-cms\",
    \"description\": \"Xibo CMS - Digital Menu Board Service\",
    \"project_uuid\": \"$PROJECT_UUID\",
    \"server_uuid\": \"$SERVER_UUID\",
    \"environment_name\": \"production\",
    \"destination_uuid\": \"$DESTINATION_UUID\",
    \"git_repository\": \"$GIT_REPO\",
    \"git_branch\": \"$GIT_BRANCH\",
    \"build_pack\": \"dockercompose\",
    \"ports_exposes\": \"80\",
    \"docker_compose_location\": \"/deploy/docker-compose.yml\",
    \"docker_compose_domains\": [{\"name\": \"cms-web\", \"domain\": \"https://$XIBO_DOMAIN\"}],
    \"instant_deploy\": true,
    \"health_check_enabled\": false,
    \"is_container_label_escape_enabled\": false
}" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).uuid))")
echo "  Xibo CMS: $XIBO_UUID"

# Set env vars
api PATCH "/applications/$XIBO_UUID/envs/bulk" -d '{"data":[
    {"key":"MYSQL_PASSWORD","value":"Xib0_CMS_Pr0d_2026!","is_literal":true},
    {"key":"CMS_SERVER_NAME","value":"'"$XIBO_DOMAIN"'"}
]}' > /dev/null
echo "  Env vars set"

# --- Step 3: Create PostgreSQL ---
echo "[3/4] Creating PostgreSQL database..."
PG_UUID=$(api POST /databases/postgresql -d "{
    \"name\": \"signage-db\",
    \"description\": \"PostgreSQL for Digital Signage management app\",
    \"project_uuid\": \"$PROJECT_UUID\",
    \"server_uuid\": \"$SERVER_UUID\",
    \"environment_name\": \"production\",
    \"destination_uuid\": \"$DESTINATION_UUID\",
    \"postgres_user\": \"$PG_USER\",
    \"postgres_password\": \"$PG_PASSWORD\",
    \"postgres_db\": \"$PG_DB\",
    \"image\": \"postgres:16-alpine\",
    \"instant_deploy\": true
}" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const r=JSON.parse(d);console.log(r.uuid)})")
echo "  PostgreSQL: $PG_UUID"

# --- Step 4: Deploy Uptime Kuma ---
echo "[4/4] Deploying Uptime Kuma..."
KUMA_UUID=$(api POST /services -d "{
    \"type\": \"uptime-kuma\",
    \"name\": \"uptime-kuma\",
    \"description\": \"Monitoring for Digital Signage services\",
    \"project_uuid\": \"$PROJECT_UUID\",
    \"server_uuid\": \"$SERVER_UUID\",
    \"environment_name\": \"production\",
    \"destination_uuid\": \"$DESTINATION_UUID\",
    \"instant_deploy\": true,
    \"urls\": [{\"name\": \"uptime-kuma\", \"url\": \"https://$UPTIME_DOMAIN\"}]
}" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).uuid))")
echo "  Uptime Kuma: $KUMA_UUID"

# --- Summary ---
echo ""
echo "=== Deployment Complete ==="
echo "Project UUID:    $PROJECT_UUID"
echo "Xibo CMS UUID:   $XIBO_UUID    → https://$XIBO_DOMAIN"
echo "PostgreSQL UUID: $PG_UUID"
echo "Uptime Kuma UUID:$KUMA_UUID    → https://$UPTIME_DOMAIN"
echo ""
echo "Default Xibo login: xibo_admin / password (CHANGE IMMEDIATELY)"
echo ""
echo "Next steps:"
echo "  1. Wait 3-5 minutes for Xibo CMS to initialize MySQL"
echo "  2. Log in at https://$XIBO_DOMAIN and change the admin password"
echo "  3. Set up Uptime Kuma at https://$UPTIME_DOMAIN"
echo "  4. Register an API Application in Xibo CMS for the management app"
