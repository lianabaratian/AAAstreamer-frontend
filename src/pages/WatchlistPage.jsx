import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWatchlist } from '../context/WatchlistContext'
import Sidebar from '../components/Sidebar'

function MovieGrid({ movies, emptyMessage }) {
  const navigate = useNavigate()
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="1.2" strokeLinecap="round">
          <rect x="2" y="2" width="20" height="20" rx="3" /><path d="M7 8h10M7 12h6" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>
      </div>
    )
  }
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
      {movies.map(movie => (
        <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)}
          className="flex flex-col cursor-pointer group">
          <div className="rounded-xl overflow-hidden group-hover:scale-105 transition-all duration-200"
            style={{ aspectRatio: '2/3', border: '1px solid var(--border)' }}>
            {movie.poster_url
              ? <img src={movie.poster_url} alt={movie.movie_title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }} />
            }
          </div>
          <p className="mt-1.5 text-xs font-medium truncate px-0.5 group-hover:text-purple-400 transition-colors"
            style={{ color: 'var(--text-primary)' }}>{movie.movie_title}</p>
          {movie.year && <p className="text-xs px-0.5" style={{ color: 'var(--text-muted)' }}>{movie.year}</p>}
        </div>
      ))}
    </div>
  )
}

export default function WatchlistPage() {
  const { watched, watchlist } = useWatchlist()
  const location = useLocation()
  const [tab, setTab] = useState(location.state?.tab ?? 'watchlist')

  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab)
  }, [location.state?.tab])

  const watchedMovies = Object.values(watched)
  const watchlistMovies = Object.values(watchlist)

  const tabs = [
    { key: 'watchlist', label: 'Watchlist', count: watchlistMovies.length },
    { key: 'watched', label: 'Watched', count: watchedMovies.length },
  ]

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--bg-page)' }}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/back.svg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.2 }} />
      </div>
      <Sidebar />
      <main className="relative z-10 flex-1 sidebar-main px-4 md:px-10 py-6 md:py-10 max-w-6xl">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
              <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="1.2" fill="#9333ea" stroke="none" />
              <circle cx="4" cy="12" r="1.2" fill="#9333ea" stroke="none" />
              <circle cx="4" cy="18" r="1.2" fill="#9333ea" stroke="none" />
            </svg>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My List</h1>
          </div>
          <p className="text-sm ml-9" style={{ color: 'var(--text-muted)' }}>
            {watchlistMovies.length} in watchlist · {watchedMovies.length} watched
          </p>
        </div>

        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-pill)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={tab === t.key ? { background: '#9333ea', color: '#fff' } : { color: 'var(--text-secondary)' }}>
              {t.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)', color: tab === t.key ? '#fff' : 'var(--text-muted)' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === 'watchlist'
          ? <MovieGrid movies={watchlistMovies} emptyMessage="Your watchlist is empty. Add movies from their detail page." />
          : <MovieGrid movies={watchedMovies} emptyMessage="No watched movies yet. Mark movies as watched from their detail page." />
        }
      </main>
    </div>
  )
}
