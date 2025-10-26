package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "gp_appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GpAppointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;
    
    @Column(nullable = false)
    private LocalDateTime appointmentDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;
    
    @Column(length = 1000)
    private String notes;
    
    @Column(length = 1000)
    private String reason;
    
    private LocalDateTime reminderTime;
    
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
    
    public enum AppointmentStatus {
        SCHEDULED,      // Scheduled
        CONFIRMED,      // Confirmed by facility
        CANCELLED,      // Cancelled
        COMPLETED,      // Completed
        NO_SHOW         // No show
    }
}
