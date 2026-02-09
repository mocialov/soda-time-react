// Global type definitions for Electron IPC
interface WindowAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
}

interface TorrentAPI {
  start: (magnetUrl: string, title: string) => Promise<{ 
    success: boolean
    data?: { streamUrl: string; torrentName: string; fileName: string }
    error?: string 
  }>
  stop: () => Promise<{ success: boolean; error?: string }>
  getInfo: () => Promise<{ 
    success: boolean
    data?: any
    error?: string 
  }>
}

interface ElectronAPI {
  window: WindowAPI
  torrent: TorrentAPI
}

interface Window {
  electronAPI: ElectronAPI
}
