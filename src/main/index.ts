import { app, shell, BrowserWindow, Menu, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import './database'
import { registrarIpcInmobles } from './ipc/inmobles'
import { registrarIpcInquilins } from './ipc/inquilins'
import { registrarIpcConfig } from './ipc/config'
import { registrarIpcContractes } from './ipc/contractes'
import { registrarIpcDocuments } from './ipc/documents'
import { registrarIpcApp } from './ipc/app'
import { registrarIpcDocumentsImmoble } from './ipc/documentsImmoble'
import { registrarIpcExportacio } from './ipc/exportacio'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menuItems: Electron.MenuItemConstructorOptions[] = []

    // Corrector ortogràfic
    if (params.misspelledWord) {
      if (params.dictionarySuggestions.length > 0) {
        for (const suggestion of params.dictionarySuggestions) {
          menuItems.push({
            label: suggestion,
            click: () => {
              mainWindow.webContents.replaceMisspelling(suggestion)
            }
          })
        }
      } else {
        menuItems.push({
          label: 'No hi ha suggeriments',
          enabled: false
        })
      }

      menuItems.push({
        label: 'Afegeix al diccionari',
        click: () => {
          session.defaultSession.addWordToSpellCheckerDictionary(params.misspelledWord)
        }
      })

      menuItems.push({ type: 'separator' })
    }

    // Edició
    const flags = params.editFlags

    if (flags.canUndo || flags.canRedo) {
      if (flags.canUndo) menuItems.push({ role: 'undo', label: 'Desfés' })
      if (flags.canRedo) menuItems.push({ role: 'redo', label: 'Refés' })
      menuItems.push({ type: 'separator' })
    }

    if (flags.canCut) menuItems.push({ role: 'cut', label: 'Retalla' })
    if (flags.canCopy) menuItems.push({ role: 'copy', label: 'Copia' })
    if (flags.canPaste) menuItems.push({ role: 'paste', label: 'Enganxa' })
    if (flags.canDelete) menuItems.push({ role: 'delete', label: 'Elimina' })

    if (flags.canSelectAll) {
      if (menuItems.length > 0) menuItems.push({ type: 'separator' })
      menuItems.push({ role: 'selectAll', label: 'Selecciona-ho tot' })
    }

    if (menuItems.length > 0) {
      event.preventDefault()
      Menu.buildFromTemplate(menuItems).popup({ window: mainWindow })
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('https://')) shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.lmoreso.lloguers')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registrarIpcInmobles()

  registrarIpcInquilins()

  registrarIpcConfig()

  registrarIpcContractes()

  registrarIpcDocuments()

  registrarIpcApp()

  registrarIpcDocumentsImmoble()

  registrarIpcExportacio()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
