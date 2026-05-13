# Display Offline Response Procedure

## When a Display Goes Offline

### Step 1: Verify (0–5 minutes)

- [ ] Check Xibo CMS → Displays → confirm display shows as offline
- [ ] Note last check-in time
- [ ] Check if other displays at same location are also offline (network issue vs single device)

### Step 2: Remote Diagnosis (5–15 minutes)

- [ ] Try RustDesk connection to the player
  - If connects: check Xibo Player status, restart if needed
  - If doesn't connect: likely network or power issue
- [ ] Ping the device IP (if on VPN/same network)
- [ ] Check if the location's internet is down (other displays offline = network issue)

### Step 3: Contact Client (15–30 minutes)

If remote access fails:
- [ ] Call/text the on-site contact
- [ ] Ask them to check:
  - Is the TV on and showing anything?
  - Is the mini PC power LED on?
  - Is the Ethernet cable plugged in?
  - Did anything change (power outage, construction, moved equipment)?
- [ ] Guide them through a power cycle if needed:
  1. Unplug mini PC power
  2. Wait 10 seconds
  3. Plug back in
  4. Wait 2 minutes for boot

### Step 4: Resolution

| Root Cause | Fix |
|-----------|-----|
| Power outage | Wait for power restore; BIOS auto-power-on should restart device |
| Network outage | Wait for ISP; content plays from cache during outage |
| Mini PC frozen | Remote or on-site power cycle |
| Xibo Player crashed | Restart snap: `snap restart xibo-player` |
| HDMI disconnected | On-site: reconnect cable |
| TV powered off | On-site: power on TV, check correct input |
| Hardware failure | Ship replacement device, swap on-site |

### Step 5: Post-Incident

- [ ] Verify display shows as online in CMS
- [ ] Verify correct content is displaying
- [ ] Document incident in client record
- [ ] If recurring: investigate root cause (bad power, flaky network, failing hardware)

## Response Time Targets

| Client Plan | First Response | Resolution Target |
|------------|---------------|-------------------|
| Starter | Next business day | 48 hours |
| Restaurant | Same day | 24 hours |
| Multi-Location | 4 hours | 8 hours |
