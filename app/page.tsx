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
  project?: string // Project name for designer deep link
  status: "online" | "offline"
  environment: "production" | "staging" | "development" | "local"
  tags: string[]
  isFavorite: boolean
  lastAccessed: Date
  group?: string
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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('designer-launcher-viewMode') as ViewMode) || "grid"
    }
    return "grid"
  })
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<"none" | "group" | "environment">("group")
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [editTagsMode, setEditTagsMode] = useState(false)
  const [openFolders, setOpenFolders] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('designer-launcher-openFolders')
        return saved ? JSON.parse(saved) : []
      } catch {
        return []
      }
    }
    return []
  })

  // Generate Ignition designer deep link
  const generateDesignerLink = (designer: Designer): string => {
    // Extract hostname from URL (remove http:// or https://, port, and trailing slash)
    let hostname = designer.url.replace(/^https?:\/\//, "").replace(/\/$/, "")

    // Remove any existing port from the hostname
    hostname = hostname.split(':')[0]

    // Don't append port - use hostname directly as gateway address
    const gateway = hostname

    // Build deep link: designer://Gateway or designer://Gateway/projectName
    // Add insecure=true if the original URL was HTTP
    const isHttp = designer.url.startsWith('http://')
    const baseLink = designer.project ? `designer://${gateway}/${designer.project}` : `designer://${gateway}`

    return isHttp ? `${baseLink}?insecure=true` : baseLink
  }

  const openDesigner = async (designer: Designer) => {
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

    // Open designer
    const deepLink = generateDesignerLink(designer)
    console.log('Opening deep link:', deepLink)
    window.location.href = deepLink
  }

  const allTags = Array.from(new Set([...designers.flatMap((d) => d.tags), ...customTags]))
  const environmentOrder: Designer['environment'][] = ['production', 'staging', 'development', 'local']
  const allEnvironments = environmentOrder.filter(env => designers.some(d => d.environment === env))

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

      if (selectedEnvironments.length > 0 && !selectedEnvironments.includes(designer.environment)) {
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

  const groupedDesigners =
    groupBy === "none" || filterTab === "recent"
      ? { "All Designers": filteredDesigners }
      : filteredDesigners.reduce(
          (acc, designer) => {
            const key = groupBy === "group" ? designer.group || "Ungrouped" : designer.environment
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

  const [folderOrder, setFolderOrder] = useState<string[]>(Object.keys(groupedDesigners))

  const orderedGroups = folderOrder
    .filter((folder) => groupedDesigners[folder])
    .concat(Object.keys(groupedDesigners).filter((folder) => !folderOrder.includes(folder)))

  // Initialize open folders on mount
  React.useEffect(() => {
    if (groupBy !== "none" && filterTab !== "recent") {
      // Only initialize if openFolders is empty
      setOpenFolders(prev => prev.length === 0 ? orderedGroups : prev)
    }
  }, [groupBy, filterTab])

  // Persist viewMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('designer-launcher-viewMode', viewMode)
    }
  }, [viewMode])

  // Persist openFolders to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('designer-launcher-openFolders', JSON.stringify(openFolders))
    }
  }, [openFolders])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleEnvironment = (env: string) => {
    setSelectedEnvironments((prev) => (prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]))
  }

  const openEditDialog = (designer: Designer) => {
    console.log('Opening edit dialog for:', designer.name)
    setEditingDesigner({ ...designer })
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

  const deleteDesigner = (designerId: string) => {
    if (confirm('Are you sure you want to delete this designer?')) {
      setDesigners((prev) => prev.filter((d) => d.id !== designerId))
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

  const handleFolderDragStart = (folderName: string) => {
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
      setDragOverFolder(folderName)
    }
  }

  const handleFolderDragLeave = () => {
    setDragOverFolder(null)
  }

  const handleFolderDrop = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedFolder || !editMode) return

    const currentIndex = orderedGroups.indexOf(draggedFolder)
    const targetIndex = orderedGroups.indexOf(targetFolder)

    if (currentIndex === -1 || targetIndex === -1) return

    const newOrder = [...orderedGroups]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, draggedFolder)

    setFolderOrder(newOrder)
    setDraggedFolder(null)
    setDragOverFolder(null)
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
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-white">
                Group By
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="mx-4 w-[calc(100%-2rem)] justify-between bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      {groupBy === "none" ? "None" : groupBy === "group" ? "Location" : "Environment"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setGroupBy("none")}>None</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGroupBy("group")}>Location</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGroupBy("environment")}>Environment</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-white">
                Environment
              </h3>
              <div className="space-y-0">
                {allEnvironments.map((env) => (
                  <button
                    key={env}
                    onClick={() => toggleEnvironment(env)}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
                      selectedEnvironments.includes(env)
                        ? "bg-gray-300 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-800",
                    )}
                  >
                    <Circle
                      className="h-2 w-2 fill-current"
                      style={{
                        color: env === "production" ? "rgb(34 197 94)" :
                               env === "staging" ? "rgb(234 179 8)" :
                               env === "development" ? "rgb(59 130 246)" :
                               env === "local" ? "rgb(249 115 22)" : undefined
                      }}
                    />
                    <span className="capitalize">{env}</span>
                    <span className="ml-auto text-xs">{designers.filter((d) => d.environment === env).length}</span>
                  </button>
                ))}
              </div>
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
                {(selectedTags.length > 0 || selectedEnvironments.length > 0) && (
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
                    {selectedEnvironments.map((env) => (
                      <Badge key={env} variant="secondary" className="gap-1 capitalize pr-1">
                        {env}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleEnvironment(env)
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
                        setSelectedEnvironments([])
                      }}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
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
            {groupBy !== "none" && filterTab !== "recent" ? (
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
                        "rounded border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 transition-all shadow-sm",
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
                      <div className="flex items-center justify-between w-full px-4 py-3">
                        <AccordionTrigger className="flex-1 hover:no-underline py-0 pr-4">
                          <div className="flex items-center gap-2">
                            {editMode && <GripVertical className="h-5 w-5 text-muted-foreground" />}
                            <Folder className="h-5 w-5 text-muted-foreground" />
                            <span className="text-lg font-semibold">{groupName}</span>
                            <span className="text-sm font-normal text-muted-foreground">({designers.length})</span>
                          </div>
                        </AccordionTrigger>
                        {!editMode && designers.length > 0 && (
                          <Button
                            className="gap-2 h-9 border border-gray-300 dark:border-neutral-500 bg-slate-600 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500 text-white cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              designers.forEach((designer, index) => {
                                setTimeout(() => {
                                  openDesigner(designer)
                                }, index * 100)
                              })
                            }}
                          >
                            <Play className="h-4 w-4" />
                            Launch All
                          </Button>
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
                                onOpen={openDesigner}
                                onEdit={openEditDialog}
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
                                onOpen={openDesigner}
                                onEdit={openEditDialog}
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
                        onOpen={openDesigner}
                        onEdit={openEditDialog}
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
                        onOpen={openDesigner}
                        onEdit={openEditDialog}
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

      {/* Edit Designer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Designer</DialogTitle>
          </DialogHeader>
          {editingDesigner && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingDesigner.name}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="url">Gateway URL</Label>
                <Input
                  id="url"
                  value={editingDesigner.url}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, url: e.target.value })}
                  placeholder="http://gateway.example.com"
                />
              </div>
              <div>
                <Label htmlFor="project">Project Name (optional)</Label>
                <Input
                  id="project"
                  value={editingDesigner.project || ""}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, project: e.target.value })}
                  placeholder="MyProject"
                />
              </div>
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={editingDesigner.environment}
                  onValueChange={(value) =>
                    setEditingDesigner({ ...editingDesigner, environment: value as Designer["environment"] })
                  }
                >
                  <SelectTrigger id="environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="group">Group</Label>
                <Input
                  id="group"
                  value={editingDesigner.group || ""}
                  onChange={(e) => setEditingDesigner({ ...editingDesigner, group: e.target.value })}
                  placeholder="Group 1"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
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
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
                      onClick={(e) => {
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveDesigner}>Save Changes</Button>
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
  onToggleFavorite,
  onDelete,
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
  onToggleFavorite: (designerId: string) => void
  onDelete: (designerId: string) => void
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
          <p className="mt-1 text-xs text-muted-foreground truncate">{designer.url}</p>
        </div>

        <Badge
          variant={undefined}
          className="capitalize border-transparent"
          style={{
            backgroundColor: designer.environment === "production" ? "rgb(220 252 231)" :
                           designer.environment === "staging" ? "rgb(254 249 195)" :
                           designer.environment === "development" ? "rgb(219 234 254)" :
                           designer.environment === "local" ? "rgb(255 237 213)" : undefined,
            color: designer.environment === "production" ? "rgb(21 128 61)" :
                   designer.environment === "staging" ? "rgb(161 98 7)" :
                   designer.environment === "development" ? "rgb(29 78 216)" :
                   designer.environment === "local" ? "rgb(194 65 12)" : undefined,
          }}
        >
          {designer.environment}
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

        <Button className="w-full gap-2 bg-[#2c5f8d] hover:bg-[#234a6d] text-white" size="sm" onClick={() => onOpen(designer)}>
          <ExternalLink className="h-4 w-4" />
          Open Designer
        </Button>
      </div>
    </div>
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
  onToggleFavorite,
  onDelete,
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
  onToggleFavorite: (designerId: string) => void
  onDelete: (designerId: string) => void
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
        <p className="text-sm text-muted-foreground truncate">{designer.url}</p>
      </div>

      <Badge
        variant={undefined}
        className="capitalize border-transparent"
        style={{
          backgroundColor: designer.environment === "production" ? "rgb(220 252 231)" :
                         designer.environment === "staging" ? "rgb(254 249 195)" :
                         designer.environment === "development" ? "rgb(219 234 254)" :
                         designer.environment === "local" ? "rgb(255 237 213)" : undefined,
          color: designer.environment === "production" ? "rgb(21 128 61)" :
                 designer.environment === "staging" ? "rgb(161 98 7)" :
                 designer.environment === "development" ? "rgb(29 78 216)" :
                 designer.environment === "local" ? "rgb(194 65 12)" : undefined,
        }}
      >
        {designer.environment}
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
        <Button size="sm" className="gap-2 bg-[#2c5f8d] hover:bg-[#234a6d]" onClick={() => onOpen(designer)}>
          <ExternalLink className="h-4 w-4" />
          Open
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
