// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

/**
 * Function for obtaining user and app paths.  Used for debugging purposes.
 * @returns an object with keys userData:, appData:, logs:, appPath
 */
async function handleGetPaths() {
  const obj = {
    userData: app.getPath('userData'),
    appData: app.getPath('appData'),
    logs: app.getPath('logs'),
    appPath: app.getAppPath()
  }
  return obj
}


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 1120,
    minHeight: 780,
    width: 1120,
    height: 780,
    backgroundColor: '#666',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#666',
      symbolColor: '#bbb'
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.menuBarVisible = false

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  console.log("userData: ",app.getPath('userData'))
  console.log("appData: ",app.getPath('appData'))
  console.log("logs: ",app.getPath('logs'))
  console.log("getAppPath: ",app.getAppPath())
  ipcMain.handle('getPaths', handleGetPaths)
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
