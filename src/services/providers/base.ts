// Base provider class for content APIs

export interface FilterOptions {
  page?: number
  limit?: number
  genre?: string
  sort?: string
  order?: 'asc' | 'desc'
  keywords?: string
  quality?: string
}

export interface Movie {
  imdb_id: string
  title: string
  year: string
  rating: number
  poster: string
  backdrop?: string
  synopsis?: string
  runtime?: string
  trailer?: string
  genres?: string[]
  torrents?: Record<string, TorrentInfo>
}

export interface TorrentInfo {
  url: string
  seed: number
  peer: number
  size: string
  filesize: number
  provider: string
}

export interface Show {
  imdb_id: string
  tvdb_id: string
  title: string
  year: string
  rating: number
  num_seasons: number
  poster: string
  backdrop?: string
  synopsis?: string
  genres?: string[]
  episodes?: Episode[]
}

export interface Episode {
  season: number
  episode: number
  title: string
  overview?: string
  tvdb_id?: string
  first_aired?: number
  torrents?: Record<string, TorrentInfo>
}

export interface ProviderResult<T> {
  results: T[]
  hasMore: boolean
}

export abstract class BaseProvider<T> {
  protected baseUrl: string
  protected cache: Map<string, any> = new Map()
  protected cacheTTL: number = 10 * 60 * 1000 // 10 minutes

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  protected async fetchData<R>(endpoint: string, options?: RequestInit): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = url + JSON.stringify(options)

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })

      return data
    } catch (error) {
      console.error(`Provider fetch error for ${url}:`, error)
      throw error
    }
  }

  protected buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    return query.toString()
  }

  clearCache(): void {
    this.cache.clear()
  }

  abstract fetch(filters: FilterOptions): Promise<ProviderResult<T>>
  abstract detail(id: string): Promise<T>
}
