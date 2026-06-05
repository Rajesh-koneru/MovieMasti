package com.MovieMasti.MovieMasti.services;

import com.MovieMasti.MovieMasti.DTO.BookingRequest;
import com.MovieMasti.MovieMasti.Repository.BookingRepository;
import com.MovieMasti.MovieMasti.Repository.ShowRepository;
import com.MovieMasti.MovieMasti.Repository.UserRepository;
import com.MovieMasti.MovieMasti.entity.Booking;
import com.MovieMasti.MovieMasti.entity.Show;
import com.MovieMasti.MovieMasti.entity.UserModel;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowRepository showRepository;
    private final UserRepository userRepository;

    @Autowired
    public BookingService(BookingRepository bookingRepository, ShowRepository showRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.showRepository = showRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Booking bookTickets(BookingRequest request) {
        // Validate request
        if (request.getBookedSeats() == null || request.getBookedSeats().isEmpty()) {
            throw new RuntimeException("No seats selected for booking.");
        }

        UserModel user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new RuntimeException("Show not found with ID: " + request.getShowId()));

        int requestedSeatsCount = request.getBookedSeats().size();

        // Check overall seat capacity
        if (show.getAvailableSeats() < requestedSeatsCount) {
            throw new RuntimeException("Not enough seats available. Requested: " 
                    + requestedSeatsCount + ", Available: " + show.getAvailableSeats());
        }

        // Get already occupied seats for this show
        List<Booking> activeBookings = bookingRepository.findByShowIdAndStatus(request.getShowId(), "CONFIRMED");
        Set<String> occupiedSeats = new HashSet<>();
        for (Booking booking : activeBookings) {
            if (booking.getBookedSeats() != null && !booking.getBookedSeats().trim().isEmpty()) {
                String[] seats = booking.getBookedSeats().split(",");
                for (String seat : seats) {
                    occupiedSeats.add(seat.trim());
                }
            }
        }

        // Check for seat conflicts
        Set<String> conflictingSeats = new HashSet<>();
        for (String seat : request.getBookedSeats()) {
            if (occupiedSeats.contains(seat.trim())) {
                conflictingSeats.add(seat.trim());
            }
        }

        if (!conflictingSeats.isEmpty()) {
            throw new RuntimeException("Seat(s) already booked: " + conflictingSeats);
        }

        // Deduct seats and update show
        show.setAvailableSeats(show.getAvailableSeats() - requestedSeatsCount);
        showRepository.save(show);

        // Save booking
        String bookedSeatsStr = String.join(",", request.getBookedSeats());
        double totalAmount = show.getPrice() * requestedSeatsCount;

        Booking booking = new Booking(
                user,
                show,
                requestedSeatsCount,
                bookedSeatsStr,
                totalAmount,
                "CONFIRMED",
                LocalDateTime.now()
        );

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByShow(Long showId) {
        return bookingRepository.findByShowIdAndStatus(showId, "CONFIRMED");
    }
}
