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
    
    @Column(length = 3000)
    private String recommendationSummary;
    
    @Column(length = 5000)
    private String detailedRecommendation;
    
    @Column(length = 2000)
    private String recommendedProducts; // JSON or formatted string
    
    @Column(length = 2000)
    private String userProfileAnalysis;
    
    @Column(length = 2000)
    private String benefits;
    
    @Column(length = 2000)
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
        NEW_IMMIGRANT,           // 新移民
        INTERNATIONAL_STUDENT,   // 国际学生
        GENERAL_NEED,            // 一般需求
        SPECIFIC_CONDITION,      // 特定健康问题
        FAMILY_COVERAGE,         // 家庭保障
        BUDGET_CONSCIOUS         // 预算考虑
    }
}
