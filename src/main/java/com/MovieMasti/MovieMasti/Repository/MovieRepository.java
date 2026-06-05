package com.MovieMasti.MovieMasti.Repository;

import com.MovieMasti.MovieMasti.entity.MoviesModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<MoviesModel, Long> {
}
