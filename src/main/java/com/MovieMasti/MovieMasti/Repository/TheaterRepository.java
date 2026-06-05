package com.MovieMasti.MovieMasti.Repository;

import com.MovieMasti.MovieMasti.entity.Theaters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TheaterRepository extends JpaRepository<Theaters, Long> {
}
