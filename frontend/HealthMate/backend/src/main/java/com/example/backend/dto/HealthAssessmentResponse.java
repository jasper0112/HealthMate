package com.example.backend.dto;

import com.example.backend.entity.HealthAssessment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HealthAssessmentResponse {
    
    private Long id;
    private Long userId;
    private String username;
    private LocalDateTime assessedAt;
    private HealthAssessment.AssessmentType type;
    private String summary;
    private String detailedReport;
    private HealthAssessment.RiskLevel overallRiskLevel;
    private BigDecimal overallScore;
    private String keyFindings;
    private String recommendations;
    private String aiInsights;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HealthAssessmentResponse fromHealthAssessment(HealthAssessment assessment) {
        HealthAssessmentResponse response = new HealthAssessmentResponse();
        response.setId(assessment.getId());
        response.setUserId(assessment.getUser().getId());
        response.setUsername(assessment.getUser().getUsername());
        response.setAssessedAt(assessment.getAssessedAt());
        response.setType(assessment.getType());
        response.setSummary(assessment.getSummary());
        response.setDetailedReport(assessment.getDetailedReport());
        response.setOverallRiskLevel(assessment.getOverallRiskLevel());
        response.setOverallScore(assessment.getOverallScore());
        response.setKeyFindings(assessment.getKeyFindings());
        response.setRecommendations(assessment.getRecommendations());
        response.setAiInsights(assessment.getAiInsights());
        response.setCreatedAt(assessment.getCreatedAt());
        response.setUpdatedAt(assessment.getUpdatedAt());
        return response;
    }
}
