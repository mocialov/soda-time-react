// Preload script to expose IPC to renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  },
  torrent: {
    start: (magnetUrl, title) => ipcRenderer.invoke('torrent:start', { magnetUrl, title }),
    stop: () => ipcRenderer.invoke('torrent:stop'),
    getInfo: () => ipcRenderer.invoke('torrent:getInfo')
  }
});
