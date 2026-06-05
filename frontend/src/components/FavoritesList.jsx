import React from 'react';
import { Film, MapPin, Heart, ArrowRight } from 'lucide-react';

export default function FavoritesList({ favorites, onSelectMovie, onSelectTheater, onNavigateToTab }) {
  const { movies = [], theaters = [] } = favorites;

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">My Favorites</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        {/* Left: Favorite Movies */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-pink)' }}>
            <Film size={20} />
            Favorite Movies ({movies.length})
          </h3>

          {movies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Heart size={36} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No movies added to favorites yet. Explore the movies list to add some!</p>
              <button 
                className="btn btn-secondary" 
                onClick={() => onNavigateToTab('movies')}
                style={{ marginTop: '1rem', fontSize: '0.85rem' }}
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {movies.map(movie => (
                <div 
                  key={movie.id}
                  className="glass-panel"
                  onClick={() => onSelectMovie(movie)}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-pink)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{movie.movieName}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', textTransform: 'uppercase', fontWeight: '500' }}>
                      {movie.genre}
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Favorite Theaters */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-indigo)' }}>
            <MapPin size={20} />
            Favorite Theaters ({theaters.length})
          </h3>

          {theaters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Heart size={36} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No theaters added to favorites yet. Search theaters on Home page to add!</p>
              <button 
                className="btn btn-secondary" 
                onClick={() => onNavigateToTab('home')}
                style={{ marginTop: '1rem', fontSize: '0.85rem' }}
              >
                Search Theaters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {theaters.map(theater => (
                <div 
                  key={theater.id}
                  className="glass-panel"
                  onClick={() => onSelectTheater(theater)}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{theater.theaterName}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                      <MapPin size={12} /> {theater.location}, {theater.city}
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
