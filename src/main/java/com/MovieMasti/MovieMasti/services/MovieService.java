package com.MovieMasti.MovieMasti.services;

import com.MovieMasti.MovieMasti.Repository.MovieRepository;
import com.MovieMasti.MovieMasti.entity.MoviesModel;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    @Autowired
    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public MoviesModel addMovie(MoviesModel movie) {
        return movieRepository.save(movie);
    }

    public List<MoviesModel> getAllMovies() {
        return movieRepository.findAll();
    }

    public Optional<MoviesModel> getMovieById(Long id) {
        return movieRepository.findById(id);
    }
}
