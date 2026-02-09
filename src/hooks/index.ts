// Custom hooks for common operations

import { useState, useEffect, useCallback } from 'react'
import { Movie, Show, movieProvider, showProvider } from '../services/providers'

export const useMovies = (initialPage: number = 1) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)

  const loadMovies = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await movieProvider.fetch({ ...filters, page })
      
      if (page === 1) {
        setMovies(result.results)
      } else {
        setMovies(prev => [...prev, ...result.results])
      }
      
      setHasMore(result.hasMore)
    } catch (err) {
      setError('Failed to load movies')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  const loadMore = () => setPage(p => p + 1)
  const reset = () => {
    setPage(1)
    setMovies([])
    setHasMore(true)
  }

  return { movies, loading, error, hasMore, loadMovies, loadMore, reset }
}

export const useShows = (initialPage: number = 1) => {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)

  const loadShows = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await showProvider.fetch({ ...filters, page })
      
      if (page === 1) {
        setShows(result.results)
      } else {
        setShows(prev => [...prev, ...result.results])
      }
      
      setHasMore(result.hasMore)
    } catch (err) {
      setError('Failed to load shows')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  const loadMore = () => setPage(p => p + 1)
  const reset = () => {
    setPage(1)
    setShows([])
    setHasMore(true)
  }

  return { shows, loading, error, hasMore, loadShows, loadMore, reset }
}

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue)
      window.localStorage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      console.error(error)
    }
  }

  return [value, setStoredValue] as const
}

export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
