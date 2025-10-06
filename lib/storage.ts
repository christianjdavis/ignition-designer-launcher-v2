// Storage abstraction layer that works in both web and Electron

declare global {
  interface Window {
    electronAPI?: {
      getGateways: () => Promise<any[]>
      saveGateways: (gateways: any[]) => Promise<{ success: boolean }>
      getTags: () => Promise<string[]>
      saveTags: (tags: string[]) => Promise<{ success: boolean }>
      getFolders: () => Promise<string[]>
      saveFolders: (folders: string[]) => Promise<{ success: boolean }>
      isElectron: boolean
    }
  }
}

// Check dynamically each time instead of caching
function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron === true
}

console.log('Storage initialization:')
console.log('- window.electronAPI:', typeof window !== 'undefined' ? window.electronAPI : 'window not defined')
console.log('- isElectron:', isElectron())

export async function getGateways() {
  console.log('getGateways called, isElectron:', isElectron())
  if (isElectron() && window.electronAPI) {
    console.log('Using Electron IPC for getGateways')
    return await window.electronAPI.getGateways()
  } else {
    console.log('Using fetch for getGateways')
    const response = await fetch('/api/gateways')
    return await response.json()
  }
}

export async function saveGateways(gateways: any[]) {
  console.log('saveGateways called, isElectron:', isElectron(), 'gateways count:', gateways.length)
  if (isElectron() && window.electronAPI) {
    console.log('Using Electron IPC for saveGateways')
    return await window.electronAPI.saveGateways(gateways)
  } else {
    console.log('Using fetch for saveGateways')
    const response = await fetch('/api/gateways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gateways),
    })
    return await response.json()
  }
}

export async function getTags() {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.getTags()
  } else {
    const response = await fetch('/api/tags')
    return await response.json()
  }
}

export async function saveTags(tags: string[]) {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.saveTags(tags)
  } else {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tags),
    })
    return await response.json()
  }
}

export async function getFolders() {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.getFolders()
  } else {
    const response = await fetch('/api/folders')
    return await response.json()
  }
}

export async function saveFolders(folders: string[]) {
  if (isElectron() && window.electronAPI) {
    return await window.electronAPI.saveFolders(folders)
  } else {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(folders),
    })
    return await response.json()
  }
}
