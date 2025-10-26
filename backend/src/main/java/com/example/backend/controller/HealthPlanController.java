package com.example.backend.controller;

import com.example.backend.dto.HealthPlanRequest;
import com.example.backend.dto.HealthPlanResponse;
import com.example.backend.entity.HealthPlan;
import com.example.backend.service.HealthPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-plans")
@CrossOrigin(origins = "*")
public class HealthPlanController {
    
    @Autowired
    private HealthPlanService healthPlanService;
    
    /**
     * Generate personalized health plan
     * POST /api/health-plans/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateHealthPlan(@Valid @RequestBody HealthPlanRequest request) {
        try {
            HealthPlanResponse plan = healthPlanService.generateHealthPlan(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(plan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all health plans
     * GET /api/health-plans
     */
    @GetMapping
    public ResponseEntity<List<HealthPlanResponse>> getAllHealthPlans() {
        List<HealthPlanResponse> plans = healthPlanService.getAllHealthPlans();
        return ResponseEntity.ok(plans);
    }
    
    /**
     * Get health plan by ID
     * GET /api/health-plans/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getHealthPlanById(@PathVariable Long id) {
        return healthPlanService.getHealthPlanById(id)
                .map(plan -> ResponseEntity.ok(plan))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get all health plans for a user
     * GET /api/health-plans/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getHealthPlansByUserId(@PathVariable Long userId) {
        try {
            List<HealthPlanResponse> plans = healthPlanService.getHealthPlansByUserId(userId);
            return ResponseEntity.ok(plans);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get latest health plan for a user
     * GET /api/health-plans/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getLatestHealthPlanByUserId(@PathVariable Long userId) {
        try {
            return healthPlanService.getLatestHealthPlanByUserId(userId)
                    .map(plan -> ResponseEntity.ok(plan))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get active health plan for a user (current date within plan's date range)
     * GET /api/health-plans/user/{userId}/active
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getActiveHealthPlan(@PathVariable Long userId) {
        try {
            return healthPlanService.getActiveHealthPlan(userId)
                    .map(plan -> ResponseEntity.ok(plan))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get health plans by type
     * GET /api/health-plans/user/{userId}/type/{type}
     */
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<?> getHealthPlansByType(
            @PathVariable Long userId,
            @PathVariable HealthPlan.PlanType type) {
        try {
            List<HealthPlanResponse> plans = healthPlanService.getHealthPlansByType(userId, type);
            return ResponseEntity.ok(plans);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Delete health plan
     * DELETE /api/health-plans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHealthPlan(@PathVariable Long id) {
        try {
            healthPlanService.deleteHealthPlan(id);
            return ResponseEntity.ok(Map.of("message", "Health plan deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
