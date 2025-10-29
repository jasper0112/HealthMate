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
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String conditionDescription;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String otcMedications; // Recommended OTC meds with dosages
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String usageInstructions;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String precautions;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String sideEffects;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendedPharmacies;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String priceComparison; // Price info for different pharmacies
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String guidance;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
