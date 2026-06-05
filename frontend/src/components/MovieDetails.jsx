import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Clock, User, MapPin, Calendar, Film, Heart } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function MovieDetails({ movie, onBack, onSelectShow, apiBaseUrl, favorites, onToggleFavorite }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShows();
  }, [movie.id]);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${apiBaseUrl}/shows/movie/${movie.id}`);
      if (response.ok) {
        const data = await response.json();
        setShows(data);
      } else {
        setError('Failed to load shows for this movie.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend database to fetch shows.');
    } finally {
      setLoading(false);
    }
  };

  const isFavoriteMovie = (movieId) => {
    return (favorites?.movies || []).some(m => m.id === movieId);
  };

  // Group shows by theater
  const showsByTheater = shows.reduce((acc, show) => {
    const theaterId = show.theater.id;
    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater: show.theater,
        shows: []
      };
    }
    acc[theaterId].shows.push(show);
    return acc;
  }, {});

  const formatShowTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    return {
      date: date.toLocaleDateString('en-US', optionsDate),
      time: date.toLocaleTimeString('en-US', optionsTime)
    };
  };

  return (
    <div className="animate-fade-in">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} />
        Back to Movies
      </button>

      {/* Movie Details Hero Banner */}
      <div className="glass-panel movie-details-hero">
        <div className="movie-large-icon">
          <Film size={64} />
        </div>
        <div className="movie-details-info">
          <h1 className="movie-details-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span>{movie.movieName}</span>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite('movies', movie)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isFavoriteMovie(movie.id) ? 'var(--accent-pink)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
                title={isFavoriteMovie(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={18} fill={isFavoriteMovie(movie.id) ? 'currentColor' : 'none'} />
              </button>
            )}
          </h1>
          <div className="movie-meta-row" style={{ marginTop: '0.5rem' }}>
            <div className="movie-meta-item">
              <Star size={16} fill="var(--accent-yellow)" className="text-yellow" />
              <strong>{movie.rating.toFixed(1)}</strong> / 10
            </div>
            <div className="movie-meta-item">
              <Clock size={16} />
              <span>{movie.duration} min</span>
            </div>
            <div className="movie-meta-item">
              <Film size={16} />
              <span>Genre: <strong>{movie.genre}</strong></span>
            </div>
            <div className="movie-meta-item">
              <User size={16} />
              <span>Director: <strong>{movie.director}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Shows List */}
      <div className="shows-container">
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem' }}>Select Theater & Show Time</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Loading show timings...</div>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : Object.keys(showsByTheater).length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Shows Scheduled</h3>
            <p>
              There are currently no active shows scheduled for this movie. 
              Go to the <strong>Admin Panel</strong> or click <strong>Seed DB</strong> in the header to create a new show!
            </p>
          </div>
        ) : (
          Object.values(showsByTheater).map(({ theater, shows }) => (
            <div key={theater.id} className="glass-panel theater-group">
              <h3 className="theater-name">
                <MapPin size={18} className="text-indigo" />
                <span>{theater.theaterName}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                  ({theater.location}, {theater.city})
                </span>
              </h3>

              <div className="shows-grid">
                {shows.map((show) => {
                  const { date, time } = formatShowTime(show.showTime);
                  return (
                    <div 
                      key={show.id} 
                      className="show-pill"
                      onClick={() => onSelectShow(show)}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{date}</span>
                      <span className="show-time">{time}</span>
                      <span className="show-price">₹{show.price.toFixed(2)}</span>
                      <span className="show-seats-left">
                        {show.availableSeats} / {show.totalSeats} seats
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
