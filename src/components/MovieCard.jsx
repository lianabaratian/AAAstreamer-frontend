import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchlist } from '../context/WatchlistContext'
import api from '../api/client'

function RateModal({ movie, onClose }) {
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const display = hovered || selected

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await api.put(`/interactions/me/${movie.id}`, { rating: selected })
      onClose()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative rounded-2xl shadow-2xl p-5 w-64" onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-bold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{movie.movie_title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Tap a star to rate</p>
        <div className="flex items-center justify-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => {
            const full = s * 2, half = s * 2 - 1
            const isActive = display >= full
            const isHalf = !isActive && display >= half
            return (
              <div key={s} className="relative w-8 h-8 cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 24 24" className="absolute inset-0">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill="var(--border)" stroke="none" />
                </svg>
                {(isActive || isHalf) && (
                  <svg width="32" height="32" viewBox="0 0 24 24" className="absolute inset-0">
                    <defs><clipPath id={`rc-${s}`}><rect x="0" y="0" width={isActive ? '24' : '12'} height="24" /></clipPath></defs>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill="#f5c518" clipPath={`url(#rc-${s})`} />
                  </svg>
                )}
                <div className="absolute left-0 top-0 w-1/2 h-full"
                  onMouseEnter={() => setHovered(half)} onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(s => s === half ? 0 : half)} />
                <div className="absolute right-0 top-0 w-1/2 h-full"
                  onMouseEnter={() => setHovered(full)} onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(s => s === full ? 0 : full)} />
              </div>
            )
          })}
        </div>
        {display > 0 && <p className="text-center text-xs font-semibold mb-3" style={{ color: '#f5c518' }}>{(display / 2).toFixed(1)} / 5</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-xs font-medium"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!selected || submitting}
            className="flex-1 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
            style={{ background: '#9333ea', color: '#fff' }}>
            {submitting ? '…' : 'Rate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MovieCard({ movie, extra }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [showRate, setShowRate] = useState(false)
  const navigate = useNavigate()
  const { toggleWatched, toggleWatchlist, isWatched, isInWatchlist } = useWatchlist()

  if (!movie.poster_url || imgError) return null

  const watched = isWatched(movie.id)
  const inWatchlist = isInWatchlist(movie.id)

  return (
    <>
      <div
        className="relative flex-shrink-0 w-36 cursor-pointer group"
        onClick={() => !menuOpen && navigate(`/movie/${movie.id}`)}
      >
        <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: '2/3' }}>
          <img src={movie.poster_url} alt={movie.movie_title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)} />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />

          {/* Three-dot button */}
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
            className="absolute top-1.5 right-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-6 h-6 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Compact dropdown */}
          {menuOpen && (
            <div
              className="absolute top-8 right-1.5 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
              style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border)', minWidth: '130px' }}
              onClick={e => e.stopPropagation()}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => { toggleWatchlist(movie); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                style={{ color: inWatchlist ? '#a855f7' : 'var(--text-primary)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>

              <button
                onClick={() => { toggleWatched(movie); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                style={{ color: watched ? '#a855f7' : 'var(--text-primary)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" fill={watched ? 'currentColor' : 'none'} />
                </svg>
                {watched ? 'Watched' : 'Mark as Watched'}
              </button>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '2px 8px' }} />

              <button
                onClick={() => { setMenuOpen(false); setShowRate(true) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Rate
              </button>
            </div>
          )}
        </div>

        <p className="mt-1.5 text-xs font-medium truncate px-0.5 text-center" style={{ color: 'var(--text-primary)' }}>{movie.movie_title}</p>
        {extra && <p className="text-gray-500 text-xs truncate px-0.5 text-center">{extra}</p>}
      </div>

      {showRate && <RateModal movie={movie} onClose={() => setShowRate(false)} />}
    </>
  )
}
