package com.MovieMasti.MovieMasti.services;

import com.MovieMasti.MovieMasti.DTO.UserRequest;
import com.MovieMasti.MovieMasti.Repository.UserRepository;
import com.MovieMasti.MovieMasti.entity.UserModel;
import java.util.List;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserAuth {

    private final UserRepository u1;
    private final PasswordEncoder pwdEncoder;

    public UserAuth(UserRepository u1) {
        this.u1 = u1;
        this.pwdEncoder = new BCryptPasswordEncoder();
    }

    // user login
    public String validateUser(UserRequest LoginUser) {
        UserModel user = u1.findByEmail(LoginUser.getUserEmail());

        if (user == null) {
            return "User not found";
        }
        if (pwdEncoder.matches(LoginUser.getPassword(), user.getPassword())) {
            System.out.println("User is valid" + LoginUser.getPassword());
            return "User logged in successfully";
        }
        return "User not valid";
    }

    //user signin
    public String SignUp(UserRequest UserDetails) {
        System.out.println(UserDetails.getUsername() + UserDetails.getUserEmail());
        String password = pwdEncoder.encode(UserDetails.getPassword());

        System.out.println(password);
        
        // Use default empty strings for optional fields if not provided to satisfy database not-null constraints
        String phoneNo = UserDetails.getPhoneNumber() != null ? UserDetails.getPhoneNumber() : "";
        String address = UserDetails.getAddress() != null ? UserDetails.getAddress() : "";
        String city = UserDetails.getCity() != null ? UserDetails.getCity() : "";
        String state = UserDetails.getState() != null ? UserDetails.getState() : "";
        String country = UserDetails.getCountry() != null ? UserDetails.getCountry() : "";
        String zipCode = UserDetails.getZipCode() != null ? UserDetails.getZipCode() : "";

        UserModel u = new UserModel(UserDetails.getUsername(), UserDetails.getUserEmail(), password, phoneNo, address, city, state, country, zipCode);
        String role = UserDetails.getRole() != null ? UserDetails.getRole() : "USER";
        u.setRole(role);
        System.out.println(UserDetails.getUsername());

        UserModel savedUser = u1.save(u);

        if (savedUser != null) {
            return "the user is registered successfully";
        }
        return "the user  is not registered";

    }

    public UserModel getUserByEmail(String email) {
        return u1.findByEmail(email);
    }

    public List<UserModel> getAllUsers() {
        return u1.findAll();
    }

    public UserModel updateUserProfile(Long id, UserRequest updatedDetails) {
        UserModel user = u1.findById(id).orElse(null);
        if (user == null) {
            return null;
        }

        if (updatedDetails.getUsername() != null) {
            user.setUsername(updatedDetails.getUsername());
        }
        if (updatedDetails.getPhoneNumber() != null) {
            user.setPhoneNo(updatedDetails.getPhoneNumber());
        }
        if (updatedDetails.getAddress() != null) {
            user.setAddress(updatedDetails.getAddress());
        }
        if (updatedDetails.getCity() != null) {
            user.setCity(updatedDetails.getCity());
        }
        if (updatedDetails.getState() != null) {
            user.setState(updatedDetails.getState());
        }
        if (updatedDetails.getCountry() != null) {
            user.setCountry(updatedDetails.getCountry());
        }
        if (updatedDetails.getZipCode() != null) {
            user.setZipCode(updatedDetails.getZipCode());
        }
        if (updatedDetails.getProfilePicture() != null) {
            user.setProfilePicture(updatedDetails.getProfilePicture());
        }
        if (updatedDetails.getPassword() != null && !updatedDetails.getPassword().trim().isEmpty()) {
            user.setPassword(pwdEncoder.encode(updatedDetails.getPassword()));
        }

        return u1.save(user);
    }
}
