package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_assessments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthAssessment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime assessedAt = LocalDateTime.now();
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentType type = AssessmentType.GENERAL;
    
    // AI Assessment Results
    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String detailedReport;
    
    @Enumerated(EnumType.STRING)
    private RiskLevel overallRiskLevel;
    
    private BigDecimal overallScore; // 0-100
    
    // Key Metrics from Analysis
    @Lob
    @Column(columnDefinition = "TEXT")
    private String keyFindings;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendations;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String aiInsights;
    
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
    
    public enum AssessmentType {
        GENERAL,
        CARDIOVASCULAR,
        NUTRITION,
        FITNESS,
        MENTAL_HEALTH,
        COMPREHENSIVE
    }
    
    public enum RiskLevel {
        LOW,
        MODERATE,
        HIGH,
        CRITICAL
    }
}
