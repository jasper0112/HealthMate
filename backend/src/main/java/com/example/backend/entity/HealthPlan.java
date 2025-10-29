package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime planDate = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime startDate;
    
    @Column(nullable = false)
    private LocalDateTime endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanType type = PlanType.WEEKLY;
    
    // Diet Plan Section
    @Lob
    @Column(columnDefinition = "TEXT")
    private String dietOverview;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String dailyMealPlan;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String nutritionGoals;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String foodRecommendations;
    
    // Exercise Plan Section
    @Lob
    @Column(columnDefinition = "TEXT")
    private String exerciseOverview;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String weeklyWorkoutPlan;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String fitnessGoals;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String exerciseRecommendations;
    
    // Lifestyle Plan Section
    @Lob
    @Column(columnDefinition = "TEXT")
    private String lifestyleOverview;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String dailyRoutine;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String sleepRecommendations;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String stressManagementTips;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String hydrationGoals;
    
    // Long-term Goals
    @Lob
    @Column(columnDefinition = "TEXT")
    private String longTermGoals;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String progressTrackingTips;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String motivationalNotes;
    
    // Overall Plan Summary
    @Lob
    @Column(columnDefinition = "TEXT")
    private String planSummary;
    
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
    
    public enum PlanType {
        DAILY,
        WEEKLY,
        MONTHLY
    }
}
