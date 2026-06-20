import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StarRating from '../components/StarRating'
import { useTheme } from '../context/ThemeContext'
import { getMovieById } from '../api/movies'
import { getMoviePeople, getPerson, getMovieStats, getMovieReviews } from '../api/people'
import { getSimilarMovies } from '../api/movies'
import api from '../api/client'
import { useWatchlist } from '../context/WatchlistContext'
import { Waves } from '../components/Waves'

const ROLE_DIRECTOR = 2
const ROLE_ACTOR = 1
const ROLE_WRITER = 3

// ── Genre colors ───────────────────────────────────────────────────────────
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

function getGenreColors(genreNames) {
  const colors = []
  for (const name of genreNames.slice(0, 3)) {
    const key = name.toLowerCase()
    const color = Object.entries(GENRE_COLORS).find(([k]) => key.includes(k))?.[1]
    if (color && !colors.includes(color)) colors.push(color)
  }
  if (colors.length === 0) colors.push('#3F51B5')
  return colors
}

function GenreBackground({ genreColors, isDark }) {
  const fadeStop = isDark ? '#0e0d14' : '#f0eff8'
  const op = isDark ? 0.65 : 0.4
  const positions = [
    { cx: '20%', cy: '0%', r: '65%' },
    { cx: '80%', cy: '5%', r: '55%' },
    { cx: '50%', cy: '25%', r: '45%' },
  ]
  // Waves stroke: blend the primary genre color with a hint of transparency
  const primaryColor = genreColors[0] ?? '#3F51B5'

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Gradient blobs — bottom layer */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {genreColors.map((color, i) => (
            <radialGradient key={i} id={`gc${i}`} cx={positions[i].cx} cy={positions[i].cy} r={positions[i].r}>
              <stop offset="0%" stopColor={color} stopOpacity={op - i * 0.08}/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>
        {genreColors.map((_, i) => (
          <rect key={i} width="1200" height="800" fill={`url(#gc${i})`}/>
        ))}
      </svg>
      {/* Animated wave lines colored by the primary genre — middle layer */}
      <div className="absolute inset-0" style={{ opacity: isDark ? 0.55 : 0.35 }}>
        <Waves
          strokeColor={primaryColor}
          backgroundColor="transparent"
          pointerSize={0}
        />
      </div>
      {/* Fade to page background — top layer */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(to bottom, transparent 30%, ${fadeStop} 82%)`
      }}/>
    </div>
  )
}

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const { toggleWatched, toggleWatchlist, isWatched, isInWatchlist } = useWatchlist()
  const { isDark } = useTheme()

  const [movie, setMovie] = useState(null)
  const [stats, setStats] = useState(null)
  const [directors, setDirectors] = useState([])
  const [writers, setWriters] = useState([])
  const [actors, setActors] = useState([])
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(true)
  const [collection, setCollection] = useState(null)
  const [loadingCollection, setLoadingCollection] = useState(true)
  const [loading, setLoading] = useState(true)
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)

  const fetchReviews = async () => {
    const data = await getMovieReviews(id).catch(() => [])
    setReviews(data)
    return data
  }

  useEffect(() => {
    setLoading(true)
    getSimilarMovies(id, 20)
      .then(data => setRelated(data.filter(m => m.poster_url)))
      .catch(() => setRelated([]))
      .finally(() => setLoadingRelated(false))

    api.get(`/movies/${id}/collection`)
      .then(r => setCollection(r.data))
      .catch(() => setCollection(null))
      .finally(() => setLoadingCollection(false))

    Promise.all([
      getMovieById(id),
      getMovieStats(id),
      getMoviePeople(id),
      getMovieReviews(id).catch(() => []),
    ]).then(async ([movieData, statsData, people, reviewsData]) => {
      setMovie(movieData)
      setStats(statsData)
      setReviews(reviewsData)

      const directorIds = [...new Set(people.filter(p => p.role_id === ROLE_DIRECTOR).map(p => p.person_id))]
      const writerIds   = [...new Set(people.filter(p => p.role_id === ROLE_WRITER).map(p => p.person_id))]
      const actorIds    = [...new Set(people.filter(p => p.role_id === ROLE_ACTOR).map(p => p.person_id))]

      const [dirData, wriData, actData] = await Promise.all([
        Promise.allSettled(directorIds.slice(0, 5).map(pid => getPerson(pid))),
        Promise.allSettled(writerIds.slice(0, 5).map(pid => getPerson(pid))),
        Promise.allSettled(actorIds.map(pid => getPerson(pid))),
      ])

      setDirectors(dirData.filter(r => r.status === 'fulfilled').map(r => r.value))
      setWriters(wriData.filter(r => r.status === 'fulfilled').map(r => r.value))
      setActors(actData.filter(r => r.status === 'fulfilled').map(r => r.value))
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 500, behavior: 'smooth' })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!movie) return null

  const genres = movie.genres?.map(g => g.name).join(' · ')
  const languages = movie.languages?.map(l => l.name).join(', ')
  const countries = movie.countries?.map(c => c.name).join(', ')
  const meaningfulReviews = reviews.filter(r => r.review_title?.trim() || r.review_body?.trim() || r.rating != null)
  const previewReviews = meaningfulReviews.slice(0, 3)

  const genreColors = getGenreColors((movie.genres ?? []).map(g => g.name))

  return (
    <div className="min-h-screen text-white flex relative overflow-x-hidden" style={{ background: 'var(--bg-page)' }}>

      {/* ── Genre-themed atmospheric background ── */}
      <GenreBackground genreColors={genreColors} isDark={isDark} />

      <Sidebar activePage="home" onNavigate={(p) => p === 'home' && navigate('/')} />

      <main className="flex-1 sidebar-main px-4 md:px-10 py-6 md:py-10 max-w-6xl relative" style={{ zIndex: 1 }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-white mb-8 transition-colors text-sm" style={{ color: 'var(--text-secondary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>

        {/* Single glass card wrapping all content */}
        <div className="rounded-3xl px-6 py-6"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(32px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.6)',
            boxShadow: isDark
              ? '0 0 80px 40px rgba(14,13,20,0.32), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 0 80px 40px rgba(255,255,255,0.35), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}>

        {/* Poster + Info */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10 md:mb-14">
          <div className="flex-shrink-0 flex justify-center md:block">
            <img src={movie.poster_url} alt={movie.movie_title} className="w-48 md:w-72 rounded-2xl object-cover shadow-2xl" style={{ maxHeight: '430px' }} />
          </div>

          <div className="flex flex-col justify-start pt-2 flex-1">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>{movie.movie_title}</h1>

            {directors.length > 0 && (
              <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Directed by{' '}
                {directors.map((d, i) => (
                  <span key={d.id}>
                    <button
                      onClick={() => navigate(`/person/${d.id}`, { state: { fromMovie: movie, fromRole: 'director' } })}
                      className="font-medium underline underline-offset-2 transition-colors hover:text-purple-600" style={{ color: "var(--text-primary)" }}
                    >{d.name}</button>
                    {i < directors.length - 1 && ', '}
                  </span>
                ))}
              </p>
            )}

            {writers.length > 0 && (
              <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Written by{' '}
                {writers.map((w, i) => (
                  <span key={w.id}>
                    <button
                      onClick={() => navigate(`/person/${w.id}`, { state: { fromMovie: movie, fromRole: 'writer' } })}
                      className="font-medium underline underline-offset-2 transition-colors hover:text-purple-600" style={{ color: "var(--text-primary)" }}
                    >{w.name}</button>
                    {i < writers.length - 1 && ', '}
                  </span>
                ))}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: 'var(--text-secondary)' }}>
              {movie.year && <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{movie.year}</span>}
              {movie.year && <span>·</span>}
              {movie.duration && <span>{movie.duration} min</span>}
              {movie.duration && genres && <span>·</span>}
              {genres && <span>{genres}</span>}
              {languages && <><span>·</span><span>{languages}</span></>}
              {countries && <><span>·</span><span>{countries}</span></>}
            </div>

            {stats && (
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <StarRating rating={stats.average_rating} count={stats.review_count} />
                {sentimentInfo(stats.average_sentiment) && (
                  <span className={`text-sm font-semibold ${sentimentInfo(stats.average_sentiment).color}`}>
                    {sentimentInfo(stats.average_sentiment).label}
                  </span>
                )}
              </div>
            )}

            {movie.plot && <MoviePlot plot={movie.plot} />}

            {/* Watched / Watchlist buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => toggleWatched(movie)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={isWatched(movie.id)
                  ? { background: '#9333ea', color: '#ffffff', border: '1px solid #9333ea' }
                  : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isWatched(movie.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {isWatched(movie.id) ? 'Watched' : 'Mark as Watched'}
              </button>

              <button
                onClick={() => toggleWatchlist(movie)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={isInWatchlist(movie.id)
                  ? { background: '#7c3aed', color: '#ffffff', border: '1px solid #7c3aed' }
                  : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWatchlist(movie.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                {isInWatchlist(movie.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Actors */}
        {actors.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Actors</h2>
            </div>
            <div className="relative group/actors">
              <button onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/actors:opacity-100 transition-opacity flex items-center" style={{ background: 'transparent' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {actors.map(actor => (
                  <button key={actor.id} onClick={() => navigate(`/person/${actor.id}`, { state: { fromMovie: movie, fromRole: 'actor' } })} className="flex-shrink-0 w-32 text-left group/actor">
                    <div className="w-32 rounded-2xl overflow-hidden mb-2" style={{ height: '168px', border: '1px solid var(--border)' }}>
                      {actor.profile_url ? (
                        <img src={actor.profile_url} alt={actor.name} className="w-full h-full object-cover object-top group-hover/actor:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate group-hover/actor:text-purple-400 transition-colors" style={{ color: 'var(--text-primary)' }}>{actor.name}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/actors:opacity-100 transition-opacity flex items-center justify-end" style={{ background: 'transparent' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </section>
        )}

        {/* Collection */}
        {(loadingCollection || (collection && collection.movies?.length > 0)) && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  {loadingCollection ? 'Collection' : collection?.name}
                </h2>
                {!loadingCollection && collection?.overview && (
                  <p className="text-xs mt-0.5 max-w-lg line-clamp-1" style={{ color: 'var(--text-muted)' }}>{collection.overview}</p>
                )}
              </div>
            </div>

            {loadingCollection ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 rounded-xl aspect-[2/3] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <RelatedRow
                movies={collection.movies.filter(m => m.poster_url)}
                currentMovieId={Number(id)}
                onMovieClick={(movieId) => navigate(`/movie/${movieId}`)}
              />
            )}
          </section>
        )}

        {/* Reviews section */}
        <section className="mt-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Reviews</h2>
              {stats && (
                <div className="flex items-center gap-2">
                  <StarRating rating={stats.average_rating} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{(stats.average_rating / 2).toFixed(1)} · {stats.review_count.toLocaleString()} reviews</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setReviewFormOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-900/30"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Write a Review
            </button>
          </div>

          {previewReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl text-center max-w-3xl" style={{ border: '1px dashed var(--border)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" className="mb-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Be the first to share your thoughts</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 max-w-3xl">
                {previewReviews.map(review => <ReviewCard key={review.id} review={review} />)}
              </div>
              {meaningfulReviews.length > 3 && (
                <button
                  onClick={() => setReviewsModalOpen(true)}
                  className="mt-5 w-full max-w-3xl py-3 rounded-2xl text-sm font-medium transition-all hover:text-white"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  See all {meaningfulReviews.length} reviews
                </button>
              )}
            </>
          )}
        </section>

        {/* Related Movies */}
        {(loadingRelated || related.length > 0) && (
          <section className="mt-12 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9b59b6" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Related</h2>
            </div>

            {loadingRelated ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 rounded-xl aspect-[2/3] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <RelatedRow movies={related} onMovieClick={(movieId) => navigate(`/movie/${movieId}`)} />
            )}
          </section>
        )}
        </div> {/* end single glass card */}
      </main>

      {reviewsModalOpen && createPortal(
        <ReviewsModal reviews={reviews} onClose={() => setReviewsModalOpen(false)} />,
        document.body
      )}

      {reviewFormOpen && createPortal(
        <WriteReviewModal
          movieId={id}
          onClose={() => setReviewFormOpen(false)}
          onSubmitted={async () => {
            setReviewFormOpen(false)
            await fetchReviews()
            const s = await getMovieStats(id).catch(() => null)
            if (s) setStats(s)
            // Rebuild user embedding so recommendations update on home page
            api.post('/embeddings/users/me/build').catch(() => {})
          }}
        />,
        document.body
      )}
    </div>
  )
}

/* ─── Movie Plot with Read More ─────────────────────── */
function MoviePlot({ plot }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = plot.length > 220

  return (
    <div className="max-w-xl">
      <p className={`leading-relaxed text-[15px] ${!expanded && isLong ? 'line-clamp-3' : ''}`} style={{ color: 'var(--text-primary)' }}>
        {plot}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(o => !o)}
          className="mt-1.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {expanded ? 'Show less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  )
}

/* ─── Related Movies Row ────────────────────────────── */
function RelatedRow({ movies, onMovieClick, currentMovieId }) {
  const rowRef = useRef(null)
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' })

  return (
    <div className="relative group/related">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/related:opacity-100 transition-opacity flex items-center"
        style={{ background: 'transparent' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {movies.map(movie => (
          <RelatedCard key={movie.id} movie={movie} isCurrent={movie.id === currentMovieId} onMovieClick={onMovieClick} />
        ))}
      </div>

      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/related:opacity-100 transition-opacity flex items-center justify-end"
        style={{ background: 'transparent' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  )
}

/* ─── Sentiment helpers ─────────────────────────────── */
function sentimentInfo(score) {
  if (score == null) return null
  if (score >= 7) return { label: 'Positive', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: '#34d399' }
  if (score >= 4) return { label: 'Mixed',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   dot: '#fbbf24' }
  return             { label: 'Negative',     color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/20',    dot: '#fb7185' }
}

function userInitials(userId) {
  // No username in review data, show a short anonymous label
  return `User`
}

function avatarColor(userId) {
  const colors = ['bg-purple-700','bg-blue-700','bg-emerald-700','bg-rose-700','bg-amber-700','bg-indigo-700']
  return colors[userId % colors.length]
}

/* ─── Review Card ───────────────────────────────────── */
function RelatedCard({ movie, isCurrent, onMovieClick }) {
  const [imgError, setImgError] = useState(false)
  if (!movie.poster_url || imgError) return null
  return (
    <div
      onClick={() => !isCurrent && onMovieClick(movie.id)}
      className={`flex-shrink-0 w-36 group/card ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div
        className={`relative rounded-xl overflow-hidden transition-all duration-200 ${isCurrent ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0e0d14]' : 'border border-white/10 group-hover/card:border-purple-500/50 group-hover/card:scale-105'}`}
        style={{ aspectRatio: '2/3' }}
      >
        <img
          src={movie.poster_url}
          alt={movie.movie_title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors duration-200" />
        {isCurrent && (
          <div className="absolute bottom-0 inset-x-0 py-1 text-center text-xs font-semibold text-white" style={{ background: 'rgba(147,51,234,0.85)' }}>
            This film
          </div>
        )}
      </div>
      <p className={`mt-1.5 text-xs font-medium truncate px-0.5 ${isCurrent ? 'text-purple-400' : 'text-white'}`}>{movie.movie_title}</p>
      {movie.year && <p className="text-xs px-0.5" style={{ color: 'var(--text-muted)' }}>{movie.year}</p>}
    </div>
  )
}

function ReviewCard({ review, forceExpanded }) {
  const [expanded, setExpanded] = useState(false)
  const hasTitle = review.review_title?.trim().length > 0
  const hasBody = review.review_body?.trim().length > 0
  const isLong = (review.review_body?.length ?? 0) > 200
  // Public reviews don't carry sentiment; derive it from rating (out of 10)
  const si = review.sentiment != null
    ? sentimentInfo(review.sentiment)
    : review.rating != null
      ? sentimentInfo(review.rating)
      : null

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${avatarColor(review.user_id)}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* Stars + sentiment */}
          <div className="flex items-center gap-2 flex-wrap">
            {review.rating != null && <StarRating rating={review.rating} />}
            {si && (
              <span className={`text-xs font-semibold ${si.color}`}>{si.label}</span>
            )}
          </div>

          {/* Date */}
          {review.review_date && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {new Date(review.review_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          )}

          {/* Title + body */}
          {(hasTitle || hasBody) && (
            <div className="mt-2">
              {hasTitle && (
                <p className="text-white font-semibold text-sm mb-1 leading-snug">{review.review_title}</p>
              )}
              {hasBody && (
                <>
                  <p className={`text-sm leading-relaxed ${!expanded && !forceExpanded && isLong ? 'line-clamp-3' : ''}`} style={{ color: 'var(--text-secondary)' }}>
                    {review.review_body}
                  </p>
                  {isLong && !forceExpanded && (
                    <button
                      onClick={() => setExpanded(o => !o)}
                      className="mt-1.5 text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
                    >
                      {expanded ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── All Reviews Modal ─────────────────────────────── */
function ReviewsModal({ reviews, onClose }) {
  // Only show reviews that have actual content
  const meaningful = reviews.filter(r =>
    r.review_title?.trim() || r.review_body?.trim() || r.rating != null
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative flex flex-col w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '82vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 flex-shrink-0">
          <div>
            <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>All Reviews</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{meaningful.length} reviews</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {meaningful.map(r => <ReviewCard key={r.id} review={r} forceExpanded />)}
        </div>
      </div>
    </div>
  )
}

/* ─── Write Review Modal ────────────────────────────── */
function WriteReviewModal({ movieId, onClose, onSubmitted }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.put(`/interactions/me/${movieId}`, {
        rating: selected || null,
        review_title: title || null,
        review_body: body || null,
      })
      setSubmitting(false)
      setSuccess(true)
      setTimeout(() => onSubmitted(), 2200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review')
      setSubmitting(false)
    }
  }

  const display = hovered || selected
  // index by half-point: 1→Awful, 2→Bad, 3→Meh, 4→Okay, 5→Average, 6→Good, 7→Very Good, 8→Great, 9→Excellent, 10→Perfect
  const ratingLabels = { 1:'Awful', 2:'Bad', 3:'Meh', 4:'Okay', 5:'Average', 6:'Good', 7:'Very Good', 8:'Great', 9:'Excellent', 10:'Perfect' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={!submitting && !success ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Purple top accent */}
        <div className="h-1 bg-gradient-to-r from-purple-600 to-indigo-500" />

        {/* Submitting overlay */}
        {submitting && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl"
            style={{ background: 'var(--bg-surface)' }}>
            <div className="w-14 h-14 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
            <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Submitting your review…</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Just a moment, we're saving your thoughts</p>
          </div>
        )}

        {/* Success screen */}
        {success && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl px-8 text-center"
            style={{ background: 'var(--bg-surface)' }}>
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center"
              style={{ boxShadow: '0 0 0 8px rgba(34,197,94,0.08)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Thank you!</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your review has been submitted.<br />We appreciate you sharing your opinion!
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Write a Review</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-all" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Half-star picker */}
            <div className="flex flex-col items-center gap-3 py-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starNum) => {
                  const fullVal = starNum * 2       // 2,4,6,8,10
                  const halfVal = starNum * 2 - 1   // 1,3,5,7,9
                  const isFullActive = display >= fullVal
                  const isHalfActive = display >= halfVal && display < fullVal
                  return (
                    <div key={starNum} className="relative w-9 h-9 cursor-pointer select-none" style={{ flexShrink: 0 }}>
                      {/* Base star (grey) */}
                      <svg width="36" height="36" viewBox="0 0 24 24" className="absolute inset-0">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="var(--border)" stroke="var(--border)" strokeWidth="1" />
                      </svg>
                      {/* Filled yellow overlay */}
                      {(isFullActive || isHalfActive) && (
                        <svg width="36" height="36" viewBox="0 0 24 24" className="absolute inset-0">
                          <defs>
                            <clipPath id={`pick-${starNum}`}>
                              <rect x="0" y="0" width={isFullActive ? '24' : '12'} height="24" />
                            </clipPath>
                          </defs>
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                            fill="#f5c518"
                            clipPath={`url(#pick-${starNum})`}
                            style={{ filter: 'drop-shadow(0 0 5px rgba(245,197,24,0.5))' }}
                          />
                        </svg>
                      )}
                      {/* Left half hit area → half star */}
                      <div
                        className="absolute left-0 top-0 w-1/2 h-full"
                        onMouseEnter={() => setHovered(halfVal)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setSelected(s => s === halfVal ? 0 : halfVal)}
                      />
                      {/* Right half hit area → full star */}
                      <div
                        className="absolute right-0 top-0 w-1/2 h-full"
                        onMouseEnter={() => setHovered(fullVal)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setSelected(s => s === fullVal ? 0 : fullVal)}
                      />
                    </div>
                  )
                })}
              </div>
              <p className="text-sm font-semibold h-5" style={{ color: display ? '#f5c518' : 'transparent' }}>
                {display ? `${(display / 2).toFixed(1)} / 5 · ${ratingLabels[display] ?? ''}` : '.'}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>Review Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Give your review a headline…"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-all"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>Your Review</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="What did you think? Share your experience…"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-all resize-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2.5 hover:text-white text-sm font-medium transition-colors rounded-xl hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (!selected && !title && !body)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-purple-900/40"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
