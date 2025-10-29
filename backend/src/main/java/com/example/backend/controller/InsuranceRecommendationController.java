package com.example.backend.controller;

import com.example.backend.dto.request.InsuranceRecommendationRequest;
import com.example.backend.dto.response.InsuranceRecommendationResponse;
import com.example.backend.service.InsuranceRecommendationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance-recommendations")
@CrossOrigin(origins = "*")
public class InsuranceRecommendationController {
    
    @Autowired
    private InsuranceRecommendationService insuranceRecommendationService;
    
    /**
     * Generate insurance recommendation
     * POST /api/insurance-recommendations
     */
    @PostMapping
    public ResponseEntity<?> generateRecommendation(@Valid @RequestBody InsuranceRecommendationRequest request) {
        try {
            InsuranceRecommendationResponse recommendation = insuranceRecommendationService.generateRecommendation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(recommendation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get user's recommendations
     * GET /api/insurance-recommendations/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRecommendations(@PathVariable Long userId) {
        try {
            List<InsuranceRecommendationResponse> recommendations = 
                insuranceRecommendationService.getUserRecommendations(userId);
            return ResponseEntity.ok(recommendations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get latest recommendation
     * GET /api/insurance-recommendations/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getLatestRecommendation(@PathVariable Long userId) {
        try {
            return insuranceRecommendationService.getLatestRecommendation(userId)
                    .map(recommendation -> ResponseEntity.ok(recommendation))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
