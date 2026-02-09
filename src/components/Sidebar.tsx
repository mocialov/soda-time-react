import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

interface SidebarProps {
  currentView: string
  onViewChange: (view: 'movies') => void
}

const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const navigate = useNavigate()

  const handleNavigation = (view: 'movies', path: string) => {
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
      </nav>
    </aside>
  )
}

export default Sidebar
