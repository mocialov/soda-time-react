import { useEffect, useRef, useState } from 'react'
import { useStream } from '../contexts/StreamContext'
import './VideoPlayer.css'

interface VideoPlayerProps {
  onClose: () => void
}

const VideoPlayer = ({ onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { streamInfo, stopStream, pauseStream, resumeStream } = useStream()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !streamInfo.streamUrl) return

    // Set video source when stream is ready
    if (streamInfo.state === 'ready' || streamInfo.state === 'playing') {
      video.src = streamInfo.streamUrl
      // Use play promise to handle autoplay properly
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Auto-play prevented:', error)
          // Video play was prevented, user will need to click play
        })
      }
    }

    // Update time
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [streamInfo.streamUrl, streamInfo.state])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      pauseStream()
    } else {
      video.play()
      resumeStream()
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleClose = () => {
    stopStream()
    onClose()
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div className="video-player" onMouseMove={handleMouseMove}>
      <video
        ref={videoRef}
        className="video-element"
        onClick={togglePlay}
      />

      {streamInfo.state === 'connecting' && (
        <div className="player-overlay">
          <div className="loading-spinner">Connecting...</div>
        </div>
      )}

      {streamInfo.state === 'downloading' && (
        <div className="player-overlay">
          <div className="loading-info">
            <div className="loading-spinner">Downloading...</div>
            <div className="stream-stats">
              <div>Progress: {streamInfo.progress.toFixed(1)}%</div>
              <div>Speed: {(streamInfo.downloadSpeed / 1024 / 1024).toFixed(2)} MB/s</div>
              <div>Peers: {streamInfo.numPeers}</div>
            </div>
          </div>
        </div>
      )}

      <div className={`player-controls ${showControls ? 'visible' : 'hidden'}`}>
        <div className="progress-bar">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="seek-bar"
          />
        </div>

        <div className="controls-row">
          <div className="controls-left">
            <button onClick={togglePlay} className="control-button">
              {isPlaying ? '⏸' : '▶'}
            </button>
            
            <div className="volume-control">
              <button className="control-button">🔊</button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="controls-right">
            <button onClick={toggleFullscreen} className="control-button">
              ⛶
            </button>
            <button onClick={handleClose} className="control-button close-button">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
