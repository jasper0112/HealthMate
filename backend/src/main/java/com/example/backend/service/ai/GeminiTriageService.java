package com.example.backend.service.ai;

import com.example.backend.config.GeminiConfig;
import com.example.backend.entity.SmartTriage;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
            
            // Debug: Print full API response
            System.out.println("==========================================");
            System.out.println("Gemini Triage API Full Response:");
            System.out.println("==========================================");
            System.out.println(response);
            System.out.println("==========================================");
            
            if (response != null) {
                String geminiResponse = extractResponseText(response);
                
                // Debug: Print extracted text
                System.out.println("Extracted Gemini Response Text:");
                System.out.println(geminiResponse != null ? (geminiResponse.length() > 500 ? geminiResponse.substring(0, 500) + "..." : geminiResponse) : "NULL (extraction failed)");
                System.out.println("==========================================");
                
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    return parseGeminiResponse(triage, geminiResponse);
                }
            }
            
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            System.err.println("==========================================");
            System.err.println("Gemini triage failed!");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("==========================================");
            e.printStackTrace();
            throw new RuntimeException("Gemini triage failed: " + e.getMessage(), e);
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
        
        promptBuilder.append("CRITICAL INSTRUCTIONS:\n");
        promptBuilder.append("You MUST respond with ONLY valid JSON format. Do NOT include any introductory text, explanations, or closing remarks.\n");
        promptBuilder.append("Your response MUST start directly with the opening brace { and end with the closing brace }.\n");
        promptBuilder.append("Do NOT add any text before or after the JSON object.\n");
        promptBuilder.append("The response must be parseable as valid JSON.\n\n");
        
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
            // First, try to extract JSON if it's embedded in text
            String jsonText = extractJsonFromText(geminiResponse);
            
            // Validate that it looks like JSON
            String trimmedJson = jsonText.trim();
            if (!trimmedJson.startsWith("{") || !trimmedJson.endsWith("}")) {
                System.err.println("Response does not appear to be valid JSON (doesn't start with { or end with }). Falling back to default.");
                System.err.println("First 100 chars: " + (trimmedJson.length() > 100 ? trimmedJson.substring(0, 100) : trimmedJson));
                return triage;
            }
            
            // Use Jackson to parse JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(jsonText);
            
            // Extract priority
            JsonNode priorityNode = jsonNode.path("priority");
            if (priorityNode.isTextual()) {
                String priorityStr = priorityNode.asText();
                SmartTriage.TriagePriority priority = parsePriority(priorityStr);
                triage.setPriority(priority);
            } else {
                triage.setPriority(SmartTriage.TriagePriority.MEDIUM);
            }
            
            // Extract other fields
            JsonNode triageResultNode = jsonNode.path("triageResult");
            triage.setTriageResult(triageResultNode.isTextual() ? triageResultNode.asText() : null);
            
            JsonNode recommendedActionNode = jsonNode.path("recommendedAction");
            triage.setRecommendedAction(recommendedActionNode.isTextual() ? recommendedActionNode.asText() : null);
            
            JsonNode aiAnalysisNode = jsonNode.path("aiAnalysis");
            triage.setAiAnalysis(aiAnalysisNode.isTextual() ? aiAnalysisNode.asText() : null);
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            e.printStackTrace();
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
