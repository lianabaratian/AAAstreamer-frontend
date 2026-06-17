import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MovieRow from '../components/MovieRow'
import { useAuth } from '../context/AuthContext'
import {
  getRecommendedMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getMostRatedMovies,
  getNewMovies,
  getBecauseYouEnjoyed,
} from '../api/movies'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')

  const showAll = (title, movies) => navigate('/browse', { state: { title, movies } })

  const [recommended, setRecommended] = useState([])
  const [topRated, setTopRated] = useState([])
  const [trending, setTrending] = useState([])
  const [newMovies, setNewMovies] = useState([])
  const [becauseMovie, setBecauseMovie] = useState(null)
  const [becauseMovies, setBecauseMovies] = useState([])

  const [loadingRec, setLoadingRec] = useState(true)
  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingBecause, setLoadingBecause] = useState(false)

  // Fetch personalised rows (called on mount + whenever tab becomes visible again)
  const fetchPersonalised = useCallback(() => {
    if (!user) { setLoadingRec(false); setLoadingBecause(false); return }

    setLoadingRec(true)
    setLoadingBecause(true)

    // Recommendations row
    getRecommendedMovies(20)
      .then(setRecommended)
      .catch(() => setRecommended([]))
      .finally(() => setLoadingRec(false))

    // "Because You Enjoyed" — dedicated endpoint that only picks highly-rated source movies
    getBecauseYouEnjoyed(20)
      .then(data => {
        setBecauseMovie(data.source_movie ?? null)
        setBecauseMovies((data.movies ?? []).filter(m => m.poster_url))
      })
      .catch(() => { setBecauseMovie(null); setBecauseMovies([]) })
      .finally(() => setLoadingBecause(false))
  }, [user])

  // Public rows — only need to load once
  useEffect(() => {
    getTopRatedMovies(20)
      .then(setTopRated).catch(() => setTopRated([]))
      .finally(() => setLoadingTop(false))

    getTrendingMovies(20)
      .then(setTrending).catch(() => setTrending([]))
      .finally(() => setLoadingTrend(false))

    getNewMovies(20)
      .then(setNewMovies).catch(() => setNewMovies([]))
      .finally(() => setLoadingNew(false))
  }, [])

  // Personalised rows — fetch on mount and whenever the tab regains focus
  // (user may have rated a movie in another tab / navigated back from detail page)
  useEffect(() => {
    fetchPersonalised()
  }, [fetchPersonalised])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchPersonalised()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchPersonalised])

  return (
    <div className="min-h-screen text-white flex relative" style={{ background: 'var(--bg-home)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/back.svg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.2 }} />
      </div>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="relative z-10 flex-1 sidebar-main px-4 md:px-8 overflow-hidden">

        {/* Top bar with centered logo */}
        <div className="relative flex items-center justify-center py-4 md:py-5 mb-4 md:mb-6">
          {user && (
            <div className="absolute left-0 flex flex-col">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back,</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.username} 👋</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-5 py-2 rounded-2xl" style={{ background: 'var(--bg-pill)' }}>
            {/* Film reel / clapperboard icon */}
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

        <MovieRow
          title="Recommended for You"
          movies={recommended}
          loading={loadingRec}
          onShowAll={() => showAll('Recommended for You', recommended)}
        />

        <MovieRow
          title="Top Rated"
          movies={topRated}
          loading={loadingTop}
          getExtra={(m) => `⭐ ${m.average_rating?.toFixed(1) ?? '—'}  ·  ${m.rating_count ?? 0} ratings`}
          onShowAll={() => showAll('Top Rated', topRated)}
        />

        <MovieRow
          title="Trending"
          movies={trending}
          loading={loadingTrend}
          getExtra={(m) => `⭐ ${m.average_rating?.toFixed(1) ?? '—'}  ·  ${m.rating_count ?? 0} ratings`}
          onShowAll={() => showAll('Trending', trending)}
        />

        <MovieRow
          title="New Arrivals"
          movies={newMovies}
          loading={loadingNew}
          getExtra={(m) => m.year ? `${m.year}${m.duration ? ` · ${m.duration} min` : ''}` : null}
          onShowAll={() => showAll('New Arrivals', newMovies)}
        />

        {becauseMovie && (
          <MovieRow
            title={`Because You Enjoyed "${becauseMovie.movie_title}"`}
            movies={becauseMovies}
            loading={loadingBecause}
            onShowAll={() => showAll(`Because You Enjoyed "${becauseMovie.movie_title}"`, becauseMovies)}
          />
        )}
      </main>
    </div>
  )
}
