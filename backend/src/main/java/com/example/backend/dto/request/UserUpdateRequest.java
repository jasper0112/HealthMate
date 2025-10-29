package com.example.backend.dto.request;

import com.example.backend.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserUpdateRequest {
    
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Email(message = "Email format is invalid")
    private String email;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;
    
    private User.Gender gender;
    
    private LocalDateTime dateOfBirth;
    
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;
    
    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;
    
    private String userInfo; // Additional user information (occupation, preferences, etc.)
    
    private String healthProfile; // Health profile (chronic conditions, allergies, family history, etc.)
    
    private String healthGoal; // Health goals (weight loss, muscle gain, cardiovascular improvement, etc.)
    
    private User.UserRole role;
    
    private Boolean enabled;
}

