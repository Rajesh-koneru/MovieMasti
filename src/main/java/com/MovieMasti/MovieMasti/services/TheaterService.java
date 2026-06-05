package com.MovieMasti.MovieMasti.services;

import com.MovieMasti.MovieMasti.Repository.TheaterRepository;
import com.MovieMasti.MovieMasti.entity.Theaters;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TheaterService {

    private final TheaterRepository theaterRepository;

    @Autowired
    public TheaterService(TheaterRepository theaterRepository) {
        this.theaterRepository = theaterRepository;
    }

    public Theaters addTheater(Theaters theater) {
        return theaterRepository.save(theater);
    }

    public List<Theaters> getAllTheaters() {
        return theaterRepository.findAll();
    }

    public Optional<Theaters> getTheaterById(Long id) {
        return theaterRepository.findById(id);
    }
}
