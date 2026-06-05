import React, { useState, useEffect } from 'react';
import { User, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function UsersList({ apiBaseUrl }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiFetch(`${apiBaseUrl}/users`);
      if (response.ok) {
        const users = await response.json();
        setUsersList(users);
      } else {
        setError('Failed to fetch registered users.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error retrieving user list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">User Management</h2>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Users List Section */}
      <div className="glass-panel admin-card" style={{ marginTop: '1rem' }}>
        <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={18} className="text-pink" />
          Registered Users ({usersList.length})
        </h3>
        
        {loading ? (
          <div style={{ padding: '3rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Loading users list...
          </div>
        ) : usersList.length === 0 ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            No registered users loaded.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '0.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem' }}>Username</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Phone Number</th>
                  <th style={{ padding: '0.75rem' }}>Address</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{usr.username}</td>
                    <td style={{ padding: '0.75rem' }}>{usr.email}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{usr.phoneNo || 'N/A'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {usr.city && usr.state ? `${usr.city}, ${usr.state}` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.5rem', 
                        background: usr.role === 'ADMIN' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: usr.role === 'ADMIN' ? 'var(--accent-pink)' : 'var(--accent-indigo)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {usr.role || 'USER'}
                      </span>
                    </td>
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
