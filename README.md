# Xibo Digital Menu Board Service

A production deployment repository for a managed multi-client digital menu board service using **Xibo CMS** (Docker self-hosted).

## What This Is

Everything needed to deploy and operate a Xibo-based digital signage service for multiple restaurant clients:

- **Server**: Docker Compose stack, reverse proxy, backup/restore scripts
- **Player**: Linux mini PC setup scripts and golden image checklist
- **Docs**: SOPs for onboarding, troubleshooting, upgrades, and support
- **Templates**: Naming conventions, folder structures, planning sheets
- **Monitoring**: Uptime checks, alerting rules, display offline procedures

## Quick Start

### 1. Server Setup

```bash
cd server/
cp config.env.template config.env
# Edit config.env with your settings
docker compose up -d
```

### 2. Reverse Proxy (HTTPS)

```bash
# See server/nginx/ for Nginx reverse proxy config
# Or use Cloudflare tunnel — see docs/server-setup-guide.md
```

### 3. Player Deployment

```bash
# On each Linux mini PC:
sudo bash player/setup-player.sh
```

### 4. Client Onboarding

Follow [docs/customer-onboarding-checklist.md](docs/customer-onboarding-checklist.md)

## Architecture

```
One Xibo CMS Instance
├── Client A (folders, user group, display groups)
│   ├── Location 1 → Display Group → Screens
│   └── Location 2 → Display Group → Screens
├── Client B
│   └── Location 1 → Display Group → Screens
└── ...
```

Clients are separated using Xibo's built-in folders, display groups, user groups, and permissions — not separate CMS instances (until a client needs full isolation).

## Hardware Standard

| Component | Spec |
|-----------|------|
| CPU | Intel N100/N150 fanless |
| RAM | 8GB minimum |
| Storage | 128GB+ SSD |
| Network | Ethernet preferred |
| Video | HDMI |
| OS | Ubuntu/Xubuntu Desktop |

Recommended: MeLE Quieter4C N100/N150

## Service Plans

| Plan | Screens | Setup | Monthly |
|------|---------|-------|---------|
| Starter | 1 | $500–$1,000 | $75–$125 |
| Restaurant | 2–4 | $1,000–$2,500 | $150–$300 |
| Multi-Location | 5+ | Custom | $100–$300/location |

See [docs/pricing-packages.md](docs/pricing-packages.md) for details.
