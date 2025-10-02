const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

// Get user data directory
const userDataPath = app.getPath('userData')
const gatewaysFilePath = path.join(userDataPath, 'gateways.json')
const tagsFilePath = path.join(userDataPath, 'tags.json')

// Ensure data files exist
async function ensureDataFiles() {
  try {
    await fs.promises.access(gatewaysFilePath)
  } catch {
    await fs.promises.writeFile(gatewaysFilePath, '[]')
  }

  try {
    await fs.promises.access(tagsFilePath)
  } catch {
    await fs.promises.writeFile(tagsFilePath, '[]')
  }
}

// IPC Handlers for file operations
ipcMain.handle('get-gateways', async () => {
  try {
    const data = await fs.promises.readFile(gatewaysFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading gateways:', error)
    return []
  }
})

ipcMain.handle('save-gateways', async (event, gateways) => {
  try {
    await fs.promises.writeFile(gatewaysFilePath, JSON.stringify(gateways, null, 2))
    return { success: true }
  } catch (error) {
    console.error('Error saving gateways:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-tags', async () => {
  try {
    const data = await fs.promises.readFile(tagsFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading tags:', error)
    return []
  }
})

ipcMain.handle('save-tags', async (event, tags) => {
  try {
    await fs.promises.writeFile(tagsFilePath, JSON.stringify(tags, null, 2))
    return { success: true }
  } catch (error) {
    console.error('Error saving tags:', error)
    return { success: false, error: error.message }
  }
})

function createWindow() {
  console.log('[Main] isDev:', isDev)
  console.log('[Main] NODE_ENV:', process.env.NODE_ENV)

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      partition: 'persist:main',
    },
    icon: path.join(__dirname, '../public/launcher.png'),
    titleBarStyle: 'default',
  })

  if (isDev) {
    console.log('[Main] Loading dev URL')
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../out/index.html')
    console.log('[Main] Loading file:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  await ensureDataFiles()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
