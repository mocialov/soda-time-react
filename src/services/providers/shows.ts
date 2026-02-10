// TV Show provider service - uses EZTV API
import { BaseProvider, FilterOptions, Show, Episode, ProviderResult } from './base'

interface EZTVTorrent {
  id: number
  hash: string
  filename: string
  magnet_url: string
  title: string
  imdb_id: string
  season: string
  episode: string
  seeds: number
  peers: number
  date_released_unix: number
  size_bytes: string
}

interface EZTVResponse {
  torrents_count: number
  limit: number
  page: number
  torrents: EZTVTorrent[]
}

interface ShowData {
  imdb_id: string
  title: string
  torrents: EZTVTorrent[]
}

class ShowProvider extends BaseProvider<Show> {
  private readonly eztvBaseUrl: string
  private showCache: Map<string, Show> = new Map()

  constructor() {
    super('')
    this.eztvBaseUrl = 'https://eztvx.to/api'
  }

  private extractShowTitle(torrentTitle: string): string {
    // Extract show name from title like "Show Name S01E01 720p..."
    // Remove season/episode and quality info
    let title = torrentTitle
      .replace(/\s+S\d+E\d+.*$/i, '') // Remove from S01E01 onwards
      .replace(/\s+\d+x\d+.*$/i, '')  // Remove from 1x01 onwards
      .replace(/\./g, ' ')            // Replace dots with spaces
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .trim()
    
    return title
  }

  private convertToShow(showData: ShowData): Show {
    const title = this.extractShowTitle(showData.torrents[0].title)
    
    // Calculate max season from torrents
    const maxSeason = Math.max(...showData.torrents.map(t => parseInt(t.season) || 0))
    
    return {
      imdb_id: showData.imdb_id,
      tvdb_id: '',
      title: title,
      year: new Date(showData.torrents[0].date_released_unix * 1000).getFullYear().toString(),
      rating: 0,
      num_seasons: maxSeason,
      poster: `https://image.tmdb.org/t/p/w500/placeholder.jpg`,
      backdrop: '',
      synopsis: `${title} - Available on EZTV`,
      genres: [],
      episodes: []
    }
  }

  async fetch(filters: FilterOptions): Promise<ProviderResult<Show>> {
    try {
      const page = filters.page || 1
      const limit = filters.limit || 50

      // Get torrents from EZTV
      const response = await fetch(`${this.eztvBaseUrl}/get-torrents?limit=100&page=${page}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: EZTVResponse = await response.json()

      // Group torrents by IMDB ID
      const showMap = new Map<string, ShowData>()
      
      data.torrents.forEach(torrent => {
        if (!torrent.imdb_id || torrent.imdb_id === '0') return
        
        const imdbId = torrent.imdb_id.startsWith('tt') ? torrent.imdb_id : `tt${torrent.imdb_id}`
        
        if (!showMap.has(imdbId)) {
          showMap.set(imdbId, {
            imdb_id: imdbId,
            title: '',
            torrents: []
          })
        }
        
        showMap.get(imdbId)!.torrents.push(torrent)
      })

      // Convert to shows
      let shows = Array.from(showMap.values())
        .slice(0, limit)
        .map(showData => {
          // Check cache first
          if (this.showCache.has(showData.imdb_id)) {
            return this.showCache.get(showData.imdb_id)!
          }
          
          const show = this.convertToShow(showData)
          this.showCache.set(showData.imdb_id, show)
          return show
        })

      // Apply filters
      if (filters.keywords) {
        const keyword = filters.keywords.toLowerCase()
        shows = shows.filter(show => 
          show.title.toLowerCase().includes(keyword)
        )
      }

      return {
        results: shows,
        hasMore: data.torrents.length >= 100
      }
    } catch (error) {
      console.error('Show provider fetch error:', error)
      return {
        results: [],
        hasMore: false
      }
    }
  }

  async detail(imdb_id: string): Promise<Show> {
    try {
      // Normalize IMDB ID
      const normalizedId = imdb_id.replace('tt', '')
      
      // Get episodes from EZTV
      const response = await fetch(`${this.eztvBaseUrl}/get-torrents?imdb_id=${normalizedId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: EZTVResponse = await response.json()
      
      if (data.torrents.length === 0) {
        throw new Error('Show not found')
      }

      // Create show from torrents
      const showData: ShowData = {
        imdb_id: imdb_id.startsWith('tt') ? imdb_id : `tt${imdb_id}`,
        title: '',
        torrents: data.torrents
      }
      
      const show = this.convertToShow(showData)

      // Convert EZTV torrents to episodes
      const episodesMap: Map<string, Episode> = new Map()

      data.torrents.forEach(torrent => {
        const season = parseInt(torrent.season) || 0
        const episode = parseInt(torrent.episode) || 0
        const episodeKey = `S${season}E${episode}`

        if (!episodesMap.has(episodeKey)) {
          episodesMap.set(episodeKey, {
            season,
            episode,
            title: this.parseEpisodeTitle(torrent.title),
            overview: '',
            tvdb_id: '',
            first_aired: torrent.date_released_unix,
            torrents: {}
          })
        }

        const episodeData = episodesMap.get(episodeKey)!
        const quality = this.extractQuality(torrent.title)

        if (!episodeData.torrents) {
          episodeData.torrents = {}
        }
        
        episodeData.torrents[quality] = {
          url: torrent.magnet_url,
          seed: torrent.seeds,
          peer: torrent.peers
        }
      })

      show.episodes = Array.from(episodesMap.values()).sort((a, b) => {
        if (a.season !== b.season) return a.season - b.season
        return a.episode - b.episode
      })

      return show
    } catch (error) {
      console.error('Show detail error:', error)
      throw error
    }
  }

  private parseEpisodeTitle(torrentTitle: string): string {
    // Try to extract episode name from torrent title
    // Format is usually: "Show Name S01E01 Episode Title 720p..."
    const match = torrentTitle.match(/S\d+E\d+\s+(.+?)\s+\d+p/i)
    if (match) {
      return match[1].trim()
    }
    return `Episode ${torrentTitle.match(/E(\d+)/i)?.[1] || '?'}`
  }

  private extractQuality(title: string): string {
    if (title.includes('2160p') || title.includes('4K')) return '2160p'
    if (title.includes('1080p')) return '1080p'
    if (title.includes('720p')) return '720p'
    if (title.includes('480p')) return '480p'
    return '720p'
  }

  async search(query: string, page: number = 1): Promise<ProviderResult<Show>> {
    return this.fetch({
      keywords: query,
      page,
      limit: 50
    })
  }

  async getByGenre(genre: string, page: number = 1): Promise<ProviderResult<Show>> {
    return this.fetch({
      genre,
      page,
      sort: 'trending'
    })
  }

  async getTrending(page: number = 1): Promise<ProviderResult<Show>> {
    return this.fetch({
      page,
      sort: 'trending'
    })
  }

  async getPopular(page: number = 1): Promise<ProviderResult<Show>> {
    return this.fetch({
      page,
      sort: 'popularity'
    })
  }
}

export const showProvider = new ShowProvider()
export default showProvider
