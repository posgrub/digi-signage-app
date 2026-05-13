# Multi-Client Xibo Digital Menu Board Service Plan

## Goal

Create a self-hosted **Xibo CMS server** that can manage digital menu boards for multiple restaurant clients. Each client may have one or more locations, and each location may have one or more screens.

The service should support:

```text
Multiple clients
Multiple locations per client
Multiple screens per location
Centralized menu updates
Display groups by client/location
User access per client
Backups
Monitoring
Player deployment standards
Repeatable onboarding process
```

Use **Xibo CMS Docker install** as the server platform because Xibo recommends Docker as the supported installation method for self-hosting.

---

## 1. Server Architecture

### Recommended server

Use a VPS or dedicated server.

```text
OS: Ubuntu Server 24.04 LTS
CPU: 2–4 vCPU minimum
RAM: 4GB minimum, 8GB preferred
Storage: 100GB minimum SSD
Docker: yes
Docker Compose: yes
Domain: menus.yourdomain.com
SSL: Cloudflare + reverse proxy or direct Let’s Encrypt
```

### Example domains

```text
menus.poseztech.com
xibo.poseztech.com
signage.poseztech.com
```

### Server stack

```text
Ubuntu Server
Docker
Docker Compose
Xibo CMS containers
MariaDB/MySQL container from Xibo stack
Web container from Xibo stack
Persistent Xibo shared storage
Reverse proxy with HTTPS
Daily backup job
Monitoring/uptime check
```

---

## 2. Install Xibo CMS

### Tasks for AI/devops agent

Create server folder:

```bash
sudo mkdir -p /opt/xibo
sudo chown -R $USER:$USER /opt/xibo
cd /opt/xibo
```

Install Docker and Docker Compose.

Download or clone the official Xibo Docker files.

Configure:

```text
config.env
docker-compose.yml
CMS URL
database credentials
admin account
mail settings if needed
upload/library storage
```

Start Xibo:

```bash
docker compose up -d
```

Confirm CMS loads at:

```text
https://menus.yourdomain.com
```

Upload a test image and verify the CMS library folder persists before using the system for customers.

---

## 3. Multi-Client Structure Inside Xibo

Xibo is not “multi-tenant” in the same way as a SaaS app with completely separate customer databases. Use **folders, user groups, display groups, naming rules, and sharing permissions** to separate clients.

### Create this structure

```text
/Clients
    /Client - Vida
        /Location - Katy
            /Layouts
            /Media
            /Playlists
            /Schedules
        /Location - Houston
            /Layouts
            /Media
            /Playlists
            /Schedules

    /Client - Taco Shop ABC
        /Location - Main
            /Layouts
            /Media
            /Playlists
            /Schedules
```

### Naming standard

Use this exact naming convention:

```text
CLIENT - LOCATION - SCREEN TYPE
```

Examples:

```text
Vida - Katy - Food Menu
Vida - Katy - Bar Menu
Vida - Katy - Specials
Taco Shop ABC - Main - Menu
Taco Shop ABC - Main - Promo
```

---

## 4. Display Groups

Create Display Groups by customer and location.

Display Groups allow content and schedules to target multiple displays with one event, which helps manage larger networks.

### Display group structure

```text
Client - Vida
    Vida - All Locations
    Vida - Katy
    Vida - Houston

Client - Taco Shop ABC
    Taco Shop ABC - All Locations
    Taco Shop ABC - Main
```

### Screen examples

```text
Vida - Katy - Food Menu
Vida - Katy - Drink Menu
Vida - Katy - Specials
Vida - Houston - Food Menu
Vida - Houston - Specials
```

### Scheduling logic

```text
Food Menu Layout → Food Menu screens
Drink Menu Layout → Bar/Drink screens
Specials Layout → Promo/Specials screens
Holiday Promo → All screens or selected location group
```

---

## 5. User and Permissions Plan

Create three levels of users.

### Super Admin

For your company only.

```text
PosezTech Admin
Full access
Can create clients
Can add displays
Can manage all folders
Can manage backups/upgrades
```

### Client Manager

For restaurant owner or manager.

```text
Can view their own client folder
Can upload media to their own folder
Can edit approved layouts if you allow it
Cannot see other clients
Cannot change system settings
Cannot delete global templates
```

### Client Viewer

For customers who only need to see status.

```text
Can view assigned layouts/schedules
Can view display status
Cannot edit or delete
```

---

## 6. Player Hardware Standard

Use one Linux x86 mini PC per TV.

### Standard device spec

```text
CPU: Intel N100 / N150 preferred
RAM: 8GB minimum
Storage: 128GB minimum, SSD preferred
Network: Ethernet preferred
Video: HDMI
Cooling: Fanless
OS: Ubuntu Desktop or Xubuntu
Remote support: RustDesk, MeshCentral, AnyDesk, or similar
```

### Acceptable player models

```text
MeLE Quieter4C N100/N150
MeLE PCG35HD N5105
MSI Cubi N fanless
MITXPC MES-N100DC
Shuttle fanless mini PC
```

### Avoid

```text
Raspberry Pi for Xibo official player
Old 2GB/4GB devices
Cheap Android TV boxes
Consumer streaming sticks
Unreliable Wi-Fi-only installs
```

---

## 7. Linux Player Setup

For each mini PC:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install snapd -y
sudo snap install xibo-player --channel=stable
```

Then configure the Xibo Player with:

```text
CMS URL: https://menus.yourdomain.com
CMS Secret Key: from Xibo CMS settings
Display Name: Client - Location - Screen Type
```

Authorize the display inside Xibo CMS before assigning layouts.

---

## 8. Player Operating System Configuration

Create a standard install script that does this:

```text
Create signage user
Enable auto-login
Disable sleep
Disable screen blanking
Disable lock screen
Install Xibo Player
Install remote support agent
Set hostname
Set timezone
Enable auto power recovery in BIOS manually
Configure unattended security updates carefully
```

### Create signage user

```bash
sudo adduser signage
```

### Disable screen sleep

```bash
gsettings set org.gnome.desktop.session idle-delay 0
gsettings set org.gnome.desktop.screensaver lock-enabled false
```

### Optional hostname format

```bash
sudo hostnamectl set-hostname vida-katy-food-menu
```

---

## 9. Golden Image Process

Create one perfect player image.

### Golden image should include

```text
Ubuntu/Xubuntu installed
Xibo Player installed
Remote support installed
Auto-login enabled
Sleep disabled
Screen blanking disabled
Browser installed
Test layout confirmed
Update policy configured
```

### On each new install

```text
Clone image
Change hostname
Connect network
Open Xibo Player
Enter CMS URL and key
Authorize display in Xibo
Assign to display group
Assign default layout
Test reboot
Test internet loss
Test power loss
```

---

## 10. Backup Plan

For Xibo Docker installs, a proper backup plan should include:

```text
shared/backup/db/latest.sql.gz
shared/cms
config.env
*.yml
```

### Implement backup job

Back up daily to:

```text
Local backup folder
Remote S3-compatible storage
External VPS backup
Cloud storage
```

### Backup retention

```text
Daily backups: keep 14 days
Weekly backups: keep 8 weeks
Monthly backups: keep 12 months
```

### Backup script goal

Create:

```bash
/opt/scripts/backup-xibo.sh
```

It should:

```text
Stop or safely snapshot containers if needed
Copy Xibo DB backup
Copy shared/cms
Copy config.env
Copy compose files
Compress archive
Upload to remote backup storage
Log success/failure
Send alert if backup fails
```

---

## 11. Upgrade Plan

Before any Xibo upgrade:

```text
Take full backup
Export database
Backup shared/cms
Backup config.env
Backup docker-compose files
Test on staging server first
Upgrade staging
Test layouts
Test player check-in
Then upgrade production
```

Never upgrade production without a verified backup.

---

## 12. Monitoring Plan

Monitor:

```text
Xibo CMS website uptime
Disk space
Docker container status
Database backup success
Player last check-in
Offline displays
Storage usage
SSL certificate expiration
Server CPU/RAM
```

Use:

```text
Uptime Kuma
Netdata
Grafana/Prometheus if needed
Xibo display status dashboard
Email alerts
```

### Alert rules

```text
CMS down for 2 minutes → alert
Disk over 80% → warning
Disk over 90% → critical
Display offline over 15 minutes → warning
Display offline over 1 hour → ticket
Backup failed → critical
SSL expires in 14 days → warning
```

---

## 13. Client Onboarding Workflow

### New customer checklist

```text
Create client folder
Create display groups
Create user group
Create client user
Create location folder
Create layouts
Upload menu assets
Prepare player device
Install at restaurant
Register display
Authorize display
Assign display group
Assign default layout
Schedule content
Test reboot
Test internet outage
Train customer
Add to billing
```

### Required information from customer

```text
Restaurant name
Location address
Wi-Fi or Ethernet availability
Number of screens
Screen orientation: landscape or portrait
Menu categories
Menu prices
Logo/branding
Operating hours
Breakfast/lunch/dinner schedule
Happy hour schedule
Who can request changes
Emergency contact
```

---

## 14. Service Packages to Sell

### Starter Plan

```text
1 screen
1 menu layout
Remote updates
Basic monitoring
Monthly price updates
```

Suggested price:

```text
Setup: $500–$1,000
Monthly: $75–$125
```

### Restaurant Plan

```text
2–4 screens
Food menu
Drink menu
Specials/promos
Scheduled layouts
Remote updates
Monitoring
```

Suggested price:

```text
Setup: $1,000–$2,500
Monthly: $150–$300
```

### Multi-Location Plan

```text
Multiple locations
Centralized control
Location-specific pricing
Seasonal campaigns
Priority support
Monthly reporting
```

Suggested price:

```text
Setup: custom
Monthly: $100–$300 per location
```

---

## 15. AI Tasks to Build This

Tell the AI/devops agent:

```text
Create a complete deployment repository for my Xibo digital menu board service.

The repository should include:

1. /server
   - Docker install notes for Xibo CMS
   - Reverse proxy config
   - Environment variable template
   - Backup script
   - Restore script
   - Upgrade checklist

2. /player
   - Ubuntu/Xubuntu player setup script
   - Auto-login setup instructions
   - Disable sleep script
   - Xibo Player install commands
   - Remote support install placeholder
   - Hostname naming guide

3. /docs
   - Customer onboarding checklist
   - New screen installation checklist
   - Support troubleshooting guide
   - Backup/restore SOP
   - Upgrade SOP
   - Pricing/package template
   - Client naming convention

4. /templates
   - Client folder structure
   - Display group naming
   - Screen naming
   - Menu board layout planning sheet

5. /monitoring
   - Uptime Kuma checks list
   - Alerting rules
   - Display offline response procedure
```

---

## 16. Important Design Decision

Use **one Xibo CMS instance** first.

Inside that one CMS, separate clients using:

```text
Folders
Display Groups
User Groups
Permissions
Naming conventions
```

Later, if a large customer needs full isolation, create a separate CMS instance for them:

```text
menus-client1.yourdomain.com
menus-client2.yourdomain.com
```

This is safer than overcomplicating the first version.

---

## 17. Final AI Prompt You Can Copy

```text
You are helping me build a managed digital menu board service using Xibo CMS.

Build a production-ready plan and deployment repo for a multi-client Xibo service.

Use:
- Ubuntu Server 24.04
- Docker and Docker Compose
- Xibo CMS Docker install
- Domain: menus.example.com
- Linux x86 mini PC players
- Ubuntu/Xubuntu player OS
- Xibo Linux Player
- One mini PC per TV
- Display Groups by client and location
- Folders and permissions to separate clients
- Daily backups
- Uptime monitoring
- Repeatable customer onboarding

Create:
1. Server setup guide
2. Docker deployment guide
3. Reverse proxy/SSL guide
4. Backup and restore scripts
5. Upgrade checklist
6. Player setup script
7. Player golden image checklist
8. New customer onboarding checklist
9. New screen install checklist
10. Naming convention guide
11. Monitoring checklist
12. Troubleshooting guide
13. Service pricing/package template

Important:
- Do not delete existing Xibo data during upgrades.
- Back up shared/cms, database backup, config.env, and compose files.
- Use folders, user groups, and display groups to separate customers.
- Use one Xibo CMS instance first.
- Support future option for one CMS per large client.
- Assume I will sell this as a managed monthly service to restaurants.
```

---

## 18. Recommended Business Standard

Main platform:

```text
Xibo CMS self-hosted
Linux x86 mini PC players
Ubuntu/Xubuntu
One player per TV
Remote support agent
Display groups per client/location
```

Recommended player:

```text
Intel N100/N150 fanless mini PC
8GB RAM minimum
128GB/256GB SSD preferred
Ethernet preferred
HDMI output
```

Acceptable budget/test player:

```text
MeLE PCG35HD N5105
8GB RAM
128GB/256GB storage
```

Avoid making Raspberry Pi the standard for Xibo official player deployments.

---

## 19. Final Recommendation

Start with:

```text
One Xibo CMS instance
One test customer folder
One display group
One Linux x86 mini PC
One test TV
One menu layout
One monitoring check
One backup job
```

After the first test works for several days, create the golden player image and repeat the process for customers.
