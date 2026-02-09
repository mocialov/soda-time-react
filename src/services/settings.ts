// Settings management service
export interface AppSettings {
  // Project info
  projectName: string
  projectUrl: string
  
  // UI Settings
  language: string
  translateSynopsis: boolean
  coversShowRating: boolean
  watchedCovers: string
  showAdvancedSettings: boolean
  theme: string
  ratingStars: boolean
  startScreen: string
  lastTab: string
  
  // Playback
  alwaysFullscreen: boolean
  playNextEpisodeAuto: boolean
  chosenPlayer: string
  
  // Quality
  shows_default_quality: string
  movies_default_quality: string
  moviesShowQuality: boolean
  movies_quality: string
  
  // Subtitles
  subtitle_language: string
  subtitle_size: string
  subtitle_color: string
  subtitle_decoration: string
  subtitle_font: string
  
  // Advanced
  httpApiPort: number
  httpApiUsername: string
  httpApiPassword: string
  connectionLimit: number
  dhtEnable: boolean
  streamPort: number
  tmpLocation: string
  databaseLocation: string
  
  // Trakt.tv
  traktToken: string
  traktTokenRefresh: string
  traktTokenTTL: string
  traktSyncOnStart: boolean
  traktPlayback: boolean
  
  // Various
  activateWatchlist: boolean
  activateTorrentCollection: boolean
  activateRandomize: boolean
  contentLang: string
}

const defaultSettings: AppSettings = {
  projectName: 'Popcorn Time',
  projectUrl: 'https://popcorntime.sh',
  
  language: 'en',
  translateSynopsis: true,
  coversShowRating: true,
  watchedCovers: 'fade',
  showAdvancedSettings: false,
  theme: 'Official_-_Dark_theme',
  ratingStars: true,
  startScreen: 'Movies',
  lastTab: '',
  
  alwaysFullscreen: false,
  playNextEpisodeAuto: true,
  chosenPlayer: 'local',
  
  shows_default_quality: '720p',
  movies_default_quality: '1080p',
  moviesShowQuality: false,
  movies_quality: 'all',
  
  subtitle_language: 'none',
  subtitle_size: '28px',
  subtitle_color: '#ffffff',
  subtitle_decoration: 'Outline',
  subtitle_font: 'Arial',
  
  httpApiPort: 8008,
  httpApiUsername: 'popcorn',
  httpApiPassword: 'popcorn',
  connectionLimit: 100,
  dhtEnable: true,
  streamPort: 0,
  tmpLocation: '',
  databaseLocation: '',
  
  traktToken: '',
  traktTokenRefresh: '',
  traktTokenTTL: '',
  traktSyncOnStart: true,
  traktPlayback: true,
  
  activateWatchlist: true,
  activateTorrentCollection: true,
  activateRandomize: true,
  contentLang: 'en'
}

class SettingsService {
  private settings: AppSettings
  private storageKey = 'popcorn_settings'

  constructor() {
    this.settings = this.load()
  }

  private load(): AppSettings {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return { ...defaultSettings }
  }

  private save(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key]
  }

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings[key] = value
    this.save()
  }

  getAll(): AppSettings {
    return { ...this.settings }
  }

  setMultiple(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates }
    this.save()
  }

  reset(): void {
    this.settings = { ...defaultSettings }
    this.save()
  }
}

export const settingsService = new SettingsService()
export default settingsService
