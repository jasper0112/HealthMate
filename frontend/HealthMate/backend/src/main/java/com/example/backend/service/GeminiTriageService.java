package com.example.backend.service;

import com.example.backend.config.GeminiConfig;
import com.example.backend.entity.SmartTriage;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiTriageService {
    
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
     * Generate triage recommendation using Gemini AI
     */
    public SmartTriage generateGeminiTriage(String symptomsInfo, User user, String additionalContext) {
        
        if (!geminiEnabled || geminiWebClient == null || geminiConfig == null) {
            throw new RuntimeException("Gemini is not enabled or configured.");
        }
        
        SmartTriage triage = new SmartTriage();
        triage.setUser(user);
        triage.setSymptomsInfo(symptomsInfo);
        
        try {
            String prompt = buildGeminiPrompt(symptomsInfo, user, additionalContext);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", java.util.List.of(Map.of("text", prompt)));
            requestBody.put("contents", java.util.List.of(contents));
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", maxTokens);
            generationConfig.put("temperature", temperature);
            requestBody.put("generationConfig", generationConfig);
            
            String apiKey = geminiConfig.getApiKey();
            String uri = String.format("/models/%s:generateContent?key=%s", model, apiKey);
            
            String response = geminiWebClient.post()
                    .uri(uri)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            if (response != null) {
                String geminiResponse = extractResponseText(response);
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    return parseGeminiResponse(triage, geminiResponse);
                }
            }
            
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            System.err.println("Gemini triage failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Gemini triage failed", e);
        }
    }
    
    private String extractResponseText(String jsonResponse) {
        try {
            int textStart = jsonResponse.indexOf("\"text\":\"");
            if (textStart > 0) {
                textStart += 8;
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
    
    private String buildGeminiPrompt(String symptomsInfo, User user, String additionalContext) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are a professional medical triage AI assistant. ");
        promptBuilder.append("Based on the user's symptoms and information, provide a triage recommendation.\n\n");
        
        promptBuilder.append("User Information:\n");
        promptBuilder.append("Age: ").append(calculateAge(user.getDateOfBirth())).append("\n");
        promptBuilder.append("Gender: ").append(user.getGender()).append("\n\n");
        
        promptBuilder.append("Symptoms:\n").append(symptomsInfo).append("\n\n");
        
        if (additionalContext != null && !additionalContext.isEmpty()) {
            promptBuilder.append("Additional Context:\n").append(additionalContext).append("\n\n");
        }
        
        promptBuilder.append("Please provide a triage recommendation (return as JSON):\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"priority\": \"LOW, MEDIUM, HIGH, or CRITICAL\",\n");
        promptBuilder.append("  \"triageResult\": \"Brief assessment of the condition (100-150 words)\",\n");
        promptBuilder.append("  \"recommendedAction\": \"Specific recommendation: SELF_CARE, OTC_MEDICATION, GP_APPOINTMENT, or EMERGENCY\" +\n");
        promptBuilder.append("              \" with explanation (200-300 words)\",\n");
        promptBuilder.append("  \"aiAnalysis\": \"Detailed AI analysis and reasoning (200-300 words)\"\n");
        promptBuilder.append("}\n\n");
        
        promptBuilder.append("Priority Guidelines:\n");
        promptBuilder.append("- LOW: Self-care recommended, mild symptoms\n");
        promptBuilder.append("- MEDIUM: GP appointment recommended within 24-48 hours\n");
        promptBuilder.append("- HIGH: Urgent GP or urgent care recommended\n");
        promptBuilder.append("- CRITICAL: Emergency care needed immediately\n\n");
        
        promptBuilder.append("Please be professional, clear, and cautious. ");
        promptBuilder.append("When in doubt, recommend professional medical consultation.");
        
        return promptBuilder.toString();
    }
    
    private int calculateAge(java.time.LocalDateTime dateOfBirth) {
        if (dateOfBirth == null) return 0;
        return java.time.LocalDateTime.now().getYear() - dateOfBirth.getYear();
    }
    
    private SmartTriage parseGeminiResponse(SmartTriage triage, String geminiResponse) {
        try {
            String priorityStr = extractJsonField(geminiResponse, "priority");
            if (priorityStr != null) {
                SmartTriage.TriagePriority priority = parsePriority(priorityStr);
                triage.setPriority(priority);
            } else {
                triage.setPriority(SmartTriage.TriagePriority.MEDIUM);
            }
            
            triage.setTriageResult(extractJsonField(geminiResponse, "triageResult"));
            triage.setRecommendedAction(extractJsonField(geminiResponse, "recommendedAction"));
            triage.setAiAnalysis(extractJsonField(geminiResponse, "aiAnalysis"));
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            setDefaultTriage(triage);
        }
        
        return triage;
    }
    
    private SmartTriage.TriagePriority parsePriority(String priorityStr) {
        try {
            return SmartTriage.TriagePriority.valueOf(priorityStr.trim().toUpperCase());
        } catch (Exception e) {
            return SmartTriage.TriagePriority.MEDIUM;
        }
    }
    
    private void setDefaultTriage(SmartTriage triage) {
        triage.setPriority(SmartTriage.TriagePriority.MEDIUM);
        triage.setTriageResult("Based on your symptoms, a medical consultation is recommended.");
        triage.setRecommendedAction("Please book a GP appointment to discuss your symptoms with a healthcare professional.");
        triage.setAiAnalysis("It's important to seek professional medical advice for proper diagnosis and treatment.");
    }
    
    private String extractJsonField(String json, String fieldName) {
        try {
            String searchPattern = "\"" + fieldName + "\":\"";
            int start = json.indexOf(searchPattern);
            if (start > 0) {
                start += searchPattern.length();
                int end = json.indexOf("\"", start);
                while (end > start && end < json.length() - 1 && json.charAt(end - 1) == '\\') {
                    end = json.indexOf("\"", end + 1);
                }
                if (end > start) {
                    String value = json.substring(start, end);
                    return value.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to extract field " + fieldName + ": " + e.getMessage());
        }
        return null;
    }
}
