"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import * as storage from "@/lib/storage"
import {
  Search,
  Grid3x3,
  List,
  Plus,
  Settings,
  Info,
  Star,
  Folder,
  Clock,
  Power,
  Circle,
  MoreVertical,
  ChevronDown,
  X,
  GripVertical,
  Edit3,
  Check,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  Download,
  Play,
  Copy,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ViewMode = "grid" | "list"
type FilterTab = "all" | "favorites" | "recent"

interface Designer {
  id: string
  name: string
  url: string
  urls?: { // Multiple environment URLs
    production?: string
    staging?: string
    development?: string
    local?: string
  }
  project?: string // Project name for designer deep link
  status: "online" | "offline"
  environment: "production" | "staging" | "development" | "local"
  tags: string[]
  isFavorite: boolean
  lastAccessed: Date
  group?: string // Deprecated - for backward compatibility
  folderPath?: string // Hierarchical folder path like "Building 1/Production"
  order?: number // Added order field for sorting within groups
}

const mockDesigners: Designer[] = [
  {
    id: "1",
    name: "B2-FE-P",
    url: "http://frontend.ludicrous-2.orb.local:80",
    status: "online",
    environment: "production",
    tags: ["frontend", "building-2"],
    isFavorite: true,
    lastAccessed: new Date("2025-01-15"),
    group: "Building 2",
    order: 1,
  },
  {
    id: "2",
    name: "ABI-2C-BMS",
    url: "http://WING-C-BMS.ludicrous-2.orb.loc...",
    status: "online",
    environment: "production",
    tags: ["bms", "wing-c"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-14"),
    group: "Building ABI",
    order: 2,
  },
  {
    id: "3",
    name: "ABI-2C-EPMS1",
    url: "http://WING-C-EPMS1.ludicrous-2.orb.l...",
    status: "offline",
    environment: "production",
    tags: ["epms", "wing-c"],
    isFavorite: true,
    lastAccessed: new Date("2025-01-13"),
    group: "Building ABI",
    order: 3,
  },
  {
    id: "4",
    name: "B1-FE-P Staging",
    url: "http://B1-FE-P.staging.const.local:80",
    status: "online",
    environment: "staging",
    tags: ["frontend", "building-1"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-16"),
    group: "Building 1",
    order: 4,
  },
  {
    id: "5",
    name: "1A-EPMS2",
    url: "http://1a-epms2.wing-a.const.local:80",
    status: "online",
    environment: "production",
    tags: ["epms", "wing-a"],
    isFavorite: true,
    lastAccessed: new Date("2025-01-15"),
    group: "Building 1A",
    order: 5,
  },
  {
    id: "6",
    name: "B1-FE-P (C-D)",
    url: "http://b1-fe.p.prod-c.const.local:80",
    status: "online",
    environment: "production",
    tags: ["frontend", "building-1"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-12"),
    group: "Building 1",
    order: 6,
  },
  {
    id: "7",
    name: "1A-BMS Prod",
    url: "http://1A-BMS.wing-a.const.local:80",
    status: "online",
    environment: "production",
    tags: ["bms", "wing-a"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-11"),
    group: "Building 1A",
    order: 7,
  },
  {
    id: "8",
    name: "1A-BMS (Local)",
    url: "http://1A-BMS.ludicrous-1.orb.local:80",
    status: "offline",
    environment: "local",
    tags: ["bms", "wing-a"],
    isFavorite: true,
    lastAccessed: new Date("2025-01-10"),
    group: "Building 1A",
    order: 8,
  },
  {
    id: "9",
    name: "B1-FE-P Local",
    url: "http://frontend.ludicrous-1.orb.local:80",
    status: "online",
    environment: "local",
    tags: ["frontend", "building-1"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-17"),
    group: "Building 1",
    order: 9,
  },
  {
    id: "10",
    name: "tag-cicd",
    url: "http://gateway.tag-cicd.orb.local:80",
    status: "online",
    environment: "development",
    tags: ["cicd", "testing"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-09"),
    group: "Development",
    order: 10,
  },
  {
    id: "11",
    name: "2C-EPMS1",
    url: "http://epms1.wing-c.b2.const.local:80",
    status: "online",
    environment: "production",
    tags: ["epms", "wing-c"],
    isFavorite: false,
    lastAccessed: new Date("2025-01-08"),
    group: "Building 2",
    order: 11,
  },
  {
    id: "12",
    name: "2C-BMS",
    url: "http://bms.wing-c.b2.const.local:80",
    status: "online",
    environment: "production",
    tags: ["bms", "wing-c"],
    isFavorite: true,
    lastAccessed: new Date("2025-01-16"),
    group: "Building 2",
    order: 12,
  },
]

export default function IgnitionLauncher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if a gateway is online using backend API
  const checkGatewayStatus = async (url: string): Promise<boolean> => {
    try {
      console.log('Checking status for:', url)
      const response = await fetch('/api/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      console.log(`Status for ${url}:`, data.online)
      return data.online
    } catch (error) {
      console.error(`Error checking ${url}:`, error)
      return false // Gateway is offline or unreachable
    }
  }

  // Update status of all gateways - uses functional update to avoid stale closure
  const updateGatewayStatuses = async () => {
    setDesigners((currentDesigners) => {
      // Start checking all gateways in parallel
      Promise.all(
        currentDesigners.map(async (designer) => {
          const isOnline = await checkGatewayStatus(designer.url)
          return { id: designer.id, status: isOnline ? 'online' : 'offline' as const }
        })
      ).then((statuses) => {
        // Update with results
        setDesigners((prev) =>
          prev.map((d) => {
            const statusUpdate = statuses.find((s) => s.id === d.id)
            return statusUpdate ? { ...d, status: statusUpdate.status } : d
          })
        )
      })

      // Return current state immediately
      return currentDesigners
    })
  }

  // Load gateways and custom tags from JSON files
  useEffect(() => {
    // Load gateways
    storage.getGateways()
      .then(async (data) => {
        const loadedDesigners = data.map((d: any) => ({
          ...d,
          lastAccessed: new Date(d.lastAccessed),
        }))
        setDesigners(loadedDesigners)
        setLoading(false)

        // Initial status check - DISABLED
        // const statusChecks = loadedDesigners.map(async (designer: Designer) => {
        //   const isOnline = await checkGatewayStatus(designer.url)
        //   return { id: designer.id, status: isOnline ? 'online' : 'offline' }
        // })

        // const statuses = await Promise.all(statusChecks)

        // Update designer statuses
        // setDesigners((prev) =>
        //   prev.map((d) => {
        //     const statusUpdate = statuses.find((s) => s.id === d.id)
        //     return statusUpdate ? { ...d, status: statusUpdate.status as 'online' | 'offline' } : d
        //   }),
        // )
      })
      .catch((error) => {
        console.error('Failed to load gateways:', error)
        // Fallback to mock data if JSON fails to load
        setDesigners(mockDesigners)
        setLoading(false)
      })

    // Load custom tags
    storage.getTags()
      .then((tags) => {
        setCustomTags(tags)
      })
      .catch((error) => {
        console.error('Failed to load custom tags:', error)
      })
  }, [])

  // Auto-refresh gateway statuses every 30 seconds - DISABLED
  // useEffect(() => {
  //   if (designers.length === 0) return

  //   const interval = setInterval(() => {
  //     updateGatewayStatuses()
  //   }, 30000) // 30 seconds

  //   return () => clearInterval(interval)
  // }, [designers.length])
  const [draggedDesigner, setDraggedDesigner] = useState<Designer | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)
  const [dragOverDesigner, setDragOverDesigner] = useState<string | null>(null) // Track which designer is being hovered over
  const [editMode, setEditMode] = useState(false)
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null)
  const [renamingFolderValue, setRenamingFolderValue] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const groupBy = "group" // Always group by location/folder
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [editTagsMode, setEditTagsMode] = useState(false)
  const [openFolders, setOpenFolders] = useState<string[]>([])

  // Folder management state
  const [folders, setFolders] = useState<string[]>([])
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderParent, setNewFolderParent] = useState<string>("")

  // Environment filter state per folder
  const [folderEnvironments, setFolderEnvironments] = useState<Record<string, "production" | "staging" | "development" | "local" | "all">>({})

  const setFolderEnvironment = (folderPath: string, env: "production" | "staging" | "development" | "local" | "all") => {
    setFolderEnvironments(prev => ({...prev, [folderPath]: env}))
  }

  // Folder order state - maps parent folder path to ordered list of child folder names
  const [folderOrder, setFolderOrder] = useState<Record<string, string[]>>({})

  // Auto-discover folders from existing designers
  useEffect(() => {
    const discoveredFolders = new Set<string>()
    designers.forEach((d) => {
      if (d.folderPath) {
        discoveredFolders.add(d.folderPath)
        // Also add parent folders
        const parts = d.folderPath.split('/')
        for (let i = 1; i < parts.length; i++) {
          discoveredFolders.add(parts.slice(0, i).join('/'))
        }
      }
    })

    // Merge with existing folders (to keep manually created empty folders)
    setFolders(prev => {
      const merged = new Set([...prev, ...Array.from(discoveredFolders)])
      return Array.from(merged).sort()
    })
  }, [designers])

  // Get the effective URL for a designer based on folder environment selection
  const getDesignerUrl = (designer: Designer, folderPath?: string): string => {
    // If designer has multi-environment URLs and a folder environment is selected, use that
    if (designer.urls && folderPath) {
      const selectedEnv = folderEnvironments[folderPath]
      if (selectedEnv && selectedEnv !== "all" && designer.urls[selectedEnv]) {
        return designer.urls[selectedEnv]
      }
    }

    // Fall back to the default url field
    return designer.url
  }

  // Generate Ignition designer deep link
  const generateDesignerLink = (designer: Designer, folderPath?: string): string => {
    // Get the appropriate URL based on environment selection
    const url = getDesignerUrl(designer, folderPath)

    // Extract hostname from URL (remove http:// or https://, port, and trailing slash)
    let hostname = url.replace(/^https?:\/\//, "").replace(/\/$/, "")

    // Remove any existing port from the hostname
    hostname = hostname.split(':')[0]

    // Don't append port - use hostname directly as gateway address
    const gateway = hostname

    // Build deep link: designer://Gateway or designer://Gateway/projectName
    // Add insecure=true if the original URL was HTTP
    const isHttp = url.startsWith('http://')
    const baseLink = designer.project ? `designer://${gateway}/${designer.project}` : `designer://${gateway}`

    return isHttp ? `${baseLink}?insecure=true` : baseLink
  }

  const openDesigner = async (designer: Designer, folderPath?: string) => {
    // Update lastAccessed date with full timestamp for better sorting
    const now = new Date()
    const updatedDesigners = designers.map((d) =>
      d.id === designer.id ? { ...d, lastAccessed: now } : d
    )
    setDesigners(updatedDesigners)

    // Save to file with ISO timestamp
    try {
      await storage.saveGateways(
        updatedDesigners.map((d) => ({
          ...d,
          lastAccessed: d.lastAccessed.toISOString(),
        }))
      )
    } catch (error) {
      console.error('Failed to save lastAccessed:', error)
    }

    // Open designer with folder path for environment-aware URL
    const deepLink = generateDesignerLink(designer, folderPath)
    console.log('Opening deep link:', deepLink)
    window.location.href = deepLink
  }

  const allTags = Array.from(new Set([...designers.flatMap((d) => d.tags), ...customTags]))

  const addCustomTag = async (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !allTags.includes(trimmedTag)) {
      const updatedTags = [...customTags, trimmedTag]
      setCustomTags(updatedTags)

      // Save to file
      try {
        await storage.saveTags(updatedTags)
      } catch (error) {
        console.error('Failed to save custom tags:', error)
      }
    }
  }

  const deleteTag = async (tagToDelete: string) => {
    // Remove from custom tags
    const updatedCustomTags = customTags.filter((t) => t !== tagToDelete)
    setCustomTags(updatedCustomTags)

    // Save custom tags to file
    try {
      await storage.saveTags(updatedCustomTags)
    } catch (error) {
      console.error('Failed to save custom tags:', error)
    }

    // Remove from all designers
    const updatedDesigners = designers.map((d) => ({
      ...d,
      tags: d.tags.filter((t) => t !== tagToDelete),
    }))
    setDesigners(updatedDesigners)

    // Save designers to file
    try {
      await storage.saveGateways(
        updatedDesigners.map((d) => ({
          ...d,
          lastAccessed: d.lastAccessed.toISOString(),
        }))
      )
    } catch (error) {
      console.error('Failed to save gateways:', error)
    }

    // Remove from selected tags
    setSelectedTags((prev) => prev.filter((t) => t !== tagToDelete))
  }


  console.log('Current filterTab:', filterTab)
  console.log('Designers count:', designers.length)

  const filteredDesigners = designers
    .filter((designer) => {
      if (filterTab === "favorites" && !designer.isFavorite) return false
      // Recent tab shows all designers, sorted by lastAccessed below

      if (
        searchQuery &&
        !designer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !designer.url.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      if (selectedTags.length > 0 && !selectedTags.some((tag) => designer.tags.includes(tag))) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by most recent access date when on Recent tab
      if (filterTab === "recent") {
        console.log('Sorting:', a.name, a.lastAccessed, 'vs', b.name, b.lastAccessed)
        const result = b.lastAccessed.getTime() - a.lastAccessed.getTime()
        console.log('Result:', result)
        return result
      }
      // Otherwise maintain original order
      return (a.order || 0) - (b.order || 0)
    })

  // Build folder tree structure from flat folder paths
  const buildFolderTree = (designers: Designer[]) => {
    const tree: Record<string, { designers: Designer[], children: Set<string> }> = {}

    designers.forEach((designer) => {
      const folderPath = designer.folderPath || designer.group || "Ungrouped"

      // Add designer ONLY to its exact folder (not to parents)
      if (!tree[folderPath]) {
        tree[folderPath] = { designers: [], children: new Set() }
      }
      tree[folderPath].designers.push(designer)

      // Build parent hierarchy WITHOUT adding designers to parent folders
      const parts = folderPath.split('/')
      for (let i = 0; i < parts.length - 1; i++) {
        const parentPath = parts.slice(0, i + 1).join('/')
        const childPath = parts.slice(0, i + 2).join('/')

        if (!tree[parentPath]) {
          tree[parentPath] = { designers: [], children: new Set() }
        }
        tree[parentPath].children.add(childPath)
      }
    })

    return tree
  }

  const groupedDesigners =
    groupBy === "none" || filterTab === "recent"
      ? { "All Designers": filteredDesigners }
      : filteredDesigners.reduce(
          (acc, designer) => {
            const key = groupBy === "group"
              ? designer.folderPath || designer.group || "Ungrouped"
              : designer.environment
            if (!acc[key]) acc[key] = []
            acc[key].push(designer)
            return acc
          },
          {} as Record<string, Designer[]>,
        )

  // Don't re-sort on Recent tab (already sorted by lastAccessed)
  if (filterTab !== "recent") {
    Object.keys(groupedDesigners).forEach((key) => {
      groupedDesigners[key].sort((a, b) => (a.order || 0) - (b.order || 0))
    })
  }

  // Get folder tree when grouping by folders
  const folderTree = groupBy === "group" && filterTab !== "recent" ? (() => {
    const tree = buildFolderTree(filteredDesigners)

    // Add empty folders from the folders state
    folders.forEach((folderPath) => {
      if (!tree[folderPath]) {
        tree[folderPath] = { designers: [], children: new Set() }
      }

      // Ensure parent folders exist
      const parts = folderPath.split('/')
      for (let i = 0; i < parts.length - 1; i++) {
        const parentPath = parts.slice(0, i + 1).join('/')
        const childPath = parts.slice(0, i + 2).join('/')

        if (!tree[parentPath]) {
          tree[parentPath] = { designers: [], children: new Set() }
        }
        tree[parentPath].children.add(childPath)
      }
    })

    return tree
  })() : null

  // Get top-level folders (folders that don't have a parent)
  const topLevelFoldersArray = React.useMemo(() => {
    return folderTree
      ? Object.keys(folderTree).filter((path) => !path.includes('/'))
      : Object.keys(groupedDesigners)
  }, [folderTree, groupedDesigners])

  // Sort top-level folders using custom order if available
  const topLevelFolders = React.useMemo(() => {
    const customTopLevelOrder = (folderOrder?.[''] || folderOrder?.['root']) ?? []
    return customTopLevelOrder.length > 0
      ? [...topLevelFoldersArray].sort((a, b) => {
          const aIndex = customTopLevelOrder.indexOf(a)
          const bIndex = customTopLevelOrder.indexOf(b)
          if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
          if (aIndex === -1) return 1
          if (bIndex === -1) return -1
          return aIndex - bIndex
        })
      : topLevelFoldersArray.sort()
  }, [topLevelFoldersArray, folderOrder])

  const orderedGroups = topLevelFolders

  // Load persisted state from localStorage on mount (client-side only)
  useEffect(() => {
    // Load viewMode
    const savedViewMode = localStorage.getItem('designer-launcher-viewMode') as ViewMode
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }

    // Load openFolders
    try {
      const savedFolders = localStorage.getItem('designer-launcher-openFolders')
      if (savedFolders) {
        setOpenFolders(JSON.parse(savedFolders))
      }
    } catch (error) {
      console.error('Error loading openFolders from localStorage:', error)
    }
  }, [])

  // Initialize open folders on mount
  React.useEffect(() => {
    if (groupBy !== "none" && filterTab !== "recent") {
      // Only initialize if openFolders is empty
      setOpenFolders(prev => prev.length === 0 ? orderedGroups : prev)
    }
  }, [groupBy, filterTab])

  // Persist viewMode to localStorage
  useEffect(() => {
    localStorage.setItem('designer-launcher-viewMode', viewMode)
  }, [viewMode])

  // Persist openFolders to localStorage
  useEffect(() => {
    localStorage.setItem('designer-launcher-openFolders', JSON.stringify(openFolders))
  }, [openFolders])

  // Load folders list from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('designer-launcher-folders')
        if (saved) {
          setFolders(JSON.parse(saved))
        }
      } catch (e) {
        console.error('Error loading folders:', e)
      }
    }
  }, [])

  // Persist folders list to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('designer-launcher-folders', JSON.stringify(folders))
    }
  }, [folders])

  // Load folderOrder from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('designer-launcher-folderOrder')
        if (saved) {
          setFolderOrder(JSON.parse(saved))
        }
      } catch (e) {
        console.error('Error loading folder order:', e)
      }
    }
  }, [])

  // Persist folderOrder to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('designer-launcher-folderOrder', JSON.stringify(folderOrder))
    }
  }, [folderOrder])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const openEditDialog = (designer: Designer) => {
    console.log('Opening edit dialog for:', designer.name)
    setEditingDesigner({ ...designer })
    setEditDialogOpen(true)
  }

  const duplicateDesigner = (designer: Designer) => {
    const duplicate: Designer = {
      ...designer,
      id: Date.now().toString(),
      name: `${designer.name} (Copy)`,
      order: designers.length + 1,
    }
    setEditingDesigner(duplicate)
    setEditDialogOpen(true)
  }

  const saveDesigner = async () => {
    if (!editingDesigner) return

    // Check if this is a new designer or an update
    const isNew = !designers.find((d) => d.id === editingDesigner.id)

    if (isNew) {
      // Add new designer
      const updatedDesigners = [...designers, editingDesigner]
      setDesigners(updatedDesigners)

      // Save to file
      await storage.saveGateways(updatedDesigners.map(d => ({
        ...d,
        lastAccessed: d.lastAccessed.toISOString()
      })))
    } else {
      // Update existing designer
      const updatedDesigners = designers.map((d) => (d.id === editingDesigner.id ? editingDesigner : d))
      setDesigners(updatedDesigners)

      // Save to file
      await storage.saveGateways(updatedDesigners.map(d => ({
        ...d,
        lastAccessed: d.lastAccessed.toISOString()
      })))
    }

    setEditDialogOpen(false)
    setEditingDesigner(null)
  }

  const toggleFavorite = (designerId: string) => {
    setDesigners((prev) => prev.map((d) => (d.id === designerId ? { ...d, isFavorite: !d.isFavorite } : d)))
  }

  const deleteDesigner = async (designerId: string) => {
    if (confirm('Are you sure you want to delete this designer?')) {
      const updatedDesigners = designers.filter((d) => d.id !== designerId)
      setDesigners(updatedDesigners)
      await storage.saveGateways(updatedDesigners.map(d => ({
        ...d,
        lastAccessed: d.lastAccessed.toISOString(),
      })))
    }
  }

  const handleDragStart = (designer: Designer) => {
    setDraggedDesigner(designer)
  }

  const handleDragEnd = () => {
    setDraggedDesigner(null)
    setDragOverGroup(null)
    setDragOverDesigner(null) // Clear designer hover state
  }

  const handleDragOver = (e: React.DragEvent, groupName: string) => {
    e.preventDefault()
    setDragOverGroup(groupName)
  }

  const handleDragLeave = () => {
    setDragOverGroup(null)
  }

  const handleDesignerDragOver = (e: React.DragEvent, designerId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverDesigner(designerId)
  }

  const handleDesignerDragLeave = () => {
    setDragOverDesigner(null)
  }

  const handleDesignerDrop = (e: React.DragEvent, targetDesigner: Designer, targetGroup: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedDesigner || draggedDesigner.id === targetDesigner.id) return

    const draggedGroup = groupBy === "group" ? draggedDesigner.group || "Ungrouped" : draggedDesigner.environment
    const isSameGroup = draggedGroup === targetGroup

    if (isSameGroup) {
      // Reorder within the same group
      const groupDesigners = groupedDesigners[targetGroup]
      const draggedIndex = groupDesigners.findIndex((d) => d.id === draggedDesigner.id)
      const targetIndex = groupDesigners.findIndex((d) => d.id === targetDesigner.id)

      if (draggedIndex === -1 || targetIndex === -1) return

      setDesigners((prev) => {
        const newDesigners = [...prev]
        const reorderedGroup = [...groupDesigners]

        // Remove dragged item
        const [removed] = reorderedGroup.splice(draggedIndex, 1)
        // Insert at target position
        reorderedGroup.splice(targetIndex, 0, removed)

        // Update order values
        reorderedGroup.forEach((designer, index) => {
          const designerInArray = newDesigners.find((d) => d.id === designer.id)
          if (designerInArray) {
            designerInArray.order = index
          }
        })

        return newDesigners
      })
    } else {
      // Move to different group
      setDesigners((prev) =>
        prev.map((d) => {
          if (d.id === draggedDesigner.id) {
            if (groupBy === "group") {
              return { ...d, group: targetGroup === "Ungrouped" ? undefined : targetGroup }
            } else if (groupBy === "environment") {
              return { ...d, environment: targetGroup as Designer["environment"] }
            }
          }
          return d
        }),
      )
    }

    setDraggedDesigner(null)
    setDragOverGroup(null)
    setDragOverDesigner(null)
  }

  const handleDrop = (e: React.DragEvent, targetGroup: string) => {
    e.preventDefault()

    if (!draggedDesigner) return

    const draggedGroup = groupBy === "group" ? draggedDesigner.group || "Ungrouped" : draggedDesigner.environment

    if (draggedGroup !== targetGroup) {
      setDesigners((prev) =>
        prev.map((d) => {
          if (d.id === draggedDesigner.id) {
            if (groupBy === "group") {
              return { ...d, group: targetGroup === "Ungrouped" ? undefined : targetGroup }
            } else if (groupBy === "environment") {
              return { ...d, environment: targetGroup as Designer["environment"] }
            }
          }
          return d
        }),
      )
    }

    setDraggedDesigner(null)
    setDragOverGroup(null)
    setDragOverDesigner(null)
  }

  const handleFolderDragStart = (folderName: string, e?: React.DragEvent) => {
    console.log('Folder drag start:', folderName, 'editMode:', editMode)
    if (e) {
      e.stopPropagation() // Prevent bubbling to parent folders
    }
    if (editMode) {
      setDraggedFolder(folderName)
    }
  }

  const handleFolderDragEnd = () => {
    setDraggedFolder(null)
    setDragOverFolder(null)
  }

  const handleFolderDragOver = (e: React.DragEvent, folderName: string) => {
    if (editMode && draggedFolder) {
      e.preventDefault()
      e.stopPropagation()
      console.log('Folder drag over:', folderName, 'dragged:', draggedFolder)
      setDragOverFolder(folderName)
    }
  }

  const handleFolderDragLeave = () => {
    setDragOverFolder(null)
  }

  const handleFolderDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('handleFolderDrop called:', targetFolder, 'draggedFolder:', draggedFolder, 'editMode:', editMode)

    if (!draggedFolder || !editMode) {
      console.log('Early return - missing draggedFolder or not in editMode')
      return
    }

    // Determine parent folder from dragged and target folder paths
    const getDraggedParent = (path: string) => {
      const parts = path.split('/')
      parts.pop() // Remove the folder name itself
      return parts.join('/') // Empty string for top-level folders
    }

    const draggedParent = getDraggedParent(draggedFolder)
    const targetParent = getDraggedParent(targetFolder)

    // Only allow reordering within same parent
    if (draggedParent !== targetParent) return

    // Get all sibling folders with current sort order applied
    const getSortedSiblings = (parentPath: string) => {
      if (parentPath === '') {
        return topLevelFolders
      }

      if (!folderTree || !folderTree[parentPath]) {
        return []
      }

      const childFoldersArray = Array.from(folderTree[parentPath].children)
      const customOrder = folderOrder?.[parentPath] ?? []

      return customOrder.length > 0
        ? [...childFoldersArray].sort((a, b) => {
            const aIndex = customOrder.indexOf(a)
            const bIndex = customOrder.indexOf(b)
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
            if (aIndex === -1) return 1
            if (bIndex === -1) return -1
            return aIndex - bIndex
          })
        : childFoldersArray.sort()
    }

    const siblings = getSortedSiblings(draggedParent)
    const currentIndex = siblings.indexOf(draggedFolder)
    const targetIndex = siblings.indexOf(targetFolder)

    if (currentIndex === -1 || targetIndex === -1) return

    const newOrder = [...siblings]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, draggedFolder)

    console.log('Folder drop:', {
      draggedFolder,
      targetFolder,
      draggedParent,
      siblings,
      currentIndex,
      targetIndex,
      newOrder
    })

    setFolderOrder(prev => {
      const updated = {
        ...prev,
        [draggedParent]: newOrder
      }
      console.log('Updated folderOrder:', updated)
      return updated
    })
    setDraggedFolder(null)
    setDragOverFolder(null)
  }

  const startRenamingFolder = (folderName: string) => {
    setRenamingFolder(folderName)
    // Only show the last part of the path in the input field
    const displayName = folderName.split('/').pop() || folderName
    setRenamingFolderValue(displayName)
  }

  const saveRenamedFolder = async () => {
    if (!renamingFolder || !renamingFolderValue.trim() || renamingFolderValue === renamingFolder) {
      setRenamingFolder(null)
      setRenamingFolderValue("")
      return
    }

    // For nested folders, we need to construct the full new path
    const folderParts = renamingFolder.split('/')
    const newFolderName = renamingFolderValue.trim()

    // Replace just the last part of the path with the new name
    folderParts[folderParts.length - 1] = newFolderName
    const newFolderPath = folderParts.join('/')

    // Update all designers in this folder (and subfolders for nested renames)
    const updatedDesigners = designers.map((d) => {
      const currentFolderPath = d.folderPath || d.group || "Ungrouped"

      // Check if this designer is in the folder being renamed or a subfolder
      if (currentFolderPath === renamingFolder || currentFolderPath.startsWith(renamingFolder + '/')) {
        // Replace the old folder path with the new one
        const updatedPath = currentFolderPath === renamingFolder
          ? newFolderPath
          : currentFolderPath.replace(renamingFolder, newFolderPath)

        return {
          ...d,
          folderPath: updatedPath,
          group: updatedPath // Keep group in sync for backward compatibility
        }
      }
      return d
    })

    setDesigners(updatedDesigners)

    // Update folder order - update all references to the renamed folder in the order records
    const updatedFolderOrder = { ...folderOrder }
    Object.keys(updatedFolderOrder).forEach(parentPath => {
      updatedFolderOrder[parentPath] = updatedFolderOrder[parentPath].map(f =>
        f === renamingFolder ? newFolderPath : f
      )
    })
    setFolderOrder(updatedFolderOrder)

    // Update folders list
    setFolders(prev => prev.map(f => {
      if (f === renamingFolder || f.startsWith(renamingFolder + '/')) {
        return f === renamingFolder ? newFolderPath : f.replace(renamingFolder, newFolderPath)
      }
      return f
    }).sort())

    // Update open folders
    const updatedOpenFolders = openFolders.map((f) => {
      if (f === renamingFolder || f.startsWith(renamingFolder + '/')) {
        return f === renamingFolder ? newFolderPath : f.replace(renamingFolder, newFolderPath)
      }
      return f
    })
    setOpenFolders(updatedOpenFolders)

    // Save to file
    try {
      await storage.saveGateways(
        updatedDesigners.map((d) => ({
          ...d,
          lastAccessed: d.lastAccessed.toISOString(),
        }))
      )
    } catch (error) {
      console.error('Failed to save renamed folder:', error)
    }

    setRenamingFolder(null)
    setRenamingFolderValue("")
  }

  const cancelRenamingFolder = () => {
    setRenamingFolder(null)
    setRenamingFolderValue("")
  }

  const duplicateFolder = async (folderPath: string) => {
    // Get all designers in this folder
    const designersInFolder = designers.filter(d =>
      (d.folderPath || d.group) === folderPath
    )

    if (designersInFolder.length === 0) {
      console.log('No designers in folder to duplicate')
      return
    }

    // Generate new folder name
    let newFolderName = `${folderPath} Copy`
    let counter = 1
    while (folders.includes(newFolderName) || designers.some(d => (d.folderPath || d.group) === newFolderName)) {
      counter++
      newFolderName = `${folderPath} Copy ${counter}`
    }

    // Duplicate all designers in the folder with new IDs and folder path
    const duplicatedDesigners = designersInFolder.map(designer => ({
      ...designer,
      id: `${designer.id}-copy-${Date.now()}-${Math.random()}`,
      folderPath: newFolderName,
      group: newFolderName,
      lastAccessed: new Date()
    }))

    // Add duplicated designers to state
    const updatedDesigners = [...designers, ...duplicatedDesigners]
    setDesigners(updatedDesigners)

    // Add new folder to folders list
    setFolders(prev => [...prev, newFolderName].sort())

    // Save to file
    try {
      await storage.saveGateways(updatedDesigners)
      console.log(`Duplicated folder "${folderPath}" as "${newFolderName}"`)
    } catch (error) {
      console.error('Failed to save duplicated folder:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-slate-700 dark:bg-black shadow-md border-b border-transparent dark:border-neutral-800">
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-3">
            <img src="./launcher.png" alt="Ignition" className="h-10 w-10" />
            <div>
              <h1 className="text-base font-normal text-white">Ignition Designer Launcher</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-800 hover:text-white"
                  >
                    {theme === 'light' ? (
                      <Sun className="h-5 w-5" />
                    ) : theme === 'dark' ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Monitor className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-800 hover:text-white"
              onClick={() => alert('Ignition Designer Launcher\nVersion 1.0\n\nManage and launch Ignition Designer connections.')}
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-800 hover:text-white"
              onClick={() => alert('Settings functionality coming soon!')}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-56 bg-gray-200 dark:bg-neutral-900 p-0 min-h-[calc(100vh-54px)] border-r border-transparent dark:border-neutral-800">
          <div className="space-y-0 py-4">
            <div className="space-y-0">
              <button
                onClick={() => setFilterTab("all")}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-sm font-normal transition-colors border-l-4",
                  filterTab === "all"
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white border-blue-500"
                    : "text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-800 border-transparent",
                )}
              >
                <Grid3x3 className="h-4 w-4" />
                All Designers
                <span className="ml-auto text-xs">{designers.length}</span>
              </button>
              <button
                onClick={() => setFilterTab("favorites")}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-sm font-normal transition-colors border-l-4",
                  filterTab === "favorites"
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white border-blue-500"
                    : "text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-800 border-transparent",
                )}
              >
                <Star className="h-4 w-4" />
                Favorites
                <span className="ml-auto text-xs">{designers.filter((d) => d.isFavorite).length}</span>
              </button>
              <button
                onClick={() => setFilterTab("recent")}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-sm font-normal transition-colors border-l-4",
                  filterTab === "recent"
                    ? "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white border-blue-500"
                    : "text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-800 border-transparent",
                )}
              >
                <Clock className="h-4 w-4" />
                Recent
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between px-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-white">Tags</h3>
                <Button
                  variant={editTagsMode ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-5 gap-1 px-2 text-xs",
                    editTagsMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-800",
                  )}
                  onClick={() => setEditTagsMode(!editTagsMode)}
                >
                  {editTagsMode ? (
                    <>
                      <Check className="h-3 w-3" />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5 px-4">
                  {allTags.map((tag) => (
                    <div key={tag} className="relative">
                      <button
                        onClick={() => !editTagsMode && toggleTag(tag)}
                        disabled={editTagsMode}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          editTagsMode && "pr-6",
                          !editTagsMode && selectedTags.includes(tag)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700",
                          editTagsMode && "cursor-default opacity-70",
                        )}
                      >
                        {tag}
                      </button>
                      {editTagsMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Delete tag "${tag}"? This will remove it from all designers.`)) {
                              deleteTag(tag)
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-background/50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 px-4">
                  <Input
                    id="sidebar-new-tag"
                    placeholder="New tag..."
                    className="h-7 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      const input = document.getElementById("sidebar-new-tag") as HTMLInputElement
                      const newTag = input.value.trim()
                      if (newTag) {
                        addCustomTag(newTag)
                        input.value = ""
                      }
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-h-screen bg-background">
          <div className="bg-white dark:bg-neutral-900 px-6 py-4 border-b border-transparent dark:border-neutral-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search designers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filters:</span>
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTag(tag)
                          }}
                          className="ml-1 rounded-full hover:bg-background/50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setSelectedTags([])
                      }}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFolderDialogOpen(true)}
                  className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
                >
                  <Folder className="h-4 w-4" />
                  Manage Folders
                </Button>
                <div className="flex rounded-lg border border-gray-300 dark:border-neutral-500">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "rounded-r-none text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700",
                      viewMode === "grid" && "bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white"
                    )}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "rounded-l-none text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700",
                      viewMode === "list" && "bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {groupBy !== "none" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (openFolders.length > 0) {
                          setOpenFolders([])
                        } else {
                          setOpenFolders(orderedGroups)
                        }
                      }}
                      className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700"
                    >
                      {openFolders.length > 0 ? "Collapse All" : "Expand All"}
                    </Button>
                    <Button
                      variant={editMode ? "default" : "outline"}
                      onClick={() => setEditMode(!editMode)}
                      className={cn(
                        "gap-2 h-9 border border-gray-300 dark:border-neutral-500 text-gray-900 dark:text-white bg-white dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700",
                        editMode && "bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white border-slate-600 dark:border-slate-600"
                      )}
                    >
                      {editMode ? (
                        <>
                          <Check className="h-4 w-4" />
                          Done
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" />
                          Edit Folders
                        </>
                      )}
                    </Button>
                  </>
                )}
                <Button
                  className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (!file) return

                      try {
                        const text = await file.text()
                        const data = JSON.parse(text)

                        // Parse Ignition launcher format
                        const imported: Designer[] = []

                        // Check if this is a single designer export (has gateway.info field)
                        if (data['gateway.info']) {
                          // Single designer format
                          const projectName = data['jvm.arguments']
                            ?.find((arg: string) => arg.startsWith('-Dproject.name='))
                            ?.replace('-Dproject.name=', '') || ''

                          const gatewayName = data['gateway.info']['gateway.name'] || ''
                          const displayName = data.name || gatewayName || 'Imported Gateway'

                          // Extract environment from URL or gateway name
                          const url = data['gateway.info']['gateway.address'] || ''
                          let environment: Designer['environment'] = 'production'
                          const urlLower = url.toLowerCase()
                          if (urlLower.includes('local') || urlLower.includes('localhost')) {
                            environment = 'local'
                          } else if (urlLower.includes('dev')) {
                            environment = 'development'
                          } else if (urlLower.includes('staging') || urlLower.includes('stg')) {
                            environment = 'staging'
                          }

                          // Create tags from gateway name parts (e.g., "ABI-WING-C-EPMS1" -> ["ABI", "WING-C", "EPMS1"])
                          const nameParts = gatewayName.split('-').filter((part: string) => part.length > 0)
                          const tags = ['imported', ...nameParts.slice(0, 2)] // First 2 parts as tags

                          const designer: Designer = {
                            id: Date.now().toString(),
                            name: displayName,
                            url: url,
                            project: projectName,
                            status: 'offline',
                            environment: environment,
                            tags: tags,
                            isFavorite: data.favorite || false,
                            lastAccessed: new Date(),
                            group: nameParts[0] || undefined, // Will be set in dialog
                            order: designers.length + 1,
                          }
                          imported.push(designer)
                        } else {
                          // Try to find gateway configurations in array format
                          const gateways = data.gateways || data.designers || data.connections || []

                          gateways.forEach((gw: any, index: number) => {
                            const projectName = gw['jvm.arguments']
                              ?.find((arg: string) => arg.startsWith('-Dproject.name='))
                              ?.replace('-Dproject.name=', '') || ''

                            const gatewayName = gw['gateway.info']?.['gateway.name'] || ''
                            const displayName = gw.name || gatewayName || `Imported Gateway ${index + 1}`

                            // Extract environment from URL
                            const url = gw['gateway.info']?.['gateway.address'] || gw.url || gw.address || ''
                            let environment: Designer['environment'] = 'production'
                            const urlLower = url.toLowerCase()
                            if (urlLower.includes('local') || urlLower.includes('localhost')) {
                              environment = 'local'
                            } else if (urlLower.includes('dev')) {
                              environment = 'development'
                            } else if (urlLower.includes('staging') || urlLower.includes('stg')) {
                              environment = 'staging'
                            }

                            // Create tags from gateway name parts
                            const nameParts = gatewayName.split('-').filter((part: string) => part.length > 0)
                            const tags = ['imported', ...nameParts.slice(0, 2)]

                            const designer: Designer = {
                              id: Date.now().toString() + index,
                              name: displayName,
                              url: url,
                              project: projectName || gw.project || '',
                              status: 'offline',
                              environment: environment,
                              tags: tags.length > 1 ? tags : ['imported'],
                              isFavorite: gw.favorite || false,
                              lastAccessed: new Date(),
                              group: nameParts[0] || undefined,
                              order: designers.length + imported.length + 1,
                            }
                            imported.push(designer)
                          })
                        }

                        if (imported.length > 0) {
                          // Open edit dialog with the first imported designer
                          setEditingDesigner(imported[0])
                          setEditDialogOpen(true)

                          // If there are more, add them after the dialog is saved
                          if (imported.length > 1) {
                            alert(`Imported ${imported.length} designer(s). You can review and edit the first one.`)
                          }
                        } else {
                          alert('No designers found in the file. Please check the file format.')
                        }
                      } catch (error) {
                        console.error('Import failed:', error)
                        alert('Failed to import file. Please ensure it is a valid Ignition launcher JSON file.')
                      }
                    }
                    input.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                  Import from Ignition
                </Button>
                <Button
                  className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white"
                  onClick={() => {
                    const newDesigner: Designer = {
                      id: Date.now().toString(),
                      name: "New Gateway",
                      url: "http://",
                      project: "",
                      status: "offline",
                      environment: "local",
                      tags: [],
                      isFavorite: false,
                      lastAccessed: new Date(),
                      order: designers.length + 1,
                    }
                    setEditingDesigner(newDesigner)
                    setEditDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Designer
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-transparent">
            {groupBy !== "none" && filterTab !== "recent" && folderTree ? (
              <Accordion type="multiple" value={openFolders} onValueChange={setOpenFolders} className="space-y-4">
                {topLevelFolders.map((folderPath) => (
                  <FolderAccordion
                    key={folderPath}
                    folderPath={folderPath}
                    folderTree={folderTree}
                    viewMode={viewMode}
                    editMode={editMode}
                    draggedFolder={draggedFolder}
                    dragOverFolder={dragOverFolder}
                    dragOverGroup={dragOverGroup}
                    renamingFolder={renamingFolder}
                    renamingFolderValue={renamingFolderValue}
                    setRenamingFolderValue={setRenamingFolderValue}
                    handleFolderDragStart={handleFolderDragStart}
                    handleFolderDragEnd={handleFolderDragEnd}
                    handleFolderDragOver={handleFolderDragOver}
                    handleFolderDrop={handleFolderDrop}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                    startRenamingFolder={startRenamingFolder}
                    saveRenamedFolder={saveRenamedFolder}
                    cancelRenamingFolder={cancelRenamingFolder}
                    duplicateFolder={duplicateFolder}
                    openDesigner={openDesigner}
                    designers={designers}
                    draggedDesigner={draggedDesigner}
                    dragOverDesigner={dragOverDesigner}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDesignerDragOver={handleDesignerDragOver}
                    handleDesignerDragLeave={handleDesignerDragLeave}
                    handleDesignerDrop={handleDesignerDrop}
                    openEditDialog={openEditDialog}
                    duplicateDesigner={duplicateDesigner}
                    toggleFavorite={toggleFavorite}
                    deleteDesigner={deleteDesigner}
                    folderEnvironment={folderEnvironments[folderPath] || "all"}
                    setFolderEnvironment={setFolderEnvironment}
                    folderEnvironments={folderEnvironments}
                    folderOrder={folderOrder}
                    setFolderOrder={setFolderOrder}
                  />
                ))}
              </Accordion>
            ) : groupBy !== "none" && filterTab !== "recent" ? (
              <Accordion type="multiple" value={openFolders} onValueChange={setOpenFolders} className="space-y-4">
                {orderedGroups.map((groupName) => {
                  const designers = groupedDesigners[groupName]
                  if (!designers) return null

                  return (
                    <AccordionItem
                      key={groupName}
                      value={groupName}
                      draggable={editMode}
                      onDragStart={() => handleFolderDragStart(groupName)}
                      onDragEnd={handleFolderDragEnd}
                      className={cn(
                        "group rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 transition-all shadow-sm",
                        dragOverGroup === groupName && !editMode && "border-blue-500 bg-blue-50 dark:bg-blue-950",
                        dragOverFolder === groupName && editMode && "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105",
                        draggedFolder === groupName && "opacity-50",
                        editMode && "cursor-move",
                      )}
                      onDragOver={(e) => {
                        if (editMode) {
                          handleFolderDragOver(e, groupName)
                        } else {
                          handleDragOver(e, groupName)
                        }
                      }}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        if (editMode) {
                          handleFolderDrop(e, groupName)
                        } else {
                          handleDrop(e, groupName)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between w-full px-4 py-3 group">
                        <div className="flex items-center gap-2 flex-1">
                          <AccordionTrigger className="flex-1 hover:no-underline py-0 pr-4">
                            <div className="flex items-center gap-2 flex-1">
                              {editMode && <GripVertical className="h-5 w-5 text-muted-foreground" />}
                              <Folder className="h-5 w-5 text-muted-foreground" />
                              {renamingFolder === groupName ? (
                                <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={renamingFolderValue}
                                    onChange={(e) => setRenamingFolderValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        saveRenamedFolder()
                                      } else if (e.key === "Escape") {
                                        cancelRenamingFolder()
                                      }
                                    }}
                                    className="h-8 text-lg font-semibold max-w-xs"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    onClick={saveRenamedFolder}
                                    className="h-8 bg-slate-600 hover:bg-slate-500"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelRenamingFolder}
                                    className="h-8"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-lg font-semibold">{groupName}</span>
                                  <span className="text-sm font-normal text-muted-foreground">({designers.length})</span>
                                </>
                              )}
                            </div>
                          </AccordionTrigger>
                          {editMode && renamingFolder !== groupName && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                startRenamingFolder(groupName)
                              }}
                              className="h-7 px-2 ml-2 flex-shrink-0 bg-slate-600 text-white hover:bg-slate-500 border-slate-600"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                              Rename
                            </Button>
                          )}
                        </div>
                        {!editMode && designers.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                designers.forEach((designer, index) => {
                                  setTimeout(() => {
                                    openDesigner(designer, groupName)
                                  }, index * 100)
                                })
                              }}
                            >
                              <Play className="h-4 w-4" />
                              Launch All
                            </Button>
                          </div>
                        )}
                      </div>
                      <AccordionContent className="px-4 pb-4">
                        {viewMode === "grid" ? (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {designers.map((designer) => (
                              <DesignerCard
                                key={designer.id}
                                designer={designer}
                                groupName={groupName}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDesignerDragOver}
                                onDragLeave={handleDesignerDragLeave}
                                onDrop={handleDesignerDrop}
                                isDragging={draggedDesigner?.id === designer.id}
                                isDraggedOver={dragOverDesigner === designer.id}
                                disabled={editMode}
                                onOpen={(d) => openDesigner(d, groupName)}
                                onEdit={openEditDialog}
                                onDuplicate={duplicateDesigner}
                                onToggleFavorite={toggleFavorite}
                                onDelete={deleteDesigner}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {designers.map((designer) => (
                              <DesignerListItem
                                key={designer.id}
                                designer={designer}
                                groupName={groupName}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDesignerDragOver}
                                onDragLeave={handleDesignerDragLeave}
                                onDrop={handleDesignerDrop}
                                isDragging={draggedDesigner?.id === designer.id}
                                isDraggedOver={dragOverDesigner === designer.id}
                                disabled={editMode}
                                onOpen={(d) => openDesigner(d, groupName)}
                                onEdit={openEditDialog}
                                onDuplicate={duplicateDesigner}
                                onToggleFavorite={toggleFavorite}
                                onDelete={deleteDesigner}
                              />
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : (
              <div>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredDesigners.map((designer) => (
                      <DesignerCard
                        key={designer.id}
                        designer={designer}
                        groupName="All Designers"
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDesignerDragOver}
                        onDragLeave={handleDesignerDragLeave}
                        onDrop={handleDesignerDrop}
                        isDragging={draggedDesigner?.id === designer.id}
                        isDraggedOver={dragOverDesigner === designer.id}
                        onOpen={(d) => openDesigner(d, designer.folderPath || designer.group)}
                        onEdit={openEditDialog}
                        onDuplicate={duplicateDesigner}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteDesigner}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDesigners.map((designer) => (
                      <DesignerListItem
                        key={designer.id}
                        designer={designer}
                        groupName="All Designers"
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDesignerDragOver}
                        onDragLeave={handleDesignerDragLeave}
                        onDrop={handleDesignerDrop}
                        isDragging={draggedDesigner?.id === designer.id}
                        isDraggedOver={dragOverDesigner === designer.id}
                        onOpen={(d) => openDesigner(d, designer.folderPath || designer.group)}
                        onEdit={openEditDialog}
                        onDuplicate={duplicateDesigner}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteDesigner}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {filteredDesigners.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-secondary p-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">No designers found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Folder Management Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Manage Folders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">Existing Folders</Label>
              <div className="border rounded-md p-2 max-h-64 overflow-y-auto bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600">
                {folders.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No folders yet. Create one below.</p>
                ) : (
                  <div className="space-y-1">
                    {folders.map((folder) => {
                      const level = folder.split('/').length - 1
                      const displayName = folder.split('/').pop() || folder
                      return (
                        <div
                          key={folder}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
                          style={{ paddingLeft: `${(level * 16) + 8}px` }}
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-gray-900 dark:text-white">{displayName}</span>
                            {level > 0 && (
                              <span className="text-xs text-muted-foreground">
                                in {folder.split('/').slice(0, -1).join('/')}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingFolder(folder)
                                setNewFolderName(folder.split('/').pop() || '')
                                const parentParts = folder.split('/')
                                parentParts.pop()
                                setNewFolderParent(parentParts.join('/') || '')
                              }}
                              className="h-7 px-2"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (confirm(`Delete folder "${folder}"? Designers in this folder will be moved to the parent folder or ungrouped.`)) {
                                  // Get parent folder path
                                  const folderParts = folder.split('/')
                                  folderParts.pop()
                                  const parentFolder = folderParts.join('/') || undefined

                                  // Remove folder from all designers and move them to parent
                                  const updatedDesigners = designers.map((d) => {
                                    const currentPath = d.folderPath || d.group
                                    if (currentPath === folder) {
                                      return {
                                        ...d,
                                        folderPath: parentFolder,
                                        group: parentFolder
                                      }
                                    }
                                    // Also update any subfolders
                                    if (currentPath && currentPath.startsWith(folder + '/')) {
                                      const newPath = parentFolder
                                        ? currentPath.replace(folder, parentFolder)
                                        : currentPath.replace(folder + '/', '')
                                      return {
                                        ...d,
                                        folderPath: newPath,
                                        group: newPath
                                      }
                                    }
                                    return d
                                  })
                                  setDesigners(updatedDesigners)

                                  // Remove folder from folders list (including subfolders)
                                  setFolders(prev => prev.filter(f => f !== folder && !f.startsWith(folder + '/')))

                                  // Remove folder from folder order
                                  setFolderOrder(prev => {
                                    const updated = { ...prev }
                                    delete updated[folder]
                                    return updated
                                  })

                                  // Save to file
                                  try {
                                    await storage.saveGateways(
                                      updatedDesigners.map((d) => ({
                                        ...d,
                                        lastAccessed: d.lastAccessed.toISOString(),
                                      }))
                                    )
                                  } catch (error) {
                                    console.error('Failed to save gateways:', error)
                                  }
                                }
                              }}
                              className="h-7 px-2 text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-gray-900 dark:text-white">
                {editingFolder ? 'Edit Folder' : 'Create New Folder'}
              </Label>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="new-folder-parent" className="text-sm text-gray-900 dark:text-white">
                    Parent Folder (optional)
                  </Label>
                  <Select
                    value={newFolderParent || "none"}
                    onValueChange={(value) => setNewFolderParent(value === "none" ? "" : value)}
                  >
                    <SelectTrigger id="new-folder-parent" className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600">
                      <SelectItem value="none" className="text-gray-900 dark:text-white">None (top level)</SelectItem>
                      {folders
                        .filter((f) => f !== editingFolder)
                        .map((folder) => (
                          <SelectItem key={folder} value={folder} className="text-gray-900 dark:text-white">
                            {folder}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="new-folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder Name"
                    className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const fullPath = newFolderParent
                          ? `${newFolderParent}/${newFolderName.trim()}`
                          : newFolderName.trim()

                        if (!fullPath) return

                        if (editingFolder) {
                          // Update existing folder
                          const updatedDesigners = designers.map((d) =>
                            d.folderPath === editingFolder ? { ...d, folderPath: fullPath } : d
                          )
                          setDesigners(updatedDesigners)

                          // Save to file
                          storage.saveGateways(
                            updatedDesigners.map((d) => ({
                              ...d,
                              lastAccessed: d.lastAccessed.toISOString(),
                            }))
                          ).catch((error) => {
                            console.error('Failed to save gateways:', error)
                          })

                          setEditingFolder(null)
                        } else {
                          // Create new folder - just add it to the folders list
                          // It will be persisted when a designer is assigned to it
                          setFolders((prev) => [...prev, fullPath].sort())
                        }

                        setNewFolderName('')
                        setNewFolderParent('')
                      } else if (e.key === 'Escape') {
                        setEditingFolder(null)
                        setNewFolderName('')
                        setNewFolderParent('')
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const fullPath = newFolderParent
                        ? `${newFolderParent}/${newFolderName.trim()}`
                        : newFolderName.trim()

                      if (!fullPath) return

                      if (editingFolder) {
                        // Update existing folder
                        const updatedDesigners = designers.map((d) =>
                          d.folderPath === editingFolder ? { ...d, folderPath: fullPath } : d
                        )
                        setDesigners(updatedDesigners)

                        // Save to file
                        storage.saveGateways(
                          updatedDesigners.map((d) => ({
                            ...d,
                            lastAccessed: d.lastAccessed.toISOString(),
                          }))
                        ).catch((error) => {
                          console.error('Failed to save gateways:', error)
                        })

                        setEditingFolder(null)
                      } else {
                        // Create new folder - just add it to the folders list
                        // It will be persisted when a designer is assigned to it
                        setFolders((prev) => [...prev, fullPath].sort())
                      }

                      setNewFolderName('')
                      setNewFolderParent('')
                    }}
                    className="bg-slate-600 hover:bg-slate-500 text-white"
                  >
                    {editingFolder ? 'Update' : 'Create'}
                  </Button>
                  {editingFolder && (
                    <Button
                      onClick={() => {
                        setEditingFolder(null)
                        setNewFolderName('')
                        setNewFolderParent('')
                      }}
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setFolderDialogOpen(false)} className="bg-slate-600 hover:bg-slate-500 text-white">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Designer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Designer</DialogTitle>
          </DialogHeader>
          {editingDesigner && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900 dark:text-white">Name</Label>
                <Input
                  id="name"
                  value={editingDesigner.name}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, name: e.target.value })}
                  className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white selection:bg-blue-600 selection:text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-gray-900 dark:text-white">Environment URLs</Label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="url-production" className="text-sm text-gray-600 dark:text-gray-400">Production</Label>
                    <Input
                      id="url-production"
                      value={editingDesigner.urls?.production || ""}
                      onChange={(e) => setEditingDesigner({
                        ...editingDesigner,
                        urls: { ...editingDesigner.urls, production: e.target.value },
                        url: editingDesigner.environment === "production" ? e.target.value : editingDesigner.url
                      })}
                      placeholder="http://gateway.production.com"
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="url-staging" className="text-sm text-gray-600 dark:text-gray-400">Staging</Label>
                    <Input
                      id="url-staging"
                      value={editingDesigner.urls?.staging || ""}
                      onChange={(e) => setEditingDesigner({
                        ...editingDesigner,
                        urls: { ...editingDesigner.urls, staging: e.target.value },
                        url: editingDesigner.environment === "staging" ? e.target.value : editingDesigner.url
                      })}
                      placeholder="http://gateway.staging.com"
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="url-development" className="text-sm text-gray-600 dark:text-gray-400">Development</Label>
                    <Input
                      id="url-development"
                      value={editingDesigner.urls?.development || ""}
                      onChange={(e) => setEditingDesigner({
                        ...editingDesigner,
                        urls: { ...editingDesigner.urls, development: e.target.value },
                        url: editingDesigner.environment === "development" ? e.target.value : editingDesigner.url
                      })}
                      placeholder="http://gateway.development.com"
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="url-local" className="text-sm text-gray-600 dark:text-gray-400">Local</Label>
                    <Input
                      id="url-local"
                      value={editingDesigner.urls?.local || ""}
                      onChange={(e) => setEditingDesigner({
                        ...editingDesigner,
                        urls: { ...editingDesigner.urls, local: e.target.value },
                        url: editingDesigner.environment === "local" ? e.target.value : editingDesigner.url
                      })}
                      placeholder="http://gateway.local.com"
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project" className="text-gray-900 dark:text-white">Project Name (optional)</Label>
                <Input
                  id="project"
                  value={editingDesigner.project || ""}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, project: e.target.value })}
                  placeholder="MyProject"
                  className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder" className="text-gray-900 dark:text-white">Folder</Label>
                <Select
                  value={editingDesigner.folderPath || "none"}
                  onValueChange={(value) =>
                    setEditingDesigner({ ...editingDesigner, folderPath: value === "none" ? undefined : value })
                  }
                >
                  <SelectTrigger id="folder" className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600">
                    <SelectItem value="none" className="text-gray-900 dark:text-white">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder} className="text-gray-900 dark:text-white">
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-gray-900 dark:text-white">Tags</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = editingDesigner.tags
                          if (currentTags.includes(tag)) {
                            setEditingDesigner({
                              ...editingDesigner,
                              tags: currentTags.filter((t) => t !== tag),
                            })
                          } else {
                            setEditingDesigner({
                              ...editingDesigner,
                              tags: [...currentTags, tag],
                            })
                          }
                        }}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                          editingDesigner.tags.includes(tag)
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600",
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="new-tag"
                      placeholder="Add new tag..."
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const input = e.currentTarget
                          const newTag = input.value.trim()
                          if (newTag && !editingDesigner.tags.includes(newTag)) {
                            setEditingDesigner({
                              ...editingDesigner,
                              tags: [...editingDesigner.tags, newTag],
                            })
                            input.value = ""
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700"
                      onClick={() => {
                        const input = document.getElementById("new-tag") as HTMLInputElement
                        const newTag = input.value.trim()
                        if (newTag && !editingDesigner.tags.includes(newTag)) {
                          setEditingDesigner({
                            ...editingDesigner,
                            tags: [...editingDesigner.tags, newTag],
                          })
                          input.value = ""
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700">
              Cancel
            </Button>
            <Button onClick={saveDesigner} className="bg-slate-600 hover:bg-slate-500 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DesignerCard({
  designer,
  groupName,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  isDraggedOver,
  disabled = false,
  onOpen,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onDelete,
  currentUrl,
  currentEnvironment,
}: {
  designer: Designer
  groupName: string
  onDragStart: (designer: Designer) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, designerId: string) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, designer: Designer, groupName: string) => void
  isDragging: boolean
  isDraggedOver: boolean
  disabled?: boolean
  onOpen: (designer: Designer) => void
  onEdit: (designer: Designer) => void
  onDuplicate: (designer: Designer) => void
  onToggleFavorite: (designerId: string) => void
  onDelete: (designerId: string) => void
  currentUrl?: string
  currentEnvironment?: string
}) {
  return (
    <div
      draggable={!disabled}
      onDragStart={() => !disabled && onDragStart(designer)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => !disabled && onDragOver(e, designer.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => !disabled && onDrop(e, designer, groupName)}
      className={cn(
        "group relative rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 p-4 transition-all hover:border-blue-500 hover:shadow-md",
        !disabled && "cursor-move",
        disabled && "cursor-default",
        isDragging && "opacity-50",
        isDraggedOver && "border-blue-500 border-2 scale-105 shadow-lg", // Visual feedback when dragged over
      )}
    >
      {!disabled && (
        <div className="absolute left-3 top-3 opacity-0 transition-opacity group-hover:opacity-50">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="absolute right-3 top-3 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(designer.id)
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              {designer.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit(designer)
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(designer)
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()

                // Convert to Ignition launcher format
                const jvmArgs = []
                if (designer.project) {
                  jvmArgs.push(`-Dproject.name=${designer.project}`)
                }

                const exportData = {
                  "window.mode": null,
                  "timeout": 30,
                  "screen": null,
                  "retries": -1,
                  "init.heap": null,
                  "max.heap": null,
                  "sun.java2d.d3d": null,
                  "sun.java2d.noddraw": null,
                  "jvm.arguments": jvmArgs,
                  "client.tag.overrides": {},
                  "fallback.application": "",
                  "use.custom.jre": false,
                  "custom.jre.path": "${JAVA_HOME}/bin/java",
                  "signature.verification.suppress.legacy": false,
                  "name": designer.name,
                  "description": null,
                  "gateway.info": {
                    "gateway.name": designer.name,
                    "gateway.address": designer.url,
                    "redundant.gateways": []
                  },
                  "last.updated": Date.now(),
                  "image.path": null,
                  "favorite": designer.isFavorite
                }

                // Download as JSON file
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${designer.name}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(designer.id)
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-balance flex-1">{designer.name}</h3>
            {designer.isFavorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />}
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {currentUrl || `No URL configured for ${currentEnvironment || designer.environment} environment`}
          </p>
        </div>

        <Badge
          variant={undefined}
          className="capitalize border-transparent"
          style={{
            backgroundColor: (currentEnvironment || designer.environment) === "production" ? "rgb(220 252 231)" :
                           (currentEnvironment || designer.environment) === "staging" ? "rgb(254 249 195)" :
                           (currentEnvironment || designer.environment) === "development" ? "rgb(219 234 254)" :
                           (currentEnvironment || designer.environment) === "local" ? "rgb(255 237 213)" : undefined,
            color: (currentEnvironment || designer.environment) === "production" ? "rgb(21 128 61)" :
                   (currentEnvironment || designer.environment) === "staging" ? "rgb(161 98 7)" :
                   (currentEnvironment || designer.environment) === "development" ? "rgb(29 78 216)" :
                   (currentEnvironment || designer.environment) === "local" ? "rgb(194 65 12)" : undefined,
          }}
        >
          {currentEnvironment || designer.environment}
        </Badge>

        <div className="flex flex-wrap gap-1">
          {designer.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="text-xs bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700 border-0 rounded-full">
              {tag}
            </Badge>
          ))}
          {designer.tags.length > 3 && (
            <Badge className="text-xs bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700 border-0 rounded-full">
              +{designer.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2 bg-[#2c5f8d] hover:bg-[#234a6d] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            size="sm"
            onClick={() => onOpen(designer)}
            disabled={!currentUrl}
          >
            <ExternalLink className="h-4 w-4" />
            Open Designer
          </Button>
          <Button
            className="gap-2 bg-slate-600 hover:bg-slate-500 text-white"
            size="sm"
            asChild
          >
            <a
              href={(currentUrl || designer.url).replace(/\/$/, '') + '/web'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

function FolderAccordion({
  folderPath,
  folderTree,
  viewMode,
  editMode,
  draggedFolder,
  dragOverFolder,
  dragOverGroup,
  renamingFolder,
  renamingFolderValue,
  setRenamingFolderValue,
  handleFolderDragStart,
  handleFolderDragEnd,
  handleFolderDragOver,
  handleFolderDrop,
  handleDragOver,
  handleDrop,
  startRenamingFolder,
  saveRenamedFolder,
  cancelRenamingFolder,
  duplicateFolder,
  openDesigner,
  designers,
  draggedDesigner,
  dragOverDesigner,
  handleDragStart,
  handleDragEnd,
  handleDesignerDragOver,
  handleDesignerDragLeave,
  handleDesignerDrop,
  openEditDialog,
  duplicateDesigner,
  toggleFavorite,
  deleteDesigner,
  folderEnvironment,
  setFolderEnvironment,
  folderEnvironments,
  folderOrder,
  setFolderOrder,
}: {
  folderPath: string
  folderTree: Record<string, { designers: Designer[], children: Set<string> }>
  viewMode: "grid" | "list"
  editMode: boolean
  draggedFolder: string | null
  dragOverFolder: string | null
  dragOverGroup: string | null
  renamingFolder: string | null
  renamingFolderValue: string
  setRenamingFolderValue: (value: string) => void
  handleFolderDragStart: (folderName: string, e?: React.DragEvent) => void
  handleFolderDragEnd: () => void
  handleFolderDragOver: (e: React.DragEvent, folderName: string) => void
  handleFolderDrop: (e: React.DragEvent, targetFolder: string) => void
  handleDragOver: (e: React.DragEvent, groupName: string) => void
  handleDrop: (e: React.DragEvent, targetGroup: string) => void
  startRenamingFolder: (folderName: string) => void
  saveRenamedFolder: () => Promise<void>
  cancelRenamingFolder: () => void
  duplicateFolder: (folderPath: string) => Promise<void>
  openDesigner: (designer: Designer, folderPath?: string) => Promise<void>
  designers: Designer[]
  draggedDesigner: Designer | null
  dragOverDesigner: string | null
  handleDragStart: (designer: Designer) => void
  handleDragEnd: () => void
  handleDesignerDragOver: (e: React.DragEvent, designerId: string) => void
  handleDesignerDragLeave: () => void
  handleDesignerDrop: (e: React.DragEvent, designer: Designer, groupName: string) => void
  openEditDialog: (designer: Designer) => void
  duplicateDesigner: (designer: Designer) => void
  toggleFavorite: (designerId: string) => void
  deleteDesigner: (designerId: string) => void
  folderEnvironment: "production" | "staging" | "development" | "local" | "all"
  setFolderEnvironment: (folderPath: string, env: "production" | "staging" | "development" | "local" | "all") => void
  folderEnvironments: Record<string, "production" | "staging" | "development" | "local" | "all">
  folderOrder: Record<string, string[]>
  setFolderOrder: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
}) {
  const folder = folderTree[folderPath]
  if (!folder) return null

  const displayName = folderPath.split('/').pop() || folderPath

  // Sort child folders using custom order if available
  const childFoldersArray = Array.from(folder.children)
  const customOrder = folderOrder?.[folderPath] ?? []
  const childFolders = customOrder.length > 0
    ? [...childFoldersArray].sort((a, b) => {
        const aIndex = customOrder.indexOf(a)
        const bIndex = customOrder.indexOf(b)
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    : childFoldersArray.sort()

  console.log(`FolderAccordion ${folderPath}:`, {
    childFoldersArray: childFoldersArray.slice(),
    customOrder,
    childFolders: childFolders.slice()
  })

  // Calculate total designers in this folder and all subfolders recursively
  const getTotalDesigners = (path: string): number => {
    const f = folderTree[path]
    if (!f) return 0
    let total = f.designers.length
    Array.from(f.children).forEach((childPath) => {
      total += getTotalDesigners(childPath)
    })
    return total
  }

  const totalDesigners = getTotalDesigners(folderPath)

  return (
    <AccordionItem
      value={folderPath}
      draggable={editMode}
      onDragStart={(e) => handleFolderDragStart(folderPath, e)}
      onDragEnd={handleFolderDragEnd}
      className={cn(
        "group rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 transition-all shadow-sm",
        dragOverGroup === folderPath && !editMode && "border-blue-500 bg-blue-50 dark:bg-blue-950",
        dragOverFolder === folderPath && editMode && "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105",
        draggedFolder === folderPath && "opacity-50",
        editMode && "cursor-move",
      )}
      onDragOver={(e) => {
        if (editMode) {
          handleFolderDragOver(e, folderPath)
        } else {
          handleDragOver(e, folderPath)
        }
      }}
      onDrop={(e) => {
        if (editMode) {
          handleFolderDrop(e, folderPath)
        } else {
          handleDrop(e, folderPath)
        }
      }}
    >
      <div className="flex items-center justify-between w-full px-4 py-3 group">
        <div className="flex items-center gap-2 flex-1">
          <AccordionTrigger className="flex-1 hover:no-underline py-0 pr-4">
            <div className="flex items-center gap-2 flex-1">
              {editMode && <GripVertical className="h-5 w-5 text-muted-foreground" />}
              <Folder className="h-5 w-5 text-muted-foreground" />
              {renamingFolder === folderPath ? (
                <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={renamingFolderValue}
                    onChange={(e) => setRenamingFolderValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveRenamedFolder()
                      } else if (e.key === "Escape") {
                        cancelRenamingFolder()
                      }
                    }}
                    className="h-8 text-lg font-semibold max-w-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={saveRenamedFolder}
                    className="h-8 bg-slate-600 hover:bg-slate-500"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelRenamingFolder}
                    className="h-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-lg font-semibold">{displayName}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalDesigners})
                  </span>
                </>
              )}
            </div>
          </AccordionTrigger>
          {!editMode && childFolders.length === 0 && folder.designers.length > 0 && (
            <div className="flex gap-1 rounded-lg border border-gray-300 dark:border-neutral-500 bg-gray-100 dark:bg-neutral-800 p-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFolderEnvironment(folderPath, "local")}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  folderEnvironment === "local" ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-gray-200 dark:hover:bg-neutral-700"
                )}
              >
                Local
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFolderEnvironment(folderPath, "development")}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  folderEnvironment === "development" ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-gray-200 dark:hover:bg-neutral-700"
                )}
              >
                Development
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFolderEnvironment(folderPath, "staging")}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  folderEnvironment === "staging" ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-gray-200 dark:hover:bg-neutral-700"
                )}
              >
                Staging
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFolderEnvironment(folderPath, "production")}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  folderEnvironment === "production" ? "bg-blue-500 text-white hover:bg-blue-600" : "hover:bg-gray-200 dark:hover:bg-neutral-700"
                )}
              >
                Production
              </Button>
            </div>
          )}
          {editMode && renamingFolder !== folderPath && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateFolder(folderPath)
                }}
                className="h-7 px-2 flex-shrink-0 bg-slate-600 text-white hover:bg-slate-500 border-slate-600"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Duplicate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  startRenamingFolder(folderPath)
                }}
                className="h-7 px-2 flex-shrink-0 bg-slate-600 text-white hover:bg-slate-500 border-slate-600"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Rename
              </Button>
            </div>
          )}
        </div>
        {!editMode && folder.designers.length > 0 && childFolders.length === 0 && (
          <div className="flex gap-2">
            <Button
              className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                folder.designers.forEach((designer, index) => {
                  setTimeout(() => {
                    openDesigner(designer, folderPath)
                  }, index * 100)
                })
              }}
            >
              <Play className="h-4 w-4" />
              Launch All
            </Button>
          </div>
        )}
      </div>
      <AccordionContent className="px-4 pb-4">
        {/* Render child folders first */}
        {childFolders.length > 0 && (
          <Accordion type="multiple" className="space-y-2 mb-4">
            {childFolders.map((childPath) => (
              <FolderAccordion
                key={childPath}
                folderPath={childPath}
                folderTree={folderTree}
                viewMode={viewMode}
                editMode={editMode}
                draggedFolder={draggedFolder}
                dragOverFolder={dragOverFolder}
                dragOverGroup={dragOverGroup}
                renamingFolder={renamingFolder}
                renamingFolderValue={renamingFolderValue}
                setRenamingFolderValue={setRenamingFolderValue}
                handleFolderDragStart={handleFolderDragStart}
                handleFolderDragEnd={handleFolderDragEnd}
                handleFolderDragOver={handleFolderDragOver}
                handleFolderDrop={handleFolderDrop}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                startRenamingFolder={startRenamingFolder}
                saveRenamedFolder={saveRenamedFolder}
                cancelRenamingFolder={cancelRenamingFolder}
                duplicateFolder={duplicateFolder}
                openDesigner={openDesigner}
                designers={designers}
                draggedDesigner={draggedDesigner}
                dragOverDesigner={dragOverDesigner}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDesignerDragOver={handleDesignerDragOver}
                handleDesignerDragLeave={handleDesignerDragLeave}
                handleDesignerDrop={handleDesignerDrop}
                openEditDialog={openEditDialog}
                duplicateDesigner={duplicateDesigner}
                toggleFavorite={toggleFavorite}
                deleteDesigner={deleteDesigner}
                folderEnvironment={folderEnvironments[childPath] || "all"}
                setFolderEnvironment={setFolderEnvironment}
                folderEnvironments={folderEnvironments}
                folderOrder={folderOrder}
                setFolderOrder={setFolderOrder}
              />
            ))}
          </Accordion>
        )}

        {/* Render designers in this folder */}
        {folder.designers.length > 0 && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {folder.designers.map((designer) => {
                const hasSpecificEnvUrl = designer.urls && folderEnvironment !== "all" && designer.urls[folderEnvironment]
                const currentUrl = hasSpecificEnvUrl
                  ? designer.urls[folderEnvironment]
                  : (folderEnvironment === "all" ? designer.url : undefined)
                const currentEnv = folderEnvironment !== "all" ? folderEnvironment : designer.environment

                return (
                  <DesignerCard
                    key={designer.id}
                    designer={designer}
                    groupName={folderPath}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDesignerDragOver}
                    onDragLeave={handleDesignerDragLeave}
                    onDrop={handleDesignerDrop}
                    isDragging={draggedDesigner?.id === designer.id}
                    isDraggedOver={dragOverDesigner === designer.id}
                    disabled={editMode}
                    onOpen={(d) => openDesigner(d, folderPath)}
                    onEdit={openEditDialog}
                    onDuplicate={duplicateDesigner}
                    onToggleFavorite={toggleFavorite}
                    onDelete={deleteDesigner}
                    currentUrl={currentUrl}
                    currentEnvironment={currentEnv}
                  />
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {folder.designers.map((designer) => {
                const hasSpecificEnvUrl = designer.urls && folderEnvironment !== "all" && designer.urls[folderEnvironment]
                const currentUrl = hasSpecificEnvUrl
                  ? designer.urls[folderEnvironment]
                  : (folderEnvironment === "all" ? designer.url : undefined)
                const currentEnv = folderEnvironment !== "all" ? folderEnvironment : designer.environment

                return (
                  <DesignerListItem
                    key={designer.id}
                    designer={designer}
                    groupName={folderPath}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDesignerDragOver}
                    onDragLeave={handleDesignerDragLeave}
                    onDrop={handleDesignerDrop}
                    isDragging={draggedDesigner?.id === designer.id}
                    isDraggedOver={dragOverDesigner === designer.id}
                    disabled={editMode}
                    onOpen={(d) => openDesigner(d, folderPath)}
                    onEdit={openEditDialog}
                    onDuplicate={duplicateDesigner}
                    onToggleFavorite={toggleFavorite}
                    onDelete={deleteDesigner}
                    currentUrl={currentUrl}
                    currentEnvironment={currentEnv}
                  />
                )
              })}
            </div>
          )
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

function DesignerListItem({
  designer,
  groupName,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragging,
  isDraggedOver,
  disabled = false,
  onOpen,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onDelete,
  currentUrl,
  currentEnvironment,
}: {
  designer: Designer
  groupName: string
  onDragStart: (designer: Designer) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, designerId: string) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, designer: Designer, groupName: string) => void
  isDragging: boolean
  isDraggedOver: boolean
  disabled?: boolean
  onOpen: (designer: Designer) => void
  onEdit: (designer: Designer) => void
  onDuplicate: (designer: Designer) => void
  onToggleFavorite: (designerId: string) => void
  onDelete: (designerId: string) => void
  currentUrl?: string
  currentEnvironment?: string
}) {
  return (
    <div
      draggable={!disabled}
      onDragStart={() => !disabled && onDragStart(designer)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => !disabled && onDragOver(e, designer.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => !disabled && onDrop(e, designer, groupName)}
      className={cn(
        "group flex items-center gap-4 rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 p-4 transition-all hover:border-blue-500 hover:shadow-md",
        !disabled && "cursor-move",
        disabled && "cursor-default",
        isDragging && "opacity-50",
        isDraggedOver && "border-blue-500 border-2 scale-[1.02] shadow-lg", // Visual feedback when dragged over
      )}
    >
      {!disabled && (
        <GripVertical className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-50" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{designer.name}</h3>
          {designer.isFavorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {currentUrl || `No URL configured for ${currentEnvironment || designer.environment} environment`}
        </p>
      </div>

      <Badge
        variant={undefined}
        className="capitalize border-transparent"
        style={{
          backgroundColor: (currentEnvironment || designer.environment) === "production" ? "rgb(220 252 231)" :
                         (currentEnvironment || designer.environment) === "staging" ? "rgb(254 249 195)" :
                         (currentEnvironment || designer.environment) === "development" ? "rgb(219 234 254)" :
                         (currentEnvironment || designer.environment) === "local" ? "rgb(255 237 213)" : undefined,
          color: (currentEnvironment || designer.environment) === "production" ? "rgb(21 128 61)" :
                 (currentEnvironment || designer.environment) === "staging" ? "rgb(161 98 7)" :
                 (currentEnvironment || designer.environment) === "development" ? "rgb(29 78 216)" :
                 (currentEnvironment || designer.environment) === "local" ? "rgb(194 65 12)" : undefined,
        }}
      >
        {currentEnvironment || designer.environment}
      </Badge>

      <div className="flex gap-1">
        {designer.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {designer.tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{designer.tags.length - 2}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="gap-2 bg-[#2c5f8d] hover:bg-[#234a6d] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onOpen(designer)}
          disabled={!currentUrl}
        >
          <ExternalLink className="h-4 w-4" />
          Open
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-slate-600 hover:bg-slate-500"
          asChild
        >
          <a
            href={(currentUrl || designer.url).replace(/\/$/, '') + '/web'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-4 w-4" />
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(designer.id)
              }}
            >
              <Star className="mr-2 h-4 w-4" />
              {designer.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit(designer)
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(designer)
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()

                // Convert to Ignition launcher format
                const jvmArgs = []
                if (designer.project) {
                  jvmArgs.push(`-Dproject.name=${designer.project}`)
                }

                const exportData = {
                  "window.mode": null,
                  "timeout": 30,
                  "screen": null,
                  "retries": -1,
                  "init.heap": null,
                  "max.heap": null,
                  "sun.java2d.d3d": null,
                  "sun.java2d.noddraw": null,
                  "jvm.arguments": jvmArgs,
                  "client.tag.overrides": {},
                  "fallback.application": "",
                  "use.custom.jre": false,
                  "custom.jre.path": "${JAVA_HOME}/bin/java",
                  "signature.verification.suppress.legacy": false,
                  "name": designer.name,
                  "description": null,
                  "gateway.info": {
                    "gateway.name": designer.name,
                    "gateway.address": designer.url,
                    "redundant.gateways": []
                  },
                  "last.updated": Date.now(),
                  "image.path": null,
                  "favorite": designer.isFavorite
                }

                // Download as JSON file
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${designer.name}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(designer.id)
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
