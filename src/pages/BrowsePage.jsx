import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Waves } from '../components/Waves'
import { useTheme } from '../context/ThemeContext'
import { BrowseCardSkeleton } from '../components/Skeleton'
import api from '../api/client'
import {
  getRecommendedMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getNewMovies,
  getBecauseYouEnjoyed,
  getTrendingByGenre,
} from '../api/movies'

const GENRE_COLORS = {
  'action':           '#D32F2F',
  'adult':            '#900C3F',
  'adventure':        '#2E8B57',
  'animation':        '#FFC107',
  'biography':        '#795548',
  'comedy':           '#FFB300',
  'crime':            '#2C3E50',
  'documentary':      '#607D8B',
  'drama':            '#3F51B5',
  'family':           '#4FC3F7',
  'fantasy':          '#8E44AD',
  'film-noir':        '#1C1C1C',
  'noir':             '#1C1C1C',
  'history':          '#A1887F',
  'horror':           '#8B0000',
  'music':            '#E91E63',
  'musical':          '#F1C40F',
  'mystery':          '#00838F',
  'news':             '#1565C0',
  'reality-tv':       '#FF5722',
  'romance':          '#EC407A',
  'science fiction':  '#00BCD4',
  'sci-fi':           '#00BCD4',
  'short':            '#2ECC71',
  'sport':            '#E67E22',
  'talk-show':        '#F39C12',
  'thriller':         '#D35400',
  'war':              '#556B2F',
  'western':          '#8B4513',
}

function getGenreColor(name) {
  if (!name) return null
  const key = name.toLowerCase()
  return Object.entries(GENRE_COLORS).find(([k]) => key.includes(k))?.[1] ?? null
}

function formatDuration(mins) {
  if (!mins) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`
}

function BrowseCard({ movie }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const pct = movie.average_rating != null ? Math.round((movie.average_rating / 10) * 100) : null

  return (
    <div
      className="flex rounded-2xl overflow-hidden cursor-pointer group relative transition-all duration-200 hover:scale-[1.02]"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      onClick={() => !menuOpen && navigate(`/movie/${movie.id}`)}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-28 relative" style={{ minHeight: '160px' }}>
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.movie_title}
            className="w-full h-full object-cover"
            style={{ minHeight: '160px' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-card)', minHeight: '160px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          {/* Title + menu */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm leading-snug line-clamp-2 flex-1" style={{ color: 'var(--text-primary)' }}>
              {movie.movie_title}
            </h3>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute top-10 right-3 rounded-xl shadow-xl z-20 py-1 min-w-[140px] text-sm"
                style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border)' }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button className="w-full text-left px-3 py-2 hover:bg-white/10" style={{ color: 'var(--text-primary)' }}>Add to Watchlist</button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10" style={{ color: 'var(--text-primary)' }}>Mark as Watched</button>
                <button className="w-full text-left px-3 py-2 hover:bg-white/10" style={{ color: 'var(--text-primary)' }}>Rate</button>
              </div>
            )}
          </div>

          {/* Genre */}
          {movie.genre && (
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{movie.genre}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {(movie.rating_count != null || movie.review_count != null) && (
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                {((movie.rating_count ?? movie.review_count ?? 0) / 1000).toFixed(1)}K
              </span>
            )}
            {movie.year && <span>{movie.year}</span>}
            {movie.duration && <span>{formatDuration(movie.duration)}</span>}
            {movie.content_rating && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                {movie.content_rating}
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {pct != null && (
          <div className="flex items-center gap-1.5 mt-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#9333ea" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

const CATEGORY_META = {
  'recommended':        { title: 'Recommended for You', fetch: () => getRecommendedMovies(40) },
  'top-rated':          { title: 'Top Rated',           fetch: () => getTopRatedMovies(20) },
  'trending':           { title: 'Trending',            fetch: () => getTrendingMovies(20) },
  'new-arrivals':       { title: 'New Arrivals',        fetch: () => getNewMovies(40) },
  'because-you-enjoyed':{ title: 'Because You Enjoyed', fetch: () => getBecauseYouEnjoyed(20).then(d => d.movies ?? []) },
}

export default function BrowsePage() {
  const location = useLocation()
  const { state, search } = location
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const params = new URLSearchParams(search)
  const category = params.get('category')
  const genreId = params.get('genre_id')
  const genreName = params.get('genre_name')
  const meta = category ? CATEGORY_META[category] : null
  const genreColor = genreId ? getGenreColor(genreName) : null
  const fadeStop = isDark ? '#0e0d14' : '#f0eff8'

  const [movies, setMovies] = useState((state?.movies ?? []).filter(m => m.poster_url))
  const [title, setTitle] = useState(
    genreName ? genreName : (state?.title ?? meta?.title ?? 'Movies')
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Genre browsing
    if (genreId) {
      setTitle(genreName ?? 'Genre')
      setLoading(true)
      getTrendingByGenre(Number(genreId), 40)
        .then(async (trending) => {
          const results = await Promise.allSettled(
            trending.map(t => api.get(`/movies/${t.id}`).then(r => r.data))
          )
          const full = results
            .filter(r => r.status === 'fulfilled' && r.value.poster_url)
            .map(r => r.value)
          setMovies(full)
        })
        .catch(() => setMovies([]))
        .finally(() => setLoading(false))
      return
    }
    if (!meta) return
    setTitle(meta.title)
    setLoading(true)
    meta.fetch()
      .then(data => setMovies((data ?? []).filter(m => m.poster_url)))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false))
  }, [category, genreId])

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--bg-page)' }}>

      {/* Genre background: single color waves, no gradient */}
      {genreColor && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {/* Solid color blob at top */}
          <div className="absolute inset-0" style={{
            background: genreColor,
            opacity: isDark ? 0.18 : 0.12,
          }} />
          {/* Waves in the genre color */}
          <div className="absolute inset-0" style={{ opacity: isDark ? 0.45 : 0.28 }}>
            <Waves strokeColor={genreColor} backgroundColor="transparent" pointerSize={0} />
          </div>
          {/* Fade to page bg from ~40% down */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom, transparent 20%, ${fadeStop} 70%)`,
          }} />
        </div>
      )}

      <Sidebar />
      <main className="relative z-10 flex-1 sidebar-main px-10 py-10">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: genreColor ?? 'var(--text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>

        {/* Genre header — glassy pill */}
        <div className="flex items-center gap-3 mb-8 px-5 py-4 rounded-2xl w-fit"
          style={genreColor ? {
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(20px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
            border: `1px solid ${genreColor}40`,
            boxShadow: `0 4px 24px ${genreColor}28`,
          } : {}}>
          {!genreColor && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          <h1 className="text-2xl font-bold" style={{ color: genreColor ?? 'var(--text-primary)' }}>{title}</h1>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{movies.length} movies</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <BrowseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {movies.map(movie => (
              <BrowseCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
