# New Screen Installation Checklist

## Pre-Install

- [ ] Confirm client, location, and screen type
- [ ] Confirm network availability (Ethernet port or Wi-Fi credentials)
- [ ] Confirm TV model and HDMI input
- [ ] Prepare mini PC (golden image clone or fresh setup)
- [ ] Verify layout is ready in Xibo CMS
- [ ] Verify display group exists for this location

## Device Naming

Format: `CLIENT - LOCATION - SCREEN TYPE`

Examples:
- Vida - Katy - Food Menu
- Vida - Katy - Bar Menu
- Taco Shop ABC - Main - Promo

Hostname format (lowercase, dashes): `vida-katy-food-menu`

## On-Site Installation

- [ ] Mount or place mini PC near TV (ventilation, hidden from view)
- [ ] Connect HDMI cable to TV
- [ ] Connect Ethernet cable (preferred) or configure Wi-Fi
- [ ] Connect power
- [ ] Boot mini PC — verify auto-login
- [ ] Open Xibo Player settings:
  - CMS URL: `https://menus.poseztech.com`
  - CMS Key: *(from CMS settings)*
  - Display Name: `{Client} - {Location} - {Screen Type}`
- [ ] Save and let player register with CMS

## CMS Authorization

- [ ] Log into Xibo CMS
- [ ] Go to Displays → find the new display (pending authorization)
- [ ] Authorize the display
- [ ] Assign to display group: `{Client} - {Location}`
- [ ] Set default layout
- [ ] Verify display status shows "Online"

## Verification

- [ ] Content displays correctly on TV
- [ ] Correct layout is showing
- [ ] Colors/fonts render properly
- [ ] No black bars or scaling issues
- [ ] Test power cycle — content resumes
- [ ] Test network disconnect — cached content plays
- [ ] RustDesk remote access works

## Documentation

- [ ] Record in client spreadsheet:
  - Display name
  - Hostname
  - RustDesk ID
  - TV model/location in restaurant
  - Install date
  - Network type (Ethernet/Wi-Fi)
