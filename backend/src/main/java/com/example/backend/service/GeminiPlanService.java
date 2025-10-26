package com.example.backend.service;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.HealthDataResponse;
import com.example.backend.entity.HealthPlan;
import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

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
            
            if (response != null) {
                String geminiResponse = extractResponseText(response);
                if (geminiResponse != null && !geminiResponse.isEmpty()) {
                    return parseGeminiResponse(healthPlan, geminiResponse);
                }
            }
            
            throw new RuntimeException("Failed to parse Gemini response");
            
        } catch (Exception e) {
            System.err.println("Gemini plan generation failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Gemini plan generation failed", e);
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
            healthPlan.setPlanSummary(extractJsonField(geminiResponse, "planSummary"));
            healthPlan.setDietOverview(extractJsonField(geminiResponse, "dietOverview"));
            healthPlan.setDailyMealPlan(extractJsonField(geminiResponse, "dailyMealPlan"));
            healthPlan.setNutritionGoals(extractJsonField(geminiResponse, "nutritionGoals"));
            healthPlan.setFoodRecommendations(extractJsonField(geminiResponse, "foodRecommendations"));
            
            healthPlan.setExerciseOverview(extractJsonField(geminiResponse, "exerciseOverview"));
            healthPlan.setWeeklyWorkoutPlan(extractJsonField(geminiResponse, "weeklyWorkoutPlan"));
            healthPlan.setFitnessGoals(extractJsonField(geminiResponse, "fitnessGoals"));
            healthPlan.setExerciseRecommendations(extractJsonField(geminiResponse, "exerciseRecommendations"));
            
            healthPlan.setLifestyleOverview(extractJsonField(geminiResponse, "lifestyleOverview"));
            healthPlan.setDailyRoutine(extractJsonField(geminiResponse, "dailyRoutine"));
            healthPlan.setSleepRecommendations(extractJsonField(geminiResponse, "sleepRecommendations"));
            healthPlan.setStressManagementTips(extractJsonField(geminiResponse, "stressManagementTips"));
            healthPlan.setHydrationGoals(extractJsonField(geminiResponse, "hydrationGoals"));
            
            healthPlan.setLongTermGoals(extractJsonField(geminiResponse, "longTermGoals"));
            healthPlan.setProgressTrackingTips(extractJsonField(geminiResponse, "progressTrackingTips"));
            healthPlan.setMotivationalNotes(extractJsonField(geminiResponse, "motivationalNotes"));
            
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            e.printStackTrace();
            setDefaultPlan(healthPlan);
        }
        
        return healthPlan;
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
