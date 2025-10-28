package com.example.backend.dto;

import com.example.backend.entity.HealthAssessment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HealthAssessmentRequest {
    
    private Long userId;
    
    private HealthAssessment.AssessmentType type = HealthAssessment.AssessmentType.GENERAL;
    
    private Integer daysBack = 30; // Analyze last N days of data
    
    private Boolean includeHistoricalData = true;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
}
