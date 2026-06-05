package com.MovieMasti.MovieMasti.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "movies")
public class MoviesModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String movieName;

    @Column(nullable = false, length = 100)
    private String genre;

    @Column(nullable = false, length = 100)
    private String director;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer duration; // in minutes

    // Constructors
    public MoviesModel() {
    }

    public MoviesModel(String movieName, String genre, String director, Double rating, Integer duration) {
        this.movieName = movieName;
        this.genre = genre;
        this.director = director;
        this.rating = rating;
        this.duration = duration;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMovieName() {
        return movieName;
    }

    public void setMovieName(String movieName) {
        this.movieName = movieName;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}
