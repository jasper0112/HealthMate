package com.example.backend.dto;

import com.example.backend.entity.HealthData;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HealthDataResponse {
    
    private Long id;
    private Long userId;
    private String username;
    private LocalDateTime recordedAt;
    private BigDecimal weight;
    private BigDecimal height;
    private BigDecimal bmi;
    private Integer systolicPressure;
    private Integer diastolicPressure;
    private Integer heartRate;
    private BigDecimal bodyTemperature;
    private Integer bloodSugar;
    private HealthData.MoodLevel mood;
    private Integer sleepHours;
    private Integer exerciseMinutes;
    private Integer waterIntake;
    private Integer steps;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HealthDataResponse fromHealthData(HealthData healthData) {
        HealthDataResponse response = new HealthDataResponse();
        response.setId(healthData.getId());
        response.setUserId(healthData.getUser().getId());
        response.setUsername(healthData.getUser().getUsername());
        response.setRecordedAt(healthData.getRecordedAt());
        response.setWeight(healthData.getWeight());
        response.setHeight(healthData.getHeight());
        response.setBmi(healthData.getBmi());
        response.setSystolicPressure(healthData.getSystolicPressure());
        response.setDiastolicPressure(healthData.getDiastolicPressure());
        response.setHeartRate(healthData.getHeartRate());
        response.setBodyTemperature(healthData.getBodyTemperature());
        response.setBloodSugar(healthData.getBloodSugar());
        response.setMood(healthData.getMood());
        response.setSleepHours(healthData.getSleepHours());
        response.setExerciseMinutes(healthData.getExerciseMinutes());
        response.setWaterIntake(healthData.getWaterIntake());
        response.setSteps(healthData.getSteps());
        response.setNotes(healthData.getNotes());
        response.setCreatedAt(healthData.getCreatedAt());
        response.setUpdatedAt(healthData.getUpdatedAt());
        return response;
    }
}
