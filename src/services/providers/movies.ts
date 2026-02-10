// Movie provider service
import { BaseProvider, FilterOptions, Movie, ProviderResult, TorrentInfo } from './base'
import { Config } from '../config'

interface YTSMovie {
  id: number
  imdb_code: string
  title: string
  year: number
  rating: number
  runtime: number
  genres: string[]
  language: string
  background_image: string
  background_image_original: string
  small_cover_image: string
  medium_cover_image: string
  large_cover_image: string
  yt_trailer_code: string
  torrents: YTSTorrent[]
}

interface OMDbMovie {
  Plot: string
  imdbRating: string
  Poster: string
  Response: string
}

interface YTSTorrent {
  url: string
  hash: string
  quality: string
  type: string
  seeds: number
  peers: number
  size: string
  size_bytes: number
  date_uploaded: string
  date_uploaded_unix: number
}

interface YTSResponse {
  status: string
  status_message: string
  data: {
    movie_count: number
    limit: number
    page_number: number
    movies: YTSMovie[]
  }
}

interface YTSDetailResponse {
  status: string
  status_message: string
  data: {
    movie: YTSMovie
  }
}

class MovieProvider extends BaseProvider<Movie> {
  private omdbCache: Map<string, OMDbMovie> = new Map()

  constructor() {
    super(Config.apiEndpoints.movies)
  }

  private async fetchOMDbDetails(imdb_id: string): Promise<OMDbMovie | null> {
    // Check if API key is configured
    if (!Config.omdbApiKey) {
      return null
    }

    // Check cache first
    if (this.omdbCache.has(imdb_id)) {
      return this.omdbCache.get(imdb_id)!
    }

    try {
      const response = await fetch(
        `${Config.apiEndpoints.omdb}/?i=${imdb_id}&apikey=${Config.omdbApiKey}`
      )
      
      if (!response.ok) {
        console.warn(`OMDb API error: ${response.status} ${response.statusText}`)
        return null
      }
      
      const data = await response.json()
      
      if (data.Response === 'True' && data.Plot && data.Plot !== 'N/A') {
        this.omdbCache.set(imdb_id, data)
        return data
      }
    } catch (error) {
      console.warn('OMDb fetch failed:', error)
    }
    
    return null
  }
  
  private convertYTSToMovie(ytsMovie: YTSMovie, omdbData?: OMDbMovie | null): Movie {
    const torrents: Record<string, TorrentInfo> = {}
    
    // Standard BitTorrent trackers (works in Electron/Node.js)
    const trackers = [
      'udp://open.demonii.com:1337/announce',
      'udp://tracker.openbittorrent.com:80',
      'udp://tracker.coppersurfer.tk:6969/announce',
      'udp://glotorrents.pw:6969/announce',
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://torrent.gresille.org:80/announce',
      'udp://p4p.arenabg.com:1337',
      'udp://tracker.leechers-paradise.org:6969/announce',
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.btorrent.xyz'
    ].map(t => `&tr=${encodeURIComponent(t)}`).join('')
    
    ytsMovie.torrents.forEach(torrent => {
      torrents[torrent.quality] = {
        url: `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(ytsMovie.title)}${trackers}`,
        seed: torrent.seeds,
        peer: torrent.peers,
        size: torrent.size,
        filesize: torrent.size_bytes,
        provider: 'YTS'
      }
    })

    return {
      imdb_id: ytsMovie.imdb_code,
      title: ytsMovie.title,
      year: ytsMovie.year.toString(),
      rating: ytsMovie.rating,
      poster: ytsMovie.medium_cover_image,
      backdrop: ytsMovie.background_image_original,
      synopsis: omdbData?.Plot && omdbData.Plot !== 'N/A' ? omdbData.Plot : undefined,
      runtime: ytsMovie.runtime ? `${ytsMovie.runtime} min` : undefined,
      trailer: ytsMovie.yt_trailer_code ? `https://www.youtube.com/watch?v=${ytsMovie.yt_trailer_code}` : undefined,
      genres: ytsMovie.genres,
      torrents
    }
  }

  async fetch(filters: FilterOptions): Promise<ProviderResult<Movie>> {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 50,
      genre: filters.genre && filters.genre !== 'All' ? filters.genre.toLowerCase() : undefined,
      sort_by: this.mapSortBy(filters.sort || 'trending'),
      order_by: filters.order || 'desc',
      query_term: filters.keywords,
      quality: filters.quality
    }

    const queryString = this.buildQueryString(params)
    const endpoint = `/list_movies.json?${queryString}`

    try {
      const response = await this.fetchData<YTSResponse>(endpoint)
      
      if (response.status !== 'ok' || !response.data.movies) {
        return {
          results: [],
          hasMore: false
        }
      }

      const movies = response.data.movies.map(m => this.convertYTSToMovie(m))
      
      return {
        results: movies,
        hasMore: movies.length === params.limit
      }
    } catch (error) {
      console.error('Movie provider fetch error:', error)
      return {
        results: [],
        hasMore: false
      }
    }
  }

  private mapSortBy(sort: string): string {
    const sortMap: Record<string, string> = {
      'trending': 'download_count',
      'popularity': 'download_count',
      'rating': 'rating',
      'year': 'year',
      'title': 'title',
      'last added': 'date_added'
    }
    return sortMap[sort] || 'download_count'
  }

  async detail(imdb_id: string): Promise<Movie> {
    const endpoint = `/movie_details.json?imdb_id=${imdb_id}&with_images=true&with_cast=true`
    const response = await this.fetchData<YTSDetailResponse>(endpoint)
    
    if (response.status !== 'ok' || !response.data.movie) {
      throw new Error('Movie not found')
    }
    
    // Fetch synopsis from OMDb since YTS doesn't provide it
    const omdbData = await this.fetchOMDbDetails(imdb_id)
    
    return this.convertYTSToMovie(response.data.movie, omdbData)
  }

  async search(query: string, page: number = 1): Promise<ProviderResult<Movie>> {
    return this.fetch({
      keywords: query,
      page,
      limit: 50
    })
  }

  async getByGenre(genre: string, page: number = 1): Promise<ProviderResult<Movie>> {
    return this.fetch({
      genre,
      page,
      sort: 'trending'
    })
  }

  async getTrending(page: number = 1): Promise<ProviderResult<Movie>> {
    return this.fetch({
      page,
      sort: 'trending'
    })
  }

  async getPopular(page: number = 1): Promise<ProviderResult<Movie>> {
    return this.fetch({
      page,
      sort: 'popularity'
    })
  }

  async getTopRated(page: number = 1): Promise<ProviderResult<Movie>> {
    return this.fetch({
      page,
      sort: 'rating',
      order: 'desc'
    })
  }
}

export const movieProvider = new MovieProvider()
export default movieProvider
