package com.MovieMasti.MovieMasti.DTO;

import java.util.List;

public class BookingRequest {
    private Long userId;
    private Long showId;
    private List<String> bookedSeats;

    public BookingRequest() {
    }

    public BookingRequest(Long userId, Long showId, List<String> bookedSeats) {
        this.userId = userId;
        this.showId = showId;
        this.bookedSeats = bookedSeats;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public List<String> getBookedSeats() {
        return bookedSeats;
    }

    public void setBookedSeats(List<String> bookedSeats) {
        this.bookedSeats = bookedSeats;
    }
}
