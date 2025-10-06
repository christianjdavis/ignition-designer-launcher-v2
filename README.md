# Ignition Designer Launcher v2

A cross-platform desktop and web application for managing and opening Ignition Designer connections using deep links. Built with Next.js and Electron for a native desktop experience.

## Features

- **Gateway Management** - Add, edit, and organize Ignition gateway connections
- **Deep Link Support** - Launch Ignition Designer 8.3+ directly using the designer:// protocol
- **Filtering & Search** - Filter by favorites, recent, tags, environment, or search by name/URL
- **Recent Tab** - View gateways sorted by most recently opened
- **Grouping** - Organize gateways by custom groups or environment
- **Drag & Drop** - Reorder gateways and move between groups
- **Folder Management** - Collapse/expand all folders, launch all designers in a folder
- **Tag Management** - Create and assign tags to categorize gateways
- **Grid/List Views** - Toggle between card grid and list layouts with persistent preference
- **Favorites** - Star frequently used gateways for quick access
- **Import/Export** - Import from Ignition launcher JSON files and export individual gateway configs
- **Theme Support** - Light, dark, and system theme modes with persistent preference
- **Persistent Storage** - Gateway configurations stored in JSON files (Electron IPC in desktop, localStorage in web)
- **State Persistence** - Remembers your theme, view mode, and opened folders across sessions
- **Cross-Platform** - Works as web app in browser or as native desktop app (Electron)

## Requirements

### Development
- Node.js 18+
- npm or pnpm
- Ignition Designer 8.3 or later installed locally

### Production (Desktop)
- macOS 10.13+, Windows 10+, or Linux (Ubuntu 18.04+)
- Ignition Designer 8.3 or later installed locally

## Installation & Development

```bash
# Install dependencies
npm install

# Run development server (Next.js only, web browser)
npx next dev

# Run Electron app in development mode (with hot reload)
npm run dev

# Build Next.js for production
npm run build

# Build Electron app for current platform
npm run electron:build

# Build macOS DMG
npm run electron:build:mac

# Build Windows installer
npm run electron:build:win

# Build Linux packages
npm run electron:build:linux
```

### Development Mode

The `npm run dev` command starts both the Next.js dev server and Electron concurrently:
- Next.js runs on `http://localhost:3000`
- Electron loads the Next.js dev server automatically
- Hot reload works for both

### Production Builds

Production builds create standalone desktop applications:
- **macOS**: DMG installer and ZIP archive in `dist/`
- **Windows**: NSIS installer and portable EXE in `dist/`
- **Linux**: AppImage and DEB package in `dist/`

### Code Signing

The application supports code signing for both macOS and Windows using local development certificates or production certificates.

**Local Development Signing:**

If you have self-signed certificates at `~/dev/tools/certs/code-signing/`, the build will automatically sign the application.

1. **macOS**: Import certificate to keychain
   ```bash
   security import ~/dev/tools/certs/code-signing/developer-cert.crt -k ~/Library/Keychains/login.keychain-db
   security import ~/dev/tools/certs/code-signing/developer-key.pem -k ~/Library/Keychains/login.keychain-db -T /usr/bin/codesign
   ```

2. **Windows**: Use the converted PFX certificate
   ```bash
   CSC_LINK=~/dev/tools/certs/code-signing/developer-cert.pfx CSC_KEY_PASSWORD="" npm run electron:build:win
   ```

3. **Disable signing** (for quick local builds):
   ```bash
   CSC_IDENTITY_AUTO_DISCOVERY=false npm run electron:build
   ```

**Production Signing:**

For production builds with official certificates:

- **macOS**: Set environment variables for notarization
  ```bash
  export APPLE_ID="your-apple-id@example.com"
  export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
  export APPLE_TEAM_ID="XXXXXXXXXX"
  npm run electron:build:mac
  ```

- **Windows**: Set certificate path and password
  ```bash
  export CSC_LINK="/path/to/certificate.pfx"
  export CSC_KEY_PASSWORD="your-certificate-password"
  npm run electron:build:win
  ```

## Configuration

### Storage Locations

**Electron Desktop App:**
- Gateway configurations stored at: `~/Library/Application Support/designer-launcher-v2/gateways.json` (macOS)
- Custom tags stored at: `~/Library/Application Support/designer-launcher-v2/tags.json` (macOS)
- Windows: `%APPDATA%/designer-launcher-v2/`
- Linux: `~/.config/designer-launcher-v2/`

**Web Browser:**
- Gateway configurations stored in browser localStorage
- Custom tags stored in browser localStorage
- Theme, view mode, and opened folders persisted in localStorage

### Gateway Configuration Format

Gateway configurations contain an array of gateway objects with the following structure:

```json
{
  "id": "1",
  "name": "Gateway Name",
  "url": "http://gateway.example.com:80",
  "project": "ProjectName",
  "status": "online",
  "environment": "production",
  "tags": ["tag1", "tag2"],
  "isFavorite": false,
  "lastAccessed": "2025-09-30T21:30:51.985Z",
  "group": "Group Name",
  "order": 1
}
```

**Gateway Configuration Fields:**

- **id** - Unique identifier for the gateway
- **name** - Display name for the gateway
- **url** - HTTP/HTTPS URL to the gateway
- **project** - (Optional) Specific project to open
- **status** - Gateway status: "online" or "offline" (currently not used for display)
- **environment** - Environment type: "production", "staging", "development", or "local"
- **tags** - Array of tags for filtering and organization
- **isFavorite** - Boolean flag for favorite gateways
- **lastAccessed** - Date and time of last access (ISO 8601 timestamp)
- **group** - (Optional) Group name for organization
- **order** - Sort order within groups

### Custom Tags Configuration

Custom tags allow you to create tags that aren't yet assigned to any gateway. Stored as an array of strings:

```json
[
  "custom-tag-1",
  "custom-tag-2",
  "custom-tag-3"
]
```

### Import/Export

The application supports importing gateway configurations from Ignition's native launcher format:
- Click **Import from Ignition** button
- Select a `.json` file exported from Ignition Launcher
- The app will parse both single gateway and multiple gateway formats
- Automatically detects environment from URL patterns
- Extracts project name from JVM arguments

Individual gateways can be exported back to Ignition launcher format via the dropdown menu on each card.

## Deep Link Format

The application generates Ignition Designer deep links in the following format:

- **With project**: `designer://hostname/projectName?insecure=true`
- **Without project**: `designer://hostname?insecure=true`

The `insecure=true` parameter is automatically added for HTTP gateways.

## Usage

See [USER_GUIDE.md](USER_GUIDE.md) for detailed end-user documentation.

### Quick Start

1. **Add a Gateway**: Click "Add Designer" button → Fill in details → Save
2. **Open Designer**: Click "Open Designer" on any gateway card to launch
3. **Filter**: Use sidebar tabs (All/Favorites/Recent) and tag filters
4. **Organize**: Drag and drop to reorder, use "Edit Folders" to rearrange groups
5. **Launch Multiple**: Click "Launch All" on any folder to open all designers in sequence

### Key Features for Developers

**Folder Management:**
- Collapse/Expand All button when grouping is enabled
- Launch All button on each folder with staggered 100ms delays to prevent OS issues
- Edit Folders mode for reordering groups via drag and drop

**State Persistence:**
- Theme preference (light/dark/system) - persisted via next-themes
- View mode (grid/list) - persisted to localStorage
- Opened folders - persisted to localStorage
- All preferences persist across app restarts

**Drag & Drop:**
- Reorder designers within groups
- Move designers between groups
- Reorder entire folders (in Edit Folders mode)

**Import/Export:**
- Import single or multiple gateway configurations from Ignition launcher JSON
- Export individual gateways to Ignition launcher format

## Project Structure

```
designer-launcher-v2/
├── app/
│   ├── api/
│   │   ├── check-status/route.ts  # Gateway status check API (not currently used)
│   │   ├── gateways/route.ts      # Gateway CRUD API (web only)
│   │   └── tags/route.ts          # Custom tags API (web only)
│   ├── page.tsx                    # Main application page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # Reusable UI components (Radix + shadcn/ui)
│   └── theme-provider.tsx          # Theme provider wrapper
├── lib/
│   ├── storage.ts                  # Storage abstraction (Electron IPC vs localStorage)
│   └── utils.ts                    # Utility functions
├── electron/
│   ├── main.js                     # Electron main process
│   └── preload.js                  # Electron preload script (IPC bridge)
├── scripts/
│   └── fix-paths.js                # Post-build script to fix static export paths
├── public/
│   └── launcher.png                # Application icon
├── out/                            # Next.js static export output (gitignored)
├── dist/                           # Electron build output (gitignored)
├── next.config.mjs                 # Next.js configuration (static export)
├── package.json                    # Dependencies and build scripts
└── README.md                       # This file
```

## Architecture

### Storage Abstraction Layer

The `lib/storage.ts` module provides a unified interface for data persistence:

```typescript
// Automatically detects environment and uses appropriate storage
export async function getGateways(): Promise<Designer[]>
export async function saveGateways(gateways: Designer[]): Promise<void>
export async function getTags(): Promise<string[]>
export async function saveTags(tags: string[]): Promise<void>
```

**Desktop (Electron):**
- Uses IPC communication via preload script
- Data stored in user data directory (app.getPath('userData'))
- Preload script exposes `window.electronAPI` with IPC handlers

**Web (Browser):**
- Falls back to localStorage when Electron API is unavailable
- Data stored as JSON strings in browser localStorage

### Electron Integration

**Main Process (`electron/main.js`):**
- Creates browser window with appropriate security settings
- Handles file I/O for gateway and tag data
- Loads static HTML in production or dev server in development
- IPC handlers: `get-gateways`, `save-gateways`, `get-tags`, `save-tags`

**Preload Script (`electron/preload.js`):**
- Exposes safe IPC methods to renderer via contextBridge
- Provides `isElectron` flag for environment detection

**Static Export:**
- Next.js builds to `out/` directory as static HTML/JS/CSS
- Post-build script (`scripts/fix-paths.js`) converts absolute paths to relative
- Electron loads `out/index.html` via file:// protocol

### State Management

- React hooks (`useState`, `useEffect`) for component state
- localStorage for persistence (theme, viewMode, openFolders)
- next-themes for theme management with system preference support

## Technology Stack

- **Next.js 14.2** - React framework with static export
- **TypeScript 5** - Type safety
- **Electron 38** - Cross-platform desktop framework
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible UI primitives (Accordion, Dialog, Dropdown, etc.)
- **Lucide React** - Icon library
- **next-themes** - Theme management with system preference support
- **electron-builder** - Package and distribute Electron apps
- **class-variance-authority** - Component variant API
- **concurrently** - Run multiple commands in development

## Development Notes

### Path Handling

The app uses a post-build script to convert Next.js absolute paths to relative paths for Electron:
- `/launcher.png` → `./launcher.png`
- `/_next/...` → `./_next/...`

This ensures assets load correctly with the file:// protocol.

### Deep Link Protocol

The `designer://` protocol must be registered by Ignition Designer 8.3+ on the system. The app generates links but relies on OS association to launch the Designer application.

### Staggered Launches

The "Launch All" feature uses staggered setTimeout delays (100ms) to prevent the OS from only registering the last deep link when multiple designers are launched rapidly.

## Troubleshooting

**Logo not displaying in Electron:**
- Ensure `launcher.png` path is relative (`./launcher.png`) not absolute (`/launcher.png`)

**Designers not launching:**
- Verify Ignition Designer 8.3+ is installed and has registered the `designer://` protocol
- Check that the gateway URL is correctly formatted with protocol (http:// or https://)

**Data not persisting:**
- **Electron**: Check user data directory permissions
- **Web**: Ensure browser allows localStorage for the site

**Build fails:**
- Clear `out/` and `dist/` directories and rebuild
- Verify all dependencies are installed: `npm install`

## Contributing

This is an internal project. For feature requests or bug reports, contact the development team.

## License

Proprietary
