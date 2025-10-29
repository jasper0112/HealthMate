package com.example.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HealthDataStatisticsResponse {
    
    private Long userId;
    private String username;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long totalRecords;
    
    private BigDecimal averageWeight;
    private BigDecimal averageBMI;
    private Double averageHeartRate;
    private Double averageSteps;
    private Double averageSleepHours;
    private Double averageExerciseMinutes;
    
    private BigDecimal minWeight;
    private BigDecimal maxWeight;
    private BigDecimal minBMI;
    private BigDecimal maxBMI;
    private Integer minHeartRate;
    private Integer maxHeartRate;
    private Integer minSteps;
    private Integer maxSteps;
    private Integer minSleepHours;
    private Integer maxSleepHours;
    private Integer minExerciseMinutes;
    private Integer maxExerciseMinutes;
    
    private List<HealthDataResponse> recentRecords;
    
    public HealthDataStatisticsResponse() {
        this.startDate = LocalDateTime.now().minusDays(30);
        this.endDate = LocalDateTime.now();
    }
}

