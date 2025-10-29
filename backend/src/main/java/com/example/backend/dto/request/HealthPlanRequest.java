package com.example.backend.dto.request;

import com.example.backend.entity.HealthPlan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HealthPlanRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Plan type is required")
    private HealthPlan.PlanType type;
    
    private Integer daysBack = 7; // Days of historical data to analyze
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    // Optional: Specific health goals
    private String healthGoals;
}

