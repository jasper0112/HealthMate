package com.example.backend.service;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.HealthDataResponse;
import com.example.backend.entity.HealthAssessment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAssessmentService {
    
    @Value("${gemini.enabled:false}")
    private Boolean geminiEnabled;
    
    @Autowired(required = false)
    private WebClient geminiWebClient;
    
    @Autowired(required = false)
    private GeminiConfig geminiConfig;
    
    @Value("${gemini.model:gemini-2.5-pro}")
    private String model;
    
    @Value("${gemini.max-tokens:8000}")
    private Integer maxTokens;
    
    @Value("${gemini.temperature:0.7}")
    private Double temperature;
    
    /**
     * Generate professional health assessment report using Gemini 2.5 Pro
     */
    public HealthAssessment generateGeminiAssessment(List<HealthDataResponse> healthDataList, 
                                                     HealthAssessment.AssessmentType type) {
        
        // Throw exception if Gemini is not enabled or configured
        if (!geminiEnabled || geminiWebClient == null || geminiConfig == null) {
            throw new RuntimeException("Gemini is not enabled or configured. Please check your configuration.");
        }
        
        // Create base assessment object
        HealthAssessment baseAssessment = new HealthAssessment();
        baseAssessment.setType(type);
        
        // Generate professional report content using Gemini
        try {
            String healthDataSummary = formatHealthDataForGemini(healthDataList);
            String baseAssessmentSummary = formatBaseAssessmentForGemini(baseAssessment);
            
            String prompt = buildGeminiPrompt(healthDataSummary, baseAssessmentSummary, type);
            
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", List.of(Map.of("text", prompt)));
            requestBody.put("contents", List.of(contents));
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", maxTokens);
            generationConfig.put("temperature", temperature);
            requestBody.put("generationConfig", generationConfig);
            
            // Call Gemini API
            String apiKey = geminiConfig.getApiKey();
            String uri = String.format("/models/%s:generateContent?key=%s", model, apiKey);
            
            String response = geminiWebClient.post()
                    .uri(uri)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            // Parse response using simple string processing
            if (response != null) {
                // Extract Gemini response text
                String geminiResponse = extractResponseText(response);
                
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    // Parse Gemini response and update assessment report
                    return parseGeminiResponse(baseAssessment, geminiResponse);
                }
            }
            
            // Throw exception if parsing fails
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            // Throw exception if Gemini call fails
            System.err.println("Gemini call failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Gemini assessment failed", e);
        }
    }
    
    private String extractResponseText(String jsonResponse) {
        // Simple extraction of text field
        try {
            int textStart = jsonResponse.indexOf("\"text\":\"");
            if (textStart > 0) {
                textStart += 8; // Skip "text":"
                int textEnd = jsonResponse.indexOf("\"", textStart);
                if (textEnd > textStart) {
                    return jsonResponse.substring(textStart, textEnd);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to extract text: " + e.getMessage());
        }
        return null;
    }
    
    private String buildGeminiPrompt(String healthDataSummary, String baseAssessment, HealthAssessment.AssessmentType type) {
        return String.format(
            "You are a professional health assessment AI assistant. Based on the following health data and preliminary assessment, generate a professional health assessment report.\n\n" +
            "Health Data Summary:\n%s\n\n" +
            "Preliminary Assessment:\n%s\n\n" +
            "Assessment Type: %s\n\n" +
            "Please provide the following content (return in JSON format):\n" +
            "{\n" +
            "  \"summary\": \"Detailed health assessment summary (200-300 words, professional and easy to understand)\",\n" +
            "  \"keyFindings\": \"Key findings (each finding on a new line with • mark, friendly language)\",\n" +
            "  \"recommendations\": \"Personalized recommendations (each recommendation on a new line with • mark, specific and feasible)\",\n" +
            "  \"aiInsights\": \"AI insights (200-300 words, deep analysis and personalized advice)\"\n" +
            "}\n\n" +
            "Please reply in English, and the language should be professional, friendly, and easy to understand.",
            healthDataSummary,
            baseAssessment,
            getTypeDescription(type)
        );
    }
    
    private String getTypeDescription(HealthAssessment.AssessmentType type) {
        switch (type) {
            case GENERAL:
                return "General Health Assessment";
            case CARDIOVASCULAR:
                return "Cardiovascular Health Assessment";
            case NUTRITION:
                return "Nutrition Health Assessment";
            case FITNESS:
                return "Fitness Health Assessment";
            case MENTAL_HEALTH:
                return "Mental Health Assessment";
            case COMPREHENSIVE:
                return "Comprehensive Health Assessment";
            default:
                return "Health Assessment";
        }
    }
    
    private String formatHealthDataForGemini(List<HealthDataResponse> dataList) {
        if (dataList == null || dataList.isEmpty()) {
            return "No health data available";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("A total of %d health records:\n", dataList.size()));
        
        for (HealthDataResponse data : dataList) {
            sb.append("- ");
            if (data.getBmi() != null) {
                sb.append(String.format("BMI: %.1f, ", data.getBmi().doubleValue()));
            }
            if (data.getSystolicPressure() != null && data.getDiastolicPressure() != null) {
                sb.append(String.format("Blood Pressure: %d/%d, ", data.getSystolicPressure(), data.getDiastolicPressure()));
            }
            if (data.getHeartRate() != null) {
                sb.append(String.format("Heart Rate: %d, ", data.getHeartRate()));
            }
            if (data.getSleepHours() != null) {
                sb.append(String.format("Sleep: %d hours, ", data.getSleepHours()));
            }
            if (data.getSteps() != null) {
                sb.append(String.format("Steps: %d", data.getSteps()));
            }
            sb.append("\n");
        }
        
        return sb.toString();
    }
    
    private String formatBaseAssessmentForGemini(HealthAssessment assessment) {
        // Generate brief health data summary
        return "Health data is being analyzed, waiting for professional assessment report to be generated.";
    }
    
    private HealthAssessment parseGeminiResponse(HealthAssessment baseAssessment, String geminiResponse) {
        try {
            // Simple JSON field extraction
            // Extract summary
            String summary = extractJsonField(geminiResponse, "summary");
            if (summary != null) {
                baseAssessment.setSummary(summary);
            } else {
                baseAssessment.setSummary("Health assessment analysis completed");
            }
            
            // Extract keyFindings
            String keyFindings = extractJsonField(geminiResponse, "keyFindings");
            if (keyFindings != null) {
                baseAssessment.setKeyFindings(keyFindings);
            } else {
                baseAssessment.setKeyFindings("No key findings");
            }
            
            // Extract recommendations
            String recommendations = extractJsonField(geminiResponse, "recommendations");
            if (recommendations != null) {
                baseAssessment.setRecommendations(recommendations);
            } else {
                baseAssessment.setRecommendations("Suggest maintaining a healthy lifestyle");
            }
            
            // Extract aiInsights
            String aiInsights = extractJsonField(geminiResponse, "aiInsights");
            if (aiInsights != null) {
                baseAssessment.setAiInsights(aiInsights);
            } else {
                baseAssessment.setAiInsights("AI analysis completed, recommend regular health checkups");
            }
            
            // Set default score and risk level
            baseAssessment.setOverallScore(BigDecimal.valueOf(75.0));
            baseAssessment.setOverallRiskLevel(HealthAssessment.RiskLevel.MODERATE);
            
            // Update detailed report
            baseAssessment.setDetailedReport(
                "# Gemini AI Health Assessment Report\n\n" +
                (summary != null ? summary : "Health assessment analysis completed") + "\n\n" +
                "## Key Findings\n" + (keyFindings != null ? keyFindings : "No key findings") + "\n\n" +
                "## Recommendations\n" + (recommendations != null ? recommendations : "Suggest maintaining a healthy lifestyle") + "\n\n" +
                "## AI Insights\n" + (aiInsights != null ? aiInsights : "AI analysis completed, recommend regular health checkups")
            );
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            e.printStackTrace();
            // Set default values
            baseAssessment.setSummary("Health assessment completed");
            baseAssessment.setKeyFindings("No key findings");
            baseAssessment.setRecommendations("Suggest maintaining a healthy lifestyle");
            baseAssessment.setAiInsights("AI analysis completed");
            baseAssessment.setOverallScore(BigDecimal.valueOf(75.0));
            baseAssessment.setOverallRiskLevel(HealthAssessment.RiskLevel.MODERATE);
        }
        
        return baseAssessment;
    }
    
    private String extractJsonField(String json, String fieldName) {
        try {
            String searchPattern = "\"" + fieldName + "\":\"";
            int start = json.indexOf(searchPattern);
            if (start > 0) {
                start += searchPattern.length();
                // Find end position
                int end = json.indexOf("\"", start);
                // Check for escaped quotes
                while (end > start && end < json.length() - 1 && json.charAt(end - 1) == '\\') {
                    end = json.indexOf("\"", end + 1);
                }
                if (end > start) {
                    String value = json.substring(start, end);
                    // Handle escaped characters
                    return value.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to extract field " + fieldName + ": " + e.getMessage());
        }
        return null;
    }
}
