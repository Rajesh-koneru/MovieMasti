package com.MovieMasti.MovieMasti.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.MovieMasti.MovieMasti.DTO.UserRequest;
import com.MovieMasti.MovieMasti.Repository.UserRepository;
import com.MovieMasti.MovieMasti.entity.UserModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class UserAuthTest {

    private UserRepository userRepository;
    private UserAuth userAuth;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userAuth = new UserAuth(userRepository);
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void signUp_ShouldReturnSuccess_WhenUserIsSaved() {
        UserRequest request = new UserRequest();
        request.setUsername("testuser");
        request.setUserEmail("test@example.com");
        request.setPassword("password123");
        request.setPhoneNumber("1234567890");
        request.setAddress("Street 1");
        request.setCity("CityA");
        request.setState("StateA");
        request.setCountry("CountryA");
        request.setZipCode("12345");

        // mock repository save
        when(userRepository.save(any(UserModel.class))).thenAnswer(invocation -> {
            UserModel userToSave = invocation.getArgument(0);
            // Verify correct fields mapping in constructor call
            assertEquals("testuser", userToSave.getUsername());
            assertEquals("test@example.com", userToSave.getEmail());
            assertTrue(passwordEncoder.matches("password123", userToSave.getPassword()));
            assertEquals("1234567890", userToSave.getPhoneNo());
            assertEquals("Street 1", userToSave.getAddress());
            assertEquals("CityA", userToSave.getCity());
            assertEquals("StateA", userToSave.getState());
            assertEquals("CountryA", userToSave.getCountry());
            assertEquals("12345", userToSave.getZipCode());
            return userToSave;
        });

        String result = userAuth.SignUp(request);
        assertEquals("the user is registered successfully", result);
        verify(userRepository, times(1)).save(any(UserModel.class));
    }

    @Test
    void signUp_ShouldReturnFailure_WhenUserSaveReturnsNull() {
        UserRequest request = new UserRequest();
        request.setUsername("testuser");
        request.setUserEmail("test@example.com");
        request.setPassword("password123");

        when(userRepository.save(any(UserModel.class))).thenReturn(null);

        String result = userAuth.SignUp(request);
        assertEquals("the user  is not registered", result);
        verify(userRepository, times(1)).save(any(UserModel.class));
    }

    @Test
    void validateUser_ShouldReturnSuccess_WhenCredentialsAreValid() {
        UserRequest loginRequest = new UserRequest();
        loginRequest.setUserEmail("test@example.com");
        loginRequest.setPassword("password123");

        UserModel databaseUser = new UserModel(
            "testuser",
            "test@example.com",
            passwordEncoder.encode("password123"),
            "1234567890",
            "Street 1",
            "CityA",
            "StateA",
            "CountryA",
            "12345"
        );

        when(userRepository.findByEmail("test@example.com")).thenReturn(databaseUser);

        String result = userAuth.validateUser(loginRequest);
        assertEquals("User logged in successfully", result);
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    void validateUser_ShouldReturnUserNotFound_WhenUserDoesNotExist() {
        UserRequest loginRequest = new UserRequest();
        loginRequest.setUserEmail("nonexistent@example.com");
        loginRequest.setPassword("password123");

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(null);

        String result = userAuth.validateUser(loginRequest);
        assertEquals("User not found", result);
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    void validateUser_ShouldReturnNotValid_WhenPasswordDoesNotMatch() {
        UserRequest loginRequest = new UserRequest();
        loginRequest.setUserEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");

        UserModel databaseUser = new UserModel(
            "testuser",
            "test@example.com",
            passwordEncoder.encode("password123"),
            "1234567890",
            "Street 1",
            "CityA",
            "StateA",
            "CountryA",
            "12345"
        );

        when(userRepository.findByEmail("test@example.com")).thenReturn(databaseUser);

        String result = userAuth.validateUser(loginRequest);
        assertEquals("User not valid", result);
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }
}
