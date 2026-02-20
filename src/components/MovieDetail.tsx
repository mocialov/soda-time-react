import { useState, useEffect } from 'react'
import { Movie } from '../services/providers'
import { getSettings } from '../services/settings'
import { aiSynopsisService } from '../services/ai-synopsis'
import './MovieDetail.css'

interface MovieDetailProps {
  movie: Movie
  onClose: () => void
  shareUrl?: string
}

const MovieDetail = ({ movie, onClose, shareUrl }: MovieDetailProps) => {
  const [displayedSynopsis, setDisplayedSynopsis] = useState<string>(movie.synopsis || 'Synopsis not available.')
  const [isLoadingSynopsis, setIsLoadingSynopsis] = useState<boolean>(false)
  const [linkCopied, setLinkCopied] = useState(false)

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

  const handleWatchTrailer = () => {
    if (movie.trailer) {
      window.open(movie.trailer, '_blank')
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
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
                {movie.trailer && (
                  <button className="trailer-btn" onClick={handleWatchTrailer}>
                    🎬 Watch Trailer
                  </button>
                )}
                {shareUrl && (
                  <button className="share-btn" onClick={handleCopyLink}>
                    {linkCopied ? '✅ Link Copied!' : '🔗 Copy Link'}
                  </button>
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