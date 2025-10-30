package com.example.backend.controller;

import com.example.backend.dto.request.HealthDataCreateRequest;
import com.example.backend.dto.request.HealthDataUpdateRequest;
import com.example.backend.dto.response.HealthDataResponse;
import com.example.backend.dto.response.HealthDataStatisticsResponse;
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
import java.util.stream.Collectors;

/**
 * REST controller for CRUD and queries on HealthData.
 * Endpoints here call methods that exist in HealthDataService with identical signatures.
 */
@RestController
@RequestMapping("/api/health-data")
@CrossOrigin(origins = "*")
public class HealthDataController {

    @Autowired
    private HealthDataService healthDataService;

    /** Create one health-data record. */
    @PostMapping
    public ResponseEntity<?> createHealthData(@Valid @RequestBody HealthDataCreateRequest request) {
        try {
            HealthDataResponse healthData = healthDataService.createHealthData(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(healthData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** List all records (admin/dev use). */
    @GetMapping
    public ResponseEntity<List<HealthDataResponse>> getAllHealthData() {
        List<HealthDataResponse> healthDataList = healthDataService.getAllHealthData();
        return ResponseEntity.ok(healthDataList);
    }

    /** Get one record by id. */
    @GetMapping("/{id}")
    public ResponseEntity<?> getHealthDataById(@PathVariable Long id) {
        return healthDataService.getHealthDataById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** List a user's records, ordered by recordedAt desc. */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getHealthDataByUserId(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByUserId(userId);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Get the latest (most recent) record of a user. */
    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<?> getLatestHealthDataByUserId(@PathVariable Long userId) {
        try {
            return healthDataService.getLatestHealthDataByUserId(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Get today's records (00:00–24:00 local) for a user. */
    @GetMapping("/user/{userId}/today")
    public ResponseEntity<?> getTodayHealthData(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getTodayHealthData(userId);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Query by explicit date range [startDate, endDate]. */
    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<?> getHealthDataByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<HealthDataResponse> healthDataList =
                    healthDataService.getHealthDataByUserAndDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Filter a user's records by mood enum. */
    @GetMapping("/user/{userId}/mood/{mood}")
    public ResponseEntity<?> getHealthDataByMood(
            @PathVariable Long userId,
            @PathVariable HealthData.MoodLevel mood) {
        try {
            List<HealthDataResponse> healthDataList = healthDataService.getHealthDataByMood(userId, mood);
            return ResponseEntity.ok(healthDataList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Aggregated statistics for a user within a time window.
     * If no window is provided, defaults to the last 30 days.
     */
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<?> getHealthDataStatistics(
            @PathVariable Long userId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            if (startDate == null) startDate = LocalDateTime.now().minusDays(30);
            if (endDate == null) endDate = LocalDateTime.now();

            HealthDataStatisticsResponse statistics =
                    healthDataService.getHealthDataStatistics(userId, startDate, endDate);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Update one record by id. */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHealthData(
            @PathVariable Long id,
            @Valid @RequestBody HealthDataUpdateRequest request) {
        try {
            HealthDataResponse healthData = healthDataService.updateHealthData(id, request);
            return ResponseEntity.ok(healthData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Delete one record by id. */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHealthData(@PathVariable Long id) {
        try {
            healthDataService.deleteHealthData(id);
            return ResponseEntity.ok(Map.of("message", "Health data deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Convenience: only weight-present rows from user's history. */
    @GetMapping("/user/{userId}/weight-history")
    public ResponseEntity<?> getWeightHistory(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> weightHistory = healthDataService.getHealthDataByUserId(userId).stream()
                    .filter(h -> h.getWeight() != null)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(weightHistory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Convenience: only bmi-present rows from user's history. */
    @GetMapping("/user/{userId}/bmi-history")
    public ResponseEntity<?> getBMIHistory(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> bmiHistory = healthDataService.getHealthDataByUserId(userId).stream()
                    .filter(h -> h.getBmi() != null)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(bmiHistory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Convenience: only heartRate-present rows from user's history. */
    @GetMapping("/user/{userId}/heart-rate-history")
    public ResponseEntity<?> getHeartRateHistory(@PathVariable Long userId) {
        try {
            List<HealthDataResponse> heartRateHistory = healthDataService.getHealthDataByUserId(userId).stream()
                    .filter(h -> h.getHeartRate() != null)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(heartRateHistory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
