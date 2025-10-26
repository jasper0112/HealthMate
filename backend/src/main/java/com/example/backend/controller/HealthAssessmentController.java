package com.example.backend.controller;

import com.example.backend.dto.HealthAssessmentRequest;
import com.example.backend.dto.HealthAssessmentResponse;
import com.example.backend.entity.HealthAssessment;
import com.example.backend.service.HealthAssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-assessments")
@CrossOrigin(origins = "*")
public class HealthAssessmentController {
    
    @Autowired
    private HealthAssessmentService healthAssessmentService;
    
    /**
     * Trigger AI health assessment
     * POST /api/health-assessments/trigger
     */
    @PostMapping("/trigger")
    public ResponseEntity<?> triggerAssessment(@Valid @RequestBody HealthAssessmentRequest request) {
        try {
            HealthAssessmentResponse assessment = healthAssessmentService.triggerAssessment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(assessment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get all assessment records
     * GET /api/health-assessments
     */
    @GetMapping
    public ResponseEntity<List<HealthAssessmentResponse>> getAllAssessments() {
        List<HealthAssessmentResponse> assessments = healthAssessmentService.getAllAssessments();
        return ResponseEntity.ok(assessments);
    }
    
    /**
     * Get assessment by ID
     * GET /api/health-assessments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAssessmentById(@PathVariable Long id) {
        return healthAssessmentService.getAssessmentById(id)
                .map(assessment -> ResponseEntity.ok(assessment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get all assessments for a user
     * GET /api/health-assessments/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAssessmentsByUserId(@PathVariable Long userId) {
        try {
            List<HealthAssessmentResponse> assessments = healthAssessmentService.getAssessmentsByUserId(userId);
            return ResponseEntity.ok(assessments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get latest assessment for a user
     * GET /api/health-assessments/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getLatestAssessmentByUserId(@PathVariable Long userId) {
        try {
            return healthAssessmentService.getLatestAssessmentByUserId(userId)
                    .map(assessment -> ResponseEntity.ok(assessment))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get assessments by type
     * GET /api/health-assessments/user/{userId}/type/{type}
     */
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<?> getAssessmentsByType(
            @PathVariable Long userId,
            @PathVariable HealthAssessment.AssessmentType type) {
        try {
            List<HealthAssessmentResponse> assessments = healthAssessmentService.getAssessmentsByType(userId, type);
            return ResponseEntity.ok(assessments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Delete assessment record
     * DELETE /api/health-assessments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
        try {
            healthAssessmentService.deleteAssessment(id);
            return ResponseEntity.ok(Map.of("message", "Assessment deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
