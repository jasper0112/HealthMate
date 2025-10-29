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
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String foodRecommendations; // Foods to eat
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String avoidFoods; // Foods to avoid
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String supplementRecommendations; // Nutritional supplements
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String mealSuggestions; // Meal plan suggestions
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String cookingTips; // How to prepare healthy meals
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String guidance; // Overall dietary guidance
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String nutritionalBenefits; // Benefits of recommended foods
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String sampleMenu; // Sample daily menu
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
