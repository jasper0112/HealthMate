package com.example.backend.service;

import com.example.backend.dto.response.DietGuidanceResponse;
import com.example.backend.entity.DietGuidance;
import com.example.backend.entity.User;
import com.example.backend.repository.DietGuidanceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ai.GeminiDietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DietGuidanceService {
    
    @Autowired
    private DietGuidanceRepository dietGuidanceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private GeminiDietService geminiDietService;
    
    @Value("${gemini.enabled:false}")
    private Boolean geminiEnabled;
    
    public DietGuidanceResponse generateDietGuidance(Long userId, String healthIssue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        DietGuidance guidance;
        
        // Try to use Gemini AI if enabled, otherwise fall back to basic guidance
        if (geminiEnabled && geminiDietService != null) {
            try {
                guidance = geminiDietService.generateGeminiDietGuidance(user, healthIssue);
            } catch (Exception e) {
                System.err.println("Gemini diet guidance failed, falling back to basic guidance: " + e.getMessage());
                guidance = createBasicDietGuidance(user, healthIssue);
            }
        } else {
            // Fall back to basic guidance
            guidance = createBasicDietGuidance(user, healthIssue);
        }
        
        DietGuidance savedGuidance = dietGuidanceRepository.save(guidance);
        return DietGuidanceResponse.fromDietGuidance(savedGuidance);
    }
    
    private DietGuidance createBasicDietGuidance(User user, String healthIssue) {
        DietGuidance guidance = new DietGuidance();
        guidance.setUser(user);
        guidance.setHealthIssue(healthIssue);
        
        // Basic guidance - fallback when Gemini is not available
        if (healthIssue.toLowerCase().contains("diabetes")) {
            guidance.setFoodRecommendations("• Whole grains (brown rice, quinoa, oatmeal)\n• Leafy greens and non-starchy vegetables\n• Lean proteins (chicken, fish, tofu)\n• Nuts and seeds\n• Berries and low-sugar fruits");
            guidance.setAvoidFoods("• Sugary drinks and candies\n• White bread and refined grains\n• Fried foods\n• Processed foods\n• High-sugar fruits (mango, banana in excess)");
            guidance.setSupplementRecommendations("• Vitamin D (consult doctor for dosage)\n• Magnesium\n• Omega-3 fatty acids\n• Consider blood sugar support supplements");
            guidance.setMealSuggestions("Balanced meals with consistent carbohydrate intake. Include protein, healthy fats, and fiber in each meal.");
            guidance.setNutritionalBenefits("Helps maintain stable blood sugar levels and supports overall metabolic health.");
            guidance.setGuidance("Focus on whole, unprocessed foods. Monitor portion sizes and maintain regular meal timing. Consult with a registered dietitian for personalized meal plans.");
        } else if (healthIssue.toLowerCase().contains("heart")) {
            guidance.setFoodRecommendations("• Fatty fish (salmon, mackerel, sardines)\n• Olive oil and avocado\n• Nuts and seeds\n• Whole grains\n• Colorful fruits and vegetables");
            guidance.setAvoidFoods("• Trans fats and processed foods\n• Excessive sodium\n• Red meat (limit to occasional)\n• Fried foods\n• Sugary beverages");
            guidance.setSupplementRecommendations("• Omega-3 fatty acids\n• Coenzyme Q10\n• Magnesium\n• Vitamin D");
            guidance.setMealSuggestions("Mediterranean-style diet with emphasis on plant foods, lean proteins, and healthy fats.");
            guidance.setNutritionalBenefits("Supports cardiovascular health, reduces inflammation, and maintains healthy blood pressure.");
            guidance.setGuidance("Prioritize heart-healthy fats and omega-3 rich foods. Limit processed foods and maintain a balanced, varied diet.");
        } else {
            guidance.setFoodRecommendations("• Fresh fruits and vegetables\n• Whole grains\n• Lean proteins\n• Healthy fats (nuts, olive oil)\n• Adequate hydration");
            guidance.setAvoidFoods("• Processed foods\n• Excessive sugar and salt\n• Unhealthy fats\n• Refined grains");
            guidance.setSupplementRecommendations("• Multivitamin (if needed)\n• Vitamin D\n• Consider probiotic for gut health");
            guidance.setMealSuggestions("Balance all food groups. Include variety to ensure nutrient diversity.");
            guidance.setNutritionalBenefits("Provides essential nutrients for overall health and well-being.");
            guidance.setGuidance("Maintain a balanced diet with variety. Focus on whole foods and stay hydrated. Consider consulting a nutritionist for personalized advice.");
        }
        
        return guidance;
    }
    
    @Transactional(readOnly = true)
    public List<DietGuidanceResponse> getUserGuidance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return dietGuidanceRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(DietGuidanceResponse::fromDietGuidance)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<DietGuidanceResponse> getGuidanceById(Long id) {
        return dietGuidanceRepository.findById(id)
                .map(DietGuidanceResponse::fromDietGuidance);
    }
    
    @Transactional(readOnly = true)
    public List<DietGuidanceResponse> searchByHealthIssue(String healthIssue) {
        return dietGuidanceRepository.findByHealthIssueContainingIgnoreCase(healthIssue).stream()
                .map(DietGuidanceResponse::fromDietGuidance)
                .collect(Collectors.toList());
    }
    
    public void deleteGuidance(Long id) {
        if (!dietGuidanceRepository.existsById(id)) {
            throw new RuntimeException("Diet guidance not found");
        }
        dietGuidanceRepository.deleteById(id);
    }
}
