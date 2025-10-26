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
    @Column(length = 3000)
    private String dietOverview;
    
    @Column(length = 3000)
    private String dailyMealPlan;
    
    @Column(length = 2000)
    private String nutritionGoals;
    
    @Column(length = 2000)
    private String foodRecommendations;
    
    // Exercise Plan Section
    @Column(length = 3000)
    private String exerciseOverview;
    
    @Column(length = 3000)
    private String weeklyWorkoutPlan;
    
    @Column(length = 2000)
    private String fitnessGoals;
    
    @Column(length = 2000)
    private String exerciseRecommendations;
    
    // Lifestyle Plan Section
    @Column(length = 3000)
    private String lifestyleOverview;
    
    @Column(length = 3000)
    private String dailyRoutine;
    
    @Column(length = 2000)
    private String sleepRecommendations;
    
    @Column(length = 2000)
    private String stressManagementTips;
    
    @Column(length = 2000)
    private String hydrationGoals;
    
    // Long-term Goals
    @Column(length = 2000)
    private String longTermGoals;
    
    @Column(length = 2000)
    private String progressTrackingTips;
    
    @Column(length = 2000)
    private String motivationalNotes;
    
    // Overall Plan Summary
    @Column(length = 2000)
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
