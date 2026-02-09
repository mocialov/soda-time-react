import { useState, useEffect } from 'react'
import { movieProvider, Movie } from '../services/providers'
import { Config } from '../services/config'
import { useApp } from '../contexts/AppContext'
import { useStream } from '../contexts/StreamContext'
import FilterBar from './FilterBar'
import MovieDetail from './MovieDetail'
import './MovieBrowser.css'

interface MovieBrowserProps {
  onPlayMovie?: () => void
}

const MovieBrowser = ({ onPlayMovie }: MovieBrowserProps) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('trending')
  const [hasMore, setHasMore] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  const { isWatched } = useApp()
  const { startStream } = useStream()

  const loadMovies = async () => {
    try {
      setLoading(true)
      const result = await movieProvider.fetch({
        page,
        genre,
        sort,
        limit: 50,
        keywords: searchQuery
      })
      
      if (page === 1) {
        setMovies(result.results)
      } else {
        setMovies(prev => [...prev, ...result.results])
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to load movies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setMovies([])
  }, [genre, sort, searchQuery])

  useEffect(() => {
    loadMovies()
  }, [page, genre, sort, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleMovieClick = async (movie: Movie) => {
    try {
      setLoadingDetail(true)
      // Fetch full movie details to get complete synopsis
      const detailedMovie = await movieProvider.detail(movie.imdb_id)
      setSelectedMovie(detailedMovie)
    } catch (error) {
      console.error('Failed to load movie details:', error)
      // Fallback to basic movie data if detail fetch fails
      setSelectedMovie(movie)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseDetail = () => {
    setSelectedMovie(null)
  }

  const handlePlayFromDetail = () => {
    setSelectedMovie(null)
    onPlayMovie?.()
  }

  const renderStars = (rating: number | undefined) => {
    if (!rating) return null
    const stars = []
    const normalizedRating = Math.round(rating) / 2
    
    for (let i = 1; i <= Math.floor(normalizedRating); i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>)
    }
    
    if (normalizedRating % 1 > 0) {
      stars.push(
        <span key="half" className="star-half-wrapper">
          <span className="star empty">★</span>
          <span className="star half">★</span>
        </span>
      )
    }
    
    for (let i = Math.ceil(normalizedRating); i < 5; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>)
    }
    
    return <div className="rating-stars">{stars}</div>
  }

  const getQualityLabel = (torrents: any) => {
    if (!torrents) return null
    const q720 = torrents['720p'] !== undefined
    const q1080 = torrents['1080p'] !== undefined
    
    if (q720 && q1080) return '720p/1080p'
    if (q1080) return '1080p'
    if (q720) return '720p'
    return 'HDRip'
  }

  if (loading && movies.length === 0) {
    return (
      <>
        <FilterBar
          genre={genre}
          onGenreChange={setGenre}
          sort={sort}
          onSortChange={setSort}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          genres={Config.genres}
          sorters={Config.sorters}
        />
        <div className="loading">Loading movies...</div>
      </>
    )
  }

  return (
    <div className="movie-browser">
      <FilterBar
        genre={genre}
        onGenreChange={setGenre}
        sort={sort}
        onSortChange={setSort}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        genres={Config.genres}
        sorters={Config.sorters}
      />

      <div className="movie-grid-container">
        <div className="movie-grid">
          {movies.map((movie) => (
            <div 
              key={movie.imdb_id} 
              className={`movie-item ${isWatched(movie.imdb_id) ? 'watched' : ''}`}
              onClick={() => handleMovieClick(movie)}
            >
              <div className="movie-cover">
                <img 
                  className="cover-image" 
                  src={movie.poster} 
                  alt={movie.title} 
                />
                <div className="cover-overlay">
                  {movie.rating && (
                    <div className="rating">
                      {renderStars(movie.rating)}
                      <div className="rating-value">{movie.rating.toFixed(1)}/10</div>
                    </div>
                  )}
                </div>
              </div>
              <p className="movie-title" title={movie.title}>{movie.title}</p>
              <p className="movie-year">{movie.year}</p>
              {movie.torrents && (
                <p className="movie-quality">{getQualityLabel(movie.torrents)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {hasMore && !loading && (
        <div className="load-more">
          <button onClick={() => setPage(p => p + 1)} className="load-more-button">
            Load More
          </button>
        </div>
      )}

      {loading && movies.length > 0 && (
        <div className="loading">Loading more movies...</div>
      )}

      {loadingDetail && (
        <div className="loading-detail-overlay">
          <div className="loading">Loading movie details...</div>
        </div>
      )}

      {selectedMovie && !loadingDetail && (
        <MovieDetail
          movie={selectedMovie}
          onClose={handleCloseDetail}
          onPlay={handlePlayFromDetail}
        />
      )}
    </div>
  )
}

export default MovieBrowser
