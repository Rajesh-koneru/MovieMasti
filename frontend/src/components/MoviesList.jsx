import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, User, Film, Heart } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function MoviesList({ onSelectMovie, apiBaseUrl, triggerRefresh, favorites, onToggleFavorite }) {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract all unique genres for filter buttons
  const genres = ['All', ...new Set(movies.map((m) => m.genre).filter(Boolean))];

  useEffect(() => {
    fetchMovies();
  }, [triggerRefresh]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${apiBaseUrl}/movies`);
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      } else {
        setError('Failed to fetch movies from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend database.');
    } finally {
      setLoading(false);
    }
  };

  const isFavoriteMovie = (movieId) => {
    return (favorites?.movies || []).some(m => m.id === movieId);
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.movieName.toLowerCase().includes(search.toLowerCase()) || 
                          movie.director.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="animate-fade-in">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title">Now Showing</h2>
        <div className="search-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              className="text-muted" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input 
              type="text" 
              className="input-control" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by movie name or director..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Genre Filter Pills */}
      {genres.length > 1 && (
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {genres.map((genre) => (
            <button
              key={genre}
              className="btn btn-secondary"
              style={{
                borderRadius: '20px',
                padding: '0.4rem 1.2rem',
                fontSize: '0.85rem',
                border: selectedGenre === genre ? '1px solid var(--accent-indigo)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedGenre === genre ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedGenre === genre ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading movies...</div>
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ margin: '2rem 0' }}>{error}</div>
      ) : filteredMovies.length === 0 ? (
        <div className="glass-panel empty-state">
          <Film className="empty-state-icon" />
          <h3 className="empty-state-title">No Movies Found</h3>
          <p className="empty-state-desc">
            {movies.length === 0 
              ? 'The database is currently empty. Click the "Seed DB" button in the navigation bar to instantly populate sample data!'
              : 'Try adjusting your search filters or browse other genres.'}
          </p>
        </div>
      ) : (
        <div className="movies-grid">
          {filteredMovies.map((movie) => (
            <div 
              key={movie.id} 
              className="glass-panel movie-card"
              onClick={() => onSelectMovie(movie)}
              style={{ position: 'relative' }}
            >
              {/* Favorites Heart Button */}
              {onToggleFavorite && (
                <button
                  className="fav-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite('movies', movie);
                  }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(10, 14, 26, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isFavoriteMovie(movie.id) ? 'var(--accent-pink)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    zIndex: 5
                  }}
                  title={isFavoriteMovie(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={16} fill={isFavoriteMovie(movie.id) ? 'currentColor' : 'none'} />
                </button>
              )}

              <div className="movie-card-poster">
                <Film size={44} />
                <div className="movie-card-badge">
                  <Star size={14} fill="currentColor" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="movie-card-content">
                <span className="movie-card-genre">{movie.genre}</span>
                <h3 className="movie-card-title">{movie.movieName}</h3>
                
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                  <User size={14} />
                  <span>Dir: {movie.director}</span>
                </div>

                <div className="movie-card-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    <span>{movie.duration} min</span>
                  </div>
                  <span style={{ color: 'var(--accent-indigo)', fontWeight: '600' }}>Get Tickets</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
