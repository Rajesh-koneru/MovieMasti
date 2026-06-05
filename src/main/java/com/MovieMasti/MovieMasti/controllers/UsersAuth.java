package com.MovieMasti.MovieMasti.controllers;

import com.MovieMasti.MovieMasti.DTO.UserRequest;
import com.MovieMasti.MovieMasti.entity.UserModel;
import com.MovieMasti.MovieMasti.services.UserAuth;
import com.MovieMasti.MovieMasti.Security.JwtTokenUtil;
import com.MovieMasti.MovieMasti.Security.CustomUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/api")
public class UsersAuth {
    private final UserAuth userAuth;
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;

    public UsersAuth(UserAuth userAuth, JwtTokenUtil jwtTokenUtil, CustomUserDetailsService userDetailsService) {
        this.userAuth = userAuth;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRequest u1) {
        String validation = userAuth.validateUser(u1);
        Map<String, Object> response = new HashMap<>();
        if ("User logged in successfully".equals(validation)) {
            UserModel user = userAuth.getUserByEmail(u1.getUserEmail());
            response.put("status", "success");
            response.put("message", validation);
            if (user != null) {
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("profilePicture", user.getProfilePicture());

                // Generate JWT Token
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String token = jwtTokenUtil.generateToken(userDetails);
                response.put("token", token);
            }
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", validation);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody UserRequest u1) {
        String validation = userAuth.SignUp(u1);
        Map<String, Object> response = new HashMap<>();
        if ("the user is registered successfully".equals(validation)) {
            UserModel user = userAuth.getUserByEmail(u1.getUserEmail());
            response.put("status", "success");
            response.put("message", validation);
            if (user != null) {
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("role", user.getRole());
                response.put("profilePicture", user.getProfilePicture());

                // Generate JWT Token
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String token = jwtTokenUtil.generateToken(userDetails);
                response.put("token", token);
            }
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "error");
            response.put("message", validation);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/home")
    public String home(){
        return "home";
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserModel>> getAllUsers() {
        List<UserModel> users = userAuth.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "User logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        UserModel user = userAuth.getAllUsers().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody UserRequest updatedDetails) {
        UserModel updatedUser = userAuth.updateUserProfile(id, updatedDetails);
        if (updatedUser == null) {
            return ResponseEntity.badRequest().body("User not found or update failed");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(updatedUser.getEmail());
        String token = jwtTokenUtil.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Profile updated successfully");
        response.put("userId", updatedUser.getId());
        response.put("username", updatedUser.getUsername());
        response.put("email", updatedUser.getEmail());
        response.put("role", updatedUser.getRole());
        response.put("profilePicture", updatedUser.getProfilePicture());
        response.put("token", token);

        return ResponseEntity.ok(response);
    }
}
