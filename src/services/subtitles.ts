// Subtitle service for fetching and managing subtitles

export interface Subtitle {
  id: string
  lang: string
  langName: string
  url: string
  rating: number
  downloadCount: number
  encoding?: string
}

export interface SubtitleSearchOptions {
  imdb_id?: string
  filename?: string
  season?: number
  episode?: number
  lang?: string
}

class SubtitleService {
  private readonly openSubtitlesUrl = 'https://rest.opensubtitles.org/search'
  private readonly userAgent = 'Soda Time v1.0'

  async search(options: SubtitleSearchOptions): Promise<Subtitle[]> {
    const params = new URLSearchParams()

    if (options.imdb_id) {
      params.append('imdbid', options.imdb_id.replace('tt', ''))
    }
    
    if (options.season) {
      params.append('season', options.season.toString())
    }
    
    if (options.episode) {
      params.append('episode', options.episode.toString())
    }

    if (options.lang) {
      params.append('sublanguageid', this.getLanguageCode(options.lang))
    }

    try {
      const response = await fetch(`${this.openSubtitlesUrl}?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subtitles')
      }

      const data = await response.json()
      return this.parseSubtitles(data)
    } catch (error) {
      console.error('Subtitle search error:', error)
      return []
    }
  }

  private parseSubtitles(data: any[]): Subtitle[] {
    if (!Array.isArray(data)) return []

    return data.map(item => ({
      id: item.IDSubtitleFile,
      lang: item.SubLanguageID,
      langName: item.LanguageName,
      url: item.SubDownloadLink,
      rating: parseFloat(item.SubRating) || 0,
      downloadCount: parseInt(item.SubDownloadsCnt) || 0,
      encoding: item.SubEncoding
    }))
  }

  async download(subtitle: Subtitle): Promise<string> {
    try {
      const response = await fetch(subtitle.url)
      if (!response.ok) {
        throw new Error('Failed to download subtitle')
      }

      const text = await response.text()
      return text
    } catch (error) {
      console.error('Subtitle download error:', error)
      throw error
    }
  }

  private getLanguageCode(lang: string): string {
    const langMap: Record<string, string> = {
      'english': 'eng',
      'spanish': 'spa',
      'french': 'fre',
      'german': 'ger',
      'italian': 'ita',
      'portuguese': 'por',
      'russian': 'rus',
      'chinese': 'chi',
      'japanese': 'jpn',
      'korean': 'kor',
      'arabic': 'ara',
      'dutch': 'dut',
      'polish': 'pol',
      'turkish': 'tur'
    }

    return langMap[lang.toLowerCase()] || lang
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'eng', name: 'English' },
      { code: 'spa', name: 'Spanish' },
      { code: 'fre', name: 'French' },
      { code: 'ger', name: 'German' },
      { code: 'ita', name: 'Italian' },
      { code: 'por', name: 'Portuguese' },
      { code: 'rus', name: 'Russian' },
      { code: 'chi', name: 'Chinese' },
      { code: 'jpn', name: 'Japanese' },
      { code: 'kor', name: 'Korean' },
      { code: 'ara', name: 'Arabic' },
      { code: 'dut', name: 'Dutch' },
      { code: 'pol', name: 'Polish' },
      { code: 'tur', name: 'Turkish' }
    ]
  }
}

export const subtitleService = new SubtitleService()
export default subtitleService
