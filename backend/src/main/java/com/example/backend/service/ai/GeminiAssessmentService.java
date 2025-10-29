package com.example.backend.service.ai;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.response.HealthDataResponse;
import com.example.backend.entity.HealthAssessment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
            
            // Debug: Print full API response
            System.out.println("==========================================");
            System.out.println("Gemini API Full Response:");
            System.out.println("==========================================");
            System.out.println(response);
            System.out.println("==========================================");
            
            // Parse response using simple string processing
            if (response != null) {
                // Extract Gemini response text
                String geminiResponse = extractResponseText(response);
                
                // Debug: Print extracted text
                System.out.println("Extracted Gemini Response Text:");
                System.out.println(geminiResponse != null ? geminiResponse : "NULL (extraction failed)");
                System.out.println("==========================================");
                
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    // Parse Gemini response and update assessment report
                    return parseGeminiResponse(baseAssessment, geminiResponse);
                }
            }
            
            // Throw exception if parsing fails
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            // Throw exception if Gemini call fails
            System.err.println("==========================================");
            System.err.println("Gemini call failed!");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("==========================================");
            e.printStackTrace();
            throw new RuntimeException("Gemini assessment failed: " + e.getMessage(), e);
        }
    }
    
    private String extractResponseText(String jsonResponse) {
        System.out.println("----------------------------------------");
        System.out.println("Attempting to extract text from response using Jackson...");
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonResponse);
            
            // Navigate: candidates[0].content.parts[0].text
            JsonNode candidates = rootNode.path("candidates");
            if (!candidates.isArray() || candidates.size() == 0) {
                System.err.println("No candidates found or candidates is empty");
                System.out.println("----------------------------------------");
                return null;
            }
            
            JsonNode firstCandidate = candidates.get(0);
            JsonNode content = firstCandidate.path("content");
            JsonNode parts = content.path("parts");
            
            if (!parts.isArray() || parts.size() == 0) {
                System.err.println("No parts found or parts is empty");
                System.out.println("----------------------------------------");
                return null;
            }
            
            JsonNode firstPart = parts.get(0);
            JsonNode textNode = firstPart.path("text");
            
            if (!textNode.isTextual()) {
                System.err.println("Text field is not a string");
                System.out.println("----------------------------------------");
                return null;
            }
            
            String extractedText = textNode.asText();
            System.out.println("Extracted raw text (length: " + extractedText.length() + ")");
            System.out.println("First 200 chars: " + (extractedText.length() > 200 ? extractedText.substring(0, 200) + "..." : extractedText));
            
            // Remove markdown code block markers if present
            if (extractedText.startsWith("```json\n")) {
                extractedText = extractedText.substring(8); // Remove "```json\n"
                System.out.println("Removed ```json\\n prefix");
            } else if (extractedText.startsWith("```\n")) {
                extractedText = extractedText.substring(4); // Remove "```\n"
                System.out.println("Removed ```\\n prefix");
            } else if (extractedText.startsWith("```json")) {
                extractedText = extractedText.substring(7); // Remove "```json"
                System.out.println("Removed ```json prefix");
            } else if (extractedText.startsWith("```")) {
                extractedText = extractedText.substring(3); // Remove "```"
                System.out.println("Removed ``` prefix");
            }
            
            // Remove trailing ``` if present
            if (extractedText.endsWith("\n```")) {
                extractedText = extractedText.substring(0, extractedText.length() - 4);
                System.out.println("Removed \\n``` suffix");
            } else if (extractedText.endsWith("```")) {
                extractedText = extractedText.substring(0, extractedText.length() - 3);
                System.out.println("Removed ``` suffix");
            }
            
            // Trim whitespace
            extractedText = extractedText.trim();
            
            // Try to extract JSON from text if it's not pure JSON
            extractedText = extractJsonFromText(extractedText);
            
            System.out.println("Final extracted text (length: " + extractedText.length() + ")");
            System.out.println("First 200 chars of final: " + (extractedText.length() > 200 ? extractedText.substring(0, 200) + "..." : extractedText));
            System.out.println("----------------------------------------");
            
            return extractedText;
            
        } catch (Exception e) {
            System.err.println("Failed to extract text: " + e.getMessage());
            e.printStackTrace();
            System.out.println("----------------------------------------");
            return null;
        }
    }
    
    private String buildGeminiPrompt(String healthDataSummary, String baseAssessment, HealthAssessment.AssessmentType type) {
        return String.format(
            "You are a professional health assessment AI assistant. Based on the following health data and preliminary assessment, generate a professional health assessment report.\n\n" +
            "Health Data Summary:\n%s\n\n" +
            "Preliminary Assessment:\n%s\n\n" +
            "Assessment Type: %s\n\n" +
            "CRITICAL INSTRUCTIONS:\n" +
            "You MUST respond with ONLY valid JSON format. Do NOT include any introductory text, explanations, or closing remarks.\n" +
            "Your response MUST start directly with the opening brace { and end with the closing brace }.\n" +
            "Do NOT add any text before or after the JSON object.\n" +
            "The response must be parseable as valid JSON.\n\n" +
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
            // First, try to extract JSON if it's embedded in text
            String jsonText = extractJsonFromText(geminiResponse);
            
            // Validate that it looks like JSON
            String trimmedJson = jsonText.trim();
            if (!trimmedJson.startsWith("{") || !trimmedJson.endsWith("}")) {
                System.err.println("Response does not appear to be valid JSON (doesn't start with { or end with }). Falling back to default.");
                System.err.println("First 100 chars: " + (trimmedJson.length() > 100 ? trimmedJson.substring(0, 100) : trimmedJson));
                return baseAssessment;
            }
            
            // Use Jackson to parse JSON (handles both strings and arrays)
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(jsonText);
            
            // Extract summary
            JsonNode summaryNode = jsonNode.path("summary");
            String summary = summaryNode.isTextual() ? summaryNode.asText() : null;
            baseAssessment.setSummary(summary != null ? summary : "Health assessment analysis completed");
            
            // Extract keyFindings (may be array or string)
            String keyFindings = null;
            JsonNode keyFindingsNode = jsonNode.path("keyFindings");
            if (keyFindingsNode.isArray()) {
                // Convert array to multi-line string
                StringBuilder sb = new StringBuilder();
                for (JsonNode item : keyFindingsNode) {
                    if (item.isTextual()) {
                        sb.append(item.asText()).append("\n");
                    }
                }
                keyFindings = sb.toString().trim();
            } else if (keyFindingsNode.isTextual()) {
                keyFindings = keyFindingsNode.asText();
            }
            baseAssessment.setKeyFindings(keyFindings != null ? keyFindings : "No key findings");
            
            // Extract recommendations (may be array or string)
            String recommendations = null;
            JsonNode recommendationsNode = jsonNode.path("recommendations");
            if (recommendationsNode.isArray()) {
                // Convert array to multi-line string
                StringBuilder sb = new StringBuilder();
                for (JsonNode item : recommendationsNode) {
                    if (item.isTextual()) {
                        sb.append(item.asText()).append("\n");
                    }
                }
                recommendations = sb.toString().trim();
            } else if (recommendationsNode.isTextual()) {
                recommendations = recommendationsNode.asText();
            }
            baseAssessment.setRecommendations(recommendations != null ? recommendations : "Suggest maintaining a healthy lifestyle");
            
            // Extract aiInsights
            JsonNode aiInsightsNode = jsonNode.path("aiInsights");
            String aiInsights = aiInsightsNode.isTextual() ? aiInsightsNode.asText() : null;
            baseAssessment.setAiInsights(aiInsights != null ? aiInsights : "AI analysis completed, recommend regular health checkups");
            
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
    
    /**
     * Extract JSON object from text that might contain additional text before or after JSON
     */
    private String extractJsonFromText(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        
        // If it already looks like pure JSON (starts and ends with braces), return as is
        String trimmed = text.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            return trimmed;
        }
        
        // Try to find JSON object in the text
        int firstBrace = text.indexOf('{');
        if (firstBrace == -1) {
            System.err.println("No opening brace { found in response. Returning original text.");
            return text;
        }
        
        // Find matching closing brace by counting braces
        int braceCount = 0;
        int lastBrace = -1;
        for (int i = firstBrace; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '{') {
                braceCount++;
            } else if (c == '}') {
                braceCount--;
                if (braceCount == 0) {
                    lastBrace = i;
                    break;
                }
            }
        }
        
        if (lastBrace > firstBrace) {
            String jsonPart = text.substring(firstBrace, lastBrace + 1);
            System.out.println("Extracted JSON from text (position " + firstBrace + " to " + lastBrace + ")");
            return jsonPart.trim();
        }
        
        System.err.println("Could not find matching closing brace. Returning original text.");
        return text;
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

