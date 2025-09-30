# Ignition Designer Launcher

A web-based launcher application for managing and opening Ignition Designer connections using deep links.

## Features

- **Gateway Management** - Add, edit, and organize Ignition gateway connections
- **Deep Link Support** - Launch Ignition Designer 8.3+ directly from the browser
- **Filtering & Search** - Filter by favorites, recent, tags, environment, or search by name/URL
- **Recent Tab** - View gateways sorted by most recently opened
- **Grouping** - Organize gateways by custom groups or environment
- **Drag & Drop** - Reorder gateways and move between groups
- **Tag Management** - Create and assign tags to categorize gateways (stored in custom-tags.json)
- **Grid/List Views** - Toggle between card grid and list layouts
- **Favorites** - Star frequently used gateways for quick access
- **Persistent Storage** - Gateway configurations and custom tags stored in JSON files

## Requirements

- Node.js 18+
- Ignition Designer 8.3 or later installed locally
- Next.js 14.2+

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

## Configuration

### Gateway Configuration

Gateway configurations are stored in `gateways.json` at the project root. The file contains an array of gateway objects with the following structure:

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

Custom tags are stored in `custom-tags.json` at the project root. This allows you to create tags that aren't yet assigned to any gateway:

```json
[
  "custom-tag-1",
  "custom-tag-2",
  "custom-tag-3"
]
```

Both `gateways.json` and `custom-tags.json` are excluded from git (see `.gitignore`). Example files are provided:
- `gateways.json.example`
- `custom-tags.json.example`

## Deep Link Format

The application generates Ignition Designer deep links in the following format:

- **With project**: `designer://hostname/projectName?insecure=true`
- **Without project**: `designer://hostname?insecure=true`

The `insecure=true` parameter is automatically added for HTTP gateways.

## Usage

### Adding a Gateway

1. Click the **"Add Designer"** button in the header
2. Fill in the gateway details:
   - Name
   - URL (including http:// or https://)
   - Project name (optional)
   - Environment
   - Group (optional)
   - Tags (optional)
3. Click **"Save Changes"**

### Opening a Gateway

Click the **"Open Designer"** button on any gateway card. This will launch the Ignition Designer application with the configured gateway connection.

### Managing Tags

- Click **"Edit Tags"** in the sidebar to enter tag management mode
- Add new tags using the input field and plus button
- Delete tags by clicking the X button (requires confirmation)
- Click tags to filter gateways

### Filtering

- **All Designers** - Show all gateways organized by groups
- **Favorites** - Show only starred gateways
- **Recent** - Show gateways sorted by most recently opened (flat list, no grouping)
- **Tags** - Click tags in the sidebar to filter
- **Environments** - Filter by environment badges
- **Search** - Search by gateway name or URL

### Organizing

- **Drag & Drop** - Drag gateways to reorder or move between groups
- **Group By** - Toggle grouping by custom groups, environment, or none
- **View Mode** - Switch between grid cards and list view

## Project Structure

```
designer-launcher-v2/
├── app/
│   ├── api/
│   │   ├── check-status/route.ts  # Gateway status check API (not currently used)
│   │   ├── gateways/route.ts      # Gateway CRUD API
│   │   └── tags/route.ts          # Custom tags API
│   ├── page.tsx                    # Main application page
│   └── layout.tsx                  # Root layout
├── components/
│   └── ui/                         # Reusable UI components
├── public/
│   └── launcher.png                # Application icon
├── gateways.json                   # Gateway configuration file (gitignored)
├── gateways.json.example           # Example gateway configuration
├── custom-tags.json                # Custom tags file (gitignored)
├── custom-tags.json.example        # Example custom tags
└── README.md
```

## API Routes

### GET `/api/gateways`
Returns all gateway configurations from `gateways.json`

### POST `/api/gateways`
Saves gateway configurations to `gateways.json`

**Request body**: Array of gateway objects

### GET `/api/tags`
Returns all custom tags from `custom-tags.json`

### POST `/api/tags`
Saves custom tags to `custom-tags.json`

**Request body**: Array of tag strings

### POST `/api/check-status` (not currently used)
Checks if a gateway URL is accessible

**Request body**: `{ "url": "http://gateway.example.com" }`
**Response**: `{ "online": true }`

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icons
- **class-variance-authority** - Component variants

## License

Open Source
