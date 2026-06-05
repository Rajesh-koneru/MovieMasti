package com.MovieMasti.MovieMasti.controllers;

import com.MovieMasti.MovieMasti.entity.MoviesModel;
import com.MovieMasti.MovieMasti.services.MovieService;
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
@RequestMapping("/v1/api/movies")
public class MovieController {

    private final MovieService movieService;

    @Autowired
    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping
    public ResponseEntity<MoviesModel> addMovie(@RequestBody MoviesModel movie) {
        MoviesModel savedMovie = movieService.addMovie(movie);
        return ResponseEntity.ok(savedMovie);
    }

    @GetMapping
    public ResponseEntity<List<MoviesModel>> getAllMovies() {
        List<MoviesModel> movies = movieService.getAllMovies();
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MoviesModel> getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
