# Server Setup Guide

## Requirements

| Component | Specification |
|-----------|--------------|
| OS | Ubuntu Server 24.04 LTS |
| CPU | 2-4 vCPU minimum |
| RAM | 4GB minimum, 8GB preferred |
| Storage | 100GB SSD minimum |
| Docker | Required |
| Docker Compose | Required |
| Domain | menus.poseztech.com |

## Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose (v2 included with Docker)
docker compose version

# Create Xibo directory
sudo mkdir -p /opt/xibo
sudo chown -R $USER:$USER /opt/xibo
```

## Step 2: Deploy Xibo CMS

```bash
cd /opt/xibo

# Copy deployment files from this repo
cp server/docker-compose.yml .
cp server/config.env.template config.env

# Edit config.env with real values
nano config.env
# Set: MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD, CMS_ADMIN_PASSWORD, CMS_KEY

# Start Xibo
docker compose up -d

# Check logs
docker compose logs -f cms-web
```

Wait for database initialization to complete (first boot takes a few minutes).

## Step 3: Reverse Proxy with HTTPS

### Option A: Nginx + Let's Encrypt

```bash
sudo apt install nginx certbot python3-certbot-nginx -y

# Copy nginx config
sudo cp server/nginx/xibo-cms.conf /etc/nginx/sites-available/xibo-cms
sudo ln -s /etc/nginx/sites-available/xibo-cms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d menus.poseztech.com
```

### Option B: Cloudflare Tunnel

If the server is behind NAT or you prefer Cloudflare:

```bash
# Install cloudflared
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install cloudflared -y

# Authenticate and create tunnel
cloudflared tunnel login
cloudflared tunnel create xibo-cms
cloudflared tunnel route dns xibo-cms menus.poseztech.com

# Configure tunnel
cat > ~/.cloudflared/config.yml <<EOF
tunnel: xibo-cms
credentials-file: /home/$USER/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: menus.poseztech.com
    service: http://127.0.0.1:9505
  - service: http_status:404
EOF

# Run as service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Step 4: Verify Installation

```bash
# Check containers are running
docker compose ps

# Test CMS locally
curl -I http://127.0.0.1:9505

# Test CMS via domain
curl -I https://menus.poseztech.com
```

Log into CMS at `https://menus.poseztech.com` with the admin credentials from config.env.

## Step 5: Post-Install

1. Upload a test image to the CMS library — verify it persists after container restart
2. Set up the backup cron job:
   ```bash
   sudo cp server/backup-xibo.sh /opt/scripts/backup-xibo.sh
   sudo chmod +x /opt/scripts/backup-xibo.sh
   echo "0 2 * * * root /opt/scripts/backup-xibo.sh" | sudo tee /etc/cron.d/xibo-backup
   ```
3. Set up monitoring (see [monitoring/](../monitoring/))
4. Create client folder structure (see [templates/](../templates/))

## Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

Do NOT expose port 9505 directly — always go through the reverse proxy.
