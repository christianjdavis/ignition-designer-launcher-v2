# Ignition Designer Launcher v2 - User Guide

Welcome to the Ignition Designer Launcher v2! This application makes it easy to manage and launch multiple Ignition Designer connections from a single interface.

## Table of Contents

- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Managing Gateways](#managing-gateways)
- [Organizing Your Workspace](#organizing-your-workspace)
- [Filtering and Searching](#filtering-and-searching)
- [Customization](#customization)
- [Tips and Tricks](#tips-and-tricks)
- [Troubleshooting](#troubleshooting)

## Getting Started

### First Launch

When you first open the Designer Launcher, you'll see an empty workspace. Let's add your first gateway!

### Adding Your First Gateway

1. Click the **"Add Designer"** button (top right, with a + icon)
2. Fill in the gateway information:
   - **Name**: A friendly name for your gateway (e.g., "Production Main Gateway")
   - **Gateway URL**: The full URL to your gateway (e.g., `http://gateway.example.com:8088`)
   - **Project Name** (optional): Specific project to open automatically
   - **Environment**: Select production, staging, development, or local
   - **Group** (optional): Organize gateways into folders (e.g., "Building 1")
   - **Tags** (optional): Add tags for filtering (e.g., "frontend", "bms")
3. Click **"Save Changes"**

Your gateway will now appear in the main area!

### Launching a Gateway

Click the **"Open Designer"** button on any gateway card. This will launch Ignition Designer and automatically connect to that gateway.

> **Note**: You must have Ignition Designer 8.3 or later installed for deep links to work.

## Interface Overview

### Header Bar

Located at the top of the window:
- **Logo and Title**: Shows "Ignition Designer Launcher"
- **Theme Toggle**: Switch between light, dark, or system theme
- **Info Button**: Shows version and app information
- **Settings Button**: Access application settings

### Sidebar (Left)

The sidebar contains navigation and filtering options:

**Tabs:**
- **All Designers**: Shows all your gateways organized by groups
- **Favorites**: Shows only gateways you've starred
- **Recent**: Shows gateways sorted by most recently opened

**Group By Dropdown:**
Choose how to organize your gateways:
- **None**: Flat list of all gateways
- **Location**: Group by custom folder names
- **Environment**: Group by environment type (Production, Staging, etc.)

**Environment Filter:**
Click environment badges to filter by:
- 🟢 Production (green)
- 🟡 Staging (yellow)
- 🔵 Development (blue)
- 🟠 Local (orange)

**Tags Section:**
- Click any tag to filter gateways by that tag
- Click **Edit** to manage tags (add/delete)
- Add new tags using the input field

### Main Area (Center)

Displays your gateways in either:
- **Grid View**: Cards in a responsive grid
- **List View**: Compact rows with details

Each gateway card shows:
- Gateway name
- URL
- Environment badge (color-coded)
- Tags
- Favorite star (if favorited)
- **Open Designer** button
- Three-dot menu for more options

## Managing Gateways

### Adding Gateways

**Manual Entry:**
1. Click **"Add Designer"** button
2. Fill in details
3. Click **"Save Changes"**

**Import from Ignition:**
1. Click **"Import from Ignition"** button
2. Select a `.json` file exported from Ignition Launcher
3. The app will parse the file and extract:
   - Gateway name and URL
   - Project name (if specified)
   - Environment (auto-detected from URL)
   - Initial tags and groups
4. Review and edit the imported gateway
5. Click **"Save Changes"**

### Editing Gateways

1. Click the three-dot menu on any gateway card
2. Select **"Edit"**
3. Modify any fields
4. Click **"Save Changes"**

### Deleting Gateways

1. Click the three-dot menu on any gateway card
2. Select **"Delete"**
3. Confirm the deletion

### Exporting Gateways

Export individual gateways back to Ignition launcher format:
1. Click the three-dot menu on any gateway card
2. Select **"Export"**
3. A `.json` file will download that can be imported into Ignition Launcher

### Favoriting Gateways

Mark frequently used gateways as favorites:
- Click the three-dot menu and select **"Add to favorites"**
- Or click the star icon on the card
- View all favorites using the **Favorites** tab in the sidebar

## Organizing Your Workspace

### Groups and Folders

Organize gateways into folders:
1. When adding/editing a gateway, enter a **Group** name
2. Choose **Group By → Location** in the sidebar
3. Gateways will be organized into expandable folders

### Folder Controls

When viewing grouped gateways:
- **Expand/Collapse**: Click folder headers to toggle
- **Collapse All / Expand All**: Button in top toolbar (toggles based on current state)
- **Launch All**: Button on each folder header launches all designers in that folder (100ms delay between each)

### Reordering

**Reorder Gateways:**
1. Simply drag any gateway card up or down
2. Drop it in the new position
3. Order is saved automatically

**Reorder Folders:**
1. Click **"Edit Folders"** button (when grouping is enabled)
2. Drag folder headers to reorder
3. Click **"Done"** when finished

**Move Between Folders:**
1. Drag a gateway card
2. Drop it onto a different folder
3. The gateway will be moved to that group

### View Modes

Toggle between two view modes using the buttons in the top toolbar:
- **Grid View** (⊞): Cards in a flexible grid layout
- **List View** (☰): Compact rows with details

Your preference is saved automatically.

## Filtering and Searching

### Quick Filters (Sidebar)

**By Tab:**
- **All Designers**: See everything
- **Favorites**: Only starred gateways
- **Recent**: Sorted by last opened (most recent first)

**By Environment:**
- Click any environment in the sidebar to filter
- Click again to remove the filter
- Multiple environments can be selected

**By Tags:**
- Click any tag in the sidebar to filter
- Click again to remove the filter
- Multiple tags can be selected (shows gateways matching ANY tag)

### Search Bar

Use the search bar at the top to search by:
- Gateway name
- Gateway URL

Search works in combination with other filters.

### Clearing Filters

When filters are active, you'll see filter badges above the gateway list. Click **"Clear all"** to remove all filters at once.

## Customization

### Theme

Change the app's appearance:
1. Click the theme icon in the header (sun/moon/monitor)
2. Select:
   - **Light**: Bright theme for daytime use
   - **Dark**: Dark theme for low-light environments
   - **System**: Automatically matches your OS theme

Your theme preference is saved automatically.

### Tags

Create custom tags to organize your gateways:

**Adding Tags:**
1. Click **Edit** next to "Tags" in the sidebar
2. Type a tag name in the input field
3. Click the **+** button
4. Click **Done**

**Deleting Tags:**
1. Click **Edit** next to "Tags"
2. Click the **X** on any tag
3. Confirm deletion (removes tag from all gateways)
4. Click **Done**

**Assigning Tags:**
1. Edit any gateway
2. In the Tags section, click available tags to toggle them
3. Or type a new tag name and press Enter
4. Click **Save Changes**

## Tips and Tricks

### Keyboard and Mouse

- **Drag and Drop**: Reorder gateways and folders by dragging
- **Click Folder Headers**: Expand/collapse individual folders
- **Three-Dot Menu**: Right-click alternative for gateway actions

### Launching Multiple Designers

Use the **Launch All** button on folder headers to open all designers in a folder at once. The app staggers launches by 100ms to ensure all deep links are processed correctly.

### Recent Tab

The **Recent** tab is perfect for daily workflow:
- Shows all gateways sorted by last access
- Most recently opened appears first
- No grouping - just a flat list

### Import Workflow

If you're migrating from Ignition Launcher:
1. Export each gateway from Ignition Launcher as JSON
2. Import them using the **Import from Ignition** button
3. Review and adjust grouping/tags as needed
4. Delete the original Ignition Launcher shortcuts

### Environment Badges

Use color-coded environment badges to quickly identify gateway types:
- 🟢 **Production**: Live systems
- 🟡 **Staging**: Pre-production testing
- 🔵 **Development**: Development/testing
- 🟠 **Local**: Local development instances

## Troubleshooting

### Gateway Won't Launch

**Problem**: Clicking "Open Designer" does nothing

**Solutions**:
- Verify Ignition Designer 8.3+ is installed
- Check that the `designer://` protocol is registered with your OS
- Try launching Ignition Designer manually first, then try again
- Verify the gateway URL is correct (must include `http://` or `https://`)

### Missing Gateway Data

**Problem**: Gateways disappear after closing the app

**Solutions**:
- **Desktop App**: Check that the app has permission to write to user data directory
- **Web Browser**: Ensure cookies/localStorage are enabled for the site
- Check browser privacy settings (private browsing may clear data on exit)

### Import Not Working

**Problem**: Can't import Ignition launcher JSON files

**Solutions**:
- Ensure the file is valid JSON (open in text editor to verify)
- Check that the file contains the expected Ignition launcher format
- Try importing one gateway at a time instead of batch import
- If all else fails, manually add the gateway using "Add Designer"

### Layout Issues

**Problem**: Cards or folders look wrong

**Solutions**:
- Try switching between Grid and List view
- Toggle grouping off and back on
- Refresh the application
- Resize the window if in desktop app

### Can't Reorder Items

**Problem**: Drag and drop doesn't work

**Solutions**:
- Make sure you're not in "Edit Folders" mode when trying to reorder gateways
- Try clicking and holding before dragging
- Check that grouping is enabled (grouping required for folder operations)

## Getting Help

For additional support or to report issues:
- Contact your system administrator
- Check with your development team
- Review the developer documentation in README.md

---

**Version**: 0.1.0
**Last Updated**: October 2025
