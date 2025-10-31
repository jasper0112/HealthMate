package com.example.backend.dto.response;

import com.example.backend.entity.User;
import lombok.Data;

@Data
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private User.UserRole role;
    private Boolean enabled;
    private String message;

    public static LoginResponse fromUser(User user) {
        LoginResponse resp = new LoginResponse();
        resp.setUserId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setRole(user.getRole());
        resp.setEnabled(user.getEnabled());
        resp.setMessage("Login successful");
        return resp;
    }
}



