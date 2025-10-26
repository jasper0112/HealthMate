package com.example.backend.dto;

import com.example.backend.entity.DietGuidance;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DietGuidanceResponse {
    
    private Long dietGuidanceId;
    private Long userId;
    private String username;
    private String healthIssue;
    private String foodRecommendations;
    private String avoidFoods;
    private String supplementRecommendations;
    private String mealSuggestions;
    private String cookingTips;
    private String guidance;
    private String nutritionalBenefits;
    private String sampleMenu;
    private LocalDateTime createdAt;
    
    public static DietGuidanceResponse fromDietGuidance(DietGuidance guidance) {
        DietGuidanceResponse response = new DietGuidanceResponse();
        response.setDietGuidanceId(guidance.getDietGuidanceId());
        response.setUserId(guidance.getUser().getId());
        response.setUsername(guidance.getUser().getUsername());
        response.setHealthIssue(guidance.getHealthIssue());
        response.setFoodRecommendations(guidance.getFoodRecommendations());
        response.setAvoidFoods(guidance.getAvoidFoods());
        response.setSupplementRecommendations(guidance.getSupplementRecommendations());
        response.setMealSuggestions(guidance.getMealSuggestions());
        response.setCookingTips(guidance.getCookingTips());
        response.setGuidance(guidance.getGuidance());
        response.setNutritionalBenefits(guidance.getNutritionalBenefits());
        response.setSampleMenu(guidance.getSampleMenu());
        response.setCreatedAt(guidance.getCreatedAt());
        return response;
    }
}
