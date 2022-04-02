
import type { Database } from '@vscode/sqlite3';

declare module 'sqlite3'

export interface MyAPI {
  connect: () => Promise<void>,
  initDb: () =>  Promise<void>,
  close: () => void,
  execSQL: (arg0: string) =>  Promise<void>,
  runSQL: (sql: string, params: any) =>  Promise<void>,
  selectAll: (sql: string, val?: never[]) =>  Promise<unknown>
  getPaths: () => {userData: string, appData: string, logs: string, appPath: string }
}

declare global {
  interface Window {
    myapi: MyAPI
  }
}


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  console.log('Testing')
})

let db: Database
// let dbPath = app.getPath('userData')

contextBridge.exposeInMainWorld('myapi', {
  getPaths: () => ipcRenderer.invoke('getPaths'),
  connect: async () => {
    const sqlite3 = require('@vscode/sqlite3').verbose()
    const path = require('path')
    const appPaths = await ipcRenderer.invoke('getPaths')
    const userPath = appPaths.userData
    const dbPath = path.join(userPath,'mydb.db')
    db = new sqlite3.Database(dbPath, (err: Error) => {
      if (err) {
        console.error(err.message);
      }
      else {
        console.log('Connected to sqlite3, version ',sqlite3.VERSION)
      }
    })
  },
  initDb: async () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS Entities (Id INTEGER PRIMARY KEY AUTOINCREMENT, EntName TEXT);
    CREATE TABLE IF NOT EXISTS Members (Id INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT, FirstName TEXT, LastName TEXT, Entity INTEGER);
    CREATE TABLE IF NOT EXISTS Groups (Id INTEGER PRIMARY KEY AUTOINCREMENT, GrpName TEXT, Entity INTEGER);
    CREATE TABLE IF NOT EXISTS GroupMembers (Id INTEGER PRIMARY KEY AUTOINCREMENT, GroupId INTEGER, MemberId INTEGER);
    CREATE TABLE IF NOT EXISTS State (Id INTEGER PRIMARY KEY AUTOINCREMENT, EntityId INTEGER, GroupId INTEGER);
    `

    // exec(sql: string, callback?: ((this: Statement, err: Error | null) => void) | undefined): Database

    db.exec(sql, (err: Error | null) => {
      if (err) {
        return console.error(err.message);
      }
    })
  },
  close: () => {
    db.close()
  },
  execSQL: async (sql: string) => {
    console.log(sql)
    db.serialize(function () {
      console.log(sql)
      db.exec(sql, (err) => {
        if (err) {
          return console.error(err.message)
        }
      })
    })
    db.close()
  },
  runSQL: async (sql: string, params: any) => {
    db.run(sql, params, err => {
      if (err) {
        return console.error(err.message);
      }
    });
  },
  selectAll: (sql: string, val = []) => new Promise((resolve, reject) => {
    db.serialize( () => {
      db.all(sql, val, (err, rows) => {
        if (err) {
          console.log('db.all error: ' + err)
          return reject(err)
        }
        resolve(rows)
      })
    })
  })
})

module.exports = {}