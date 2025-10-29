package com.example.backend.service.ai;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.request.InsuranceRecommendationRequest;
import com.example.backend.entity.InsuranceProduct;
import com.example.backend.entity.InsuranceRecommendation;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiInsuranceService {
    
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
     * Generate professional insurance recommendation using Gemini 2.5 Pro
     */
    public void enhanceRecommendationWithGemini(InsuranceRecommendation recommendation, 
                                                User user, 
                                                InsuranceRecommendationRequest request,
                                                List<InsuranceProduct> products) {
        
        // Throw exception if Gemini is not enabled or configured
        if (!geminiEnabled || geminiWebClient == null || geminiConfig == null) {
            throw new RuntimeException("Gemini is not enabled or configured. Please check your configuration.");
        }
        
        // Generate professional recommendation content using Gemini
        try {
            String prompt = buildGeminiPrompt(user, request, products, recommendation.getReason());
            
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
            System.out.println("Gemini Insurance API Full Response:");
            System.out.println("==========================================");
            System.out.println(response);
            System.out.println("==========================================");
            
            // Parse response using Jackson
            if (response != null) {
                // Extract Gemini response text
                String geminiResponse = extractResponseText(response);
                
                // Debug: Print extracted text
                System.out.println("Extracted Gemini Insurance Response Text:");
                System.out.println(geminiResponse != null ? geminiResponse : "NULL (extraction failed)");
                System.out.println("==========================================");
                
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    // Parse Gemini response and update recommendation
                    parseGeminiResponse(recommendation, geminiResponse, products);
                    return;
                }
            }
            
            // Throw exception if parsing fails
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            // Throw exception if Gemini call fails
            System.err.println("==========================================");
            System.err.println("Gemini insurance call failed!");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("==========================================");
            e.printStackTrace();
            throw new RuntimeException("Gemini insurance recommendation failed: " + e.getMessage(), e);
        }
    }
    
    private String extractResponseText(String jsonResponse) {
        System.out.println("----------------------------------------");
        System.out.println("Attempting to extract text from insurance response using Jackson...");
        
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
    
    private String buildGeminiPrompt(User user, 
                                    InsuranceRecommendationRequest request, 
                                    List<InsuranceProduct> products,
                                    InsuranceRecommendation.RecommendationReason reason) {
        
        // Format products information
        StringBuilder productsInfo = new StringBuilder();
        for (InsuranceProduct product : products) {
            productsInfo.append(String.format("- %s by %s: Monthly $%.2f\n", 
                product.getInsuranceName(), 
                product.getProviderName(), 
                product.getMonthlyPremium()));
        }
        
        return String.format(
            "You are a professional health insurance recommendation AI assistant. Based on the following user information, request details, and available insurance products, generate professional insurance recommendations.\n\n" +
            "User Information:\n" +
            "- Name: %s\n" +
            "- Age: %s\n" +
            "- Gender: %s\n" +
            "- Email: %s\n\n" +
            "User Profile:\n" +
            "- Profile Description: %s\n" +
            "- Specific Needs: %s\n" +
            "- International Student: %s\n" +
            "- New Immigrant: %s\n" +
            "- Recommendation Reason: %s\n\n" +
            "Available Insurance Products:\n%s\n" +
            "CRITICAL INSTRUCTIONS:\n" +
            "You MUST respond with ONLY valid JSON format. Do NOT include any introductory text, explanations, or closing remarks.\n" +
            "Your response MUST start directly with the opening brace { and end with the closing brace }.\n" +
            "Do NOT add any text before or after the JSON object.\n" +
            "The response must be parseable as valid JSON.\n\n" +
            "Please provide the following content (return in JSON format):\n" +
            "{\n" +
            "  \"userProfileAnalysis\": \"Detailed analysis of the user's profile, needs, and situation (200-300 words, personalized and insightful)\",\n" +
            "  \"recommendationSummary\": \"Brief summary of the recommendation (2-3 sentences, clear and concise)\",\n" +
            "  \"detailedRecommendation\": \"Detailed insurance recommendation explanation (200-300 words, explain why these products are suitable, coverage benefits, and how they match the user's needs)\",\n" +
            "  \"benefits\": \"Key benefits of the recommended insurance products (each benefit on a new line with • mark, specific and relevant)\",\n" +
            "  \"considerations\": \"Important considerations and tips for choosing insurance (each consideration on a new line with • mark, practical advice)\"\n" +
            "}\n\n" +
            "Please reply in English, and the language should be professional, friendly, and easy to understand. " +
            "Focus on helping the user make an informed decision about health insurance.",
            user.getFullName() != null ? user.getFullName() : "Not specified",
            user.getAge() != null ? user.getAge().toString() : "Not specified",
            user.getGender() != null ? user.getGender().toString() : "Not specified",
            user.getEmail() != null ? user.getEmail() : "Not specified",
            request.getUserProfile() != null ? request.getUserProfile() : "Not specified",
            request.getSpecificNeeds() != null ? request.getSpecificNeeds() : "Not specified",
            request.getIsInternationalStudent() != null && request.getIsInternationalStudent() ? "Yes" : "No",
            request.getIsNewImmigrant() != null && request.getIsNewImmigrant() ? "Yes" : "No",
            reason != null ? reason.toString() : "GENERAL_NEED",
            productsInfo.toString()
        );
    }
    
    private void parseGeminiResponse(InsuranceRecommendation recommendation, 
                                    String geminiResponse,
                                    List<InsuranceProduct> products) {
        try {
            // First, try to extract JSON if it's embedded in text
            String jsonText = extractJsonFromText(geminiResponse);
            
            // Validate that it looks like JSON
            String trimmedJson = jsonText.trim();
            if (!trimmedJson.startsWith("{") || !trimmedJson.endsWith("}")) {
                System.err.println("Response does not appear to be valid JSON (doesn't start with { or end with }). Falling back to default.");
                System.err.println("First 100 chars: " + (trimmedJson.length() > 100 ? trimmedJson.substring(0, 100) : trimmedJson));
                return;
            }
            
            // Use Jackson to parse JSON (handles both strings and arrays)
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(jsonText);
            
            // Extract userProfileAnalysis
            String userProfileAnalysis = extractJsonFieldFromNode(jsonNode, "userProfileAnalysis");
            recommendation.setUserProfileAnalysis(userProfileAnalysis != null ? userProfileAnalysis : 
                "User profile analysis completed.");
            
            // Extract recommendationSummary
            String recommendationSummary = extractJsonFieldFromNode(jsonNode, "recommendationSummary");
            recommendation.setRecommendationSummary(recommendationSummary != null ? recommendationSummary : 
                "Based on your profile, we recommend the following health insurance options.");
            
            // Extract detailedRecommendation
            String detailedRecommendation = extractJsonFieldFromNode(jsonNode, "detailedRecommendation");
            recommendation.setDetailedRecommendation(detailedRecommendation != null ? detailedRecommendation : 
                "We've analyzed your profile and identified suitable health insurance options.");
            
            // Extract benefits
            String benefits = extractJsonFieldFromNode(jsonNode, "benefits");
            recommendation.setBenefits(benefits != null ? benefits : 
                "• Comprehensive medical coverage\n• Hospital accommodation\n• Medical services coverage\n• 24/7 health support");
            
            // Extract considerations
            String considerations = extractJsonFieldFromNode(jsonNode, "considerations");
            recommendation.setConsiderations(considerations != null ? considerations : 
                "• Compare different options\n• Check waiting periods\n• Verify coverage for your specific needs\n• Consider your budget");
            
            // Format recommended products (this is still done locally, not by Gemini)
            recommendation.setRecommendedProducts(formatProducts(products));
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini insurance response: " + e.getMessage());
            e.printStackTrace();
            // Set default values
            recommendation.setUserProfileAnalysis("User profile analysis completed.");
            recommendation.setRecommendationSummary("Based on your profile, we recommend the following health insurance options.");
            recommendation.setDetailedRecommendation("We've analyzed your profile and identified suitable health insurance options.");
            recommendation.setBenefits("• Comprehensive medical coverage\n• Hospital accommodation\n• Medical services coverage\n• 24/7 health support");
            recommendation.setConsiderations("• Compare different options\n• Check waiting periods\n• Verify coverage for your specific needs\n• Consider your budget");
            recommendation.setRecommendedProducts(formatProducts(products));
        }
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
    
    private String extractJsonFieldFromNode(JsonNode jsonNode, String fieldName) {
        JsonNode fieldNode = jsonNode.path(fieldName);
        if (fieldNode.isTextual()) {
            return fieldNode.asText();
        } else if (fieldNode.isArray()) {
            // Convert array to multi-line string
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : fieldNode) {
                if (item.isTextual()) {
                    sb.append(item.asText()).append("\n");
                }
            }
            return sb.toString().trim();
        }
        return null;
    }
    
    private String formatProducts(List<InsuranceProduct> products) {
        StringBuilder sb = new StringBuilder();
        for (InsuranceProduct product : products) {
            sb.append("- ").append(product.getInsuranceName())
              .append(" by ").append(product.getProviderName())
              .append(": Monthly $").append(product.getMonthlyPremium()).append("\n");
        }
        return sb.toString();
    }
}

