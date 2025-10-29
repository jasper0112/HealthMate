package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Column(unique = true, nullable = false)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;
    
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender = Gender.OTHER;
    
    private LocalDateTime dateOfBirth;
    
    private Integer age;
    
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phoneNumber;
    
    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String userInfo; // Additional user information (occupation, preferences, etc.)
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String healthProfile; // Health profile (chronic conditions, allergies, family history, etc.)
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String healthGoal; // Health goals (weight loss, muscle gain, cardiovascular improvement, etc.)
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        calculateAge();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateAge();
    }
    
    /**
     * Calculate age from dateOfBirth
     */
    private void calculateAge() {
        if (this.dateOfBirth != null) {
            LocalDateTime now = LocalDateTime.now();
            this.age = now.getYear() - this.dateOfBirth.getYear();
            // Adjust if birthday hasn't occurred this year
            if (now.getMonthValue() < this.dateOfBirth.getMonthValue() ||
                (now.getMonthValue() == this.dateOfBirth.getMonthValue() && 
                 now.getDayOfMonth() < this.dateOfBirth.getDayOfMonth())) {
                this.age--;
            }
        }
    }
    
    @Override
    public String getUsername() {
        return this.username;
    }
    
    @Override
    public String getPassword() {
        return this.password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    public enum Gender {
        MALE, FEMALE, OTHER
    }
    
    public enum UserRole {
        USER, ADMIN, DOCTOR
    }
}
