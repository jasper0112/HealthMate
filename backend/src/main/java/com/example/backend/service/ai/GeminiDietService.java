package com.example.backend.service.ai;

import com.example.backend.config.GeminiConfig;
import com.example.backend.entity.DietGuidance;
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
public class GeminiDietService {
    
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
     * Generate professional diet guidance using Gemini 2.5 Pro
     */
    public DietGuidance generateGeminiDietGuidance(User user, String healthIssue) {
        
        // Throw exception if Gemini is not enabled or configured
        if (!geminiEnabled || geminiWebClient == null || geminiConfig == null) {
            throw new RuntimeException("Gemini is not enabled or configured. Please check your configuration.");
        }
        
        // Create base guidance object
        DietGuidance baseGuidance = new DietGuidance();
        baseGuidance.setUser(user);
        baseGuidance.setHealthIssue(healthIssue);
        
        // Generate professional guidance content using Gemini
        try {
            String prompt = buildGeminiPrompt(user, healthIssue);
            
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
            System.out.println("Gemini Diet API Full Response:");
            System.out.println("==========================================");
            System.out.println(response);
            System.out.println("==========================================");
            
            // Parse response using Jackson
            if (response != null) {
                // Extract Gemini response text
                String geminiResponse = extractResponseText(response);
                
                // Debug: Print extracted text
                System.out.println("Extracted Gemini Diet Response Text:");
                System.out.println(geminiResponse != null ? geminiResponse : "NULL (extraction failed)");
                System.out.println("==========================================");
                
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    // Parse Gemini response and update guidance
                    return parseGeminiResponse(baseGuidance, geminiResponse);
                }
            }
            
            // Throw exception if parsing fails
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            // Throw exception if Gemini call fails
            System.err.println("==========================================");
            System.err.println("Gemini diet call failed!");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("==========================================");
            e.printStackTrace();
            throw new RuntimeException("Gemini diet guidance failed: " + e.getMessage(), e);
        }
    }
    
    private String extractResponseText(String jsonResponse) {
        System.out.println("----------------------------------------");
        System.out.println("Attempting to extract text from diet response using Jackson...");
        
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
    
    private String buildGeminiPrompt(User user, String healthIssue) {
        return String.format(
            "You are a professional nutrition and diet guidance AI assistant. Based on the following user information and health issue, generate professional dietary guidance.\n\n" +
            "User Information:\n" +
            "- Age: %s\n" +
            "- Gender: %s\n" +
            "- Health Issue: %s\n\n" +
            "CRITICAL INSTRUCTIONS:\n" +
            "You MUST respond with ONLY valid JSON format. Do NOT include any introductory text, explanations, or closing remarks.\n" +
            "Your response MUST start directly with the opening brace { and end with the closing brace }.\n" +
            "Do NOT add any text before or after the JSON object.\n" +
            "The response must be parseable as valid JSON.\n\n" +
            "Please provide the following content (return in JSON format):\n" +
            "{\n" +
            "  \"foodRecommendations\": \"Recommended foods to eat (each food on a new line with • mark, include variety and specific examples)\",\n" +
            "  \"avoidFoods\": \"Foods to avoid or limit (each food on a new line with • mark)\",\n" +
            "  \"supplementRecommendations\": \"Recommended nutritional supplements (each supplement on a new line with • mark, include dosage considerations)\",\n" +
            "  \"mealSuggestions\": \"Meal planning suggestions and recommendations (detailed, practical advice)\",\n" +
            "  \"cookingTips\": \"Cooking and meal preparation tips (practical, easy-to-follow advice)\",\n" +
            "  \"nutritionalBenefits\": \"Benefits of the recommended foods and dietary approach (explain why these choices are beneficial)\",\n" +
            "  \"sampleMenu\": \"Sample daily menu or meal plan (breakfast, lunch, dinner, snacks)\",\n" +
            "  \"guidance\": \"Overall dietary guidance and advice (200-300 words, professional, personalized, and helpful)\"\n" +
            "}\n\n" +
            "Please reply in English, and the language should be professional, friendly, and easy to understand. " +
            "Always remind users to consult registered dietitians or healthcare professionals for personalized meal plans.",
            user.getAge() != null ? user.getAge().toString() : "Not specified",
            user.getGender() != null ? user.getGender().toString() : "Not specified",
            healthIssue
        );
    }
    
    private DietGuidance parseGeminiResponse(DietGuidance baseGuidance, String geminiResponse) {
        try {
            // First, try to extract JSON if it's embedded in text
            String jsonText = extractJsonFromText(geminiResponse);
            
            // Validate that it looks like JSON
            String trimmedJson = jsonText.trim();
            if (!trimmedJson.startsWith("{") || !trimmedJson.endsWith("}")) {
                System.err.println("Response does not appear to be valid JSON (doesn't start with { or end with }). Falling back to default.");
                System.err.println("First 100 chars: " + (trimmedJson.length() > 100 ? trimmedJson.substring(0, 100) : trimmedJson));
                return baseGuidance;
            }
            
            // Use Jackson to parse JSON (handles both strings and arrays)
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(jsonText);
            
            // Extract foodRecommendations
            String foodRecommendations = extractJsonFieldFromNode(jsonNode, "foodRecommendations");
            baseGuidance.setFoodRecommendations(foodRecommendations != null ? foodRecommendations : "Focus on whole, unprocessed foods with variety.");
            
            // Extract avoidFoods
            String avoidFoods = extractJsonFieldFromNode(jsonNode, "avoidFoods");
            baseGuidance.setAvoidFoods(avoidFoods != null ? avoidFoods : "Limit processed foods, excessive sugar and salt.");
            
            // Extract supplementRecommendations
            String supplementRecommendations = extractJsonFieldFromNode(jsonNode, "supplementRecommendations");
            baseGuidance.setSupplementRecommendations(supplementRecommendations != null ? supplementRecommendations : "Consult healthcare professional for supplement needs.");
            
            // Extract mealSuggestions
            String mealSuggestions = extractJsonFieldFromNode(jsonNode, "mealSuggestions");
            baseGuidance.setMealSuggestions(mealSuggestions != null ? mealSuggestions : "Balance all food groups. Include variety to ensure nutrient diversity.");
            
            // Extract cookingTips (optional)
            String cookingTips = extractJsonFieldFromNode(jsonNode, "cookingTips");
            if (cookingTips != null && !cookingTips.isEmpty()) {
                baseGuidance.setCookingTips(cookingTips);
            }
            
            // Extract nutritionalBenefits
            String nutritionalBenefits = extractJsonFieldFromNode(jsonNode, "nutritionalBenefits");
            baseGuidance.setNutritionalBenefits(nutritionalBenefits != null ? nutritionalBenefits : "Provides essential nutrients for overall health and well-being.");
            
            // Extract sampleMenu (optional)
            String sampleMenu = extractJsonFieldFromNode(jsonNode, "sampleMenu");
            if (sampleMenu != null && !sampleMenu.isEmpty()) {
                baseGuidance.setSampleMenu(sampleMenu);
            }
            
            // Extract guidance
            String guidance = extractJsonFieldFromNode(jsonNode, "guidance");
            baseGuidance.setGuidance(guidance != null ? guidance : "Maintain a balanced diet with variety. Focus on whole foods and stay hydrated. Consider consulting a nutritionist for personalized advice.");
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini diet response: " + e.getMessage());
            e.printStackTrace();
            // Set default values
            baseGuidance.setFoodRecommendations("Focus on whole, unprocessed foods with variety.");
            baseGuidance.setAvoidFoods("Limit processed foods, excessive sugar and salt.");
            baseGuidance.setSupplementRecommendations("Consult healthcare professional for supplement needs.");
            baseGuidance.setMealSuggestions("Balance all food groups. Include variety to ensure nutrient diversity.");
            baseGuidance.setNutritionalBenefits("Provides essential nutrients for overall health and well-being.");
            baseGuidance.setGuidance("Maintain a balanced diet with variety. Focus on whole foods and stay hydrated. Consider consulting a nutritionist for personalized advice.");
        }
        
        return baseGuidance;
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
}

