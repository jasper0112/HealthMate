package com.example.backend.controller;

import com.example.backend.dto.HealthDataCreateRequest;
import com.example.backend.dto.HealthDataResponse;
import com.example.backend.dto.HealthDataStatisticsResponse;
import com.example.backend.dto.HealthDataUpdateRequest;
import com.example.backend.entity.HealthData;
import com.example.backend.service.HealthDataService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-data")
@CrossOrigin(origins = "*")
public class HealthDataController {
    
    @Autowired
    private HealthDataService healthDataService;
    
    @PostMapping
    public ResponseEntity<?> createHealthData(@Valid @RequestBody HealthDataCreateRequest request) {
        try {
            HealthDataResponse healthData = healthDataService.createHealthData(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(healthData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<HealthDataResponse>> getAllHealthData() {
        List<HealthDataResponse> healthDataList = healthDataService.getAllHealthData();
        return ResponseEntity.ok(healthDataList);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getHealthDataById(@PathVariable Long id) {
        return healthDataService.getHealthDataById(id)
                .map(healthData -> ResponseEntity.ok(healthData))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getHealthDataByUserId(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByUserId(userId);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getLatestHealthDataByUserId(@PathVariable Long userId) {
        try {
            return healthDataService.getLatestHealthDataByUserId(userId)
                    .map(healthData -> ResponseEntity.ok(healthData))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/today")
    public ResponseEntity<?> getTodayHealthData(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getTodayHealthData(userId);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<?> getHealthDataByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByUserAndDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/mood/{mood}")
    public ResponseEntity<?> getHealthDataByMood(@PathVariable Long userId, @PathVariable HealthData.MoodLevel mood) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByMood(userId, mood);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<?> getHealthDataStatistics(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            if (startDate == null) {
                startDate = LocalDateTime.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDateTime.now();
            }
            
            HealthDataStatisticsResponse statistics = healthDataService.getHealthDataStatistics(userId, startDate, endDate);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHealthData(@PathVariable Long id, @Valid @RequestBody HealthDataUpdateRequest request) {
        try {
            HealthDataResponse healthData = healthDataService.updateHealthData(id, request);
            return ResponseEntity.ok(healthData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHealthData(@PathVariable Long id) {
        try {
            healthDataService.deleteHealthData(id);
            return ResponseEntity.ok(Map.of("message", "Health data deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/weight-history")
    public ResponseEntity<?> getWeightHistory(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByUserId(userId);
            List<HealthDataResponse> weightHistory = healthDataList.stream()
                    .filter(h -> h.getWeight() != null)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(weightHistory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/bmi-history")
    public ResponseEntity<?> getBMIHistory(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByUserId(userId);
            List<HealthDataResponse> bmiHistory = healthDataList.stream()
                    .filter(h -> h.getBmi() != null)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(bmiHistory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}/heart-rate-history")
    public ResponseEntity<?> getHeartRateHistory(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByUserId(userId);
            List<HealthDataResponse> heartRateHistory = healthDataList.stream()
                    .filter(h -> h.getHeartRate() != null)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(heartRateHistory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
