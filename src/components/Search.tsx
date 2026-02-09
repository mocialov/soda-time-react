import { useState } from 'react'
import { useDebounce } from '../hooks'
import { movieProvider, showProvider } from '../services/providers'
import './Search.css'

interface SearchProps {
  onClose: () => void
}

const Search = ({ onClose }: SearchProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'movies' | 'shows'>('movies')
  
  const debouncedQuery = useDebounce(query, 500)

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      
      if (activeTab === 'movies') {
        const result = await movieProvider.search(searchQuery)
        setResults(result.results)
      } else {
        const result = await showProvider.search(searchQuery)
        setResults(result.results)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Trigger search when debounced query changes
  useState(() => {
    handleSearch(debouncedQuery)
  })

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <input
            type="text"
            placeholder="Search movies and TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="search-input"
          />
          <button onClick={onClose} className="search-close">✕</button>
        </div>

        <div className="search-tabs">
          <button 
            className={`search-tab ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </button>
          <button 
            className={`search-tab ${activeTab === 'shows' ? 'active' : ''}`}
            onClick={() => setActiveTab('shows')}
          >
            TV Shows
          </button>
        </div>

        <div className="search-results">
          {loading && <div className="search-loading">Searching...</div>}
          
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="search-empty">No results found</div>
          )}

          {!loading && results.length > 0 && (
            <div className="results-grid">
              {results.map((item) => (
                <div key={item.imdb_id} className="result-item">
                  <img src={item.poster} alt={item.title} className="result-poster" />
                  <div className="result-info">
                    <div className="result-title">{item.title}</div>
                    <div className="result-meta">
                      {item.year} • ⭐ {item.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
