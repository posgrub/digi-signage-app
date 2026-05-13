#!/usr/bin/env bash
# =============================================================================
# Xibo Linux Player Setup Script
# Run on a fresh Ubuntu/Xubuntu Desktop install on an Intel N100/N150 mini PC
#
# Usage: sudo bash setup-player.sh
# =============================================================================
set -euo pipefail

# --- Configuration (edit before running) ---
SIGNAGE_USER="signage"
SIGNAGE_PASSWORD="changeme123"  # Change this!
HOSTNAME_PREFIX=""              # e.g., "vida-katy-food-menu" — set per device
CMS_URL=""                      # e.g., "https://menus.poseztech.com"
TIMEZONE="America/Chicago"

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "${GREEN}[STEP]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# --- Pre-checks ---
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root (sudo)."
    exit 1
fi

# Prompt for required values if not set
if [[ -z "$HOSTNAME_PREFIX" ]]; then
    read -p "Enter hostname (e.g., vida-katy-food-menu): " HOSTNAME_PREFIX
fi
if [[ -z "$CMS_URL" ]]; then
    read -p "Enter CMS URL (e.g., https://menus.poseztech.com): " CMS_URL
fi

echo "=== Xibo Player Setup ==="
echo "Hostname:  $HOSTNAME_PREFIX"
echo "CMS URL:   $CMS_URL"
echo "Timezone:  $TIMEZONE"
echo "========================="

# --- Step 1: System Updates ---
step "Updating system packages..."
apt update && apt upgrade -y

# --- Step 2: Set Timezone ---
step "Setting timezone to $TIMEZONE..."
timedatectl set-timezone "$TIMEZONE"

# --- Step 3: Set Hostname ---
step "Setting hostname to $HOSTNAME_PREFIX..."
hostnamectl set-hostname "$HOSTNAME_PREFIX"

# --- Step 4: Create Signage User ---
if id "$SIGNAGE_USER" &>/dev/null; then
    warn "User $SIGNAGE_USER already exists, skipping creation."
else
    step "Creating signage user..."
    adduser --gecos "" --disabled-password "$SIGNAGE_USER"
    echo "$SIGNAGE_USER:$SIGNAGE_PASSWORD" | chpasswd
    usermod -aG sudo "$SIGNAGE_USER"
fi

# --- Step 5: Enable Auto-Login ---
step "Enabling auto-login for $SIGNAGE_USER..."

# GDM3 (Ubuntu default)
if [[ -f /etc/gdm3/custom.conf ]]; then
    sed -i "s/^#.*AutomaticLoginEnable.*/AutomaticLoginEnable=true/" /etc/gdm3/custom.conf
    sed -i "s/^#.*AutomaticLogin =.*/AutomaticLogin=$SIGNAGE_USER/" /etc/gdm3/custom.conf
    # If lines don't exist, add them
    if ! grep -q "AutomaticLoginEnable" /etc/gdm3/custom.conf; then
        sed -i "/\[daemon\]/a AutomaticLoginEnable=true\nAutomaticLogin=$SIGNAGE_USER" /etc/gdm3/custom.conf
    fi
fi

# LightDM (Xubuntu)
if [[ -f /etc/lightdm/lightdm.conf ]] || dpkg -l | grep -q lightdm; then
    mkdir -p /etc/lightdm/lightdm.conf.d
    cat > /etc/lightdm/lightdm.conf.d/50-autologin.conf <<EOF
[Seat:*]
autologin-user=$SIGNAGE_USER
autologin-user-timeout=0
EOF
fi

# --- Step 6: Disable Screen Sleep/Blanking/Lock ---
step "Disabling screen sleep, blanking, and lock screen..."

# Run as signage user for gsettings
sudo -u "$SIGNAGE_USER" bash -c '
    export DISPLAY=:0
    # GNOME
    gsettings set org.gnome.desktop.session idle-delay 0 2>/dev/null || true
    gsettings set org.gnome.desktop.screensaver lock-enabled false 2>/dev/null || true
    gsettings set org.gnome.desktop.screensaver idle-activation-enabled false 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type "nothing" 2>/dev/null || true
    gsettings set org.gnome.settings-daemon.plugins.power idle-dim false 2>/dev/null || true
    # XFCE
    xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/dpms-enabled -s false 2>/dev/null || true
    xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/blank-on-ac -s 0 2>/dev/null || true
    xfconf-query -c xfce4-screensaver -p /saver/enabled -s false 2>/dev/null || true
'

# Disable via systemd as well
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target 2>/dev/null || true

# --- Step 7: Install Xibo Player ---
step "Installing Xibo Player via snap..."
apt install -y snapd
snap install xibo-player --channel=stable

# --- Step 8: Install Remote Support (RustDesk) ---
step "Installing remote support agent..."
# RustDesk — download latest .deb
RUSTDESK_VERSION="1.3.7"
RUSTDESK_DEB="rustdesk-${RUSTDESK_VERSION}-x86_64.deb"
if ! command -v rustdesk &>/dev/null; then
    wget -q "https://github.com/rustdesk/rustdesk/releases/download/${RUSTDESK_VERSION}/${RUSTDESK_DEB}" -O "/tmp/${RUSTDESK_DEB}" || warn "RustDesk download failed — install manually"
    dpkg -i "/tmp/${RUSTDESK_DEB}" 2>/dev/null || apt install -f -y
    rm -f "/tmp/${RUSTDESK_DEB}"
else
    warn "RustDesk already installed."
fi

# --- Step 9: Install useful utilities ---
step "Installing utilities..."
apt install -y curl wget htop net-tools chromium-browser 2>/dev/null || apt install -y curl wget htop net-tools

# --- Step 10: Configure unattended upgrades (security only) ---
step "Configuring unattended security updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

# --- Step 11: Create autostart for Xibo Player ---
step "Setting up Xibo Player autostart..."
AUTOSTART_DIR="/home/$SIGNAGE_USER/.config/autostart"
mkdir -p "$AUTOSTART_DIR"
cat > "$AUTOSTART_DIR/xibo-player.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Xibo Player
Exec=snap run xibo-player
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF
chown -R "$SIGNAGE_USER:$SIGNAGE_USER" "$AUTOSTART_DIR"

# --- Summary ---
echo ""
echo "=== Setup Complete ==="
echo "Hostname:       $HOSTNAME_PREFIX"
echo "Signage user:   $SIGNAGE_USER"
echo "Auto-login:     Enabled"
echo "Screen sleep:   Disabled"
echo "Xibo Player:    Installed (snap)"
echo "Remote support: RustDesk"
echo ""
echo "=== Next Steps ==="
echo "1. Reboot: sudo reboot"
echo "2. Open Xibo Player and configure:"
echo "   CMS URL: $CMS_URL"
echo "   CMS Key: (from Xibo CMS settings)"
echo "   Display Name: $(echo "$HOSTNAME_PREFIX" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')"
echo "3. Authorize the display in Xibo CMS"
echo "4. Assign to display group"
echo "5. Set BIOS: auto power recovery ON"
echo "6. Configure RustDesk ID/password for remote access"
