package com.example.backend.service;

import com.example.backend.dto.InsuranceRecommendationRequest;
import com.example.backend.dto.InsuranceRecommendationResponse;
import com.example.backend.entity.InsuranceRecommendation;
import com.example.backend.entity.InsuranceProduct;
import com.example.backend.entity.User;
import com.example.backend.repository.InsuranceProductRepository;
import com.example.backend.repository.InsuranceRecommendationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InsuranceRecommendationService {
    
    @Autowired
    private InsuranceRecommendationRepository recommendationRepository;
    
    @Autowired
    private InsuranceProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public InsuranceRecommendationResponse generateRecommendation(InsuranceRecommendationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        InsuranceRecommendation recommendation = new InsuranceRecommendation();
        recommendation.setUser(user);
        
        // Determine recommendation reason
        if (request.getIsInternationalStudent()) {
            recommendation.setReason(InsuranceRecommendation.RecommendationReason.INTERNATIONAL_STUDENT);
        } else if (request.getIsNewImmigrant()) {
            recommendation.setReason(InsuranceRecommendation.RecommendationReason.NEW_IMMIGRANT);
        } else {
            recommendation.setReason(InsuranceRecommendation.RecommendationReason.GENERAL_NEED);
        }
        
        // Generate recommendation based on user profile
        String profileAnalysis = "User: " + user.getFullName() + 
                                ", Profile: " + request.getUserProfile();
        recommendation.setUserProfileAnalysis(profileAnalysis);
        
        // Get recommended products
        List<InsuranceProduct> products;
        if (request.getIsInternationalStudent()) {
            products = productRepository.findByIsRecommendedForStudentsTrue();
        } else if (request.getIsNewImmigrant()) {
            products = productRepository.findByIsRecommendedForImmigrantsTrue();
        } else {
            products = productRepository.findByActiveTrue();
        }
        
        // Build recommendation
        recommendation.setRecommendationSummary("Based on your profile, we recommend the following health insurance options.");
        recommendation.setDetailedRecommendation(generateDetailedRecommendation(products, request));
        recommendation.setRecommendedProducts(formatProducts(products));
        recommendation.setBenefits(generateBenefits(products));
        recommendation.setConsiderations(generateConsiderations(request));
        
        InsuranceRecommendation saved = recommendationRepository.save(recommendation);
        return InsuranceRecommendationResponse.fromInsuranceRecommendation(saved);
    }
    
    private String generateDetailedRecommendation(List<InsuranceProduct> products, InsuranceRecommendationRequest request) {
        return "We've analyzed your profile and identified " + products.size() + 
               " suitable health insurance options. These products are specifically " +
               "designed for people in your situation and offer comprehensive coverage.";
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
    
    private String generateBenefits(List<InsuranceProduct> products) {
        return "• Comprehensive medical coverage\n• Hospital accommodation\n• Medical services coverage\n• 24/7 health support";
    }
    
    private String generateConsiderations(InsuranceRecommendationRequest request) {
        return "• Compare different options\n• Check waiting periods\n• Verify coverage for your specific needs\n• Consider your budget";
    }
    
    @Transactional(readOnly = true)
    public List<InsuranceRecommendationResponse> getUserRecommendations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return recommendationRepository.findByUserOrderByRecommendationDateDesc(user).stream()
                .map(InsuranceRecommendationResponse::fromInsuranceRecommendation)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<InsuranceRecommendationResponse> getLatestRecommendation(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return recommendationRepository.findFirstByUserOrderByRecommendationDateDesc(user)
                .map(InsuranceRecommendationResponse::fromInsuranceRecommendation);
    }
}
