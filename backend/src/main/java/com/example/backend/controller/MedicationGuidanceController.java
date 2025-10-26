package com.example.backend.controller;

import com.example.backend.dto.MedicationGuidanceResponse;
import com.example.backend.service.MedicationGuidanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medication-guidance")
@CrossOrigin(origins = "*")
public class MedicationGuidanceController {
    
    @Autowired
    private MedicationGuidanceService medicationGuidanceService;
    
    /**
     * Generate medication guidance
     * POST /api/medication-guidance?userId={userId}&symptoms={symptoms}
     */
    @PostMapping
    public ResponseEntity<?> generateGuidance(@RequestParam Long userId, @RequestParam String symptoms) {
        try {
            MedicationGuidanceResponse guidance = medicationGuidanceService.generateMedicationGuidance(userId, symptoms);
            return ResponseEntity.status(HttpStatus.CREATED).body(guidance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get guidance by ID
     * GET /api/medication-guidance/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGuidanceById(@PathVariable Long id) {
        return medicationGuidanceService.getGuidanceById(id)
                .map(guidance -> ResponseEntity.ok(guidance))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get user's medication guidance history
     * GET /api/medication-guidance/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserGuidance(@PathVariable Long userId) {
        try {
            List<MedicationGuidanceResponse> guidanceList = medicationGuidanceService.getUserGuidance(userId);
            return ResponseEntity.ok(guidanceList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Search by symptoms
     * GET /api/medication-guidance/search?symptoms={symptoms}
     */
    @GetMapping("/search")
    public ResponseEntity<List<MedicationGuidanceResponse>> searchBySymptoms(@RequestParam String symptoms) {
        List<MedicationGuidanceResponse> guidanceList = medicationGuidanceService.searchBySymptoms(symptoms);
        return ResponseEntity.ok(guidanceList);
    }
    
    /**
     * Delete guidance
     * DELETE /api/medication-guidance/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGuidance(@PathVariable Long id) {
        try {
            medicationGuidanceService.deleteGuidance(id);
            return ResponseEntity.ok(Map.of("message", "Medication guidance deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
