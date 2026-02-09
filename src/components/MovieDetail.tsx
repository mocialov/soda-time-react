import { useState, useEffect } from 'react'
import { Movie } from '../services/providers'
import { useStream } from '../contexts/StreamContext'
import { getSettings } from '../services/settings'
import { aiSynopsisService } from '../services/ai-synopsis'
import './MovieDetail.css'

interface MovieDetailProps {
  movie: Movie
  onClose: () => void
  onPlay: () => void
}

const MovieDetail = ({ movie, onClose, onPlay }: MovieDetailProps) => {
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p')
  const [displayedSynopsis, setDisplayedSynopsis] = useState<string>(movie.synopsis || 'Synopsis not available.')
  const [isLoadingSynopsis, setIsLoadingSynopsis] = useState<boolean>(false)
  const { startStream } = useStream()

  // Generate AI-enhanced synopsis when component mounts
  useEffect(() => {
    const loadAiSynopsis = async () => {
      const settings = getSettings()
      
      if (settings.aiEnhancedSynopsis && aiSynopsisService.isAvailable() && movie.synopsis) {
        setIsLoadingSynopsis(true)
        try {
          const enhancedSynopsis = await aiSynopsisService.generateSynopsis(
            movie.title,
            movie.synopsis,
            movie.year,
            movie.rating,
            movie.genres
          )
          setDisplayedSynopsis(enhancedSynopsis)
        } catch (error) {
          console.error('Failed to generate AI synopsis:', error)
          setDisplayedSynopsis(movie.synopsis || 'Synopsis not available.')
        } finally {
          setIsLoadingSynopsis(false)
        }
      } else {
        setDisplayedSynopsis(movie.synopsis || 'Synopsis not available.')
      }
    }

    loadAiSynopsis()
  }, [movie.imdb_id, movie.synopsis])

  const availableQualities = movie.torrents ? Object.keys(movie.torrents) : []
  const maxQuality = availableQualities.includes('1080p') ? '1080p' : availableQualities.includes('720p') ? '720p' : '480p'
  
  if (!selectedQuality || !availableQualities.includes(selectedQuality)) {
    setSelectedQuality(maxQuality)
  }

  const handlePlay = async () => {
    const torrent = movie.torrents?.[selectedQuality]
    if (!torrent) {
      alert('No torrent available for this quality')
      return
    }

    try {
      await startStream({
        torrentUrl: torrent.url,
        imdb_id: movie.imdb_id,
        title: movie.title,
        backdrop: movie.backdrop
      })
      onPlay()
    } catch (error) {
      console.error('Failed to start stream:', error)
      alert('Failed to start playback')
    }
  }

  const handleWatchTrailer = () => {
    if (movie.trailer) {
      window.open(movie.trailer, '_blank')
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

  const runtime = movie.runtime || 'N/A'
  const genres = movie.genres?.join(' / ') || 'N/A'

  return (
    <div className="movie-detail-overlay" onClick={onClose}>
      <div className="movie-detail" onClick={(e) => e.stopPropagation()}>
        <div 
          className="backdrop" 
          style={{ 
            backgroundImage: movie.backdrop ? `url(${movie.backdrop})` : 'none'
          }}
        >
          <div className="backdrop-overlay"></div>
        </div>

        <div className="close-icon" onClick={onClose}>✕</div>

        <div className="detail-content">
          <section className="poster-box">
            <img src={movie.poster} alt={movie.title} className="poster-image" />
          </section>

          <section className="content-box">
            <div className="meta-container">
              <div className="title">{movie.title}</div>

              <div className="metadatas">
                <div className="metaitem">{movie.year}</div>
                <div className="dot"></div>
                <div className="metaitem">{runtime} min</div>
                <div className="dot"></div>
                <div className="metaitem">{genres}</div>
                <div className="dot"></div>
                <div className="rating-container">
                  <div className="star-container" title={`${movie.rating}/10`}>
                    {movie.rating && renderStars(movie.rating)}
                  </div>
                  <div className="number-container">{movie.rating?.toFixed(1)} <em>/10</em></div>
                </div>
              </div>

              <div className="overview">
                {isLoadingSynopsis ? (
                  <div className="synopsis-loading">
                    <div className="loading-spinner"></div>
                    <span>Generating enhanced synopsis...</span>
                  </div>
                ) : (
                  displayedSynopsis
                )}
              </div>
            </div>

            <div className="bottom-container">
              <div className="play-controls">
                <button className="play-btn" onClick={handlePlay}>
                  ▶ Watch Now
                </button>

                {movie.trailer && (
                  <button className="trailer-btn" onClick={handleWatchTrailer}>
                    🎬 Watch Trailer
                  </button>
                )}

                {availableQualities.length > 1 && (
                  <div className="quality-selector">
                    <span className="quality-label">Quality:</span>
                    {availableQualities.map(quality => (
                      <button
                        key={quality}
                        className={`quality-btn ${selectedQuality === quality ? 'active' : ''}`}
                        onClick={() => setSelectedQuality(quality)}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail
