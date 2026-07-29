import { app, BrowserWindow, shell, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ipcMain } from 'electron'

app.setName('Bloom')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url)
})

let win: BrowserWindow | null = null
let pendingDeepLink: string | null = null  // Buffer URL that arrives before renderer is ready

function sendDeepLink(url: string) {
  if (win && win.webContents) {
    win.webContents.send('deep-link', url)
  } else {
    pendingDeepLink = url
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'Bloom',
    icon: path.join(__dirname, '../public/app-icon.png'),
    titleBarStyle: 'hiddenInset', // Makes it look like a native Mac app
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Force all popup windows and new URLs to open in default external browser (Chrome/Safari)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // When renderer has loaded, send any buffered deep link
  win.webContents.once('did-finish-load', () => {
    if (pendingDeepLink) {
      win?.webContents.send('deep-link', pendingDeepLink)
      pendingDeepLink = null
    }
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

function createMenu() {
  const isMac = process.platform === 'darwin'
  const template: any[] = [
    ...(isMac
      ? [{
          label: 'Bloom',
          submenu: [
            { role: 'about', label: 'About Bloom' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide', label: 'Hide Bloom' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit', label: 'Quit Bloom' },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      
      const url = commandLine.find((arg) => arg.startsWith('bloom://'))
      if (url) {
        sendDeepLink(url)
      }
    }
  })

  app.whenReady().then(() => {
    createMenu()
    createWindow()
  })
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  if (url.startsWith('bloom://')) {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
    sendDeepLink(url)
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
