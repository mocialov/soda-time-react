import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FilterBar.css'

interface FilterBarProps {
  currentTab: 'movies' | 'shows' | 'anime'
  onTabChange: (tab: 'movies' | 'shows' | 'anime') => void
  genre?: string
  onGenreChange?: (genre: string) => void
  sort?: string
  onSortChange?: (sort: string) => void
  onSearch?: (query: string) => void
  genres?: string[]
  sorters?: string[]
  type?: string
  onTypeChange?: (type: string) => void
  types?: string[]
}

const FilterBar = ({
  currentTab,
  onTabChange,
  genre,
  onGenreChange,
  sort,
  onSortChange,
  onSearch,
  genres = [],
  sorters = [],
  type,
  onTypeChange,
  types = []
}: FilterBarProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const showRandomize = true
  const showWatchlist = true
  const navigate = useNavigate()

  const handleTabClick = (tab: 'movies' | 'shows' | 'anime') => {
    onTabChange(tab)
    if (tab === 'movies') navigate('/movies')
    else if (tab === 'shows') navigate('/shows')
    else if (tab === 'anime') navigate('/anime')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleSearchClear = () => {
    setSearchQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className="filter-bar">
      <ul className="nav nav-left">
        <li 
          className={`source ${currentTab === 'movies' ? 'active' : ''}`}
          onClick={() => handleTabClick('movies')}
        >
          Movies
        </li>
        <li 
          className={`source ${currentTab === 'shows' ? 'active' : ''}`}
          onClick={() => handleTabClick('shows')}
        >
          TV Series
        </li>
        <li 
          className={`source ${currentTab === 'anime' ? 'active' : ''}`}
          onClick={() => handleTabClick('anime')}
        >
          Anime
        </li>
      </ul>

      <ul className="nav nav-filters">
        {types && types.length > 0 && type && onTypeChange && (
          <li className="dropdown filter">
            <a className="dropdown-toggle">
              Type
              <span className="value">{type}</span>
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              {types.map(t => (
                <li key={t}>
                  <a onClick={() => onTypeChange(t)}>{t}</a>
                </li>
              ))}
            </ul>
          </li>
        )}

        {genres && genres.length > 0 && genre && onGenreChange && (
          <li className="dropdown filter">
            <a className="dropdown-toggle">
              Genre
              <span className="value">{genre}</span>
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              {genres.map(g => (
                <li key={g}>
                  <a onClick={() => onGenreChange(g)}>{g}</a>
                </li>
              ))}
            </ul>
          </li>
        )}

        {sorters && sorters.length > 0 && sort && onSortChange && (
          <li className="dropdown filter">
            <a className="dropdown-toggle">
              Sort by
              <span className="value">{sort}</span>
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              {sorters.map(s => (
                <li key={s}>
                  <a onClick={() => onSortChange(s)}>{s}</a>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>

      <ul className="nav nav-right">
        <li>
          <div className="search">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="clear" onClick={handleSearchClear}>
                  ✕
                </div>
              )}
            </form>
          </div>
        </li>

        {showRandomize && (
          <li>
            <i className="icon-random" title="Randomize">🎲</i>
          </li>
        )}

        {showWatchlist && (
          <li>
            <i className="icon-watchlist" title="Watchlist">📥</i>
          </li>
        )}

        <li>
          <i className="icon-favorites" title="Favorites">❤️</i>
        </li>

        <li>
          <i className="icon-about" title="About">ℹ️</i>
        </li>

        <li>
          <i 
            className="icon-settings" 
            title="Settings"
            onClick={() => navigate('/settings')}
          >
            ⚙️
          </i>
        </li>
      </ul>
    </div>
  )
}

export default FilterBar
