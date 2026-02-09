import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { StreamProvider } from './contexts/StreamContext'
import Header from './components/Header'
import MovieBrowser from './components/MovieBrowser'
import TvShowBrowser from './components/TvShowBrowser'
import Settings from './components/Settings'
import VideoPlayer from './components/VideoPlayer'
import './App.css'

function AppContent() {
  const [showPlayer, setShowPlayer] = useState(false)

  const handlePlayMovie = () => {
    setShowPlayer(true)
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
  }

  return (
    <div className="app">
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<MovieBrowser onPlayMovie={handlePlayMovie} />} />
          <Route path="/movies" element={<MovieBrowser onPlayMovie={handlePlayMovie} />} />
          <Route path="/shows" element={<TvShowBrowser onPlayMovie={handlePlayMovie} />} />
          <Route path="/anime" element={<MovieBrowser onPlayMovie={handlePlayMovie} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {showPlayer && (
        <VideoPlayer onClose={handleClosePlayer} />
      )}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <StreamProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </StreamProvider>
    </AppProvider>
  )
}

export default App
