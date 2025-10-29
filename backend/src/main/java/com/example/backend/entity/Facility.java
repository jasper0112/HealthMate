package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "facilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facility {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facilityId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityType facilityType = FacilityType.GP;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(length = 500)
    private String address;
    
    @Column(length = 20)
    private String phoneNumber;
    
    @Column(length = 100)
    private String email;
    
    private BigDecimal latitude;
    
    private BigDecimal longitude;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 500)
    private String specialties; // Comma-separated
    
    @Column(length = 1000)
    private String operatingHours; // JSON or formatted string
    
    @Column(length = 2000)
    private String directions;
    
    private Integer distance; // Distance in meters (calculated)
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum FacilityType {
        GP,                // General Practitioner
        HOSPITAL,          // Hospital
        CLINIC,            // Clinic
        PHARMACY,          // Pharmacy
        URGENT_CARE,       // Urgent Care
        EMERGENCY          // Emergency Department
    }
}
