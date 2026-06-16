import api from './client'

export const getMoviePeople = (movieId) =>
  api.get(`/movies/${movieId}/people`).then(r => r.data)

export const getPerson = (personId) =>
  api.get(`/people/${personId}`).then(r => r.data)

export const getMovieStats = (movieId) =>
  api.get(`/stats/movies/${movieId}`).then(r => r.data)

// GET /interactions/movie/{movie_id} — all reviews for a movie
export const getMovieReviews = (movieId, limit = 100, offset = 0, withTextOnly = false) =>
  api.get(`/interactions/movie/${movieId}`, { params: { limit, offset, with_text_only: withTextOnly } })
    .then(r => r.data)
    .catch(() =>
      // fallback to old endpoint if new one not yet deployed
      api.get('/interactions', { params: { movie_id: movieId, has_review: true, limit, offset } }).then(r => r.data)
    )

// GET /interactions/me/{movie_id} — current user's own interaction for a movie
export const getMyMovieInteraction = (movieId) =>
  api.get(`/interactions/me/${movieId}`).then(r => r.data)

export const getPersonMovies = (personId, limit = 50) =>
  api.get(`/people/${personId}/movies`, { params: { limit } }).then(r => r.data)
