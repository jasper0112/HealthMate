package com.example.backend.dto;

import com.example.backend.entity.MedicationGuidance;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedicationGuidanceResponse {
    
    private Long medGuidanceId;
    private Long userId;
    private String username;
    private String symptoms;
    private String conditionDescription;
    private String otcMedications;
    private String usageInstructions;
    private String precautions;
    private String sideEffects;
    private String recommendedPharmacies;
    private String priceComparison;
    private String guidance;
    private LocalDateTime createdAt;
    
    public static MedicationGuidanceResponse fromMedicationGuidance(MedicationGuidance guidance) {
        MedicationGuidanceResponse response = new MedicationGuidanceResponse();
        response.setMedGuidanceId(guidance.getMedGuidanceId());
        response.setUserId(guidance.getUser().getId());
        response.setUsername(guidance.getUser().getUsername());
        response.setSymptoms(guidance.getSymptoms());
        response.setConditionDescription(guidance.getConditionDescription());
        response.setOtcMedications(guidance.getOtcMedications());
        response.setUsageInstructions(guidance.getUsageInstructions());
        response.setPrecautions(guidance.getPrecautions());
        response.setSideEffects(guidance.getSideEffects());
        response.setRecommendedPharmacies(guidance.getRecommendedPharmacies());
        response.setPriceComparison(guidance.getPriceComparison());
        response.setGuidance(guidance.getGuidance());
        response.setCreatedAt(guidance.getCreatedAt());
        return response;
    }
}
