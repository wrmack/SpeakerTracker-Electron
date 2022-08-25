export interface MyAPI {
  connect: () => Promise<void>,
  initDb: () =>  Promise<void>,
  close: () => void,
  execSQL: (arg0: string) =>  Promise<void>,
  runSQL: (sql: string, params: any) =>  Promise<void>,
  selectAll: (ev:Event,sql: string) =>  Promise<unknown>
  getPaths: () => {userData: string, appData: string, logs: string, appPath: string }
}

declare global {
  interface Window {
    myapi: MyAPI
  }
}

import { contextBridge, ipcRenderer } from 'electron'

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded')
  console.log("Versions: ",process.versions)
})



contextBridge.exposeInMainWorld('myapi', {
  getPaths: () => ipcRenderer.invoke('getPaths'),
  connect: () => ipcRenderer.invoke('dbConnect'),
  initDb: () => ipcRenderer.invoke('dbInit'),
  execSQL: (sql: string) => ipcRenderer.invoke('dbExec',sql),
  runSQL: (sql: string, params: any) => ipcRenderer.invoke('dbRun',sql,params),
  selectAll: (sql: string) => ipcRenderer.invoke('dbSelect',sql),
  close: () => ipcRenderer.invoke('dbClose')
})

// module.exports = {}