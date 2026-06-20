import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { fetchGenreCards } from '../api/movies'

function GenreCard({ genre, posterUrl, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group"
      style={{ aspectRatio: '2/3' }}
    >
      <div className="w-full h-full rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={genre.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'var(--bg-surface)' }} />
        )}
        <div className="absolute inset-0 rounded-xl" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)'
        }} />
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <span className="text-white genre-label font-bold text-sm text-center leading-tight drop-shadow-lg">
            {genre.name}
          </span>
        </div>
        <div className="absolute inset-0 rounded-xl ring-2 ring-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}

export default function GenresPage() {
  const navigate = useNavigate()
  const [genreCards, setGenreCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenreCards(27)
      .then(setGenreCards)
      .catch(() => setGenreCards([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--bg-page)' }}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/back.svg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.2 }} />
      </div>
      <Sidebar />
      <main className="relative z-10 flex-1 sidebar-main px-4 md:px-10 py-6 md:py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/>
            <rect x="2" y="14" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/>
          </svg>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Browse by Genre</h1>
        </div>

        {loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="rounded-xl animate-pulse" style={{ aspectRatio: '2/3', background: 'var(--skeleton)' }} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {genreCards.map(({ genre, posterUrl }) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                posterUrl={posterUrl}
                onClick={() => navigate(`/browse?genre_id=${genre.id}&genre_name=${encodeURIComponent(genre.name)}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
