import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Globe, Lock, Hash, Save, ShieldAlert, CheckCircle, Upload } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function UserProfile({ user, apiBaseUrl, onUpdateUser }) {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [zipCode, setZipCode] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ type: '', msg: '' });

  // Avatar presets using dynamically generated SVG base64 strings
  const generateAvatarSvg = (logo, bg, color) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="48" fill="${bg}" stroke="${color}" stroke-width="2"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="26" font-weight="800" fill="${color}">
        ${logo}
      </text>
    </svg>`;
    return `data:image/svg+xml;base64,${window.btoa(svg)}`;
  };

  const presets = [
    { name: 'Rocky Bhai', logo: 'KGF', bg: '#1c1917', color: '#fbbf24' },
    { name: 'Raj', logo: 'SRK', bg: '#311042', color: '#f472b6' },
    { name: 'Simran', logo: 'DDLJ', bg: '#4c0519', color: '#fda4af' },
    { name: 'Singham', logo: '🦁', bg: '#7c2d12', color: '#fdba74' },
    { name: 'Pushpa', logo: '🔥', bg: '#064e3b', color: '#34d399' },
    { name: 'Baburao', logo: '👓', bg: '#451a03', color: '#ca8a04' },
    { name: 'Shaktimaan', logo: '🌀', bg: '#7f1d1d', color: '#facc15' },
    { name: 'Mogambo', logo: '👑', bg: '#2e1065', color: '#a78bfa' }
  ];

  // Fetch current user details on mount
  useEffect(() => {
    if (user && user.userId) {
      fetchProfileDetails();
    }
  }, [user]);

  const fetchProfileDetails = async () => {
    try {
      const response = await apiFetch(`${apiBaseUrl}/users/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username || '');
        setPhoneNumber(data.phoneNo || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setCountry(data.country || 'India');
        setZipCode(data.zipCode || '');
        setProfilePicture(data.profilePicture || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (limit to 2MB for base64 DB storage)
    if (file.size > 2 * 1024 * 1024) {
      setNotif({ type: 'error', msg: 'Image size must be less than 2MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
      setNotif({ type: 'success', msg: 'Custom profile picture loaded!' });
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset) => {
    const svgBase64 = generateAvatarSvg(preset.logo, preset.bg, preset.color);
    setProfilePicture(svgBase64);
    setNotif({ type: 'success', msg: `Selected avatar: ${preset.name}` });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotif({ type: '', msg: '' });

    try {
      const payload = {
        username,
        phoneNumber,
        address,
        city,
        state,
        country,
        zipCode,
        profilePicture
      };

      if (password.trim()) {
        payload.password = password;
      }

      const response = await apiFetch(`${apiBaseUrl}/users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setNotif({ type: 'success', msg: 'Preferences updated successfully!' });
        setPassword('');
        // Update parent state
        onUpdateUser({
          username: data.username,
          email: data.email,
          token: data.token,
          profilePicture: data.profilePicture
        });
      } else {
        const text = await response.text();
        setNotif({ type: 'error', msg: text || 'Failed to update preferences.' });
      }
    } catch (err) {
      console.error(err);
      setNotif({ type: 'error', msg: 'Connection error updating details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="section-header">
        <h2 className="section-title">Profile Preferences</h2>
      </div>

      {notif.msg && (
        <div 
          className={`alert ${notif.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginBottom: '1.5rem' }}
        >
          {notif.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          <span>{notif.msg}</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Left Side: Avatar Display and Presets */}
        <div className="glass-panel profile-sidebar">
          <div className="profile-avatar-large">
            {profilePicture ? (
              <img src={profilePicture} alt="User Avatar" />
            ) : (
              username ? username.substring(0, 2).toUpperCase() : 'US'
            )}
          </div>
          <h3 className="profile-name">{username || 'User Profile'}</h3>
          <span className="profile-email">{user.email}</span>

          {/* Upload Custom File */}
          <div className="upload-btn-wrapper">
            <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Upload size={14} />
              Upload Photo
            </button>
            <input type="file" name="myfile" accept="image/*" onChange={handleFileUpload} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max image size: 2MB</span>

          {/* Avatar Preset Grid */}
          <h4 className="avatar-presets-title">Pick a Cinema Preset</h4>
          <div className="avatar-presets-grid">
            {presets.map((preset, index) => {
              const svg = generateAvatarSvg(preset.logo, preset.bg, preset.color);
              const isSelected = profilePicture === svg;
              return (
                <button
                  key={index}
                  type="button"
                  className={`avatar-preset-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                  title={preset.name}
                >
                  <img src={svg} alt={preset.name} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Details Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address (Disabled)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="input-control"
                    style={{ paddingLeft: '2.5rem', opacity: 0.6, cursor: 'not-allowed' }}
                    value={user.email}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    className="input-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>New Password (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    className="input-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Leave blank to keep current"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Street Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="input-control"
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
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>Country</label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>PIN Code / Zip Code</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="input-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. 500081"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.8rem', padding: '0.8rem' }}
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving Preferences...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
