const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getGateways: () => ipcRenderer.invoke('get-gateways'),
  saveGateways: (gateways) => ipcRenderer.invoke('save-gateways', gateways),
  getTags: () => ipcRenderer.invoke('get-tags'),
  saveTags: (tags) => ipcRenderer.invoke('save-tags', tags),
  getFolders: () => ipcRenderer.invoke('get-folders'),
  saveFolders: (folders) => ipcRenderer.invoke('save-folders', folders),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
})
