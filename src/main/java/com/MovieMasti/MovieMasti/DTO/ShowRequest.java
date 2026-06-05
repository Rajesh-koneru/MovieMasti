package com.MovieMasti.MovieMasti.DTO;

import java.time.LocalDateTime;

public class ShowRequest {
    private Long movieId;
    private Long theaterId;
    private LocalDateTime showTime;
    private Double price;
    private Integer totalSeats;

    public ShowRequest() {
    }

    public ShowRequest(Long movieId, Long theaterId, LocalDateTime showTime, Double price, Integer totalSeats) {
        this.movieId = movieId;
        this.theaterId = theaterId;
        this.showTime = showTime;
        this.price = price;
        this.totalSeats = totalSeats;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public Long getTheaterId() {
        return theaterId;
    }

    public void setTheaterId(Long theaterId) {
        this.theaterId = theaterId;
    }

    public LocalDateTime getShowTime() {
        return showTime;
    }

    public void setShowTime(LocalDateTime showTime) {
        this.showTime = showTime;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }
}
