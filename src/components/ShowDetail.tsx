import { useState, useEffect } from 'react'
import { Show } from '../services/providers'
import { showProvider } from '../services/providers'
import { useApp } from '../contexts/AppContext'
import { getSettings } from '../services/settings'
import { aiSynopsisService } from '../services/ai-synopsis'
import './MovieDetail.css'

interface ShowDetailProps {
  show: Show
  onClose: () => void
}

const ShowDetail = ({ show: initialShow, onClose }: ShowDetailProps) => {
  const [show, setShow] = useState<Show>(initialShow)
  const [loading, setLoading] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [displayedSynopsis, setDisplayedSynopsis] = useState<string>(initialShow.synopsis || 'Synopsis not available.')
  const [isLoadingSynopsis, setIsLoadingSynopsis] = useState<boolean>(false)
  const { isBookmarked, addBookmark, removeBookmark } = useApp()

  useEffect(() => {
    // Fetch full show details with episodes
    const loadShowDetails = async () => {
      try {
        setLoading(true)
        const fullShow = await showProvider.detail(initialShow.imdb_id)
        setShow(fullShow)
      } catch (error) {
        console.error('Failed to load show details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShowDetails()
  }, [initialShow.imdb_id])

  // Generate AI-enhanced synopsis when show is loaded
  useEffect(() => {
    const loadAiSynopsis = async () => {
      const settings = getSettings()
      
      if (settings.aiEnhancedSynopsis && aiSynopsisService.isAvailable() && show.synopsis) {
        setIsLoadingSynopsis(true)
        try {
          const enhancedSynopsis = await aiSynopsisService.generateSynopsis(
            show.title,
            show.synopsis,
            show.year,
            show.rating,
            show.genres
          )
          setDisplayedSynopsis(enhancedSynopsis)
        } catch (error) {
          console.error('Failed to generate AI synopsis:', error)
          setDisplayedSynopsis(show.synopsis || 'Synopsis not available.')
        } finally {
          setIsLoadingSynopsis(false)
        }
      } else {
        setDisplayedSynopsis(show.synopsis || 'Synopsis not available.')
      }
    }

    loadAiSynopsis()
  }, [show.imdb_id, show.synopsis])

  const handleToggleBookmark = async () => {
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

  const renderStars = (rating: number) => {
    const stars = []
    const normalizedRating = Math.round(rating) / 2 // Convert 0-10 to 0-5
    
    for (let i = 1; i <= Math.floor(normalizedRating); i++) {
      stars.push(<i key={`full-${i}`} className="star full">★</i>)
    }
    
    if (normalizedRating % 1 > 0) {
      stars.push(
        <span key="half" className="star-half-container">
          <i className="star empty">★</i>
          <i className="star half">★</i>
        </span>
      )
    }
    
    for (let i = Math.ceil(normalizedRating); i < 5; i++) {
      stars.push(<i key={`empty-${i}`} className="star empty">★</i>)
    }
    
    return stars
  }

  const genres = show.genres?.join(' / ') || 'N/A'
  
  // Get episodes for the selected season
  const seasonEpisodes = show.episodes?.filter(ep => ep.season === selectedSeason) || []
  const hasEpisodes = show.episodes && show.episodes.length > 0

  return (
    <div className="movie-detail-overlay" onClick={onClose}>
      <div className="movie-detail" onClick={(e) => e.stopPropagation()}>
        <div 
          className="backdrop" 
          style={{ 
            backgroundImage: show.backdr
                {isLoadingSynopsis ? (
                  <div className="synopsis-loading">
                    <div className="loading-spinner"></div>
                    <span>Generating enhanced synopsis...</span>
                  </div>
                ) : (
                  displayedSynopsis
                )}
              
          }}
        >
          <div className="backdrop-overlay"></div>
        </div>

        <div className="close-icon" onClick={onClose}>✕</div>

        <div className="detail-content">
          <section className="poster-box">
            <img src={show.poster} alt={show.title} className="poster-image" />
          </section>

          <section className="content-box">
            <div className="meta-container">
              <div className="title">{show.title}</div>

              <div className="metadatas">
                <div className="metaitem">{show.year}</div>
                <div className="dot"></div>
                <div className="metaitem">{show.num_seasons} {show.num_seasons === 1 ? 'Season' : 'Seasons'}</div>
                <div className="dot"></div>
                <div className="metaitem">{genres}</div>
                <div className="dot"></div>
                <div className="rating-container">
                  <div className="star-container" title={`${show.rating}/10`}>
                    {show.rating && renderStars(show.rating)}
                  </div>
                  <div className="number-container">{show.rating?.toFixed(1)} <em>/10</em></div>
                </div>
              </div>

              <div className="overview">{show.synopsis || 'Synopsis not available.'}</div>
            </div>

            <div className="bottom-container">
              <div className="action-buttons">
                <button 
                  className={`toggle-button ${isBookmarked(show.imdb_id) ? 'active' : ''}`}
                  onClick={handleToggleBookmark}
                >
                  {isBookmarked(show.imdb_id) ? '★ Remove from Bookmarks' : '☆ Add to Bookmarks'}
                </button>
              </div>

              {loading && (
                <div style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
                  Loading episodes...
                </div>
              )}

              {!loading && hasEpisodes && (
                <div className="episodes-container">
                  <div className="season-selector">
                    {Array.from({ length: show.num_seasons }, (_, i) => i + 1).map(season => (
                      <button
                        key={season}
                        className={`season-btn ${selectedSeason === season ? 'active' : ''}`}
                        onClick={() => setSelectedSeason(season)}
                      >
                        Season {season}
                      </button>
                    ))}
                  </div>

                  <div className="episodes-list">
                    {seasonEpisodes.map(episode => (
                      <div key={`${episode.season}-${episode.episode}`} className="episode-item">
                        <div className="episode-number">E{episode.episode}</div>
                        <div className="episode-info">
                          <div className="episode-title">{episode.title}</div>
                          {episode.overview && (
                            <div className="episode-overview">{episode.overview}</div>
                          )}
                        </div>
                        {episode.torrents && Object.keys(episode.torrents).length > 0 && (
                          <button className="episode-play-btn">▶</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && !hasEpisodes && (
                <div className="info-message">
                  <p style={{ color: '#999', fontSize: '14px', marginTop: '15px' }}>
                    No episodes available for this show yet. Check back later!
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ShowDetail