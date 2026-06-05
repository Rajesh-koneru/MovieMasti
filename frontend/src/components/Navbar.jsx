import React from 'react';
import { Film, User, LogOut, Ticket, Settings, Zap, Home, Sun, Moon, LogIn, Heart } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, onSeed, theme, onToggleTheme }) {
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <nav className="navbar glass-panel animate-fade-in">
      <div className="nav-brand" onClick={() => setActiveTab('home')}>
        <Film size={28} className="text-indigo" />
        <span>MovieMasti</span>
      </div>

      <div className="nav-links">
        {/* Publicly Available Tabs */}
        {(!user || user.role !== 'ADMIN') && (
          <>
            <button 
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={18} />
              Home
            </button>

            <button 
              className={`nav-link ${activeTab === 'movies' ? 'active' : ''}`}
              onClick={() => setActiveTab('movies')}
            >
              <Film size={18} />
              Movies
            </button>
          </>
        )}

        {/* Logged in User Bookings & Favorites */}
        {user && !isAdmin && (
          <>
            <button 
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Ticket size={18} />
              My Bookings
            </button>

            <button 
              className={`nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={18} />
              Favorites
            </button>
          </>
        )}

        {/* Admin Restricted Views */}
        {isAdmin && (
          <>
            <button 
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Settings size={18} />
              Admin Panel
            </button>

            <button 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <User size={18} />
              Users
            </button>

            <button 
              className="nav-link"
              onClick={onSeed}
              title="Auto-seed movies, theaters & showtimes"
              style={{ color: 'var(--accent-yellow)', border: '1px dashed rgba(245, 158, 11, 0.3)' }}
            >
              <Zap size={18} />
              Seed DB
            </button>
          </>
        )}

        {/* Theme Toggle Button */}
        <button 
          className="nav-link theme-toggle-btn" 
          onClick={onToggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{ padding: '0.5rem', borderRadius: '50%' }}
        >
          {theme === 'dark' ? <Sun size={18} className="text-yellow" /> : <Moon size={18} className="text-indigo" />}
        </button>

        {/* User Session Profile or Login Button */}
        {user ? (
          <div className="user-profile" style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div 
              className="user-avatar" 
              onClick={() => setActiveTab('profile')}
              title="Edit Profile Preferences"
              style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.username ? user.username.substring(0, 2).toUpperCase() : 'US'
              )}
            </div>
            <span 
              className="user-name" 
              onClick={() => setActiveTab('profile')}
              style={{ cursor: 'pointer' }}
            >
              {user.username}
              {isAdmin && <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-pink)', fontWeight: 'bold' }}>ADMIN</span>}
            </span>
            <button 
              className="nav-link" 
              onClick={onLogout} 
              title="Logout"
              style={{ padding: '0.4rem', marginLeft: '0.5rem' }}
            >
              <LogOut size={18} className="text-muted" />
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('login')}
            style={{ padding: '0.5rem 1.2rem' }}
          >
            <LogIn size={16} />
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
