// IndexedDB wrapper for storing app data (bookmarks, watched items, etc.)

interface DBSchema {
  bookmarks: Bookmark
  watched: WatchedItem
  movies: MovieCache
  shows: ShowCache
}

export interface Bookmark {
  imdb_id: string
  tvdb_id?: string
  title: string
  year: string
  poster: string
  type: 'movie' | 'show' | 'anime'
  rating?: number
}

export interface WatchedItem {
  imdb_id: string
  tvdb_id?: string
  season?: number
  episode?: number
  watched: boolean
  date: number
}

export interface MovieCache {
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
  torrents?: Record<string, any>
}

export interface ShowCache {
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
  episodes?: any[]
}

class DatabaseService {
  private db: IDBDatabase | null = null
  private readonly dbName = 'SodaTimeDB'
  private readonly version = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'imdb_id' })
          bookmarkStore.createIndex('type', 'type', { unique: false })
        }

        if (!db.objectStoreNames.contains('watched')) {
          const watchedStore = db.createObjectStore('watched', { keyPath: 'imdb_id' })
          watchedStore.createIndex('date', 'date', { unique: false })
        }

        if (!db.objectStoreNames.contains('movies')) {
          db.createObjectStore('movies', { keyPath: 'imdb_id' })
        }

        if (!db.objectStoreNames.contains('shows')) {
          db.createObjectStore('shows', { keyPath: 'imdb_id' })
        }
      }
    })
  }

  private getStore<K extends keyof DBSchema>(
    storeName: K,
    mode: IDBTransactionMode = 'readonly'
  ): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized')
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Generic CRUD operations
  async get<K extends keyof DBSchema>(
    storeName: K,
    key: string
  ): Promise<DBSchema[K] | undefined> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName).get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<K extends keyof DBSchema>(storeName: K): Promise<DBSchema[K][]> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName).getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async add<K extends keyof DBSchema>(
    storeName: K,
    data: DBSchema[K]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName, 'readwrite').add(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async put<K extends keyof DBSchema>(
    storeName: K,
    data: DBSchema[K]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName, 'readwrite').put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete<K extends keyof DBSchema>(
    storeName: K,
    key: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName, 'readwrite').delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear<K extends keyof DBSchema>(storeName: K): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getStore(storeName, 'readwrite').clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Bookmark operations
  async addBookmark(bookmark: Bookmark): Promise<void> {
    return this.put('bookmarks', bookmark)
  }

  async removeBookmark(imdb_id: string): Promise<void> {
    return this.delete('bookmarks', imdb_id)
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return this.getAll('bookmarks')
  }

  async isBookmarked(imdb_id: string): Promise<boolean> {
    const bookmark = await this.get('bookmarks', imdb_id)
    return !!bookmark
  }

  // Watched operations
  async markWatched(item: WatchedItem): Promise<void> {
    return this.put('watched', { ...item, watched: true, date: Date.now() })
  }

  async markUnwatched(imdb_id: string): Promise<void> {
    return this.delete('watched', imdb_id)
  }

  async getWatched(): Promise<WatchedItem[]> {
    return this.getAll('watched')
  }

  async isWatched(imdb_id: string): Promise<boolean> {
    const item = await this.get('watched', imdb_id)
    return !!item?.watched
  }

  // Cache operations
  async cacheMovie(movie: MovieCache): Promise<void> {
    return this.put('movies', movie)
  }

  async cacheShow(show: ShowCache): Promise<void> {
    return this.put('shows', show)
  }
}

export const database = new DatabaseService()
export default database
