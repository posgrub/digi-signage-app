# Customer Onboarding Checklist

## Information Gathering

- [ ] Restaurant name
- [ ] Location address(es)
- [ ] Wi-Fi or Ethernet availability at each location
- [ ] Number of screens per location
- [ ] Screen orientation: landscape or portrait
- [ ] Menu categories (food, drinks, specials, etc.)
- [ ] Menu prices (provided as spreadsheet, PDF, or photos)
- [ ] Logo and branding assets (vector preferred)
- [ ] Operating hours
- [ ] Breakfast/lunch/dinner schedule (if applicable)
- [ ] Happy hour schedule (if applicable)
- [ ] Who can request changes (name, email, phone)
- [ ] Emergency contact

## CMS Setup

- [ ] Create client folder: `/Clients/Client - {Name}`
- [ ] Create location folder(s): `/Clients/Client - {Name}/Location - {City}`
- [ ] Create sub-folders per location: Layouts, Media, Playlists, Schedules
- [ ] Create user group: `{Client Name} Users`
- [ ] Create client manager user account
- [ ] Set folder permissions — client can only see their own folder
- [ ] Create display group: `{Client Name} - All Locations`
- [ ] Create location display groups: `{Client Name} - {Location}`

## Content Creation

- [ ] Design menu layout(s) using client branding
- [ ] Upload menu assets (images, logos, fonts)
- [ ] Create playlists if using rotating content
- [ ] Schedule layouts to correct display groups
- [ ] Test layouts in CMS preview

## Player Deployment

Per screen:
- [ ] Prepare mini PC (clone golden image or run setup script)
- [ ] Set hostname: `{client}-{location}-{screen-type}`
- [ ] Connect to network (Ethernet preferred)
- [ ] Configure Xibo Player with CMS URL and key
- [ ] Set display name: `{Client} - {Location} - {Screen Type}`
- [ ] Install at restaurant, connect to TV via HDMI
- [ ] Authorize display in Xibo CMS
- [ ] Assign display to correct display group
- [ ] Assign default layout
- [ ] Verify content displays correctly on TV
- [ ] Configure RustDesk for remote access
- [ ] Record RustDesk ID in client records

## Testing

- [ ] Reboot mini PC — content resumes automatically
- [ ] Unplug Ethernet — content continues from cache
- [ ] Reconnect Ethernet — player checks in and syncs
- [ ] Power cycle — content resumes after boot
- [ ] Verify scheduled content switches at correct times

## Handoff

- [ ] Train client on requesting menu changes
- [ ] Provide client login credentials
- [ ] Show client how to view display status (if viewer access granted)
- [ ] Document support contact process
- [ ] Add client to billing (monthly service)
- [ ] Send welcome email with:
  - CMS login URL
  - Their username/password
  - Support contact info
  - How to request menu updates
