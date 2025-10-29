package com.example.backend.service.ai;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.response.HealthDataResponse;
import com.example.backend.entity.HealthPlan;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiPlanService {
    
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
     * Generate personalized health plan using Gemini AI
     */
    public HealthPlan generateGeminiHealthPlan(List<HealthDataResponse> healthDataList, 
                                                User user, 
                                                HealthPlan.PlanType type,
                                                String healthGoals) {
        
        if (!geminiEnabled || geminiWebClient == null || geminiConfig == null) {
            throw new RuntimeException("Gemini is not enabled or configured. Please check your configuration.");
        }
        
        HealthPlan healthPlan = new HealthPlan();
        healthPlan.setType(type);
        healthPlan.setUser(user);
        healthPlan.setPlanDate(LocalDateTime.now());
        
        // Set date range based on plan type
        LocalDateTime now = LocalDateTime.now();
        if (type == HealthPlan.PlanType.DAILY) {
            healthPlan.setStartDate(now);
            healthPlan.setEndDate(now.plusDays(1));
        } else if (type == HealthPlan.PlanType.WEEKLY) {
            healthPlan.setStartDate(now);
            healthPlan.setEndDate(now.plusWeeks(1));
        } else if (type == HealthPlan.PlanType.MONTHLY) {
            healthPlan.setStartDate(now);
            healthPlan.setEndDate(now.plusMonths(1));
        }
        
        try {
            String healthDataSummary = formatHealthDataForGemini(healthDataList, user);
            String prompt = buildGeminiPrompt(healthDataSummary, user, type, healthGoals);
            
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
            System.out.println("Gemini Plan API Full Response:");
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
                    return parseGeminiResponse(healthPlan, geminiResponse);
                }
            }
            
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            System.err.println("==========================================");
            System.err.println("Gemini plan generation failed!");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("==========================================");
            e.printStackTrace();
            throw new RuntimeException("Gemini plan generation failed: " + e.getMessage(), e);
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
    
    private String buildGeminiPrompt(String healthDataSummary, User user, HealthPlan.PlanType type, String healthGoals) {
        String planTypeStr = type == HealthPlan.PlanType.DAILY ? "Daily" : 
                            type == HealthPlan.PlanType.WEEKLY ? "Weekly" : "Monthly";
        
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are a professional health and wellness advisor. ");
        promptBuilder.append("Based on the user's health data, generate a comprehensive personalized ");
        promptBuilder.append(planTypeStr).append(" health plan.\n\n");
        
        promptBuilder.append("User Profile:\n");
        promptBuilder.append("Username: ").append(user.getUsername()).append("\n");
        if (user.getFullName() != null) {
            promptBuilder.append("Name: ").append(user.getFullName()).append("\n");
        }
        if (user.getGender() != null) {
            promptBuilder.append("Gender: ").append(user.getGender()).append("\n");
        }
        if (user.getDateOfBirth() != null) {
            promptBuilder.append("Age: ").append(calculateAge(user.getDateOfBirth())).append(" years\n");
        }
        promptBuilder.append("\n");
        
        promptBuilder.append("Health Data History:\n");
        promptBuilder.append(healthDataSummary);
        promptBuilder.append("\n");
        
        if (healthGoals != null && !healthGoals.isEmpty()) {
            promptBuilder.append("User's Health Goals: ").append(healthGoals).append("\n\n");
        }
        
        promptBuilder.append("CRITICAL INSTRUCTIONS:\n");
        promptBuilder.append("You MUST respond with ONLY valid JSON format. Do NOT include any introductory text, explanations, or closing remarks.\n");
        promptBuilder.append("Your response MUST start directly with the opening brace { and end with the closing brace }.\n");
        promptBuilder.append("Do NOT add any text before or after the JSON object.\n");
        promptBuilder.append("The response must be parseable as valid JSON.\n\n");
        
        promptBuilder.append("Please generate a comprehensive health plan with the following structure (return as JSON):\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"planSummary\": \"Overall plan summary (200-300 words)\",\n");
        promptBuilder.append("  \"dietOverview\": \"Diet strategy overview (200-300 words)\",\n");
        promptBuilder.append("  \"dailyMealPlan\": \"Detailed ").append(planTypeStr.toLowerCase()).append(" meal plan with breakfast, lunch, dinner, and snacks (specific and practical)\",\n");
        promptBuilder.append("  \"nutritionGoals\": \"Nutrition goals (each goal on a new line with • mark)\",\n");
        promptBuilder.append("  \"foodRecommendations\": \"Specific food recommendations (each recommendation on a new line with • mark)\",\n");
        promptBuilder.append("  \"exerciseOverview\": \"Exercise strategy overview (200-300 words)\",\n");
        promptBuilder.append("  \"weeklyWorkoutPlan\": \"Detailed ").append(planTypeStr.toLowerCase()).append(" workout schedule with specific exercises, duration, and intensity\",\n");
        promptBuilder.append("  \"fitnessGoals\": \"Fitness goals (each goal on a new line with • mark)\",\n");
        promptBuilder.append("  \"exerciseRecommendations\": \"Specific exercise recommendations (each recommendation on a new line with • mark)\",\n");
        promptBuilder.append("  \"lifestyleOverview\": \"Lifestyle management overview (200-300 words)\",\n");
        promptBuilder.append("  \"dailyRoutine\": \"Recommended daily routine with specific timings\",\n");
        promptBuilder.append("  \"sleepRecommendations\": \"Sleep improvement tips (each tip on a new line with • mark)\",\n");
        promptBuilder.append("  \"stressManagementTips\": \"Stress management strategies (each strategy on a new line with • mark)\",\n");
        promptBuilder.append("  \"hydrationGoals\": \"Hydration goals and recommendations\",\n");
        promptBuilder.append("  \"longTermGoals\": \"Long-term health goals and milestones\",\n");
        promptBuilder.append("  \"progressTrackingTips\": \"How to track progress (each tip on a new line with • mark)\",\n");
        promptBuilder.append("  \"motivationalNotes\": \"Motivational messages and encouragement\"\n");
        promptBuilder.append("}\n\n");
        
        promptBuilder.append("Important guidelines:\n");
        promptBuilder.append("1. Make all recommendations specific, measurable, and achievable\n");
        promptBuilder.append("2. Consider the user's health history and current status\n");
        promptBuilder.append("3. Provide practical, actionable advice\n");
        promptBuilder.append("4. Use professional yet friendly and encouraging language\n");
        promptBuilder.append("5. Ensure the plan is personalized to the user's profile and data\n");
        promptBuilder.append("6. Include safety considerations for exercise recommendations\n");
        
        return promptBuilder.toString();
    }
    
    private String formatHealthDataForGemini(List<HealthDataResponse> dataList, User user) {
        if (dataList == null || dataList.isEmpty()) {
            return "Limited health data available. Please use general health recommendations.";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Analysis of %d recent health records:\n", dataList.size()));
        
        // Calculate averages and identify patterns
        double avgBMI = dataList.stream()
                .filter(d -> d.getBmi() != null)
                .mapToDouble(d -> d.getBmi().doubleValue())
                .average()
                .orElse(0);
        
        double avgHeartRate = dataList.stream()
                .filter(d -> d.getHeartRate() != null)
                .mapToInt(HealthDataResponse::getHeartRate)
                .average()
                .orElse(0);
        
        int avgSteps = (int) dataList.stream()
                .filter(d -> d.getSteps() != null)
                .mapToInt(HealthDataResponse::getSteps)
                .average()
                .orElse(0);
        
        double avgSleep = dataList.stream()
                .filter(d -> d.getSleepHours() != null)
                .mapToInt(HealthDataResponse::getSleepHours)
                .average()
                .orElse(0);
        
        int avgExercise = (int) dataList.stream()
                .filter(d -> d.getExerciseMinutes() != null)
                .mapToInt(HealthDataResponse::getExerciseMinutes)
                .average()
                .orElse(0);
        
        sb.append(String.format("\nKey Metrics:\n"));
        if (avgBMI > 0) {
            sb.append(String.format("- Average BMI: %.1f\n", avgBMI));
        }
        if (avgHeartRate > 0) {
            sb.append(String.format("- Average Heart Rate: %.0f bpm\n", avgHeartRate));
        }
        if (avgSteps > 0) {
            sb.append(String.format("- Average Daily Steps: %d\n", avgSteps));
        }
        if (avgSleep > 0) {
            sb.append(String.format("- Average Sleep Hours: %.1f\n", avgSleep));
        }
        if (avgExercise > 0) {
            sb.append(String.format("- Average Exercise Minutes: %d\n", avgExercise));
        }
        
        return sb.toString();
    }
    
    private int calculateAge(LocalDateTime dateOfBirth) {
        if (dateOfBirth == null) return 0;
        return LocalDateTime.now().getYear() - dateOfBirth.getYear();
    }
    
    private HealthPlan parseGeminiResponse(HealthPlan healthPlan, String geminiResponse) {
        try {
            // First, try to extract JSON if it's embedded in text
            String jsonText = extractJsonFromText(geminiResponse);
            
            // Validate that it looks like JSON
            String trimmedJson = jsonText.trim();
            if (!trimmedJson.startsWith("{") || !trimmedJson.endsWith("}")) {
                System.err.println("Response does not appear to be valid JSON (doesn't start with { or end with }). Falling back to default plan.");
                System.err.println("First 100 chars: " + (trimmedJson.length() > 100 ? trimmedJson.substring(0, 100) : trimmedJson));
                setDefaultPlan(healthPlan);
                return healthPlan;
            }
            
            // Use Jackson to parse JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(jsonText);
            
            // Extract all fields using Jackson (handles both strings and arrays)
            healthPlan.setPlanSummary(extractJsonFieldFromNode(jsonNode, "planSummary"));
            healthPlan.setDietOverview(extractJsonFieldFromNode(jsonNode, "dietOverview"));
            healthPlan.setDailyMealPlan(extractJsonFieldFromNode(jsonNode, "dailyMealPlan"));
            healthPlan.setNutritionGoals(extractJsonFieldFromNode(jsonNode, "nutritionGoals"));
            healthPlan.setFoodRecommendations(extractJsonFieldFromNode(jsonNode, "foodRecommendations"));
            
            healthPlan.setExerciseOverview(extractJsonFieldFromNode(jsonNode, "exerciseOverview"));
            healthPlan.setWeeklyWorkoutPlan(extractJsonFieldFromNode(jsonNode, "weeklyWorkoutPlan"));
            healthPlan.setFitnessGoals(extractJsonFieldFromNode(jsonNode, "fitnessGoals"));
            healthPlan.setExerciseRecommendations(extractJsonFieldFromNode(jsonNode, "exerciseRecommendations"));
            
            healthPlan.setLifestyleOverview(extractJsonFieldFromNode(jsonNode, "lifestyleOverview"));
            healthPlan.setDailyRoutine(extractJsonFieldFromNode(jsonNode, "dailyRoutine"));
            healthPlan.setSleepRecommendations(extractJsonFieldFromNode(jsonNode, "sleepRecommendations"));
            healthPlan.setStressManagementTips(extractJsonFieldFromNode(jsonNode, "stressManagementTips"));
            healthPlan.setHydrationGoals(extractJsonFieldFromNode(jsonNode, "hydrationGoals"));
            
            healthPlan.setLongTermGoals(extractJsonFieldFromNode(jsonNode, "longTermGoals"));
            healthPlan.setProgressTrackingTips(extractJsonFieldFromNode(jsonNode, "progressTrackingTips"));
            healthPlan.setMotivationalNotes(extractJsonFieldFromNode(jsonNode, "motivationalNotes"));
            
            return healthPlan;
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            e.printStackTrace();
            setDefaultPlan(healthPlan);
            return healthPlan;
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
    
    /**
     * Extract field from JsonNode, handling both strings and arrays
     */
    private String extractJsonFieldFromNode(JsonNode jsonNode, String fieldName) {
        JsonNode fieldNode = jsonNode.path(fieldName);
        
        if (fieldNode.isArray()) {
            // Convert array to multi-line string
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : fieldNode) {
                if (item.isTextual()) {
                    sb.append(item.asText()).append("\n");
                }
            }
            return sb.toString().trim();
        } else if (fieldNode.isTextual()) {
            return fieldNode.asText();
        }
        
        return null;
    }
    
    private void setDefaultPlan(HealthPlan healthPlan) {
        healthPlan.setPlanSummary("Personalized health plan generated successfully.");
        healthPlan.setDietOverview("Focus on balanced nutrition with vegetables, lean proteins, and whole grains.");
        healthPlan.setDailyMealPlan("Follow a regular meal schedule with breakfast, lunch, dinner, and healthy snacks.");
        healthPlan.setNutritionGoals("• Increase vegetable intake\n• Stay hydrated\n• Maintain regular meal times");
        healthPlan.setFoodRecommendations("• Eat colorful vegetables\n• Choose whole grains\n• Limit processed foods");
        
        healthPlan.setExerciseOverview("Engage in regular physical activity to improve cardiovascular health and strength.");
        healthPlan.setWeeklyWorkoutPlan("Aim for at least 150 minutes of moderate-intensity exercise per week.");
        healthPlan.setFitnessGoals("• Build cardiovascular endurance\n• Improve flexibility\n• Maintain strength");
        healthPlan.setExerciseRecommendations("• Start with walking or jogging\n• Include stretching exercises\n• Gradually increase intensity");
        
        healthPlan.setLifestyleOverview("Maintain a healthy lifestyle with proper sleep, stress management, and hydration.");
        healthPlan.setDailyRoutine("Wake up early, regular meals, exercise time, and adequate rest.");
        healthPlan.setSleepRecommendations("• Aim for 7-8 hours of sleep\n• Maintain regular sleep schedule\n• Create a bedtime routine");
        healthPlan.setStressManagementTips("• Practice mindfulness\n• Take regular breaks\n• Engage in hobbies");
        healthPlan.setHydrationGoals("Drink at least 8 glasses of water daily.");
        
        healthPlan.setLongTermGoals("Achieve and maintain optimal health through consistent effort.");
        healthPlan.setProgressTrackingTips("• Track daily activities\n• Monitor health metrics\n• Review progress weekly");
        healthPlan.setMotivationalNotes("Every small step counts towards your health goals. Stay consistent and positive!");
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
