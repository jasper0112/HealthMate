package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InsuranceRecommendationRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String userProfile; // International student, new immigrant, etc.
    
    private String specificNeeds; // Budget, coverage type, etc.
    
    private Boolean isInternationalStudent = false;
    
    private Boolean isNewImmigrant = false;
}

