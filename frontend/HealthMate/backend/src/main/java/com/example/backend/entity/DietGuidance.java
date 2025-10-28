package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "diet_guidance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietGuidance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dietGuidanceId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 500)
    private String healthIssue; // The specific issue user wants guidance for
    
    @Column(length = 3000)
    private String foodRecommendations; // Foods to eat
    
    @Column(length = 2000)
    private String avoidFoods; // Foods to avoid
    
    @Column(length = 2000)
    private String supplementRecommendations; // Nutritional supplements
    
    @Column(length = 2000)
    private String mealSuggestions; // Meal plan suggestions
    
    @Column(length = 2000)
    private String cookingTips; // How to prepare healthy meals
    
    @Column(length = 3000)
    private String guidance; // Overall dietary guidance
    
    @Column(length = 2000)
    private String nutritionalBenefits; // Benefits of recommended foods
    
    @Column(length = 2000)
    private String sampleMenu; // Sample daily menu
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
