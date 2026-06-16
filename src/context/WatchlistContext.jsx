import { createContext, useContext, useState, useCallback } from 'react'

const WatchlistContext = createContext(null)

function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

export function WatchlistProvider({ children }) {
  const [watched, setWatched] = useState(() => loadFromStorage('aaas_watched'))
  const [watchlist, setWatchlist] = useState(() => loadFromStorage('aaas_watchlist'))

  const toggleWatched = useCallback((movie) => {
    setWatched(prev => {
      const next = { ...prev }
      if (next[movie.id]) { delete next[movie.id] } else { next[movie.id] = movie }
      localStorage.setItem('aaas_watched', JSON.stringify(next))
      return next
    })
  }, [])

  const toggleWatchlist = useCallback((movie) => {
    setWatchlist(prev => {
      const next = { ...prev }
      if (next[movie.id]) { delete next[movie.id] } else { next[movie.id] = movie }
      localStorage.setItem('aaas_watchlist', JSON.stringify(next))
      return next
    })
  }, [])

  const isWatched = useCallback((id) => !!watched[id], [watched])
  const isInWatchlist = useCallback((id) => !!watchlist[id], [watchlist])

  return (
    <WatchlistContext.Provider value={{ watched, watchlist, toggleWatched, toggleWatchlist, isWatched, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export const useWatchlist = () => useContext(WatchlistContext)
