package com.MovieMasti.MovieMasti.services;

import com.MovieMasti.MovieMasti.DTO.ShowRequest;
import com.MovieMasti.MovieMasti.Repository.MovieRepository;
import com.MovieMasti.MovieMasti.Repository.ShowRepository;
import com.MovieMasti.MovieMasti.Repository.TheaterRepository;
import com.MovieMasti.MovieMasti.entity.MoviesModel;
import com.MovieMasti.MovieMasti.entity.Show;
import com.MovieMasti.MovieMasti.entity.Theaters;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieRepository movieRepository;
    private final TheaterRepository theaterRepository;

    @Autowired
    public ShowService(ShowRepository showRepository, MovieRepository movieRepository, TheaterRepository theaterRepository) {
        this.showRepository = showRepository;
        this.movieRepository = movieRepository;
        this.theaterRepository = theaterRepository;
    }

    public Show addShow(ShowRequest request) {
        MoviesModel movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + request.getMovieId()));

        Theaters theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new RuntimeException("Theater not found with ID: " + request.getTheaterId()));

        Show show = new Show(movie, theater, request.getShowTime(), request.getPrice(), request.getTotalSeats());
        return showRepository.save(show);
    }

    public List<Show> getShowsByMovie(Long movieId) {
        return showRepository.findByMovieId(movieId);
    }

    public List<Show> getShowsByTheater(Long theaterId) {
        return showRepository.findByTheaterId(theaterId);
    }

    public Optional<Show> getShowById(Long id) {
        return showRepository.findById(id);
    }

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }
}
