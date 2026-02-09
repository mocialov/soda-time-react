import './Header.css'

const Header = () => {
  const handleMinimize = () => {
    if (window.require) {
      const { remote } = window.require('electron')
      remote.getCurrentWindow().minimize()
    }
  }

  const handleMaximize = () => {
    if (window.require) {
      const { remote } = window.require('electron')
      const win = remote.getCurrentWindow()
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  }

  const handleClose = () => {
    if (window.require) {
      const { remote } = window.require('electron')
      remote.getCurrentWindow().close()
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
