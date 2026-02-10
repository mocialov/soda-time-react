// Anime provider service
import { BaseProvider, FilterOptions, ProviderResult } from './base'
import { Config } from '../config'

export interface Anime {
  mal_id: string
  imdb_id?: string
  title: string
  year: string
  rating: number
  poster: string
  backdrop?: string
  synopsis?: string
  type: string
  genres?: string[]
  episodes?: AnimeEpisode[]
  num_seasons?: number
}

export interface AnimeEpisode {
  season: number
  episode: number
  title: string
  overview?: string
  torrents?: Record<string, any>
}

interface AnimeAPIResponse {
  anime: Anime[]
  total: number
}

class AnimeProvider extends BaseProvider<Anime> {
  constructor() {
    super(Config.apiEndpoints.anime)
  }

  async fetch(filters: FilterOptions): Promise<ProviderResult<Anime>> {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 50,
      genre: filters.genre && filters.genre !== 'All' ? filters.genre : undefined,
      sort_by: filters.sort || 'popularity',
      order: filters.order || 'desc',
      keywords: filters.keywords
    }

    const queryString = this.buildQueryString(params)
    const endpoint = `/animes/${params.page}?${queryString}`

    try {
      const response = await this.fetchData<AnimeAPIResponse>(endpoint)
      
      return {
        results: response.anime || [],
        hasMore: response.anime.length === params.limit
      }
    } catch (error) {
      console.error('Anime provider fetch error:', error)
      return {
        results: [],
        hasMore: false
      }
    }
  }

  async detail(mal_id: string): Promise<Anime> {
    const endpoint = `/anime/${mal_id}`
    return await this.fetchData<Anime>(endpoint)
  }

  async search(query: string, page: number = 1): Promise<ProviderResult<Anime>> {
    return this.fetch({
      keywords: query,
      page,
      limit: 50
    })
  }

  async getByGenre(genre: string, page: number = 1): Promise<ProviderResult<Anime>> {
    return this.fetch({
      genre,
      page,
      sort: 'popularity'
    })
  }

  async getPopular(page: number = 1): Promise<ProviderResult<Anime>> {
    return this.fetch({
      page,
      sort: 'popularity'
    })
  }
}

export const animeProvider = new AnimeProvider()
export default animeProvider
