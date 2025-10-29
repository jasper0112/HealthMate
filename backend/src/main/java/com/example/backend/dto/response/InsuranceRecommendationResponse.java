package com.example.backend.dto.response;

import com.example.backend.entity.InsuranceRecommendation;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InsuranceRecommendationResponse {
    
    private Long insuranceRecommendationId;
    private Long userId;
    private String username;
    private InsuranceRecommendation.RecommendationReason reason;
    private String recommendationSummary;
    private String detailedRecommendation;
    private String recommendedProducts;
    private String userProfileAnalysis;
    private String benefits;
    private String considerations;
    private LocalDateTime recommendationDate;
    private LocalDateTime createdAt;
    
    public static InsuranceRecommendationResponse fromInsuranceRecommendation(InsuranceRecommendation recommendation) {
        InsuranceRecommendationResponse response = new InsuranceRecommendationResponse();
        response.setInsuranceRecommendationId(recommendation.getInsuranceRecommendationId());
        response.setUserId(recommendation.getUser().getId());
        response.setUsername(recommendation.getUser().getUsername());
        response.setReason(recommendation.getReason());
        response.setRecommendationSummary(recommendation.getRecommendationSummary());
        response.setDetailedRecommendation(recommendation.getDetailedRecommendation());
        response.setRecommendedProducts(recommendation.getRecommendedProducts());
        response.setUserProfileAnalysis(recommendation.getUserProfileAnalysis());
        response.setBenefits(recommendation.getBenefits());
        response.setConsiderations(recommendation.getConsiderations());
        response.setRecommendationDate(recommendation.getRecommendationDate());
        response.setCreatedAt(recommendation.getCreatedAt());
        return response;
    }
}

