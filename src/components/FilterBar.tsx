import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './FilterBar.css'

interface FilterBarProps {
  genre?: string
  onGenreChange?: (genre: string) => void
  sort?: string
  onSortChange?: (sort: string) => void
  onSearch?: (query: string) => void
  searchQuery?: string
  genres?: string[]
  sorters?: string[]
  type?: string
  onTypeChange?: (type: string) => void
  types?: string[]
}

const FilterBar = ({
  genre,
  onGenreChange,
  sort,
  onSortChange,
  onSearch,
  searchQuery: propSearchQuery,
  genres = [],
  sorters = [],
  type,
  onTypeChange,
  types = []
}: FilterBarProps) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLocalSearchQuery(propSearchQuery || '')
  }, [propSearchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(localSearchQuery)
    }
  }

  const handleSearchClear = () => {
    setLocalSearchQuery('')
    if (onSearch) {
      onSearch('')
    }
    navigate('/')
  }

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const handleItemClick = (callback: (value: string) => void, value: string) => {
    callback(value)
    setOpenDropdown(null)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="filter-bar" ref={dropdownRef}>
      <ul className="nav nav-filters">
        {types && types.length > 0 && type && onTypeChange && (
          <li className={`dropdown filter ${openDropdown === 'type' ? 'open' : ''}`}>
            <a className="dropdown-toggle" onClick={() => toggleDropdown('type')}>
              Type
              <span className="value">{type}</span>
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              {types.map(t => (
                <li key={t}>
                  <a onClick={() => handleItemClick(onTypeChange, t)}>{t}</a>
                </li>
              ))}
            </ul>
          </li>
        )}

        {genres && genres.length > 0 && genre && onGenreChange && (
          <li className={`dropdown filter ${openDropdown === 'genre' ? 'open' : ''}`}>
            <a className="dropdown-toggle" onClick={() => toggleDropdown('genre')}>
              Genre
              <span className="value">{genre}</span>
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              {genres.map(g => (
                <li key={g}>
                  <a onClick={() => handleItemClick(onGenreChange, g)}>{g}</a>
                </li>
              ))}
            </ul>
          </li>
        )}

        {sorters && sorters.length > 0 && sort && onSortChange && (
          <li className={`dropdown filter ${openDropdown === 'sort' ? 'open' : ''}`}>
            <a className="dropdown-toggle" onClick={() => toggleDropdown('sort')}>
              Sort by
              <span className="value">{sort}</span>
              <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              {sorters.map(s => (
                <li key={s}>
                  <a onClick={() => handleItemClick(onSortChange, s)}>{s}</a>
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
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              {localSearchQuery && (
                <div className="clear" onClick={handleSearchClear}>
                  ✕
                </div>
              )}
            </form>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default FilterBar
