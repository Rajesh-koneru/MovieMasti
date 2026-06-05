import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiFetch } from '../utils/api';

export default function SeatLayout({ show, user, onBack, onBookingSuccess, apiBaseUrl, onLoginRedirect }) {
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const columns = Array.from({ length: 10 }, (_, i) => i + 1);

  useEffect(() => {
    fetchOccupiedSeats();
  }, [show.id]);

  const fetchOccupiedSeats = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${apiBaseUrl}/bookings/show/${show.id}`);
      if (response.ok) {
        const bookings = await response.json();
        const occupied = new Set();
        bookings.forEach((booking) => {
          if (booking.bookedSeats && booking.status === 'CONFIRMED') {
            booking.bookedSeats.split(',').forEach((seat) => {
              occupied.add(seat.trim());
            });
          }
        });
        setOccupiedSeats(occupied);
      } else {
        setError('Failed to fetch seat availability for this show.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database to check seat availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.has(seatId)) return; // Can't click booked seats

    setSelectedSeats((prev) => 
      prev.includes(seatId) 
        ? prev.filter((s) => s !== seatId) 
        : [...prev, seatId]
    );
  };

  const handleBookTickets = async () => {
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);
    setError('');

    try {
      const payload = {
        userId: user.userId,
        showId: show.id,
        bookedSeats: selectedSeats
      };

      const response = await apiFetch(`${apiBaseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Confetti explosion!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        onBookingSuccess();
      } else {
        const errMsg = await response.text();
        setError(errMsg || 'Failed to book tickets. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Could not place booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatShowDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const totalAmount = selectedSeats.length * show.price;

  return (
    <div className="animate-fade-in">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} />
        Back to Show Times
      </button>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {!user && (
        <div className="alert alert-error animate-pulse" style={{ marginBottom: '1.5rem', background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#FCA5A5' }}>
          <AlertCircle size={16} />
          <span>You are booking as a Guest. You can select seats, but you must log in to finalize ticket bookings.</span>
        </div>
      )}

      <div className="booking-grid">
        {/* Left Side: Seat Layout */}
        <div className="glass-panel seat-selection-card">
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>Choose Your Seats</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            Select seats from the grid below.
          </p>

          <div className="screen-container">
            <div className="screen"></div>
            <div className="screen-label">Screen This Way</div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', color: 'var(--text-secondary)' }}>Loading seats map...</div>
          ) : (
            <>
              {/* Seating Grid */}
              <div className="seat-map">
                {rows.map((row) => (
                  <div key={row} className="seat-row">
                    <span className="row-label">{row}</span>
                    {columns.map((col) => {
                      const seatId = `${row}${col}`;
                      const isOccupied = occupiedSeats.has(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatClass = 'available';
                      if (isOccupied) seatClass = 'occupied';
                      else if (isSelected) seatClass = 'selected';

                      return (
                        <div
                          key={seatId}
                          className={`seat ${seatClass}`}
                          onClick={() => handleSeatClick(seatId)}
                          title={isOccupied ? `Seat ${seatId} (Booked)` : `Seat ${seatId}`}
                        >
                          {col}
                        </div>
                      );
                    })}
                    <span className="row-label" style={{ textAlign: 'right' }}>{row}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="seat-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--accent-rose) 100%)' }}></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: 'rgba(31, 41, 55, 0.8)', border: '1px solid rgba(255, 255, 255, 0.03)' }}></div>
                  <span>Booked</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Checkout Summary */}
        <div className="glass-panel checkout-card">
          <h3 className="checkout-title">Booking Summary</h3>
          <div className="checkout-details">
            <div className="checkout-row">
              <span className="label">Movie</span>
              <span className="val">{show.movie.movieName}</span>
            </div>
            <div className="checkout-row">
              <span className="label">Theater</span>
              <span className="val">{show.theater.theaterName}</span>
            </div>
            <div className="checkout-row">
              <span className="label">Location</span>
              <span className="val">{show.theater.location}, {show.theater.city}</span>
            </div>
            <div className="checkout-row">
              <span className="label">Showtime</span>
              <span className="val" style={{ fontSize: '0.85rem', maxWidth: '160px', textAlign: 'right' }}>
                {formatShowDate(show.showTime)}
              </span>
            </div>
            <div className="checkout-row">
              <span className="label">Ticket Price</span>
              <span className="val">₹{show.price.toFixed(2)}</span>
            </div>

            <div className="checkout-row" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.8rem' }}>
              <span className="label">Selected Seats</span>
              <span className="val" style={{ color: 'var(--accent-indigo)', fontWeight: '700' }}>
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
              </span>
            </div>

            <div className="checkout-row total">
              <span className="label" style={{ color: 'var(--text-primary)' }}>Total Amount</span>
              <span className="val">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {user ? (
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', opacity: selectedSeats.length === 0 ? 0.5 : 1, cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer' }}
              disabled={selectedSeats.length === 0 || bookingLoading}
              onClick={handleBookTickets}
            >
              {bookingLoading ? 'Processing Booking...' : `Book ${selectedSeats.length} Ticket${selectedSeats.length !== 1 ? 's' : ''}`}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', opacity: selectedSeats.length === 0 ? 0.5 : 1, cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer' }}
              disabled={selectedSeats.length === 0}
              onClick={() => {
                alert('Warning: You are not logged in. You must log in to complete your movie booking.');
                onLoginRedirect();
              }}
            >
              Login to Book {selectedSeats.length > 0 ? `${selectedSeats.length} Ticket(s)` : 'Tickets'}
            </button>
          )}

          {selectedSeats.length === 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.8rem', justifyContent: 'center' }}>
              <AlertCircle size={14} />
              <span>Select at least 1 seat to checkout</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
