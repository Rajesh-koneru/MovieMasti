package com.MovieMasti.MovieMasti;

import com.MovieMasti.MovieMasti.Repository.UserRepository;
import com.MovieMasti.MovieMasti.entity.UserModel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        UserModel admin = userRepository.findByEmail("admin@moviemasti.com");
        if (admin == null) {
            System.out.println("Seeding admin user into the database...");
            UserModel newAdmin = new UserModel(
                "Administrator",
                "admin@moviemasti.com",
                passwordEncoder.encode("admin"),
                "9876543210",
                "A-12, Movie Towers, Madhapur",
                "Hyderabad",
                "Telangana",
                "India",
                "500081"
            );
            newAdmin.setRole("ADMIN");
            userRepository.save(newAdmin);
            System.out.println("Admin user seeded successfully!");
        } else {
            System.out.println("Admin user already exists in the database. Seeding skipped.");
        }
    }
}
