package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceRecommendation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long insuranceRecommendationId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationReason reason;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendationSummary;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String detailedRecommendation;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendedProducts; // JSON or formatted string
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String userProfileAnalysis;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String benefits;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String considerations;
    
    @Column(nullable = false)
    private LocalDateTime recommendationDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        this.recommendationDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }
    
    public enum RecommendationReason {
        NEW_IMMIGRANT,           // New immigrant
        INTERNATIONAL_STUDENT,   // International student
        GENERAL_NEED,            // General need
        SPECIFIC_CONDITION,      // Specific health condition
        FAMILY_COVERAGE,         // Family coverage
        BUDGET_CONSCIOUS         // Budget conscious
    }
}
