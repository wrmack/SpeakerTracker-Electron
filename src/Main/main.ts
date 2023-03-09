import type { Database } from 'sqlite3'
import { app, BrowserWindow, ipcMain } from 'electron'
import path = require('path')
const sqlite3 = require('sqlite3').verbose()


let db: Database


function createWindow () {
  // Create the browser window.
  // titleBarOverlay causes enableblinkfeatures error in devtools - https://github.com/electron/electron/issues/36948
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
  mainWindow.webContents.openDevTools({mode:'detach'})

  // Handles opening windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("window url ", url)
    if (url === 'about:blank#blocked') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          frame: true,
          fullscreenable: false,
          autoHideMenuBar: true,
          show: true
        }
      }
    }
    else {
      // Opens the window in the default external browser
      const { shell } = require('electron')
      shell.openExternal(url);
      return { action: 'deny' }
    }
  })

  mainWindow.webContents.once('did-create-window', (window, details) => {
    console.log("here")
    // details.options.backgroundColor = '#525254'
    // window.show()
  })
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

/**
 * IPC Handlers
 */

/**
 * Function for obtaining user and app paths.  Used for debugging purposes.
 * @returns an object with keys userData:, appData:, logs:, appPath
 */
ipcMain.handle('getPaths', async () => {
  const obj = {
    userData: app.getPath('userData'),
    appData: app.getPath('appData'),
    logs: app.getPath('logs'),
    appPath: app.getAppPath()
  }
  return obj
})


ipcMain.handle('dbConnect', async () => {
  const userPath = app.getPath('userData')
  const dbPath = path.join(userPath,'mydb.db')
  db = new sqlite3.Database(dbPath, (err: Error) => {
    if (err) {
      console.error(err.message)
    }
    else {
      // console.log('Connected to sqlite3, version ',sqlite3.VERSION)
    }
  })
})


ipcMain.handle('dbInit', async () => {
  const sql = `
  CREATE TABLE IF NOT EXISTS Entities (Id INTEGER PRIMARY KEY AUTOINCREMENT, EntName TEXT);
  CREATE TABLE IF NOT EXISTS Members (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT, FirstName TEXT, LastName TEXT, Entity INTEGER);
  CREATE TABLE IF NOT EXISTS Groups (Id INTEGER PRIMARY KEY AUTOINCREMENT, GrpName TEXT, Entity INTEGER);
  CREATE TABLE IF NOT EXISTS GroupMembers (Id INTEGER PRIMARY KEY AUTOINCREMENT, GroupId INTEGER, MemberId INTEGER);
  CREATE TABLE IF NOT EXISTS Events (Id INTEGER PRIMARY KEY AUTOINCREMENT, GroupId INTEGER, EventDate TEXT, Closed INTEGER);
  CREATE TABLE IF NOT EXISTS DebateSpeeches (Id INTEGER PRIMARY KEY AUTOINCREMENT, EventId INTEGER, DebateNumber INTEGER, SectionNumber INTEGER, MemberId INTEGER, StartTime TEXT, Seconds INTEGER);
  CREATE TABLE IF NOT EXISTS DebateSections (Id INTEGER PRIMARY KEY AUTOINCREMENT,  EventId INTEGER, DebateNumber INTEGER, SectionNumber INTEGER, SectionName TEXT);
  CREATE TABLE IF NOT EXISTS Debates (Id INTEGER PRIMARY KEY AUTOINCREMENT, EventId INTEGER, DebateNumber INTEGER, Note TEXT);
  CREATE TABLE IF NOT EXISTS State (Id INTEGER PRIMARY KEY AUTOINCREMENT, EntityId INTEGER, GroupId INTEGER, EventId INTEGER);
  `

  db.exec(sql, (err: Error | null) => {
    if (err) {
      return console.error("------->> ",err.message);
    }
  })
})


ipcMain.handle('dbExec', async (ev: Event,sql: string) => {
  db.serialize(function () {
    db.exec(sql, (err) => {
      if (err) {
        return console.error("------->> ",err.message)
      }
      console.log('db.exec: ', sql)
    })
  })
  // db.close()
})


ipcMain.handle('dbRun', async (ev: Event, sql: string, params: any) => {
  db.run(sql, params, err => {
    if (err) {
      return console.error("------->> ",err.message);
    }
  });
})

// db.all uses a callback therefore wrap whole thing in a Promise and return the Prommise
ipcMain.handle('dbSelect', async (ev:Event, sql: string) => {
  // db.serialize( () => {
    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) {
          console.error('------->> db.all error: ' + err)
        }
        // console.log('db.all rows: ' + JSON.stringify(rows))
        resolve (rows)
      })
    })
  // })
})


ipcMain.handle('dbClose', async () => {
  db.close()
})


