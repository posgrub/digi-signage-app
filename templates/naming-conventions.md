# Naming Conventions

Consistent naming is critical for managing multiple clients across Xibo CMS.

## Universal Format

```
CLIENT - LOCATION - SCREEN TYPE
```

## CMS Folder Structure

```
/Clients
    /Client - {Name}
        /Location - {City or Label}
            /Layouts
            /Media
            /Playlists
            /Schedules
```

### Examples

```
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

## Display Names

Format: `{Client} - {Location} - {Screen Type}`

```
Vida - Katy - Food Menu
Vida - Katy - Bar Menu
Vida - Katy - Specials
Vida - Houston - Food Menu
Taco Shop ABC - Main - Menu
Taco Shop ABC - Main - Promo
```

## Display Groups

```
{Client} - All Locations        (parent group)
{Client} - {Location}           (location group)
```

### Examples

```
Vida - All Locations
Vida - Katy
Vida - Houston

Taco Shop ABC - All Locations
Taco Shop ABC - Main
```

## Layout Names

```
{Client} - {Location} - {Content Type} Layout
```

### Examples

```
Vida - Katy - Food Menu Layout
Vida - Katy - Drink Menu Layout
Vida - Houston - Specials Layout
```

## Hostnames (Player Devices)

Lowercase, dashes, no spaces:

```
{client}-{location}-{screen-type}
```

### Examples

```
vida-katy-food-menu
vida-katy-bar-menu
vida-houston-food-menu
taco-shop-abc-main-menu
```

## User Groups

```
{Client} Users
```

### Examples

```
Vida Users
Taco Shop ABC Users
```

## User Accounts

```
{client}.{role}@poseztech.com   (internal)
{firstname}@{client-domain}     (client users)
```

## Schedule Events

```
{Client} - {Location} - {Content Type} - {Time Period}
```

### Examples

```
Vida - Katy - Lunch Menu - 11am-3pm
Vida - Katy - Dinner Menu - 3pm-Close
Vida - All - Holiday Promo - Dec 20-25
```
