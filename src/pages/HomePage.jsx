import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MovieRow from '../components/MovieRow'
import { GenreCardSkeleton } from '../components/Skeleton'
import { Waves } from '../components/Waves'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
  getRecommendedMovies,
  getTopRatedMovies,
  getTrendingMovies,
  getMostRatedMovies,
  getNewMovies,
  getBecauseYouEnjoyed,
  fetchGenreCards,
} from '../api/movies'

function GlassRow({ children, isDark }) {
  return (
    <div className="rounded-2xl px-5 py-3" style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.38)',
      backdropFilter: 'blur(28px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
      border: isDark ? '1px solid rgba(147,51,234,0.12)' : '1px solid rgba(255,255,255,0.65)',
      boxShadow: isDark
        ? '0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
        : '0 4px 32px rgba(147,51,234,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    }}>
      {children}
    </div>
  )
}

function GenreCard({ genre, posterUrl, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: '140px', aspectRatio: '2/3' }}
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
          <span className="text-white genre-label font-bold text-sm text-center leading-tight drop-shadow-lg line-clamp-3">
            {genre.name}
          </span>
        </div>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(0,0,0,0.18)' }} />
      </div>
    </div>
  )
}

function GenreRow({ genres, loading, onGenreClick, onShowAll }) {
  const scrollRef = useRef(null)
  const [rightClicks, setRightClicks] = useState(0)

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' })
    if (dir < 0) setRightClicks(0)
  }

  const handleRightClick = () => {
    if (rightClicks === 0) {
      scrollRef.current?.scrollBy({ left: 600, behavior: 'smooth' })
      setRightClicks(1)
    } else {
      onShowAll?.()
    }
  }

  return (
    <div className="mb-0">
      <div className="flex items-center gap-2 mb-4 px-1">
        <button onClick={() => onShowAll?.()} className="flex items-center gap-2 group/title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/>
            <rect x="2" y="14" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/>
          </svg>
          <h2 className="text-white text-xl font-semibold tracking-wide group-hover/title:text-purple-400 transition-colors">Browse by Genre</h2>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="text-gray-500 group-hover/title:text-purple-400 transition-colors">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="relative group/row">
        {/* Left arrow */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-start pl-1"
          style={{ background: 'transparent' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Cards */}
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <GenreCardSkeleton key={i} />
              ))
            : genres.map(({ genre, posterUrl }) => (
                <GenreCard key={genre.id} genre={genre} posterUrl={posterUrl} onClick={() => onGenreClick(genre)} />
              ))
          }
        </div>

        {/* Right arrow */}
        <button
          onClick={handleRightClick}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-end pr-1"
          style={{ background: 'transparent' }}
          title={rightClicks > 0 ? 'See all genres' : 'Scroll right'}
        >
          {rightClicks > 0 ? (
            <div className="flex flex-col items-center gap-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-[9px] font-bold" style={{ color: '#9333ea' }}>ALL</span>
            </div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')

  const showAll = (title, movies) => navigate('/browse', { state: { title, movies } })
  const showGenre = (genre) => navigate(`/browse?genre_id=${genre.id}&genre_name=${encodeURIComponent(genre.name)}`)

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

  const [genreCards, setGenreCards] = useState([])
  const [loadingGenres, setLoadingGenres] = useState(true)

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

  // Genre cards — load once
  useEffect(() => {
    fetchGenreCards(27)
      .then(setGenreCards)
      .catch(() => setGenreCards([]))
      .finally(() => setLoadingGenres(false))
  }, [])

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
      {/* Purple waves — fixed behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: isDark ? 0.4 : 0.22 }}>
        <Waves strokeColor="#9333ea" backgroundColor="transparent" pointerSize={0} />
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

        {/* Glassy container for all rows */}
        <div className="flex flex-col gap-4">

        {/* Has recs → show recommended first */}
        {(loadingRec || recommended.length > 0) && (
          <GlassRow isDark={isDark}>
            <MovieRow
              title="Recommended for You"
              movies={recommended}
              loading={loadingRec}
              getExtra={(m) => [m.year, m.duration ? `${m.duration} min` : null].filter(Boolean).join(' · ') || null}
              onShowAll={() => showAll('Recommended for You', recommended)}
            />
          </GlassRow>
        )}

        {/* Genre row */}
        <GlassRow isDark={isDark}>
          <GenreRow genres={genreCards} loading={loadingGenres} onGenreClick={showGenre} onShowAll={() => navigate('/genres')} />
        </GlassRow>

        <GlassRow isDark={isDark}>
          <MovieRow
            title="Top Rated"
            movies={topRated}
            loading={loadingTop}
            getExtra={(m) => `⭐ ${m.average_rating?.toFixed(1) ?? '—'}  ·  ${m.rating_count ?? 0} ratings`}
            onShowAll={() => showAll('Top Rated', topRated)}
          />
        </GlassRow>

        <GlassRow isDark={isDark}>
          <MovieRow
            title="Trending"
            movies={trending}
            loading={loadingTrend}
            getExtra={(m) => `⭐ ${m.average_rating?.toFixed(1) ?? '—'}  ·  ${m.rating_count ?? 0} ratings`}
            onShowAll={() => showAll('Trending', trending)}
          />
        </GlassRow>

        <GlassRow isDark={isDark}>
          <MovieRow
            title="New Arrivals"
            movies={newMovies}
            loading={loadingNew}
            getExtra={(m) => m.year ? `${m.year}${m.duration ? ` · ${m.duration} min` : ''}` : null}
            onShowAll={() => showAll('New Arrivals', newMovies)}
          />
        </GlassRow>

        {becauseMovie && (
          <GlassRow isDark={isDark}>
            <MovieRow
              title={`Because You Enjoyed "${becauseMovie.movie_title}"`}
              movies={becauseMovies}
              loading={loadingBecause}
              getExtra={(m) => [m.year, m.duration ? `${m.duration} min` : null].filter(Boolean).join(' · ') || null}
              onShowAll={() => showAll(`Because You Enjoyed "${becauseMovie.movie_title}"`, becauseMovies)}
            />
          </GlassRow>
        )}

        </div>


      </main>
    </div>
  )
}
