import { useRef, useState } from 'react'
import MovieCard from './MovieCard'

export default function MovieRow({ title, movies = [], loading, getExtra, onShowAll }) {
  const scrollRef = useRef(null)
  const [rightClicks, setRightClicks] = useState(0)

  const handleRightClick = () => {
    if (rightClicks === 0) {
      scrollRef.current?.scrollBy({ left: 600, behavior: 'smooth' })
      setRightClicks(1)
    } else {
      onShowAll?.()
    }
  }

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' })
    if (dir < 0) setRightClicks(0)
  }

  return (
    <section className="mb-10">
      {/* Row header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <button
          onClick={() => onShowAll?.()}
          className="flex items-center gap-2 group/title"
        >
          <h2 className="text-white text-xl font-semibold tracking-wide group-hover/title:text-purple-400 transition-colors">{title}</h2>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="text-gray-500 group-hover/title:text-purple-400 transition-colors">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Scrollable row */}
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
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 rounded-xl aspect-[2/3] animate-pulse"
                  style={{ background: 'var(--skeleton)' }} />
              ))
            : movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  extra={getExtra?.(movie)}
                />
              ))
          }
        </div>

        {/* Right arrow — 1st click scrolls, 2nd click opens browse page */}
        <button
          onClick={handleRightClick}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-end pr-1"
          style={{ background: 'transparent' }}
          title={rightClicks > 0 ? 'See all' : 'Scroll right'}
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
    </section>
  )
}
