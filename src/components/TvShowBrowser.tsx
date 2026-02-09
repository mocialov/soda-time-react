import { useState, useEffect } from 'react'
import { showProvider, Show } from '../services/providers'
import { Config } from '../services/config'
import { useApp } from '../contexts/AppContext'
import FilterBar from './FilterBar'
import ShowDetail from './ShowDetail'
import './MovieBrowser.css'

interface TvShowBrowserProps {
  onPlayMovie?: () => void
}

const TvShowBrowser = ({ onPlayMovie }: TvShowBrowserProps) => {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('trending')
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTab, setCurrentTab] = useState<'movies' | 'shows' | 'anime'>('shows')
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  
  const { isBookmarked, addBookmark, removeBookmark, isWatched } = useApp()

  const loadShows = async () => {
    try {
      setLoading(true)
      const result = await showProvider.fetch({
        page,
        genre,
        sort,
        limit: 50,
        keywords: searchQuery
      })
      
      if (page === 1) {
        setShows(result.results)
      } else {
        setShows(prev => [...prev, ...result.results])
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to load shows:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    setShows([])
  }, [genre, sort, searchQuery])

  useEffect(() => {
    loadShows()
  }, [page, genre, sort, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleShowClick = (show: Show) => {
    setSelectedShow(show)
  }

  const handleCloseDetail = () => {
    setSelectedShow(null)
  }

  const toggleBookmark = async (show: Show, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isBookmarked(show.imdb_id)) {
      await removeBookmark(show.imdb_id)
    } else {
      await addBookmark({
        imdb_id: show.imdb_id,
        tvdb_id: show.tvdb_id,
        title: show.title,
        year: show.year,
        poster: show.poster,
        type: 'show',
        rating: show.rating
      })
    }
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

  if (loading && shows.length === 0) {
    return (
      <>
        <FilterBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          genre={genre}
          onGenreChange={setGenre}
          sort={sort}
          onSortChange={setSort}
          onSearch={handleSearch}
          genres={Config.genres}
          sorters={Config.sorters_tv}
        />
        <div className="loading">Loading TV shows...</div>
      </>
    )
  }

  return (
    <div className="movie-browser">
      <FilterBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        genre={genre}
        onGenreChange={setGenre}
        sort={sort}
        onSortChange={setSort}
        onSearch={handleSearch}
        genres={Config.genres}
        sorters={Config.sorters_tv}
      />

      <div className="movie-grid-container">
        <div className="movie-grid">
          {shows.map((show) => (
            <div 
              key={show.imdb_id} 
              className={`movie-item ${isWatched(show.imdb_id) ? 'watched' : ''}`}
              onClick={() => handleShowClick(show)}
            >
              <div className="movie-cover">
                <img 
                  className="cover-image" 
                  src={show.poster} 
                  alt={show.title} 
                />
                <div className="cover-overlay">
                  <i 
                    className={`action-icon favorites ${isBookmarked(show.imdb_id) ? 'active' : ''}`}
                    onClick={(e) => toggleBookmark(show, e)}
                    title="Add to favorites"
                  >
                    {isBookmarked(show.imdb_id) ? '★' : '☆'}
                  </i>
                  <i 
                    className={`action-icon watched ${isWatched(show.imdb_id) ? 'active' : ''}`}
                    title={isWatched(show.imdb_id) ? 'Watched' : 'Not watched'}
                  >
                    👁
                  </i>
                  {show.rating && (
                    <div className="rating">
                      {renderStars(show.rating)}
                      <div className="rating-value">{show.rating.toFixed(1)}/10</div>
                    </div>
                  )}
                </div>
              </div>
              <p className="movie-title" title={show.title}>{show.title}</p>
              <p className="movie-year">{show.year}</p>
              {show.num_seasons && (
                <p className="movie-quality">
                  {show.num_seasons} {show.num_seasons === 1 ? 'Season' : 'Seasons'}
                </p>
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

      {loading && shows.length > 0 && (
        <div className="loading">Loading more shows...</div>
      )}

      {selectedShow && (
        <ShowDetail
          show={selectedShow}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

export default TvShowBrowser
