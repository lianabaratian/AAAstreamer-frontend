// Reusable shimmer skeleton primitives

export function Sk({ w, h, r = '8px', className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  )
}

// Poster card (2:3 ratio) — matches MovieCard
export function MovieCardSkeleton({ width = 144 }) {
  return (
    <div style={{ width, flexShrink: 0 }}>
      <Sk w={width} h={width * 1.5} r="12px" />
      <Sk w="70%" h="12px" r="6px" style={{ marginTop: 8, marginLeft: 'auto', marginRight: 'auto' }} />
      <Sk w="50%" h="10px" r="6px" style={{ marginTop: 5, marginLeft: 'auto', marginRight: 'auto' }} />
    </div>
  )
}

// Genre poster card — centered label placeholder matches real GenreCard layout
export function GenreCardSkeleton() {
  return (
    <div className="relative" style={{ width: 140, height: 210, flexShrink: 0 }}>
      <Sk w={140} h={210} r="12px" />
      {/* centered genre name line */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sk w={80} h={13} r="6px" style={{ opacity: 0.5 }} />
      </div>
    </div>
  )
}

// Horizontal list card (BrowsePage)
export function BrowseCardSkeleton() {
  return (
    <div className="flex rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', minHeight: 160 }}>
      <Sk w={112} h={160} r="0" />
      <div className="flex-1 p-4 flex flex-col gap-3">
        <Sk w="70%" h="14px" />
        <Sk w="40%" h="11px" />
        <Sk w="55%" h="11px" />
        <div style={{ marginTop: 'auto' }}><Sk w="30%" h="12px" /></div>
      </div>
    </div>
  )
}

// Movie detail — full page skeleton
export function MovieDetailSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10 md:mb-14">
      {/* Poster */}
      <Sk w={288} h={430} r="16px" style={{ flexShrink: 0 }} />
      {/* Info */}
      <div className="flex flex-col gap-4 pt-2 flex-1">
        <Sk w="80%" h="40px" r="10px" />
        <Sk w="40%" h="14px" r="6px" />
        <Sk w="30%" h="14px" r="6px" />
        <div className="flex gap-3 mt-2">
          <Sk w={64} h={28} r="20px" />
          <Sk w={80} h={28} r="20px" />
          <Sk w={72} h={28} r="20px" />
        </div>
        <Sk w="100%" h="14px" r="6px" style={{ marginTop: 8 }} />
        <Sk w="90%" h="14px" r="6px" />
        <Sk w="75%" h="14px" r="6px" />
        <div className="flex gap-3 mt-4">
          <Sk w={120} h={44} r="12px" />
          <Sk w={120} h={44} r="12px" />
        </div>
      </div>
    </div>
  )
}

// Actors row
export function ActorsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ flexShrink: 0, width: 88, textAlign: 'center' }}>
          <Sk w={88} h={88} r="50%" />
          <Sk w="80%" h="11px" r="6px" style={{ margin: '8px auto 0' }} />
          <Sk w="60%" h="10px" r="6px" style={{ margin: '5px auto 0' }} />
        </div>
      ))}
    </div>
  )
}

// Review cards
export function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <Sk w={36} h={36} r="50%" />
            <div className="flex flex-col gap-2">
              <Sk w={100} h="12px" r="6px" />
              <Sk w={60} h="10px" r="6px" />
            </div>
          </div>
          <Sk w="90%" h="13px" r="6px" />
          <Sk w="75%" h="13px" r="6px" />
          <Sk w="50%" h="13px" r="6px" />
        </div>
      ))}
    </div>
  )
}
