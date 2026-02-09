import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { database, Bookmark, WatchedItem } from '../services/database'
import settingsService, { AppSettings } from '../services/settings'

interface AppContextType {
  // Settings
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  updateSettings: (updates: Partial<AppSettings>) => void
  
  // Bookmarks
  bookmarks: Bookmark[]
  addBookmark: (bookmark: Bookmark) => Promise<void>
  removeBookmark: (imdb_id: string) => Promise<void>
  isBookmarked: (imdb_id: string) => boolean
  
  // Watched items
  watched: WatchedItem[]
  markAsWatched: (item: WatchedItem) => Promise<void>
  markAsUnwatched: (imdb_id: string) => Promise<void>
  isWatched: (imdb_id: string) => boolean
  
  // UI State
  loading: boolean
  error: string | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(settingsService.getAll())
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [watched, setWatched] = useState<WatchedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize database and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true)
        await database.init()
        
        const [loadedBookmarks, loadedWatched] = await Promise.all([
          database.getBookmarks(),
          database.getWatched()
        ])
        
        setBookmarks(loadedBookmarks)
        setWatched(loadedWatched)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize app:', err)
        setError('Failed to initialize application')
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  // Settings management
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settingsService.set(key, value)
    setSettings(settingsService.getAll())
  }

  const updateSettings = (updates: Partial<AppSettings>) => {
    settingsService.setMultiple(updates)
    setSettings(settingsService.getAll())
  }

  // Bookmark management
  const addBookmark = async (bookmark: Bookmark) => {
    await database.addBookmark(bookmark)
    setBookmarks(await database.getBookmarks())
  }

  const removeBookmark = async (imdb_id: string) => {
    await database.removeBookmark(imdb_id)
    setBookmarks(await database.getBookmarks())
  }

  const isBookmarked = (imdb_id: string) => {
    return bookmarks.some(b => b.imdb_id === imdb_id)
  }

  // Watched management
  const markAsWatched = async (item: WatchedItem) => {
    await database.markWatched(item)
    setWatched(await database.getWatched())
  }

  const markAsUnwatched = async (imdb_id: string) => {
    await database.markUnwatched(imdb_id)
    setWatched(await database.getWatched())
  }

  const isWatched = (imdb_id: string) => {
    return watched.some(w => w.imdb_id === imdb_id && w.watched)
  }

  const value: AppContextType = {
    settings,
    updateSetting,
    updateSettings,
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    watched,
    markAsWatched,
    markAsUnwatched,
    isWatched,
    loading,
    error
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
