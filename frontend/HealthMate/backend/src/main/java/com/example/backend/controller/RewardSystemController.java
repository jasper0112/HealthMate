package com.example.backend.controller;

import com.example.backend.dto.RewardSystemResponse;
import com.example.backend.service.RewardSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/rewards")
@CrossOrigin(origins = "*")
public class RewardSystemController {
    
    @Autowired
    private RewardSystemService rewardSystemService;
    
    /**
     * Daily check-in
     * POST /api/rewards/{userId}/check-in
     */
    @PostMapping("/{userId}/check-in")
    public ResponseEntity<?> dailyCheckIn(@PathVariable Long userId) {
        try {
            RewardSystemResponse response = rewardSystemService.dailyCheckIn(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get user's rewards
     * GET /api/rewards/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRewards(@PathVariable Long userId) {
        try {
            Optional<RewardSystemResponse> response = rewardSystemService.getUserRewards(userId);
            return response.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record health data entry
     * POST /api/rewards/{userId}/health-data
     */
    @PostMapping("/{userId}/health-data")
    public ResponseEntity<?> recordHealthData(@PathVariable Long userId) {
        try {
            RewardSystemResponse response = rewardSystemService.recordHealthDataEntry(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Record assessment completion
     * POST /api/rewards/{userId}/assessment
     */
    @PostMapping("/{userId}/assessment")
    public ResponseEntity<?> recordAssessment(@PathVariable Long userId) {
        try {
            RewardSystemResponse response = rewardSystemService.recordAssessmentCompletion(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
