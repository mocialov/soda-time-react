import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'movies' | 'shows' | 'anime' | 'settings') => void
}

const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const navigate = useNavigate()

  const handleNavigation = (view: 'movies' | 'shows' | 'anime' | 'settings', path: string) => {
    onViewChange(view)
    navigate(path)
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'movies' ? 'active' : ''}`}
          onClick={() => handleNavigation('movies', '/movies')}
        >
          <span className="nav-icon">🎬</span>
          <span className="nav-label">Movies</span>
        </button>
        
        <button
          className={`nav-item ${currentView === 'shows' ? 'active' : ''}`}
          onClick={() => handleNavigation('shows', '/shows')}
        >
          <span className="nav-icon">📺</span>
          <span className="nav-label">TV Shows</span>
        </button>
        
        <button
          className={`nav-item ${currentView === 'anime' ? 'active' : ''}`}
          onClick={() => handleNavigation('anime', '/anime')}
        >
          <span className="nav-icon">🎌</span>
          <span className="nav-label">Anime</span>
        </button>

        <div className="sidebar-spacer"></div>
        
        <button
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavigation('settings', '/settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
