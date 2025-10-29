package com.example.backend.dto.response;

import com.example.backend.entity.HealthPlan;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HealthPlanResponse {
    
    private Long id;
    private Long userId;
    private String username;
    private LocalDateTime planDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private HealthPlan.PlanType type;
    
    // Diet Plan Section
    private String dietOverview;
    private String dailyMealPlan;
    private String nutritionGoals;
    private String foodRecommendations;
    
    // Exercise Plan Section
    private String exerciseOverview;
    private String weeklyWorkoutPlan;
    private String fitnessGoals;
    private String exerciseRecommendations;
    
    // Lifestyle Plan Section
    private String lifestyleOverview;
    private String dailyRoutine;
    private String sleepRecommendations;
    private String stressManagementTips;
    private String hydrationGoals;
    
    // Long-term Goals
    private String longTermGoals;
    private String progressTrackingTips;
    private String motivationalNotes;
    
    // Overall Plan Summary
    private String planSummary;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HealthPlanResponse fromHealthPlan(HealthPlan plan) {
        HealthPlanResponse response = new HealthPlanResponse();
        response.setId(plan.getId());
        response.setUserId(plan.getUser().getId());
        response.setUsername(plan.getUser().getUsername());
        response.setPlanDate(plan.getPlanDate());
        response.setStartDate(plan.getStartDate());
        response.setEndDate(plan.getEndDate());
        response.setType(plan.getType());
        
        // Diet Plan Section
        response.setDietOverview(plan.getDietOverview());
        response.setDailyMealPlan(plan.getDailyMealPlan());
        response.setNutritionGoals(plan.getNutritionGoals());
        response.setFoodRecommendations(plan.getFoodRecommendations());
        
        // Exercise Plan Section
        response.setExerciseOverview(plan.getExerciseOverview());
        response.setWeeklyWorkoutPlan(plan.getWeeklyWorkoutPlan());
        response.setFitnessGoals(plan.getFitnessGoals());
        response.setExerciseRecommendations(plan.getExerciseRecommendations());
        
        // Lifestyle Plan Section
        response.setLifestyleOverview(plan.getLifestyleOverview());
        response.setDailyRoutine(plan.getDailyRoutine());
        response.setSleepRecommendations(plan.getSleepRecommendations());
        response.setStressManagementTips(plan.getStressManagementTips());
        response.setHydrationGoals(plan.getHydrationGoals());
        
        // Long-term Goals
        response.setLongTermGoals(plan.getLongTermGoals());
        response.setProgressTrackingTips(plan.getProgressTrackingTips());
        response.setMotivationalNotes(plan.getMotivationalNotes());
        
        // Overall Plan Summary
        response.setPlanSummary(plan.getPlanSummary());
        
        response.setCreatedAt(plan.getCreatedAt());
        response.setUpdatedAt(plan.getUpdatedAt());
        
        return response;
    }
}

