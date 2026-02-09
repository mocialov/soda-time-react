import './Header.css'

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI

const Header = () => {
  const handleMinimize = () => {
    if (isElectron) {
      window.electronAPI.window.minimize()
    }
  }

  const handleMaximize = () => {
    if (isElectron) {
      window.electronAPI.window.maximize()
    }
  }

  const handleClose = () => {
    if (isElectron) {
      window.electronAPI.window.close()
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🥤</span>
          <span className="logo-text">Soda Time</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="window-controls">
          <button className="window-button minimize" onClick={handleMinimize}>−</button>
          <button className="window-button maximize" onClick={handleMaximize}>□</button>
          <button className="window-button close" onClick={handleClose}>✕</button>
        </div>
      </div>
    </header>
  )
}

export default Header
