import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods here in the future
  ping: () => ipcRenderer.invoke('ping'),
  onDeepLink: (callback: (url: string) => void) => {
    ipcRenderer.on('deep-link', (_event, url) => callback(url))
  },
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url)
})
