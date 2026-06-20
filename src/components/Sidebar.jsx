import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ activePage, onNavigate }) {
  const [expanded, setExpanded] = useState(() => localStorage.getItem('sidebar_expanded') === 'true')

  const toggleExpanded = (val) => {
    setExpanded(val)
    localStorage.setItem('sidebar_expanded', String(val))
  }
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentPage = activePage ?? (
    location.pathname === '/' ? 'home' :
    location.pathname === '/search' ? 'search' :
    location.pathname === '/watchlist'
      ? (location.state?.tab === 'watched' ? 'watched' : 'watchlist') :
    location.pathname === '/history' ? 'history' :
    location.pathname === '/settings' ? 'settings' :
    location.pathname === '/browse' ? 'browse' : ''
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', expanded ? '224px' : '64px')
  }, [expanded])

  const go = (path, page, state) => {
    navigate(path, state ? { state } : undefined)
    onNavigate?.(page)
  }

  const isActive = (page) => currentPage === page

  /* ── Expanded full nav ── */
  const NavItem = ({ icon, label, page, path, bold }) => {
    const active = isActive(page)
    return (
      <button
        onClick={() => go(path, page)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
          active ? 'bg-purple-600 text-white' : 'hover:bg-purple-600/20'
        } ${bold ? 'font-bold' : 'font-medium'}`}
        style={{ color: active ? '#fff' : 'var(--text-primary)' }}
      >
        <span className="flex-shrink-0 w-5 flex items-center justify-center">{icon}</span>
        <span className="truncate">{label}</span>
      </button>
    )
  }

  const SubItem = ({ label, path, page }) => (
    <button
      onClick={() => go(path, page)}
      className="w-full flex items-center gap-2 pl-11 pr-3 py-1.5 rounded-xl text-xs transition-colors hover:text-purple-300"
      style={{ color: isActive(page) ? '#a855f7' : 'var(--text-muted)' }}
    >
      <span className="w-1 h-1 rounded-full flex-shrink-0 bg-current" />
      {label}
    </button>
  )

  /* ── Icons for collapsed pills ── */
  const iconBtn = (page, path, svgPath, state) => {
    const active = isActive(page)
    return (
      <button
        onClick={() => go(path, page, state)}
        className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-colors ${
          active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-purple-600/30 hover:text-purple-300'
        }`}
      >
        {svgPath}
      </button>
    )
  }

  return (
    <>
    {/* Mobile top bar */}
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
      style={{ background: 'var(--bg-nav)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)' }}>
      <button onClick={() => toggleExpanded(!expanded)} className="w-9 h-9 flex items-center justify-center rounded-xl"
        style={{ color: 'var(--text-primary)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AAA<span style={{ color: '#9333ea' }}>Streamer</span></span>
      </div>
      <button onClick={() => go('/settings', 'settings')}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 border-2"
        style={{ borderColor: isActive('settings') ? '#9333ea' : 'rgba(107,114,128,0.5)' }}>
        {user ? <span className="text-white font-semibold text-xs">{user.username[0].toUpperCase()}</span>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>}
      </button>
    </div>

    {/* Mobile overlay backdrop */}
    {expanded && (
      <div className="md:hidden fixed inset-0 bg-black/50 z-[60]" onClick={() => toggleExpanded(false)} />
    )}

    <aside
      className="hidden md:flex fixed left-0 top-0 h-full z-[70] flex-col overflow-hidden"
      style={{
        width: expanded ? '224px' : '64px',
        transition: 'width 0.25s ease',
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      <div className="md:hidden" style={{ display: expanded ? 'block' : 'none' }} />

      {/* ── COLLAPSED STATE ── */}
      {!expanded && (
        <div className="flex flex-col items-center py-5 w-16 h-full">
          {/* Hamburger */}
          <button
            onClick={() => toggleExpanded(true)}
            className="text-white mb-auto mt-1 hover:opacity-70 transition-opacity"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* Middle pill */}
          <div className="flex flex-col items-center gap-1 px-2 py-3 rounded-3xl" style={{ background: 'var(--bg-pill)' }}>
            {iconBtn('search', '/search',
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
            {iconBtn('home', '/',
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            )}
            {iconBtn(isActive('watched') ? 'watched' : 'watchlist', '/watchlist',
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
              </svg>,
              { tab: 'watchlist' }
            )}
          </div>

          {/* Bottom pill */}
          <div className="mt-auto flex flex-col items-center gap-1 px-2 py-3 rounded-3xl" style={{ background: 'var(--bg-pill)' }}>
            {/* History with tooltip */}
            <div className="relative group/h">
              <button
                onClick={() => go('/history', 'history')}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-colors ${
                  isActive('history') ? 'bg-purple-600 text-white' : 'hover:bg-purple-600/30 hover:text-purple-300'
                }`}
                style={{ color: isActive('history') ? '#fff' : 'var(--text-secondary)' }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
              <span className="absolute left-12 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover/h:opacity-100 transition-opacity pointer-events-none"
                style={{ background: 'var(--bg-dropdown)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                History
              </span>
            </div>

            {/* Avatar */}
            <button
              onClick={() => go('/settings', 'settings')}
              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors flex items-center justify-center bg-gray-700 ${
                isActive('settings') ? 'border-purple-500' : 'border-gray-600 hover:border-purple-500'
              }`}
            >
              {user ? (
                <span className="text-white font-semibold text-sm">{user.username[0].toUpperCase()}</span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── EXPANDED STATE ── */}
      {expanded && (
        <div className="flex flex-col h-full w-56">

          {/* Close button — top, standalone */}
          <div className="flex items-center px-4 pt-5 pb-3 flex-shrink-0">
            <button
              onClick={() => toggleExpanded(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>

          {/* Center nav — grows to fill space */}
          <div className="flex-1 overflow-y-auto px-3 flex flex-col justify-center gap-0.5 py-4">

            <NavItem icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            } label="Search" page="search" path="/search" bold />

            <div className="my-1" />

            <NavItem icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            } label="Home" page="home" path="/" bold />

            <SubItem label="Recommended for You" path="/browse?category=recommended" page="browse" />
            <SubItem label="Top Rated" path="/browse?category=top-rated" page="browse" />
            <SubItem label="Trending" path="/browse?category=trending" page="browse" />
            <SubItem label="New Arrivals" path="/browse?category=new-arrivals" page="browse" />
            <SubItem label="Because You Enjoyed" path="/browse?category=because-you-enjoyed" page="browse" />
            <SubItem label="Genres" path="/genres" page="genres" />

            <div className="my-3 mx-1" style={{ height: '1px', background: 'var(--border-subtle)' }} />
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Lists</p>

            <button
              onClick={() => { navigate('/watchlist', { state: { tab: 'watchlist' } }); onNavigate?.('watchlist') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('watchlist') ? 'bg-purple-600' : 'hover:bg-purple-600/20'}`}
              style={{ color: isActive('watchlist') ? '#fff' : 'var(--text-primary)' }}
            >
              <span className="flex-shrink-0 w-5 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="truncate font-bold">Watchlist</span>
            </button>

            <button
              onClick={() => { navigate('/watchlist', { state: { tab: 'watched' } }); onNavigate?.('watched') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive('watched') ? 'bg-purple-600' : 'hover:bg-purple-600/20'}`}
              style={{ color: isActive('watched') ? '#fff' : 'var(--text-primary)' }}
            >
              <span className="flex-shrink-0 w-5 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span className="truncate">Watched</span>
            </button>
          </div>

          {/* Bottom section: History + Settings + Profile */}
          <div className="flex-shrink-0 px-3 pb-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="pt-3 flex flex-col gap-0.5">

              <NavItem icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              } label="History" page="history" path="/history" bold />

              <NavItem icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              } label="Settings" page="settings" path="/settings" bold />

              <div className="mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }} />
              <button
                onClick={() => go('/settings', 'settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-600/20 transition-colors mt-1"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border-2"
                  style={{ borderColor: isActive('settings') ? '#9333ea' : 'rgba(107,114,128,0.5)' }}>
                  {user
                    ? <span className="text-white font-semibold text-xs">{user.username[0].toUpperCase()}</span>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                  }
                </div>
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.username ?? 'Profile'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
    </>
  )
}
