import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { searchMovies, getMostRatedMovies } from '../api/movies'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [topSearches, setTopSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTop, setLoadingTop] = useState(true)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  // Load "Top Searches" grid once
  useEffect(() => {
    getMostRatedMovies(24)
      .then(setTopSearches)
      .catch(() => setTopSearches([]))
      .finally(() => setLoadingTop(false))
    // Auto-focus the search bar
    inputRef.current?.focus()
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(() => {
      searchMovies(query.trim(), 40)
        .then(data => setResults(data.filter(m => m.poster_url)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const isSearching = query.trim().length > 0

  return (
    <div className="min-h-screen text-white flex" style={{ background: 'var(--bg-page)' }}>
      <Sidebar activePage="search" onNavigate={(page) => {
        if (page === 'home') navigate('/')
        else if (page === 'list') navigate('/list')
      }} />

      <main className="flex-1 sidebar-main px-8 py-8">

        {/* Top logo */}
        <div className="flex items-center justify-center py-5 mb-2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-2xl" style={{ background: 'var(--bg-pill)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="17" y1="7" x2="22" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
            </svg>
            <span className="text-white font-bold text-sm tracking-wide">
              AAA<span style={{ color: '#9333ea' }}>Streamer</span>
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search shows & movies..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl text-white placeholder-gray-400 text-base outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: 'var(--bg-surface)', border: '1.5px solid rgba(147,51,234,0.5)' }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results or Top Searches */}
        {isSearching ? (
          <SearchResults results={results} loading={loading} query={query} onMovieClick={id => navigate(`/movie/${id}`)} />
        ) : (
          <TopSearches movies={topSearches} loading={loadingTop} onMovieClick={id => navigate(`/movie/${id}`)} />
        )}
      </main>
    </div>
  )
}

function TopSearches({ movies, loading, onMovieClick }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Top Searches</h2>
      {loading ? (
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 rounded-xl animate-pulse" style={{ aspectRatio: '2/3', background: 'var(--skeleton)' }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {movies.map(movie => (
            <MovieGridCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SearchResults({ results, loading, query, onMovieClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/5 animate-pulse" style={{ aspectRatio: '2/3' }} />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.4)" strokeWidth="1.5" strokeLinecap="round" className="mb-4">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-gray-400 text-lg">No results for <span className="text-white font-medium">"{query}"</span></p>
        <p className="text-gray-600 text-sm mt-1">Try a different title or keyword</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-gray-400 text-sm mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for <span className="text-white">"{query}"</span></p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {results.map(movie => (
          <MovieGridCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie.id)} />
        ))}
      </div>
    </div>
  )
}

function MovieGridCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false)
  if (!movie.poster_url || imgError) return null
  return (
    <div onClick={onClick} className="relative flex-shrink-0 w-36 cursor-pointer group">
      <div className="relative rounded-xl overflow-hidden border border-white/10 transition-transform duration-300 group-hover:scale-105"
        style={{ aspectRatio: '2/3' }}>
        <img src={movie.poster_url} alt={movie.movie_title} className="w-full h-full object-cover"
          onError={() => setImgError(true)} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
      </div>
      <p className="mt-1.5 text-white text-xs font-medium truncate px-0.5">{movie.movie_title}</p>
      {movie.year && <p className="text-gray-500 text-xs px-0.5">{movie.year}</p>}
    </div>
  )
}
