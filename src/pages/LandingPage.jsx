import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import MovieRow from '../components/MovieRow'
import { getTopRatedMovies, getTrendingMovies, getNewMovies } from '../api/movies'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'Personalized For You',
    desc: 'AI-powered recommendations that learn from your taste — ratings, reviews, and watch history all feed the model.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Sentiment Analysis',
    desc: 'Every review is analyzed for emotional tone. See whether a movie\'s reviews skew Positive, Mixed, or Negative at a glance.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
        <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
        <circle cx="4" cy="6" r="1.2" fill="#9333ea" stroke="none"/>
        <circle cx="4" cy="12" r="1.2" fill="#9333ea" stroke="none"/>
        <circle cx="4" cy="18" r="1.2" fill="#9333ea" stroke="none"/>
      </svg>
    ),
    title: 'Watchlist & History',
    desc: 'Save movies to your watchlist, mark what you\'ve seen, and browse your full viewing history anytime.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Because You Enjoyed…',
    desc: 'Loved a film? Get an instant "Because You Enjoyed" carousel of movies similar to what you rated highly.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [topRated, setTopRated] = useState([])
  const [trending, setTrending] = useState([])
  const [newMovies, setNewMovies] = useState([])
  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)

  useEffect(() => {
    getTopRatedMovies(20).then(setTopRated).catch(() => setTopRated([])).finally(() => setLoadingTop(false))
    getTrendingMovies(20).then(setTrending).catch(() => setTrending([])).finally(() => setLoadingTrend(false))
    getNewMovies(20).then(setNewMovies).catch(() => setNewMovies([])).finally(() => setLoadingNew(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative" style={{ background: 'var(--bg-page)' }}>

      {/* Background image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/back.svg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.2 }} />
      </div>

      {/* Glassy overlay tint */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.06) 0%, transparent 60%, rgba(109,40,217,0.05) 100%)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
          </svg>
          <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
            AAA<span style={{ color: '#9333ea' }}>Streamer</span>
          </span>
        </div>
        <div className="flex items-center gap-3 pr-14">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#9333ea', color: '#fff' }}
          >
            Create account
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-10 md:pt-20 md:pb-16">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(147,51,234,0.18) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5 max-w-3xl" style={{ color: 'var(--text-primary)' }}>
            Discover movies<br />
            <span style={{ color: '#9333ea' }}>made for you</span>
          </h1>

          <p className="text-base md:text-lg max-w-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Rate films, write reviews, and let the recommendation engine learn exactly what you love. Your next favourite movie is one click away.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              style={{ background: '#9333ea', color: '#fff' }}
            >
              Get started — it's free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Movie rows */}
      <div className="relative z-10 px-4 md:px-8 mb-8">
        <MovieRow
          title="Top Rated"
          movies={topRated}
          loading={loadingTop}
          getExtra={(m) => `⭐ ${m.average_rating?.toFixed(1) ?? '—'}  ·  ${m.rating_count ?? 0} ratings`}
          onShowAll={() => navigate('/login')}
        />
        <MovieRow
          title="Trending"
          movies={trending}
          loading={loadingTrend}
          getExtra={(m) => `⭐ ${m.average_rating?.toFixed(1) ?? '—'}  ·  ${m.rating_count ?? 0} ratings`}
          onShowAll={() => navigate('/login')}
        />
        <MovieRow
          title="New Arrivals"
          movies={newMovies}
          loading={loadingNew}
          getExtra={(m) => m.year ? `${m.year}${m.duration ? ` · ${m.duration} min` : ''}` : null}
          onShowAll={() => navigate('/login')}
        />
      </div>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>
          Everything you need to explore film
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(147,51,234,0.1)' }}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative z-10 mx-6 md:mx-12 mb-16 rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ background: 'rgba(147,51,234,0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(147,51,234,0.3)' }}>
        <div>
          <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Ready to find your next favourite film?</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create a free account and start rating movies in seconds.</p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
          style={{ background: '#9333ea', color: '#fff' }}
        >
          Create account
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-6 mt-auto border-t text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        © 2025 AAAStreamer — Powered by FastAPI + pgvector
      </footer>
    </div>
  )
}
