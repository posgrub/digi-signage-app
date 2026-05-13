# Golden Image Checklist

Create one perfect player image, then clone it for all new deployments.

## Base Image Requirements

- [ ] Ubuntu Desktop 24.04 LTS or Xubuntu 24.04 LTS installed
- [ ] All system updates applied
- [ ] Timezone set to America/Chicago (or client timezone)
- [ ] `signage` user created
- [ ] Auto-login enabled for `signage` user
- [ ] Screen sleep disabled
- [ ] Screen blanking disabled
- [ ] Lock screen disabled
- [ ] Suspend/hibernate disabled via systemd

## Software Installed

- [ ] Xibo Player (snap, stable channel)
- [ ] RustDesk (or chosen remote support agent)
- [ ] Chromium browser (fallback/diagnostics)
- [ ] curl, wget, htop, net-tools
- [ ] Unattended security upgrades enabled

## Xibo Player Configured

- [ ] Xibo Player launches on boot (autostart desktop entry)
- [ ] Test layout confirmed displaying correctly
- [ ] Player connects to CMS and checks in

## Verified Behaviors

- [ ] Auto-login works after reboot
- [ ] Xibo Player starts automatically after reboot
- [ ] No screen sleep after 30 minutes idle
- [ ] No lock screen appears
- [ ] Content resumes after simulated internet outage
- [ ] Content resumes after simulated power loss
- [ ] Remote support connects successfully

## Create the Image

```bash
# Option 1: Clonezilla USB
# Boot from Clonezilla USB → device-image → savedisk

# Option 2: dd (if same hardware)
sudo dd if=/dev/sda bs=4M status=progress | gzip > golden-image-xibo.img.gz

# Restore:
gunzip -c golden-image-xibo.img.gz | sudo dd of=/dev/sda bs=4M status=progress
```

## Per-Device Customization After Cloning

- [ ] Change hostname: `sudo hostnamectl set-hostname <client-location-screen>`
- [ ] Connect to network (Ethernet preferred)
- [ ] Open Xibo Player → enter CMS URL and key
- [ ] Set display name: `Client - Location - Screen Type`
- [ ] Authorize display in Xibo CMS
- [ ] Assign to correct display group
- [ ] Assign default layout
- [ ] Configure RustDesk ID/password
- [ ] Test reboot
- [ ] Test internet loss recovery
- [ ] Test power loss recovery
