import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getPerson, getPersonMovies } from '../api/people'
import Sidebar from '../components/Sidebar'

function calcAge(birthday) {
  if (!birthday) return null
  const born = new Date(birthday)
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--
  return age
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PersonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fromMovie = location.state?.fromMovie ?? null
  const fromRole = location.state?.fromRole ?? null

  const [person, setPerson] = useState(null)
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [bioExpanded, setBioExpanded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setMoviesLoading(true)
    getPerson(id)
      .then(setPerson)
      .catch(console.error)
      .finally(() => setLoading(false))
    getPersonMovies(id)
      .then(data => setMovies(data.filter(m => m.poster_url)))
      .catch(console.error)
      .finally(() => setMoviesLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!person) return null

  const age = calcAge(person.birthday)
  const isLongBio = (person.biography?.length ?? 0) > 400

  return (
    <div className="min-h-screen text-white flex" style={{ background: 'var(--bg-page)' }}>

      <Sidebar onNavigate={(p) => { if (p === 'home') navigate('/') }} />

      <main className="flex-1 sidebar-main px-4 md:px-10 py-6 md:py-10 max-w-5xl">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>

        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10 md:mb-12">

          {/* Photo */}
          <div className="flex-shrink-0 flex justify-center md:block">
            {person.profile_url ? (
              <img
                src={person.profile_url}
                alt={person.name}
                className="w-40 md:w-56 rounded-2xl object-cover object-top shadow-2xl"
                style={{ aspectRatio: '2/3' }}
              />
            ) : (
              <div className="w-40 md:w-56 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ aspectRatio: '2/3', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.4)" strokeWidth="1.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-start pt-2 flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{person.name}</h1>
              {fromRole && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: 'var(--bg-pill)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {fromRole}
                </span>
              )}
            </div>

            {/* Birthday + Age */}
            {(person.birthday || age != null) && (
              <div className="flex items-center gap-3 mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {person.birthday && (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(person.birthday)}
                  </span>
                )}
                {age != null && (
                  <span style={{ color: 'var(--text-secondary)' }}>· Age {age}</span>
                )}
              </div>
            )}

            {/* Biography */}
            {person.biography ? (
              <div>
                <p className={`leading-relaxed text-[15px] max-w-xl ${!bioExpanded && isLongBio ? 'line-clamp-5' : ''}`} style={{ color: 'var(--text-primary)' }}>
                  {person.biography}
                </p>
                {isLongBio && (
                  <button onClick={() => setBioExpanded(o => !o)} className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                    {bioExpanded ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No biography available yet.</p>
            )}
          </div>
        </div>

        {/* Known For */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Known For</h2>
          </div>

          {moviesLoading ? (
            <div className="flex gap-4 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 rounded-xl animate-pulse flex-shrink-0"
                  style={{ aspectRatio: '2/3', background: 'var(--skeleton)' }} />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No movies found.</p>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {movies.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="flex flex-col cursor-pointer group w-36 flex-shrink-0"
                >
                  <div className="rounded-xl overflow-hidden group-hover:scale-105 transition-all duration-200"
                    style={{ aspectRatio: '2/3', border: '1px solid var(--border)' }}>
                    <img src={movie.poster_url} alt={movie.movie_title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-1.5 text-xs font-medium truncate px-0.5 group-hover:text-purple-400 transition-colors"
                    style={{ color: 'var(--text-primary)' }}>{movie.movie_title}</p>
                  {movie.year && <p className="text-xs px-0.5" style={{ color: 'var(--text-muted)' }}>{movie.year}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
