// WebTorrent streaming service using Electron IPC
// Torrent handling runs in main process with full Node.js BitTorrent support

import settingsService from './settings'

export interface StreamInfo {
  state: 'connecting' | 'downloading' | 'ready' | 'playing' | 'stopped'
  progress: number
  downloadSpeed: number
  uploadSpeed: number
  numPeers: number
  downloaded: number
  uploaded: number
  streamUrl?: string
}

export interface StreamOptions {
  torrentUrl: string
  imdb_id: string
  title: string
  backdrop?: string
  subtitles?: any[]
  quality?: string
}

// Check if we're in Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

class StreamerService {
  private streamInfo: StreamInfo = this.getDefaultStreamInfo()
  private listeners: ((info: StreamInfo) => void)[] = []
  private updateInterval: number | null = null

  private getDefaultStreamInfo(): StreamInfo {
    return {
      state: 'stopped',
      progress: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      numPeers: 0,
      downloaded: 0,
      uploaded: 0
    }
  }

  async start(options: StreamOptions): Promise<void> {
    console.log('Streamer: start() called')
    
    if (!isElectron) {
      throw new Error('Streaming is only available in Electron desktop app')
    }

    try {
      this.updateStreamInfo({ state: 'connecting' })
      
      console.log('Sending torrent to main process...')
      const result = await (window as any).electronAPI.torrent.start(
        options.torrentUrl,
        options.title
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to start torrent')
      }

      console.log('Torrent started successfully:', result.data)
      
      this.updateStreamInfo({
        state: 'ready',
        streamUrl: result.data.streamUrl
      })

      // Start polling for stream info
      this.startUpdateLoop()

    } catch (error) {
      console.error('Failed to start stream:', error)
      this.updateStreamInfo({ state: 'stopped' })
      throw error
    }
  }

  async stop(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }

    if (isElectron) {
      await (window as any).electronAPI.torrent.stop()
    }

    this.streamInfo = this.getDefaultStreamInfo()
    this.notifyListeners()
  }

  pause(): void {
    // Pause is handled by the video element itself
    // This method exists for API compatibility
    console.log('Streamer: pause() called')
  }

  resume(): void {
    // Resume is handled by the video element itself
    // This method exists for API compatibility
    console.log('Streamer: resume() called')
  }

  private startUpdateLoop(): void {
    if (this.updateInterval) return

    this.updateInterval = window.setInterval(async () => {
      if (!isElectron) return

      try {
        const result = await (window as any).electronAPI.torrent.getInfo()
        if (result.success) {
          this.updateStreamInfo(result.data)
        }
      } catch (error) {
        console.error('Error getting stream info:', error)
      }
    }, 1000)
  }

  private updateStreamInfo(updates: Partial<StreamInfo>): void {
    this.streamInfo = { ...this.streamInfo, ...updates }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.streamInfo))
  }

  getStreamInfo(): StreamInfo {
    return { ...this.streamInfo }
  }

  subscribe(listener: (info: StreamInfo) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

export const streamer = new StreamerService()
export default streamer
