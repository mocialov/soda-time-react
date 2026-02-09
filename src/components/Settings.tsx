import { useApp } from '../contexts/AppContext'
import './Settings.css'

const Settings = () => {
  const { settings, updateSetting } = useApp()

  return (
    <div className="settings">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Quality</h3>
        <div className="setting-item">
          <label>Movies Default Quality</label>
          <select 
            value={settings.movies_default_quality}
            onChange={(e) => updateSetting('movies_default_quality', e.target.value)}
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="2160p">4K</option>
          </select>
        </div>
        <div className="setting-item">
          <label>TV Shows Default Quality</label>
          <select 
            value={settings.shows_default_quality}
            onChange={(e) => updateSetting('shows_default_quality', e.target.value)}
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Subtitles</h3>
        <div className="setting-item">
          <label>Default Language</label>
          <select 
            value={settings.subtitle_language}
            onChange={(e) => updateSetting('subtitle_language', e.target.value)}
          >
            <option value="none">None</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Font Size: {settings.subtitle_size}</label>
          <input 
            type="range" 
            min="16" 
            max="40" 
            value={parseInt(settings.subtitle_size)} 
            onChange={(e) => updateSetting('subtitle_size', `${e.target.value}px`)}
          />
        </div>
        <div className="setting-item">
          <label>Font Color</label>
          <input 
            type="color" 
            value={settings.subtitle_color}
            onChange={(e) => updateSetting('subtitle_color', e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Playback</h3>
        <div className="setting-item checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={settings.alwaysFullscreen}
              onChange={(e) => updateSetting('alwaysFullscreen', e.target.checked)}
            />
            Always start in fullscreen
          </label>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={settings.playNextEpisodeAuto}
              onChange={(e) => updateSetting('playNextEpisodeAuto', e.target.checked)}
            />
            Auto-play next episode
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Connection</h3>
        <div className="setting-item">
          <label>Connection Limit</label>
          <input 
            type="number" 
            value={settings.connectionLimit} 
            min="10" 
            max="500"
            onChange={(e) => updateSetting('connectionLimit', parseInt(e.target.value))}
          />
        </div>
        <div className="setting-item checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={settings.dhtEnable}
              onChange={(e) => updateSetting('dhtEnable', e.target.checked)}
            />
            Enable DHT
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>User Interface</h3>
        <div className="setting-item">
          <label>Start Screen</label>
          <select 
            value={settings.startScreen}
            onChange={(e) => updateSetting('startScreen', e.target.value)}
          >
            <option value="Movies">Movies</option>
            <option value="TV Shows">TV Shows</option>
            <option value="Anime">Anime</option>
          </select>
        </div>
        <div className="setting-item checkbox">
          <label>
            <input 
              type="checkbox" 
              checked={settings.coversShowRating}
              onChange={(e) => updateSetting('coversShowRating', e.target.checked)}
            />
            Show ratings on covers
          </label>
        </div>
      </div>
    </div>
  )
}

export default Settings
