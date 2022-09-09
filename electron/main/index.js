import { release } from 'os'
import { join } from 'path'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import debug from 'electron-debug'
import unhandled from 'electron-unhandled'

// Main Process Modules: https://www.electronjs.org/docs/latest/api/app
// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1'))
  app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32')
  app.setAppUserModelId(app.getName())

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, '../..'),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHTML = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
  // Create the browser window.
  // https://www.electronjs.org/docs/latest/api/browser-window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Application is currently initializing...',
    icon: join(ROOT_PATH.public, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // Load app
  if (app.isPackaged) {
    win.loadFile(indexHTML)
  }
  else {
    win.loadURL(url)

    // Open devTool if the app is not packaged
    win.webContents.openDevTools()

    debug()
    // unhandled()

    // https://github.com/MarshallOfSound/electron-devtools-installer/issues/187
    // Errors are thrown if the dev tools are opened before the DOM is ready
    // await installExtension(VUEJS3_DEVTOOLS)
    //   .then(name => console.log(`Added Extension: ${name}`))
    //   .catch(err => console.log('An error occurred: ', err))
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window
    // For multiple windows store them in an array
    win = null
  })

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win.setTitle(`Getting started with electron-vite-vue-starter (v${app.getVersion()})`)
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:'))
      shell.openExternal(url)
    return { action: 'deny' }
  })
}

// or 'ready' event
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized())
      win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length)
    allWindows[0].focus()

  else
    createWindow()
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged)
    childWindow.loadFile(indexHTML, { hash: arg })

  else
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
})

// https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
// app.on('web-contents-created', (_event, _contents) => {})
