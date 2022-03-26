
import type { Database } from '@vscode/sqlite3';

declare module 'sqlite3'

export interface MyAPI {
  connect: () => Promise<void>,
  initDb: () => void,
  close: () => void,
  execSQL: (arg0: string) => void,
  runSQL: (sql: string, params: any) => void,
  selectAll: (arg0: string) => any[],
}

declare global {
  interface Window {
    myapi: MyAPI
  }
}


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  console.log('Testing')
})

let db: Database

contextBridge.exposeInMainWorld('myapi', {
  connect: async () => {
    const sqlite3 = require('@vscode/sqlite3').verbose();
    db = new sqlite3.Database('mydb.db', (err: Error) => {
      if (err) {
        console.error(err.message);
      }
      console.log('connected to sqlite');
      console.log(sqlite3)
    });
  },
  initDb: () => {
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