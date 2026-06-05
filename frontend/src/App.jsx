import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Home from './components/Home';
import MoviesList from './components/MoviesList';
import MovieDetails from './components/MovieDetails';
import SeatLayout from './components/SeatLayout';
import BookingsList from './components/BookingsList';
import AdminPanel from './components/AdminPanel';
import UsersList from './components/UsersList';
import UserProfile from './components/UserProfile';
import FavoritesList from './components/FavoritesList';
import { apiFetch } from './utils/api';
import { Film, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8080/v1/api' : '/v1/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('moviemasti_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('moviemasti_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.role === 'ADMIN' ? 'admin' : 'home';
    }
    return 'home';
  });

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [seedStatus, setSeedStatus] = useState({ type: '', msg: '' });
  const [seeding, setSeeding] = useState(false);

  // Theme support
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('moviemasti_theme');
    return saved || 'dark';
  });

  // Favorites state
  const [favorites, setFavorites] = useState({ movies: [], theaters: [] });
  // For redirecting from favorites to today's shows on home tab
  const [preselectedTheater, setPreselectedTheater] = useState(null);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('moviemasti_theme', theme);
  }, [theme]);

  // Load favorites when user state changes
  useEffect(() => {
    if (user && user.userId) {
      const savedFavs = localStorage.getItem(`moviemasti_favs_${user.userId}`);
      setFavorites(savedFavs ? JSON.parse(savedFavs) : { movies: [], theaters: [] });
    } else {
      setFavorites({ movies: [], theaters: [] });
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleFavorite = (type, item) => {
    if (!user) {
      alert("Warning: You must be logged in to manage your favorites list!");
      setActiveTab('login');
      return;
    }

    setFavorites((prev) => {
      const list = prev[type] || [];
      const exists = list.some((i) => i.id === item.id);
      let newList;
      if (exists) {
        newList = list.filter((i) => i.id !== item.id);
      } else {
        newList = [...list, item];
      }
      const updatedFavs = { ...prev, [type]: newList };
      localStorage.setItem(`moviemasti_favs_${user.userId}`, JSON.stringify(updatedFavs));
      return updatedFavs;
    });
  };

  const handleLoginSuccess = (loginData) => {
    const sessionUser = {
      userId: loginData.userId,
      username: loginData.username,
      email: loginData.email,
      role: loginData.role || 'USER',
      token: loginData.token,
      profilePicture: loginData.profilePicture
    };
    setUser(sessionUser);
    localStorage.setItem('moviemasti_user', JSON.stringify(sessionUser));
    
    // If they were trying to book a seat, keep them on the seats page!
    if (selectedShow) {
      setActiveTab('movies');
    } else {
      setActiveTab(loginData.role === 'ADMIN' ? 'admin' : 'home');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/logout`, { method: 'POST' });
    } catch (err) {
      console.error('Server logout request failed:', err);
    }
    setUser(null);
    localStorage.removeItem('moviemasti_user');
    setSelectedMovie(null);
    setSelectedShow(null);
    setFavorites({ movies: [], theaters: [] });
    setActiveTab('home');
  };

  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Automated DB Seeding Script
  const handleSeedDatabase = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedStatus({ type: 'info', msg: 'Seeding database. Please wait...' });

    try {
      // 1. Seed Admin User Account
      try {
        await apiFetch(`${API_BASE_URL}/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: 'admin@moviemasti.com',
            password: 'admin',
            username: 'Administrator',
            phoneNumber: '9876543210',
            address: 'A-12, Movie Towers, Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            zipCode: '500081',
            role: 'ADMIN'
          })
        });
      } catch (err) {
        console.log("Admin seeding skipped - likely already registered.");
      }

      // 2. Seed Movies
      const moviesToSeed = [
        { movieName: 'RRR', genre: 'Action', director: 'S. S. Rajamouli', rating: 8.0, duration: 187 },
        { movieName: 'Baahubali 2: The Conclusion', genre: 'Fantasy', director: 'S. S. Rajamouli', rating: 8.2, duration: 167 },
        { movieName: 'K.G.F: Chapter 2', genre: 'Action', director: 'Prashanth Neel', rating: 8.3, duration: 168 },
        { movieName: 'Dangal', genre: 'Drama', director: 'Nitesh Tiwari', rating: 8.4, duration: 161 },
        { movieName: 'Inception', genre: 'Sci-Fi', director: 'Christopher Nolan', rating: 8.8, duration: 148 }
      ];

      const seededMovies = [];
      for (const movie of moviesToSeed) {
        const res = await apiFetch(`${API_BASE_URL}/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movie)
        });
        if (res.ok) {
          const data = await res.json();
          seededMovies.push(data);
        }
      }

      // 3. Seed Theaters
      const theatersToSeed = [
        { theaterName: 'PVR Forum Mall', location: 'Hosur Rd, Koramangala', city: 'Bengaluru', state: 'Karnataka', country: 'India', zipCode: '560095' },
        { theaterName: 'INOX GVK One Mall', location: 'Road No. 1, Banjara Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', zipCode: '500034' },
        { theaterName: 'Cinepolis Mantra Mall', location: 'Attapur Main Rd', city: 'Hyderabad', state: 'Telangana', country: 'India', zipCode: '500048' }
      ];

      const seededTheaters = [];
      for (const theater of theatersToSeed) {
        const res = await apiFetch(`${API_BASE_URL}/theaters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(theater)
        });
        if (res.ok) {
          const data = await res.json();
          seededTheaters.push(data);
        }
      }

      if (seededMovies.length === 0 || seededTheaters.length === 0) {
        throw new Error('Could not seed movies or theaters.');
      }

      // 4. Seed Shows
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const showsToSeed = [];

      seededMovies.forEach((movie, mIdx) => {
        seededTheaters.forEach((theater, tIdx) => {
          const showTimeToday = new Date(today);
          showTimeToday.setHours(12 + mIdx, 30, 0, 0);

          const showTimeTomorrow = new Date(tomorrow);
          showTimeTomorrow.setHours(13 + mIdx, 0, 0, 0);
          
          const showTimeDayAfter = new Date(dayAfter);
          showTimeDayAfter.setHours(18 + tIdx, 0, 0, 0);

          showsToSeed.push({
            movieId: movie.id,
            theaterId: theater.id,
            showTime: showTimeToday.toISOString().substring(0, 19),
            price: 150.00 + (mIdx * 50.00),
            totalSeats: 60
          });

          showsToSeed.push({
            movieId: movie.id,
            theaterId: theater.id,
            showTime: showTimeTomorrow.toISOString().substring(0, 19),
            price: 180.00 + (mIdx * 40.00),
            totalSeats: 60
          });

          showsToSeed.push({
            movieId: movie.id,
            theaterId: theater.id,
            showTime: showTimeDayAfter.toISOString().substring(0, 19),
            price: 200.00 + (tIdx * 50.00),
            totalSeats: 60
          });
        });
      });

      let successfulShowsCount = 0;
      for (const show of showsToSeed) {
        const res = await apiFetch(`${API_BASE_URL}/shows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(show)
        });
        if (res.ok) {
          successfulShowsCount++;
        }
      }

      setSeedStatus({
        type: 'success',
        msg: `Seeded admin (admin@moviemasti.com), ${seededMovies.length} movies, ${seededTheaters.length} theaters, and ${successfulShowsCount} schedules in INR (₹) currency!`
      });
      forceRefresh();
    } catch (err) {
      console.error(err);
      setSeedStatus({ type: 'error', msg: 'Error seeding database. Make sure backend is running.' });
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedStatus({ type: '', msg: '' }), 5000);
    }
  };

  // Render proper subpage
  const renderContent = () => {
    if (activeTab === 'login') {
      return <Auth onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />;
    }

    if (activeTab === 'bookings') {
      if (!user) return <Auth onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />;
      return <BookingsList user={user} apiBaseUrl={API_BASE_URL} triggerRefresh={refreshTrigger} />;
    }

    if (activeTab === 'admin') {
      if (!user || user.role !== 'ADMIN') return <Auth onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />;
      return <AdminPanel apiBaseUrl={API_BASE_URL} onRefreshData={forceRefresh} />;
    }

    if (activeTab === 'users') {
      if (!user || user.role !== 'ADMIN') return <Auth onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />;
      return <UsersList apiBaseUrl={API_BASE_URL} />;
    }

    if (activeTab === 'profile') {
      if (!user) return <Auth onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />;
      return (
        <UserProfile 
          user={user} 
          apiBaseUrl={API_BASE_URL} 
          onUpdateUser={(updated) => {
            const newUser = { ...user, ...updated };
            setUser(newUser);
            localStorage.setItem('moviemasti_user', JSON.stringify(newUser));
          }}
        />
      );
    }

    if (activeTab === 'favorites') {
      if (!user) return <Auth onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />;
      return (
        <FavoritesList 
          favorites={favorites} 
          onSelectMovie={(movie) => {
            setSelectedMovie(movie);
            setActiveTab('movies');
          }}
          onSelectTheater={(theater) => {
            setPreselectedTheater(theater);
            setActiveTab('home');
          }}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      );
    }

    if (activeTab === 'home') {
      return (
        <Home 
          apiBaseUrl={API_BASE_URL}
          onSelectShow={(show) => {
            if (!user) {
              alert("Warning: You must be logged in to book tickets! Redirecting you to the login page.");
              setSelectedShow(show);
              setActiveTab('login');
            } else {
              setSelectedShow(show);
              setActiveTab('movies');
            }
          }}
          onSelectMovie={(movie) => {
            setSelectedMovie(movie);
            setActiveTab('movies');
          }}
          onNavigateToTab={(tab) => setActiveTab(tab)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          preselectedTheater={preselectedTheater}
          onClearPreselectedTheater={() => setPreselectedTheater(null)}
        />
      );
    }

    // Movies flow
    if (selectedShow) {
      return (
        <SeatLayout 
          show={selectedShow} 
          user={user} 
          apiBaseUrl={API_BASE_URL}
          onBack={() => setSelectedShow(null)} 
          onBookingSuccess={() => {
            setSelectedShow(null);
            setSelectedMovie(null);
            forceRefresh();
            setActiveTab('bookings');
          }}
          onLoginRedirect={() => {
            setActiveTab('login');
          }}
        />
      );
    }

    if (selectedMovie) {
      return (
        <MovieDetails 
          movie={selectedMovie} 
          apiBaseUrl={API_BASE_URL}
          onBack={() => setSelectedMovie(null)} 
          onSelectShow={(show) => {
            if (!user) {
              alert("Warning: You must be logged in to book tickets! Redirecting you to the login page.");
              setSelectedShow(show);
              setActiveTab('login');
            } else {
              setSelectedShow(show);
            }
          }} 
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    return (
      <MoviesList 
        apiBaseUrl={API_BASE_URL}
        triggerRefresh={refreshTrigger}
        onSelectMovie={(movie) => setSelectedMovie(movie)} 
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    );
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setSelectedMovie(null);
          setSelectedShow(null);
          setActiveTab(tab);
        }} 
        user={user} 
        onLogout={handleLogout}
        onSeed={handleSeedDatabase}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {seedStatus.msg && (
          <div 
            className={`alert ${seedStatus.type === 'success' ? 'alert-success' : seedStatus.type === 'error' ? 'alert-error' : 'alert-success'}`}
            style={{ 
              marginBottom: '1.5rem', 
              background: seedStatus.type === 'info' ? 'rgba(99, 102, 241, 0.15)' : undefined,
              borderColor: seedStatus.type === 'info' ? 'rgba(99, 102, 241, 0.3)' : undefined,
              color: seedStatus.type === 'info' ? '#93C5FD' : undefined
            }}
          >
            {seedStatus.type === 'success' ? <CheckCircle size={16} /> : <Zap size={16} />}
            <span>{seedStatus.msg}</span>
          </div>
        )}

        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer animate-fade-in">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <Film size={24} className="text-indigo" />
            <span>MovieMasti</span>
          </div>
          <p className="footer-desc">
            Your premium destination for booking movie tickets instantly. Explore latest shows, select preferred seats, and enjoy a seamless cinema experience across India.
          </p>
        </div>
        <div className="footer-section">
          <h4>Explore</h4>
          <ul className="footer-links">
            <li>Now Showing</li>
            <li>Popular Theaters</li>
            <li>Book Tickets</li>
            <li>Promotions</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MovieMasti India. All rights reserved.</span>
        <div className="footer-socials">
          <span className="footer-social-icon">Twitter</span>
          <span className="footer-social-icon">Instagram</span>
          <span className="footer-social-icon">Facebook</span>
        </div>
      </div>
    </footer>
  );
}
