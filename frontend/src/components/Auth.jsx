import React, { useState } from 'react';
import { Mail, Lock, Shield, User as UserIcon, Phone, MapPin, Globe, Hash } from 'lucide-react';

export default function Auth({ onLoginSuccess, apiBaseUrl }) {
  const [isCustomerMode, setIsCustomerMode] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signin';
      
      const payload = isLogin 
        ? { userEmail: email, password }
        : { 
            userEmail: email, 
            password, 
            username, 
            phoneNumber,
            address,
            city,
            state,
            country,
            zipCode,
            role: 'USER' // Registered users always start with USER role
          };

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Double-check role if logged in as Admin
        if (!isCustomerMode && data.role !== 'ADMIN') {
          setError('Access Denied. This account does not have administrative privileges.');
          setLoading(false);
          return;
        }

        setSuccess(isCustomerMode ? data.message : 'Admin authentication successful! Loading workspace...');
        setTimeout(() => {
          onLoginSuccess(data);
        }, 1000);
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the server. Please check if the Spring Boot backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container glass-panel">
        
        {/* Customer vs Admin Toggle Switch */}
        <div className="portal-switch-container">
          <button 
            type="button"
            className={`portal-switch-btn ${isCustomerMode ? 'active' : ''}`}
            onClick={() => {
              setIsCustomerMode(true);
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
          >
            <UserIcon size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
            Customer Portal
          </button>
          <button 
            type="button"
            className={`portal-switch-btn ${!isCustomerMode ? 'active' : ''}`}
            onClick={() => {
              setIsCustomerMode(false);
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
          >
            <Shield size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
            Admin Workspace
          </button>
        </div>

        <div className="auth-header">
          <h2>
            {isCustomerMode 
              ? (isLogin ? 'Customer Sign In' : 'Register Account')
              : 'Admin Workspace'}
          </h2>
          <p>
            {isCustomerMode 
              ? (isLogin ? 'Log in to browse movies and book show tickets' : 'Join MovieMasti to start booking tickets')
              : 'Secure administrative access portal'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isLogin ? (
            // Login Fields
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-control" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isCustomerMode ? "customer@example.com" : "admin@moviemasti.com"}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="input-control" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {!isCustomerMode && (
                <div style={{ padding: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  <strong>Demo Info:</strong> Admin credentials are set by default during database seeding. 
                  Use <strong>admin@moviemasti.com</strong> with password <strong>admin</strong> to log in.
                </div>
              )}
            </>
          ) : (
            // Register Fields for Users
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    className="input-control" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="john_doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    className="input-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    className="input-control" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    className="input-control" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Movie Lane"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    className="input-control" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    className="input-control" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="California"
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
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="90001"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {isCustomerMode && (
          <div className="auth-footer">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button 
              className="auth-link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
