import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ipcMain } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url)
})

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    titleBarStyle: 'hiddenInset', // Makes it look like a native Mac app
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test if it's running in dev mode
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Uncomment next line to open DevTools automatically in dev
    // win.webContents.openDevTools()
  } else {
    // process.env.DIST depends on vite-plugin-electron setup
    win.loadFile(path.join(process.env.APP_ROOT || path.join(__dirname, '..'), 'dist/index.html'))
  }
}

// Register custom protocol 'bloom://'
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('bloom', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('bloom')
}

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      
      const url = commandLine.find((arg) => arg.startsWith('bloom://'))
      if (url) {
        win.webContents.send('deep-link', url)
      }
    }
  })

  app.whenReady().then(createWindow)
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  if (win && url.startsWith('bloom://')) {
    win.webContents.send('deep-link', url)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
