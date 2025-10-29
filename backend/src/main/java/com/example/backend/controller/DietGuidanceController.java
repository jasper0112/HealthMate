package com.example.backend.controller;

import com.example.backend.dto.response.DietGuidanceResponse;
import com.example.backend.service.DietGuidanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diet-guidance")
@CrossOrigin(origins = "*")
public class DietGuidanceController {
    
    @Autowired
    private DietGuidanceService dietGuidanceService;
    
    /**
     * Generate diet guidance
     * POST /api/diet-guidance?userId={userId}&healthIssue={healthIssue}
     */
    @PostMapping
    public ResponseEntity<?> generateGuidance(@RequestParam Long userId, @RequestParam String healthIssue) {
        try {
            DietGuidanceResponse guidance = dietGuidanceService.generateDietGuidance(userId, healthIssue);
            return ResponseEntity.status(HttpStatus.CREATED).body(guidance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get guidance by ID
     * GET /api/diet-guidance/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGuidanceById(@PathVariable Long id) {
        return dietGuidanceService.getGuidanceById(id)
                .map(guidance -> ResponseEntity.ok(guidance))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get user's diet guidance history
     * GET /api/diet-guidance/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserGuidance(@PathVariable Long userId) {
        try {
            List<DietGuidanceResponse> guidanceList = dietGuidanceService.getUserGuidance(userId);
            return ResponseEntity.ok(guidanceList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Search by health issue
     * GET /api/diet-guidance/search?healthIssue={healthIssue}
     */
    @GetMapping("/search")
    public ResponseEntity<List<DietGuidanceResponse>> searchByHealthIssue(@RequestParam String healthIssue) {
        List<DietGuidanceResponse> guidanceList = dietGuidanceService.searchByHealthIssue(healthIssue);
        return ResponseEntity.ok(guidanceList);
    }
    
    /**
     * Delete guidance
     * DELETE /api/diet-guidance/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGuidance(@PathVariable Long id) {
        try {
            dietGuidanceService.deleteGuidance(id);
            return ResponseEntity.ok(Map.of("message", "Diet guidance deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
