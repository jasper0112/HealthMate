package com.example.backend.dto.response;

import com.example.backend.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private User.Gender gender;
    private LocalDateTime dateOfBirth;
    private Integer age;
    private String phoneNumber;
    private String address;
    private String userInfo;
    private String healthProfile;
    private String healthGoal;
    private User.UserRole role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static UserResponse fromUser(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setGender(user.getGender());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setAge(user.getAge());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(user.getAddress());
        response.setUserInfo(user.getUserInfo());
        response.setHealthProfile(user.getHealthProfile());
        response.setHealthGoal(user.getHealthGoal());
        response.setRole(user.getRole());
        response.setEnabled(user.getEnabled());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}

