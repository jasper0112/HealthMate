package com.example.backend.dto.request;

import com.example.backend.entity.HealthData;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HealthDataCreateRequest {
    
    private Long userId;
    
    private LocalDateTime recordedAt;
    
    @DecimalMin(value = "0.0", message = "Weight must be positive")
    @DecimalMax(value = "1000.0", message = "Weight must be reasonable")
    private BigDecimal weight;
    
    @DecimalMin(value = "0.0", message = "Height must be positive")
    @DecimalMax(value = "300.0", message = "Height must be reasonable")
    private BigDecimal height;
    
    @Min(value = 0, message = "Systolic pressure must be positive")
    @Max(value = 300, message = "Systolic pressure must be reasonable")
    private Integer systolicPressure;
    
    @Min(value = 0, message = "Diastolic pressure must be positive")
    @Max(value = 200, message = "Diastolic pressure must be reasonable")
    private Integer diastolicPressure;
    
    @Min(value = 30, message = "Heart rate must be at least 30")
    @Max(value = 250, message = "Heart rate must be reasonable")
    private Integer heartRate;
    
    @DecimalMin(value = "0.0", message = "Body temperature must be positive")
    @DecimalMax(value = "50.0", message = "Body temperature must be reasonable")
    private BigDecimal bodyTemperature;
    
    @Min(value = 0, message = "Blood sugar must be positive")
    @Max(value = 1000, message = "Blood sugar must be reasonable")
    private Integer bloodSugar;
    
    private HealthData.MoodLevel mood;
    
    @Min(value = 0, message = "Sleep hours must be positive")
    @Max(value = 24, message = "Sleep hours cannot exceed 24")
    private Integer sleepHours;
    
    @Min(value = 0, message = "Exercise minutes must be positive")
    @Max(value = 1440, message = "Exercise minutes cannot exceed 24 hours")
    private Integer exerciseMinutes;
    
    @Min(value = 0, message = "Water intake must be positive")
    @Max(value = 10000, message = "Water intake must be reasonable")
    private Integer waterIntake;
    
    @Min(value = 0, message = "Steps must be positive")
    @Max(value = 100000, message = "Steps must be reasonable")
    private Integer steps;
    
    private String notes;
}

