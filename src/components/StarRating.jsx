// rating: 0–10 scale → displayed as 0–5 stars with half-star support
export default function StarRating({ rating, count }) {
  const stars = (rating ?? 0) / 2  // 0-10 → 0-5
  const full = Math.floor(stars)
  const fraction = stars - full
  const half = fraction >= 0.25 && fraction < 0.75
  const roundedUp = fraction >= 0.75  // treat as full
  const fullCount = roundedUp ? full + 1 : full
  const showHalf = half
  const emptyCount = 5 - fullCount - (showHalf ? 1 : 0)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullCount }).map((_, i) => (
          <Star key={`f${i}`} fill={1} />
        ))}
        {showHalf && <Star fill={0.5} />}
        {Array.from({ length: emptyCount }).map((_, i) => (
          <Star key={`e${i}`} fill={0} />
        ))}
      </div>
      {count != null && (
        <span className="text-gray-400 text-sm">
          {stars.toFixed(1)} / 5 · {count.toLocaleString()} reviews
        </span>
      )}
    </div>
  )
}

// fill: 0 = empty, 0.5 = half, 1 = full
function Star({ fill }) {
  const id = `clip-${fill === 0.5 ? 'half' : fill}`
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={fill === 0.5 ? '12' : fill === 1 ? '24' : '0'} height="24" />
        </clipPath>
      </defs>
      {/* Empty (grey) base */}
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="#4b5563"
      />
      {/* Filled (yellow) overlay clipped */}
      {fill > 0 && (
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill="#f5c518"
          clipPath={`url(#${id})`}
        />
      )}
    </svg>
  )
}
