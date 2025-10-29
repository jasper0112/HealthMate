package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "smart_triage")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmartTriage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long triageId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String symptomsInfo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TriagePriority priority = TriagePriority.MEDIUM;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String triageResult;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendedAction;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;
    
    @Column(nullable = false)
    private LocalDateTime triageTime = LocalDateTime.now();
    
    private Long associatedAppointmentId;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        this.triageTime = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
    
    public enum TriagePriority {
        LOW,        // Self-care recommended
        MEDIUM,     // GP appointment recommended
        HIGH,       // Urgent care needed
        CRITICAL    // Emergency care needed
    }
}
