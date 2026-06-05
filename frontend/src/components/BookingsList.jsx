import React, { useState, useEffect } from 'react';
import { Ticket, MapPin, Calendar, Film } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function BookingsList({ user, apiBaseUrl, triggerRefresh }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [triggerRefresh]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${apiBaseUrl}/bookings/user/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        // Sort bookings by time descending
        data.sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime));
        setBookings(data);
      } else {
        setError('Failed to fetch your bookings history.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const d = new Date(dateTimeString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">My Tickets</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading your tickets...</div>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel empty-state">
          <Ticket className="empty-state-icon" />
          <h3 className="empty-state-title">No Booked Tickets</h3>
          <p className="empty-state-desc">
            You haven't booked any movie tickets yet. Explore movies and choose a showtime to make your first booking!
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="glass-panel ticket">
              {/* Main Ticket Portion */}
              <div className="ticket-main">
                <div className="ticket-icon">
                  <Film size={32} />
                </div>
                <div className="ticket-info">
                  <div>
                    <h3 className="ticket-movie">{booking.show.movie.movieName}</h3>
                    <div className="ticket-theater">
                      <MapPin size={14} />
                      <span>{booking.show.theater.theaterName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        ({booking.show.theater.location}, {booking.show.theater.city})
                      </span>
                    </div>
                  </div>

                  <div className="ticket-meta">
                    <div className="ticket-meta-item">
                      Show Time
                      <span>{formatDateTime(booking.show.showTime)}</span>
                    </div>
                    <div className="ticket-meta-item">
                      Seats
                      <span style={{ color: 'var(--accent-pink)' }}>{booking.bookedSeats}</span>
                    </div>
                    <div className="ticket-meta-item">
                      Seats Count
                      <span>{booking.numberOfSeats}</span>
                    </div>
                    <div className="ticket-meta-item">
                      Booking Date
                      <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                        {formatDateTime(booking.bookingTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Stub Portion */}
              <div className="ticket-stub">
                <div className={`ticket-status confirmed`}>
                  {booking.status}
                </div>
                <div className="ticket-price">
                  ₹{booking.totalAmount.toFixed(2)}
                </div>
                <div className="ticket-barcode"></div>
                <div className="ticket-id">
                  TICKET #{String(booking.id).padStart(6, '0')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
