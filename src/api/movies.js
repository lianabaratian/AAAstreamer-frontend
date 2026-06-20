import api from './client'

export const getRecommendedMovies = (limit = 20) =>
  api.get('/me/recommendations/movies', { params: { limit } }).then(r => r.data)

export const getTopRatedMovies = async (wantCount = 20) => {
  const rated = await api.get('/stats/movies/top-rated', { params: { limit: wantCount * 2, min_ratings: 10 } }).then(r => r.data)
  const results = await Promise.allSettled(
    rated.map(m => api.get(`/movies/${m.id}`).then(r => r.data))
  )
  return results
    .map((res, i) => res.status === 'fulfilled'
      ? { ...res.value, average_rating: rated[i].average_rating, rating_count: rated[i].rating_count, score: rated[i].score }
      : null)
    .filter(m => m && m.poster_url)
    .slice(0, wantCount)
}

export const getTrendingMovies = async (wantCount = 20) => {
  const trending = await api.get('/stats/movies/most-rated', { params: { limit: wantCount * 2 } }).then(r => r.data)
  const results = await Promise.allSettled(
    trending.map(m => api.get(`/movies/${m.id}`).then(r => r.data))
  )
  return results
    .map((res, i) => res.status === 'fulfilled'
      ? { ...res.value, average_rating: trending[i].average_rating, rating_count: trending[i].rating_count }
      : null)
    .filter(m => m && m.poster_url)
    .slice(0, wantCount)
}

// kept for SearchPage fallback usage
export const getMostRatedMovies = async (wantCount = 20) => {
  const rated = await api.get('/stats/movies/top-rated', { params: { limit: wantCount * 3, min_ratings: 1 } }).then(r => r.data)
  const results = await Promise.allSettled(
    rated.map(m => api.get(`/movies/${m.id}`).then(r => r.data))
  )
  return results
    .map((res, i) => res.status === 'fulfilled'
      ? { ...res.value, average_rating: rated[i].average_rating, rating_count: rated[i].rating_count, score: rated[i].score }
      : null)
    .filter(m => m && m.poster_url)
    .slice(0, wantCount)
}

export const getNewMovies = async (wantCount = 20) => {
  const movies = await api.get('/movies', { params: { limit: wantCount * 3, sort: '-created' } }).then(r => r.data)
  return movies.filter(m => m.poster_url).slice(0, wantCount)
}

export const getMovieById = (id) =>
  api.get(`/movies/${id}`).then(r => r.data)

export const getSimilarMovies = (movieId, limit = 20) =>
  api.get(`/movies/${movieId}/similar/movies`, { params: { limit } }).then(r => r.data)

export const searchMovies = (query, limit = 40) =>
  api.get('/movies', { params: { search: query, limit } }).then(r => r.data)

// Returns { source_movie, preference_score, movies }
// Backend only picks source movies with preference_score >= min_preference (default 6.0),
// so bad ratings never appear as a "Because You Enjoyed" source.
export const getBecauseYouEnjoyed = (limit = 20) =>
  api.get('/me/recommendations/because-you-enjoyed', { params: { limit } }).then(r => r.data)

export const getTrendingByGenre = (genreId, limit = 20) =>
  api.get('/stats/movies/trending', { params: { genre_id: genreId, limit, min_recent: 1 } }).then(r => r.data)

export const getGenres = () =>
  api.get('/genres', { params: { limit: 50 } }).then(r => r.data)

export const fetchGenreCards = async (maxGenres = 27) => {
  const genres = await getGenres()
  const usedMovieIds = new Set()
  const results = []

  for (const genre of genres.slice(0, maxGenres)) {
    try {
      const trending = await getTrendingByGenre(genre.id, 50)
      let picked = null
      let fallback = null

      for (const t of trending) {
        const movie = await api.get(`/movies/${t.id}`).then(r => r.data)
        if (!movie.poster_url) continue
        if (!usedMovieIds.has(t.id)) {
          usedMovieIds.add(t.id)
          picked = { genre, posterUrl: movie.poster_url }
          break
        }
        if (!fallback) fallback = { genre, posterUrl: movie.poster_url }
      }

      const card = picked ?? fallback
      if (card) results.push(card)
    } catch {
      // skip genres with no data
    }
  }

  return results
}
