package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_guidance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicationGuidance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long medGuidanceId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 500)
    private String symptoms;
    
    @Column(length = 2000)
    private String conditionDescription;
    
    @Column(length = 3000)
    private String otcMedications; // Recommended OTC meds with dosages
    
    @Column(length = 2000)
    private String usageInstructions;
    
    @Column(length = 2000)
    private String precautions;
    
    @Column(length = 2000)
    private String sideEffects;
    
    @Column(length = 2000)
    private String recommendedPharmacies;
    
    @Column(length = 2000)
    private String priceComparison; // Price info for different pharmacies
    
    @Column(length = 3000)
    private String guidance;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
