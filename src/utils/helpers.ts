// Utility functions

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const formatSpeed = (bytesPerSecond: number): string => {
  return formatBytes(bytesPerSecond) + '/s'
}

export const getQualityOrder = (): string[] => {
  return ['2160p', '1080p', '720p', '480p', '360p']
}

export const getBestQuality = (torrents: Record<string, any>): string | null => {
  const qualities = getQualityOrder()
  
  for (const quality of qualities) {
    if (torrents[quality]) {
      return quality
    }
  }
  
  return null
}

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export const parseIMDbId = (id: string): string => {
  // Ensure IMDb ID has 'tt' prefix
  if (!id.startsWith('tt')) {
    return 'tt' + id
  }
  return id
}

export const getTorrentHealth = (seeds: number, peers: number): 'excellent' | 'good' | 'medium' | 'poor' => {
  const ratio = seeds / (peers || 1)
  
  if (seeds >= 50 && ratio >= 2) return 'excellent'
  if (seeds >= 20 && ratio >= 1) return 'good'
  if (seeds >= 5) return 'medium'
  return 'poor'
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await sleep(delay)
    return retry(fn, retries - 1, delay * 2)
  }
}
