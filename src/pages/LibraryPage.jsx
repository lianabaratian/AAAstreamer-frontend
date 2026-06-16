import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchlist } from '../context/WatchlistContext'
import Sidebar from '../components/Sidebar'
import api from '../api/client'
import { getMovieById } from '../api/movies'

function StarDisplay({ rating }) {
  if (rating == null) return null
  const stars = rating / 2
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => {
        const full = stars >= s
        const half = !full && stars >= s - 0.5
        return (
          <svg key={s} width="12" height="12" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={full || half ? '#f5c518' : 'var(--border)'} stroke="none" />
          </svg>
        )
      })}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-secondary)' }}>
        {(rating / 2).toFixed(1)}
      </span>
    </div>
  )
}

function ReviewCard({ interaction, movie, onClick }) {
  const [imgError, setImgError] = useState(false)
  const date = new Date(interaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div
      onClick={onClick}
      className="flex gap-4 rounded-2xl cursor-pointer group transition-all duration-200 hover:scale-[1.01] p-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden" style={{ aspectRatio: '2/3', border: '1px solid var(--border)' }}>
        {movie?.poster_url && !imgError ? (
          <img src={movie.poster_url} alt={movie.movie_title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm leading-snug group-hover:text-purple-400 transition-colors truncate"
            style={{ color: 'var(--text-primary)' }}>
            {movie?.movie_title ?? `Movie #${interaction.movie_id}`}
          </h3>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{date}</span>
        </div>

        <StarDisplay rating={interaction.rating} />

        {interaction.review_title && (
          <p className="text-xs font-semibold mt-2 truncate" style={{ color: 'var(--text-primary)' }}>
            "{interaction.review_title}"
          </p>
        )}
        {interaction.review_body && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {interaction.review_body}
          </p>
        )}
      </div>
    </div>
  )
}

function MovieGrid({ movies, emptyMessage }) {
  const navigate = useNavigate()
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="1.2" strokeLinecap="round">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <path d="M7 8h10M7 12h6" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-4">
      {movies.map(movie => (
        <div key={movie.id} onClick={() => navigate(`/movie/${movie.id}`)}
          className="flex flex-col cursor-pointer group w-36 flex-shrink-0">
          <div className="rounded-xl overflow-hidden group-hover:scale-105 transition-all duration-200"
            style={{ aspectRatio: '2/3', border: '1px solid var(--border)' }}>
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.movie_title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                </svg>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-xs font-medium truncate px-0.5 group-hover:text-purple-400 transition-colors"
            style={{ color: 'var(--text-primary)' }}>{movie.movie_title}</p>
          {movie.year && <p className="text-xs px-0.5" style={{ color: 'var(--text-muted)' }}>{movie.year}</p>}
        </div>
      ))}
    </div>
  )
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const { watched, watchlist } = useWatchlist()
  const [tab, setTab] = useState('history')

  const [interactions, setInteractions] = useState([])
  const [movieMap, setMovieMap] = useState({})
  const [loadingHistory, setLoadingHistory] = useState(true)

  const watchedMovies = Object.values(watched)
  const watchlistMovies = Object.values(watchlist)

  useEffect(() => {
    if (tab !== 'history') return
    setLoadingHistory(true)
    api.get('/interactions/me', { params: { limit: 100 } })
      .then(async r => {
        const data = r.data
        setInteractions(data)
        // fetch movie details for all unique movie_ids
        const ids = [...new Set(data.map(i => i.movie_id))]
        const results = await Promise.allSettled(ids.map(id => getMovieById(id)))
        const map = {}
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') map[ids[idx]] = res.value
        })
        setMovieMap(map)
      })
      .catch(() => setInteractions([]))
      .finally(() => setLoadingHistory(false))
  }, [tab])

  const tabs = [
    { key: 'history', label: 'History', count: null },
    { key: 'watchlist', label: 'Watchlist', count: watchlistMovies.length },
    { key: 'watched', label: 'Watched', count: watchedMovies.length },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className="flex-1 sidebar-main px-10 py-10 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Library</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-pill)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={tab === t.key ? { background: '#9333ea', color: '#ffffff' } : { color: 'var(--text-secondary)' }}>
              {t.label}
              {t.count != null && (
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: tab === t.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface)', color: tab === t.key ? '#fff' : 'var(--text-muted)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* History tab */}
        {tab === 'history' && (
          loadingHistory ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--skeleton)' }} />
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reviews or ratings yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {interactions.map(interaction => (
                <ReviewCard
                  key={interaction.id}
                  interaction={interaction}
                  movie={movieMap[interaction.movie_id]}
                  onClick={() => navigate(`/movie/${interaction.movie_id}`)}
                />
              ))}
            </div>
          )
        )}

        {tab === 'watchlist' && (
          <MovieGrid movies={watchlistMovies} emptyMessage="Your watchlist is empty. Add movies from their detail page." />
        )}

        {tab === 'watched' && (
          <MovieGrid movies={watchedMovies} emptyMessage="No watched movies yet. Mark movies as watched from their detail page." />
        )}
      </main>
    </div>
  )
}
