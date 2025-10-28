package com.example.backend.controller;

import com.example.backend.dto.SmartTriageRequest;
import com.example.backend.dto.SmartTriageResponse;
import com.example.backend.service.SmartTriageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/smart-triage")
@CrossOrigin(origins = "*")
public class SmartTriageController {
    
    @Autowired
    private SmartTriageService smartTriageService;
    
    /**
     * Generate triage recommendation
     * POST /api/smart-triage
     */
    @PostMapping
    public ResponseEntity<?> generateTriage(@Valid @RequestBody SmartTriageRequest request) {
        try {
            SmartTriageResponse triage = smartTriageService.generateTriage(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(triage);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get triage by ID
     * GET /api/smart-triage/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTriageById(@PathVariable Long id) {
        return smartTriageService.getTriageById(id)
                .map(triage -> ResponseEntity.ok(triage))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get triage history for user
     * GET /api/smart-triage/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTriageHistory(@PathVariable Long userId) {
        try {
            List<SmartTriageResponse> triageList = smartTriageService.getTriageHistory(userId);
            return ResponseEntity.ok(triageList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get latest triage for user
     * GET /api/smart-triage/user/{userId}/latest
     */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getLatestTriage(@PathVariable Long userId) {
        try {
            return smartTriageService.getLatestTriage(userId)
                    .map(triage -> ResponseEntity.ok(triage))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Delete triage record
     * DELETE /api/smart-triage/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTriage(@PathVariable Long id) {
        try {
            smartTriageService.deleteTriage(id);
            return ResponseEntity.ok(Map.of("message", "Triage deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
