package com.MovieMasti.MovieMasti.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.MovieMasti.MovieMasti.DTO.BookingRequest;
import com.MovieMasti.MovieMasti.Repository.BookingRepository;
import com.MovieMasti.MovieMasti.Repository.ShowRepository;
import com.MovieMasti.MovieMasti.Repository.UserRepository;
import com.MovieMasti.MovieMasti.entity.Booking;
import com.MovieMasti.MovieMasti.entity.MoviesModel;
import com.MovieMasti.MovieMasti.entity.Show;
import com.MovieMasti.MovieMasti.entity.Theaters;
import com.MovieMasti.MovieMasti.entity.UserModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BookingServiceTest {

    private BookingRepository bookingRepository;
    private ShowRepository showRepository;
    private UserRepository userRepository;
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingRepository = mock(BookingRepository.class);
        showRepository = mock(ShowRepository.class);
        userRepository = mock(UserRepository.class);
        bookingService = new BookingService(bookingRepository, showRepository, userRepository);
    }

    @Test
    void bookTickets_ShouldSucceed_WhenSeatsAreAvailable() {
        Long userId = 1L;
        Long showId = 1L;
        List<String> requestedSeats = Arrays.asList("A1", "A2");

        UserModel user = new UserModel();
        user.setId(userId);

        MoviesModel movie = new MoviesModel("Inception", "Sci-Fi", "Christopher Nolan", 8.8, 148);
        Theaters theater = new Theaters("PVR", "Mall", "City", "State", "Country", "12345");
        Show show = new Show(movie, theater, LocalDateTime.now().plusDays(1), 250.0, 100);
        show.setId(showId);

        BookingRequest request = new BookingRequest(userId, showId, requestedSeats);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(showRepository.findById(showId)).thenReturn(Optional.of(show));
        when(bookingRepository.findByShowIdAndStatus(showId, "CONFIRMED")).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking booking = bookingService.bookTickets(request);

        assertNotNull(booking);
        assertEquals("CONFIRMED", booking.getStatus());
        assertEquals(2, booking.getNumberOfSeats());
        assertEquals("A1,A2", booking.getBookedSeats());
        assertEquals(500.0, booking.getTotalAmount());
        assertEquals(98, show.getAvailableSeats());

        verify(showRepository, times(1)).save(show);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void bookTickets_ShouldFail_WhenNoSeatsSelected() {
        BookingRequest request = new BookingRequest(1L, 1L, Collections.emptyList());
        Exception exception = assertThrows(RuntimeException.class, () -> bookingService.bookTickets(request));
        assertEquals("No seats selected for booking.", exception.getMessage());
    }

    @Test
    void bookTickets_ShouldFail_WhenCapacityIsInsufficient() {
        Long userId = 1L;
        Long showId = 1L;
        List<String> requestedSeats = Arrays.asList("A1", "A2");

        UserModel user = new UserModel();
        user.setId(userId);

        MoviesModel movie = new MoviesModel("Inception", "Sci-Fi", "Christopher Nolan", 8.8, 148);
        Theaters theater = new Theaters("PVR", "Mall", "City", "State", "Country", "12345");
        Show show = new Show(movie, theater, LocalDateTime.now().plusDays(1), 250.0, 1); // Only 1 available seat
        show.setId(showId);

        BookingRequest request = new BookingRequest(userId, showId, requestedSeats);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(showRepository.findById(showId)).thenReturn(Optional.of(show));

        Exception exception = assertThrows(RuntimeException.class, () -> bookingService.bookTickets(request));
        assertTrue(exception.getMessage().contains("Not enough seats available"));
    }

    @Test
    void bookTickets_ShouldFail_WhenSeatsAreAlreadyBooked() {
        Long userId = 1L;
        Long showId = 1L;
        List<String> requestedSeats = Arrays.asList("A1", "A2");

        UserModel user = new UserModel();
        user.setId(userId);

        MoviesModel movie = new MoviesModel("Inception", "Sci-Fi", "Christopher Nolan", 8.8, 148);
        Theaters theater = new Theaters("PVR", "Mall", "City", "State", "Country", "12345");
        Show show = new Show(movie, theater, LocalDateTime.now().plusDays(1), 250.0, 100);
        show.setId(showId);

        // Mock existing booking with seat A1
        UserModel otherUser = new UserModel();
        otherUser.setId(2L);
        Booking existingBooking = new Booking(otherUser, show, 1, "A1", 250.0, "CONFIRMED", LocalDateTime.now());

        BookingRequest request = new BookingRequest(userId, showId, requestedSeats);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(showRepository.findById(showId)).thenReturn(Optional.of(show));
        when(bookingRepository.findByShowIdAndStatus(showId, "CONFIRMED")).thenReturn(Arrays.asList(existingBooking));

        Exception exception = assertThrows(RuntimeException.class, () -> bookingService.bookTickets(request));
        assertTrue(exception.getMessage().contains("Seat(s) already booked: [A1]"));
    }
}
