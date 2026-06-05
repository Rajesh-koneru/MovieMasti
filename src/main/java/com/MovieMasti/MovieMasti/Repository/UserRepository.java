package com.MovieMasti.MovieMasti.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.MovieMasti.MovieMasti.entity.UserModel;

public interface UserRepository extends JpaRepository<UserModel, Long> {

    UserModel findByEmail(String userEmail);
}
