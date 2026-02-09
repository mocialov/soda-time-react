// Global type definitions for Electron IPC
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
  torrent: TorrentAPI
}

interface Window {
  electronAPI: ElectronAPI
}
