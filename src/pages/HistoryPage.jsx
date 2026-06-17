import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api/client'
import { getMovieById } from '../api/movies'

function StarDisplay({ rating }) {
  if (rating == null) return null
  const stars = rating / 2
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={stars >= s ? '#f5c518' : stars >= s - 0.5 ? '#f5c518' : 'var(--border)'} stroke="none" />
        </svg>
      ))}
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
    <div onClick={onClick}
      className="flex gap-4 rounded-2xl cursor-pointer group transition-all duration-200 hover:scale-[1.01] p-4"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>

      <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden" style={{ aspectRatio: '2/3', border: '1px solid var(--border)' }}>
        {movie?.poster_url && !imgError
          ? <img src={movie.poster_url} alt={movie.movie_title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          : <div className="w-full h-full" style={{ background: 'var(--bg-card)' }} />
        }
      </div>

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

export default function HistoryPage() {
  const navigate = useNavigate()
  const [interactions, setInteractions] = useState([])
  const [movieMap, setMovieMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/interactions/me', { params: { limit: 100 } })
      .then(async r => {
        const data = r.data
        setInteractions(data)
        const ids = [...new Set(data.map(i => i.movie_id))]
        const results = await Promise.allSettled(ids.map(id => getMovieById(id)))
        const map = {}
        results.forEach((res, idx) => { if (res.status === 'fulfilled') map[ids[idx]] = res.value })
        setMovieMap(map)
      })
      .catch(() => setInteractions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--bg-page)' }}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/back.svg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.2 }} />
      </div>
      <Sidebar />
      <main className="relative z-10 flex-1 sidebar-main px-4 md:px-10 py-6 md:py-10 max-w-3xl">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>History</h1>
          </div>
          <p className="text-sm ml-9" style={{ color: 'var(--text-muted)' }}>
            Your reviews and ratings
          </p>
        </div>

        {loading ? (
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
        )}
      </main>
    </div>
  )
}
