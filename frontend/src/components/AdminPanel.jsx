import React, { useState, useEffect } from 'react';
import { Film, MapPin, Calendar, PlusCircle, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function AdminPanel({ apiBaseUrl, onRefreshData }) {
  // Movie Form State
  const [movieName, setMovieName] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [rating, setRating] = useState('8.0');
  const [duration, setDuration] = useState('120');

  // Theater Form State
  const [theaterName, setTheaterName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [zipCode, setZipCode] = useState('');

  // Show Form State
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [showTime, setShowTime] = useState('');
  const [price, setPrice] = useState('12.50');
  const [totalSeats, setTotalSeats] = useState('60');

  // Options for Dropdowns
  const [moviesList, setMoviesList] = useState([]);
  const [theatersList, setTheatersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showsList, setShowsList] = useState([]);

  const [notif, setNotif] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [movRes, theRes, usrRes, shwRes] = await Promise.all([
        apiFetch(`${apiBaseUrl}/movies`),
        apiFetch(`${apiBaseUrl}/theaters`),
        apiFetch(`${apiBaseUrl}/users`),
        apiFetch(`${apiBaseUrl}/shows`)
      ]);
      
      if (movRes.ok && theRes.ok) {
        const movies = await movRes.json();
        const theaters = await theRes.json();
        setMoviesList(movies);
        setTheatersList(theaters);
        
        if (movies.length > 0) setSelectedMovieId(movies[0].id.toString());
        if (theaters.length > 0) setSelectedTheaterId(theaters[0].id.toString());
      }

      if (usrRes.ok) {
        const users = await usrRes.json();
        setUsersList(users);
      }

      if (shwRes.ok) {
        const shows = await shwRes.json();
        setShowsList(shows);
      }
    } catch (err) {
      console.error('Error fetching admin select list options:', err);
    }
  };

  const showNotification = (type, msg) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif({ type: '', msg: '' }), 4000);
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!movieName || !genre || !director) return;
    setLoading(true);

    try {
      const payload = {
        movieName,
        genre,
        director,
        rating: parseFloat(rating),
        duration: parseInt(duration)
      };

      const response = await apiFetch(`${apiBaseUrl}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('success', `Movie "${movieName}" added successfully!`);
        setMovieName('');
        setGenre('');
        setDirector('');
        fetchOptions();
        onRefreshData();
      } else {
        showNotification('error', 'Failed to add movie.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Network error adding movie.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTheater = async (e) => {
    e.preventDefault();
    if (!theaterName || !location || !city || !state || !zipCode) return;
    setLoading(true);

    try {
      const payload = {
        theaterName,
        location,
        city,
        state,
        country,
        zipCode
      };

      const response = await apiFetch(`${apiBaseUrl}/theaters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('success', `Theater "${theaterName}" created!`);
        setTheaterName('');
        setLocation('');
        setCity('');
        setState('');
        setZipCode('');
        fetchOptions();
        onRefreshData();
      } else {
        showNotification('error', 'Failed to add theater.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Network error adding theater.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    if (!selectedMovieId || !selectedTheaterId || !showTime) {
      showNotification('error', 'Please choose a movie, theater, and showtime.');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        movieId: parseInt(selectedMovieId),
        theaterId: parseInt(selectedTheaterId),
        showTime, // Format is compatible with LocalDateTime
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats)
      };

      const response = await apiFetch(`${apiBaseUrl}/shows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification('success', `Show scheduled successfully!`);
        setShowTime('');
        onRefreshData();
      } else {
        const body = await response.text();
        showNotification('error', body || 'Failed to create show.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Network error scheduling show.');
    } finally {
      setLoading(false);
    }
  };

  const getTodaysShows = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`; // "2026-05-28"

    return showsList.filter(show => show.showTime.startsWith(todayStr));
  };

  const todaysShows = getTodaysShows();

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">Admin Dashboard</h2>
      </div>

      {notif.msg && (
        <div className={`alert ${notif.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.5rem' }}>
          {notif.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{notif.msg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Total Movies Registered</span>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>{moviesList.length}</span>
        </div>
        <div className="glass-panel stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Total Theaters Registered</span>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-pink)' }}>{theatersList.length}</span>
        </div>
        <div className="glass-panel stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Total Registered Users</span>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-yellow)' }}>{usersList.length}</span>
        </div>
      </div>

      <div className="admin-grid">
        {/* Box 1: Add Movie */}
        <div className="glass-panel admin-card">
          <h3>
            <Film size={18} className="text-indigo" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Add New Movie
          </h3>
          <form onSubmit={handleAddMovie}>
            <div className="form-group">
              <label>Movie Title</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Inception"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Sci-Fi"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Director</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Christopher Nolan"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Rating (out of 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  className="input-control"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  className="input-control"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              <PlusCircle size={16} />
              Add Movie
            </button>
          </form>
        </div>

        {/* Box 2: Add Theater */}
        <div className="glass-panel admin-card">
          <h3>
            <MapPin size={18} className="text-pink" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Add Theater Hall
          </h3>
          <form onSubmit={handleAddTheater}>
            <div className="form-group">
              <label>Theater Name</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Galaxy Cinemas IMAX"
                value={theaterName}
                onChange={(e) => setTheaterName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Location / Address</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. 456 Hollywood Blvd"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Los Angeles"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="California"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  className="input-control"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="90028"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              <PlusCircle size={16} />
              Create Theater
            </button>
          </form>
        </div>
      </div>

      {/* Box 3: Schedule Show (Full Width below) */}
      <div className="glass-panel admin-card" style={{ marginTop: '2rem' }}>
        <h3>
          <Calendar size={18} className="text-yellow" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Schedule Movie Show
        </h3>
        {moviesList.length === 0 || theatersList.length === 0 ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            To schedule a show, you must first create at least 1 movie and 1 theater.
          </div>
        ) : (
          <form onSubmit={handleAddShow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Select Movie</label>
                <select
                  className="input-control"
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  required
                  style={{ background: 'var(--bg-color)' }}
                >
                  {moviesList.map((m) => (
                    <option key={m.id} value={m.id}>{m.movieName} ({m.genre})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Theater</label>
                <select
                  className="input-control"
                  value={selectedTheaterId}
                  onChange={(e) => setSelectedTheaterId(e.target.value)}
                  required
                  style={{ background: 'var(--bg-color)' }}
                >
                  {theatersList.map((t) => (
                    <option key={t.id} value={t.id}>{t.theaterName} - {t.city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Show Date & Time</label>
                <input
                  type="datetime-local"
                  className="input-control"
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Ticket Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className="input-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    className="input-control"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.8rem', gridColumn: 'span 2' }} disabled={loading}>
                <Calendar size={16} />
                Schedule Show
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Today's Shows Section */}
      <div className="glass-panel admin-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={18} className="text-indigo" />
          Today's Scheduled Shows ({todaysShows.length})
        </h3>
        {todaysShows.length === 0 ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            No shows scheduled for today yet. Use the form above to schedule a show for today!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '0.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem' }}>Movie</th>
                  <th style={{ padding: '0.75rem' }}>Theater</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Show Time</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {todaysShows.map((show) => (
                  <tr key={show.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{show.movie.movieName}</td>
                    <td style={{ padding: '0.75rem' }}>{show.theater.theaterName}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {show.theater.location}, {show.theater.city}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--accent-yellow)' }}>
                      {new Date(show.showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--accent-green)' }}>₹{show.price.toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}>{show.availableSeats}/{show.totalSeats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
