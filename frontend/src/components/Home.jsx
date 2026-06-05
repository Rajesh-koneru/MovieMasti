import React, { useState, useEffect } from 'react';
import { Search, MapPin, Film, Clock, Calendar, ChevronRight, AlertCircle, ChevronLeft, Star, Heart } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function Home({ 
  apiBaseUrl, 
  onSelectShow, 
  onSelectMovie, 
  onNavigateToTab, 
  favorites, 
  onToggleFavorite, 
  preselectedTheater, 
  onClearPreselectedTheater 
}) {
  const [locationQuery, setLocationQuery] = useState('');
  const [allTheaters, setAllTheaters] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [filteredTheaters, setFilteredTheaters] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [theaterShows, setTheaterShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Default sliding template banners
  const fallbackBanners = [
    {
      title: 'RRR',
      genre: 'Action',
      rating: 8.0,
      duration: 187,
      desc: 'An action-packed historical saga of two legendary revolutionaries and their journey away from home before they started fighting for their country.',
      bg: 'linear-gradient(135deg, #450a0a 0%, #090d16 100%)',
      tag: 'Blockbuster #1'
    },
    {
      title: 'Baahubali 2: The Conclusion',
      genre: 'Fantasy / Action',
      rating: 8.2,
      duration: 167,
      desc: 'When Shiva, the son of Bahubali, learns about his heritage, he begins to look for answers, leading to epic battles in the Mahishmati Kingdom.',
      bg: 'linear-gradient(135deg, #451a03 0%, #090d16 100%)',
      tag: 'All Time Record Breaker'
    },
    {
      title: 'K.G.F: Chapter 2',
      genre: 'Action / Thriller',
      rating: 8.3,
      duration: 168,
      desc: 'In the blood-soaked Kolar Gold Fields, Rocky\'s name strikes fear into his foes. His allies look up to Rocky as their Savior.',
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #090d16 100%)',
      tag: 'Mass Blockbuster'
    },
    {
      title: 'Inception',
      genre: 'Sci-Fi / Action',
      rating: 8.8,
      duration: 148,
      desc: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
      bg: 'linear-gradient(135deg, #062033 0%, #090d16 100%)',
      tag: 'Mind-Bending Sci-Fi'
    }
  ];

  // Fetch all theaters and movies on load
  useEffect(() => {
    fetchTheaters();
    fetchMovies();
  }, []);

  // Handle preselected theater from favorites
  useEffect(() => {
    if (preselectedTheater && allTheaters.length > 0) {
      // Find matches in allTheaters to get complete object
      const matched = allTheaters.find(t => t.id === preselectedTheater.id);
      if (matched) {
        setLocationQuery(matched.city);
        // Pre-filter
        const query = matched.city.toLowerCase().trim();
        const matchedList = allTheaters.filter(t => 
          t.city.toLowerCase().includes(query) ||
          t.theaterName.toLowerCase().includes(query)
        );
        setFilteredTheaters(matchedList);
        setSearched(true);
        handleTheaterClick(matched);

        setTimeout(() => {
          const element = document.getElementById('today-shows');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
      onClearPreselectedTheater();
    }
  }, [preselectedTheater, allTheaters]);

  const fetchTheaters = async () => {
    try {
      const response = await apiFetch(`${apiBaseUrl}/theaters`);
      if (response.ok) {
        const data = await response.json();
        setAllTheaters(data);
      }
    } catch (err) {
      console.error('Error pre-fetching theaters:', err);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await apiFetch(`${apiBaseUrl}/movies`);
      if (response.ok) {
        const data = await response.json();
        setAllMovies(data);
      }
    } catch (err) {
      console.error('Error pre-fetching movies:', err);
    }
  };

  // Carousel Auto-slide
  useEffect(() => {
    if (fallbackBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % fallbackBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) {
      setFilteredTheaters([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSelectedTheater(null);
    setTheaterShows([]);

    const query = locationQuery.toLowerCase().trim();
    const matched = allTheaters.filter(t => 
      t.city.toLowerCase().includes(query) ||
      t.state.toLowerCase().includes(query) ||
      t.zipCode.includes(query) ||
      t.location.toLowerCase().includes(query) ||
      t.theaterName.toLowerCase().includes(query)
    );

    setFilteredTheaters(matched);
    setSearched(true);
    setLoading(false);
  };

  const handleTheaterClick = async (theater) => {
    setSelectedTheater(theater);
    setTheaterShows([]);
    setShowsLoading(true);
    setError('');

    try {
      const response = await apiFetch(`${apiBaseUrl}/shows/theater/${theater.id}`);
      if (response.ok) {
        const shows = await response.json();
        
        // Filter shows available TODAY
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const todayShows = shows.filter(show => {
          return show.showTime.startsWith(todayStr);
        });

        setTheaterShows(todayShows);
      } else {
        setError('Failed to fetch shows for this theater.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database to retrieve show schedules.');
    } finally {
      setShowsLoading(false);
    }
  };

  const isFavoriteTheater = (theaterId) => {
    return (favorites?.theaters || []).some(t => t.id === theaterId);
  };

  // Group today's shows by movie
  const showsByMovie = theaterShows.reduce((acc, show) => {
    const movieId = show.movie.id;
    if (!acc[movieId]) {
      acc[movieId] = {
        movie: show.movie,
        shows: []
      };
    }
    acc[movieId].shows.push(show);
    return acc;
  }, {});

  const formatTimeOnly = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSlideClick = (slideTitle) => {
    const matchedMovie = allMovies.find(m => m.movieName.toLowerCase() === slideTitle.toLowerCase());
    if (matchedMovie) {
      onSelectMovie(matchedMovie);
    } else {
      onNavigateToTab('movies');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Sliding Movie Templates Carousel */}
      <div className="carousel-container">
        <div className="carousel-track-wrapper">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {fallbackBanners.map((slide, index) => (
              <div 
                key={index} 
                className="carousel-slide"
                style={{ background: slide.bg }}
              >
                <div className="carousel-overlay"></div>
                <div className="carousel-content">
                  <span className="carousel-badge">{slide.tag}</span>
                  <h2 className="carousel-title">{slide.title}</h2>
                  <div className="carousel-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-yellow)' }}>
                      <Star size={14} fill="currentColor" /> {slide.rating}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={14} /> {slide.duration} min
                    </span>
                    <span>•</span>
                    <span style={{ color: 'var(--accent-indigo)', fontWeight: '600' }}>{slide.genre}</span>
                  </div>
                  <p className="carousel-desc">{slide.desc}</p>
                  <div className="carousel-btn-group">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleSlideClick(slide.title)}
                    >
                      Book Tickets Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <button 
          className="carousel-nav-btn prev"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + fallbackBanners.length) % fallbackBanners.length)}
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          className="carousel-nav-btn next"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % fallbackBanners.length)}
        >
          <ChevronRight size={20} />
        </button>

        {/* Carousel Dots */}
        <div className="carousel-dots">
          {fallbackBanners.map((_, index) => (
            <div 
              key={index}
              className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Landing banner */}
      <div className="hero-section" style={{ marginTop: '1rem', padding: '3rem 2rem' }}>
        <h1 className="hero-title">
          Book Tickets for <span>Your Favorite Movies</span>
        </h1>
        <p className="hero-subtitle">
          Find theaters near you, check today's show schedules, select seats, and book tickets instantly in Indian Rupees (₹).
        </p>

        {/* Location Search Bar */}
        <form onSubmit={handleSearch} className="location-search-box">
          <input 
            type="text" 
            placeholder="Enter City (e.g. Hyderabad, Bengaluru), State, Pin Code, or Theater..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
          <button type="submit">
            <Search size={16} />
            Search
          </button>
        </form>
      </div>

      {/* Search results loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Searching theaters...</span>
        </div>
      )}

      {/* Search Results Display */}
      {searched && !loading && (
        <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Theaters near "{locationQuery}"
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Found {filteredTheaters.length} theater{filteredTheaters.length !== 1 ? 's' : ''}. Click a theater to view today's shows.
          </p>

          {filteredTheaters.length === 0 ? (
            <div className="glass-panel empty-state" style={{ padding: '3rem' }}>
              <MapPin className="empty-state-icon" style={{ color: 'var(--accent-rose)' }} />
              <h3 className="empty-state-title">No Theaters Found</h3>
              <p className="empty-state-desc">
                We couldn't find any theaters matching "{locationQuery}". 
                Make sure you typed the correct city (e.g. "Hyderabad", "Bengaluru") or pin code.
              </p>
            </div>
          ) : (
            <div className="theaters-grid">
              {filteredTheaters.map((theater) => (
                <div 
                  key={theater.id}
                  className={`glass-panel theater-card ${selectedTheater?.id === theater.id ? 'active' : ''}`}
                  onClick={() => handleTheaterClick(theater)}
                  style={{
                    borderColor: selectedTheater?.id === theater.id ? 'var(--accent-indigo)' : undefined,
                    background: selectedTheater?.id === theater.id ? 'rgba(99, 102, 241, 0.05)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="theater-card-name" style={{ margin: 0 }}>{theater.theaterName}</h3>
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite('theaters', theater);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isFavoriteTheater(theater.id) ? 'var(--accent-pink)' : 'var(--text-muted)',
                          padding: '0.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s ease'
                        }}
                        title={isFavoriteTheater(theater.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart size={16} fill={isFavoriteTheater(theater.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                  <div className="theater-card-address" style={{ marginTop: '0.5rem' }}>
                    <MapPin size={14} className="text-pink" />
                    <span>{theater.location}, {theater.city}, {theater.state}</span>
                  </div>
                  <div className="theater-card-footer">
                    <span>View Today's Shows</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Theater Shows Available Today */}
      {selectedTheater && (
        <div id="today-shows" className="glass-panel today-shows-wrapper animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 className="today-shows-title">Today's Schedule at {selectedTheater.theaterName}</h2>
              <div className="today-shows-meta">
                <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                <span>{selectedTheater.location}, {selectedTheater.city}</span>
              </div>
            </div>
            <div style={{ padding: '0.4rem 1rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {showsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading schedules...
            </div>
          ) : Object.keys(showsByMovie).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Calendar size={40} style={{ opacity: 0.4, marginBottom: '0.8rem' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '1.1rem' }}>No Shows Scheduled Today</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                There are no more scheduled shows running today at this theater. 
                If you are an administrator, you can add shows for today in the **Admin Panel**, or click **Seed DB** to populate today's data!
              </p>
            </div>
          ) : (
            <div>
              {Object.values(showsByMovie).map(({ movie, shows }) => (
                <div key={movie.id} className="glass-panel showtime-row-card">
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 className="showtime-movie-name">{movie.movieName}</h3>
                    <div className="showtime-movie-meta">
                      <span style={{ color: 'var(--accent-indigo)', fontWeight: '600' }}>{movie.genre}</span>
                      <span>•</span>
                      <span>{movie.duration} min</span>
                      <span>•</span>
                      <span>Rating: {movie.rating.toFixed(1)}/10</span>
                    </div>
                  </div>

                  <div className="today-showtimes-grid">
                    {shows.map(show => (
                      <button
                        key={show.id}
                        className="showtime-pill-btn"
                        onClick={() => onSelectShow(show)}
                        title={`Available Seats: ${show.availableSeats}/${show.totalSeats}`}
                      >
                        <span>{formatTimeOnly(show.showTime)}</span>
                        <span className="price">₹{show.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Promoted Features when not searched */}
      {!searched && (
        <div className="animate-fade-in" style={{ marginTop: '3.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">Why MovieMasti?</h2>
          </div>
          <div className="theaters-grid" style={{ pointerEvents: 'none' }}>
            <div className="glass-panel theater-card" style={{ cursor: 'default' }}>
              <h3 className="theater-card-name" style={{ color: 'var(--accent-indigo)' }}>Wide Cinema Network</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Explore shows across premium Indian theater branches like PVR, INOX, and Cinepolis in your city.
              </p>
            </div>
            <div className="glass-panel theater-card" style={{ cursor: 'default' }}>
              <h3 className="theater-card-name" style={{ color: 'var(--accent-pink)' }}>Interactive Seat Maps</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Visualize exactly where you will sit. Click seats to book tickets dynamically in real-time.
              </p>
            </div>
            <div className="glass-panel theater-card" style={{ cursor: 'default' }}>
              <h3 className="theater-card-name" style={{ color: 'var(--accent-yellow)' }}>Quick Ticket Retrieval</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Access virtual bookings with decorative barcodes immediately on your dashboard to enter halls.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
