package com.MovieMasti.MovieMasti.controllers;

import com.MovieMasti.MovieMasti.DTO.BookingRequest;
import com.MovieMasti.MovieMasti.entity.Booking;
import com.MovieMasti.MovieMasti.services.BookingService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> bookTickets(@RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.bookTickets(request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/show/{showId}")
    public ResponseEntity<List<Booking>> getBookingsByShow(@PathVariable Long showId) {
        List<Booking> bookings = bookingService.getBookingsByShow(showId);
        return ResponseEntity.ok(bookings);
    }
}
