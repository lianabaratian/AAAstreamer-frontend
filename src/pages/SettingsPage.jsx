import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../api/client'

function StatCard({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <span className="text-2xl font-bold" style={{ color: accent ?? 'var(--text-primary)' }}>{value ?? '—'}</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}

function Badge({ children, color }) {
  const colors = {
    green:  { background: 'rgba(34,197,94,0.12)',  color: '#22c55e',  border: '1px solid rgba(34,197,94,0.3)' },
    red:    { background: 'rgba(239,68,68,0.12)',   color: '#ef4444',  border: '1px solid rgba(239,68,68,0.3)' },
    yellow: { background: 'rgba(234,179,8,0.12)',   color: '#ca8a04',  border: '1px solid rgba(234,179,8,0.3)' },
    purple: { background: 'rgba(147,51,234,0.15)',  color: '#9333ea',  border: '1px solid rgba(147,51,234,0.3)' },
    gray:   { background: 'var(--bg-surface)',      color: 'var(--text-muted)', border: '1px solid var(--border)' },
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={colors[color] ?? colors.gray}>
      {children}
    </span>
  )
}

function AdminPanel() {
  const [subTab, setSubTab] = useState('overview')
  const [globalStats, setGlobalStats] = useState(null)
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [jobs, setJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [retrainLoading, setRetrainLoading] = useState(false)
  const [retrainResult, setRetrainResult] = useState(null)

  useEffect(() => {
    api.get('/stats/global').then(r => setGlobalStats(r.data)).catch(() => {})
  }, [])

  const loadUsers = useCallback(() => {
    setUsersLoading(true)
    api.get('/users', { params: { search: userSearch || undefined, limit: 50 } })
      .then(r => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false))
  }, [userSearch])

  useEffect(() => {
    if (subTab === 'users') loadUsers()
  }, [subTab, loadUsers])

  useEffect(() => {
    if (subTab === 'jobs') {
      setJobsLoading(true)
      api.get('/admin/recommendations/jobs', { params: { limit: 20 } })
        .then(r => setJobs(r.data))
        .catch(() => setJobs([]))
        .finally(() => setJobsLoading(false))
    }
  }, [subTab])

  useEffect(() => {
    if (subTab === 'models') {
      setModelsLoading(true)
      api.get('/admin/recommendations/models')
        .then(r => setModels(r.data))
        .catch(() => setModels([]))
        .finally(() => setModelsLoading(false))
    }
  }, [subTab])

  const toggleUserField = async (userId, field, current) => {
    try {
      await api.patch(`/users/${userId}`, { [field]: !current })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: !current } : u))
    } catch {}
  }

  const triggerRetrain = async () => {
    setRetrainLoading(true)
    setRetrainResult(null)
    try {
      const r = await api.post('/admin/recommendations/retrain')
      setRetrainResult({ ok: true, msg: `Job #${r.data.job_id} queued — ${r.data.detail}` })
    } catch (err) {
      setRetrainResult({ ok: false, msg: err?.response?.data?.detail ?? 'Failed to trigger retrain.' })
    } finally {
      setRetrainLoading(false)
    }
  }

  const jobStatusColor = (s) => ({ completed: 'green', running: 'yellow', failed: 'red', pending: 'gray' }[s] ?? 'gray')

  const subTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users',    label: 'Users' },
    { key: 'jobs',     label: 'ML Jobs' },
    { key: 'models',   label: 'Models' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Admin badge */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.25)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="text-sm font-medium" style={{ color: '#9333ea' }}>Admin access — changes take effect immediately</span>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-pill)' }}>
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={subTab === t.key ? { background: '#9333ea', color: '#fff' } : { color: 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {subTab === 'overview' && (
        <div className="flex flex-col gap-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Platform Stats</h3>
          {globalStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total Movies"       value={globalStats.total_movies?.toLocaleString()} />
              <StatCard label="Total Users"        value={globalStats.total_users?.toLocaleString()} />
              <StatCard label="Active Users"       value={globalStats.active_users?.toLocaleString()} accent="#22c55e" />
              <StatCard label="Total Interactions" value={globalStats.total_interactions?.toLocaleString()} />
              <StatCard label="Total Ratings"      value={globalStats.total_ratings?.toLocaleString()} />
              <StatCard label="Total Reviews"      value={globalStats.total_reviews?.toLocaleString()} />
              <StatCard label="Avg Platform Rating"
                value={globalStats.overall_average_rating != null
                  ? (globalStats.overall_average_rating / 2).toFixed(2) + ' / 5'
                  : null}
                accent="#9333ea" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({length: 7}).map((_,i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--skeleton)' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {subTab === 'users' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && loadUsers()}
              placeholder="Search by username…"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button onClick={loadUsers} className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#9333ea', color: '#fff' }}>
              Search
            </button>
          </div>

          {usersLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({length: 6}).map((_,i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--skeleton)' }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(147,51,234,0.15)' }}>
                    <span className="text-xs font-bold" style={{ color: '#9333ea' }}>{u.username[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {u.is_admin && <Badge color="purple">Admin</Badge>}
                    <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                    <button
                      onClick={() => toggleUserField(u.id, 'is_active', u.is_active)}
                      className="text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      title={u.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => toggleUserField(u.id, 'is_admin', u.is_admin)}
                      className="text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: u.is_admin ? '#ef4444' : '#9333ea', border: `1px solid ${u.is_admin ? 'rgba(239,68,68,0.3)' : 'rgba(147,51,234,0.3)'}` }}
                      title={u.is_admin ? 'Remove Admin' : 'Make Admin'}
                    >
                      {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No users found.</p>}
            </div>
          )}
        </div>
      )}

      {/* ML Jobs */}
      {subTab === 'jobs' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Retrain Jobs</h3>
            <button
              onClick={triggerRetrain}
              disabled={retrainLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: '#9333ea', color: '#fff' }}
            >
              {retrainLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              )}
              Trigger Retrain
            </button>
          </div>

          {retrainResult && (
            <div className="px-3 py-2 rounded-lg text-sm" style={{
              background: retrainResult.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${retrainResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: retrainResult.ok ? '#22c55e' : '#ef4444',
            }}>
              {retrainResult.msg}
            </div>
          )}

          {jobsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({length: 5}).map((_,i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--skeleton)' }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs.map(j => (
                <div key={j.id} className="px-4 py-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Job #{j.id}</span>
                      <Badge color={jobStatusColor(j.status)}>{j.status}</Badge>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{j.job_type}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {j.created_at ? new Date(j.created_at).toLocaleString() : '—'}
                    </span>
                  </div>
                  {j.finished_at && j.started_at && (
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Duration: {Math.round((new Date(j.finished_at) - new Date(j.started_at)) / 1000)}s
                    </p>
                  )}
                  {j.error_message && (
                    <p className="text-xs" style={{ color: '#ef4444' }}>{j.error_message}</p>
                  )}
                  {j.metrics && Object.keys(j.metrics).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(j.metrics).slice(0, 6).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-pill)', color: 'var(--text-secondary)' }}>
                          {k}: {typeof v === 'number' ? v.toFixed(3) : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {jobs.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No jobs found.</p>}
            </div>
          )}
        </div>
      )}

      {/* Models */}
      {subTab === 'models' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ML Model Versions</h3>
          {modelsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({length: 4}).map((_,i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--skeleton)' }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {models.map(m => (
                <div key={m.id} className="px-4 py-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.version_name}</span>
                      <Badge color="gray">{m.model_type}</Badge>
                      {m.is_active && <Badge color="green">Active</Badge>}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <p className="text-xs mb-2 font-mono truncate" style={{ color: 'var(--text-muted)' }}>{m.artifact_path}</p>
                  {m.metrics && Object.keys(m.metrics).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(m.metrics).slice(0, 6).map(([k, v]) => (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-pill)', color: 'var(--text-secondary)' }}>
                          {k}: {typeof v === 'number' ? v.toFixed(3) : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {models.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No models found.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('profile')

  // Change password form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    api.get('/stats/me').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      await api.patch('/users/me', { password: newPassword })
      setPwSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err?.response?.data?.detail ?? 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className="flex-1 sidebar-main px-4 md:px-10 py-6 md:py-10 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-red-500/10"
            style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit flex-wrap" style={{ background: 'var(--bg-pill)' }}>
          {[
            { key: 'profile', label: 'Profile' },
            { key: 'password', label: 'Change Password' },
            ...(user?.is_admin ? [{ key: 'admin', label: '⚙ Admin' }] : []),
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === t.key ? { background: '#9333ea', color: '#fff' } : { color: 'var(--text-secondary)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="flex flex-col gap-6">
            {/* Avatar + info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-6 rounded-2xl text-center sm:text-left" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-700 border-2 border-purple-500 flex-shrink-0">
                <span className="text-white font-bold text-3xl">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user?.username}</h2>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                {joined && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Member since {joined}</p>}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div>
                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Your Activity</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard label="Total Reviews" value={stats.review_count} />
                  <StatCard label="Movies Rated" value={stats.rating_count} />
                  <StatCard label="Avg Rating Given" value={stats.average_rating_given != null ? (stats.average_rating_given / 2).toFixed(1) + ' / 5' : null} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin tab */}
        {tab === 'admin' && user?.is_admin && <AdminPanel />}

        {/* Change Password tab */}
        {tab === 'password' && (
          <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Change Password</h3>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-all"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-all"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {pwError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Password updated successfully.
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading || !newPassword || !confirmPassword}
                className="mt-1 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#9333ea', color: '#fff' }}
              >
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
