package com.example.backend.service;

import com.example.backend.dto.request.HealthAssessmentRequest;
import com.example.backend.dto.response.HealthAssessmentResponse;
import com.example.backend.dto.response.HealthDataResponse;
import com.example.backend.entity.HealthAssessment;
import com.example.backend.entity.User;
import com.example.backend.repository.HealthAssessmentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ai.GeminiAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for creating and retrieving health assessments.
 * No "lastOnly" mode. We either use an explicit time range or a daysBack window.
 */
@Service
@Transactional
public class HealthAssessmentService {

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HealthDataService healthDataService;

    @Autowired
    private GeminiAssessmentService geminiAssessmentService;

    /**
     * Trigger an assessment for the given request.
     * Behavior:
     *  - if startDate/endDate provided: use that explicit window.
     *  - otherwise: use daysBack (default to 30 if null/invalid).
     */
    public HealthAssessmentResponse triggerAssessment(HealthAssessmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<HealthDataResponse> healthDataList;

        if (request.getStartDate() != null && request.getEndDate() != null) {
            // explicit start/end window
            healthDataList = healthDataService.getHealthDataByUserAndDateRange(
                    request.getUserId(), request.getStartDate(), request.getEndDate());
        } else {
            // daysBack window
            int days = (request.getDaysBack() != null && request.getDaysBack() > 0)
                    ? request.getDaysBack() : 30;
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusDays(days);
            healthDataList = healthDataService.getHealthDataByUserAndDateRange(
                    request.getUserId(), startDate, endDate);
        }

        // Generate assessment via Gemini or heuristic fallback
        HealthAssessment assessment = geminiAssessmentService.generateGeminiAssessment(
                healthDataList, request.getType());

        // Persist and map to DTO
        assessment.setUser(user);
        assessment.setAssessedAt(LocalDateTime.now());
        HealthAssessment saved = healthAssessmentRepository.save(assessment);
        return HealthAssessmentResponse.fromHealthAssessment(saved);
    }

    /* -------- read operations (unchanged) -------- */

    @Transactional(readOnly = true)
    public List<HealthAssessmentResponse> getAllAssessments() {
        return healthAssessmentRepository.findAll().stream()
                .map(HealthAssessmentResponse::fromHealthAssessment)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<HealthAssessmentResponse> getAssessmentById(Long id) {
        return healthAssessmentRepository.findById(id)
                .map(HealthAssessmentResponse::fromHealthAssessment);
    }

    @Transactional(readOnly = true)
    public List<HealthAssessmentResponse> getAssessmentsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return healthAssessmentRepository.findByUserOrderByAssessedAtDesc(user).stream()
                .map(HealthAssessmentResponse::fromHealthAssessment)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<HealthAssessmentResponse> getLatestAssessmentByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return healthAssessmentRepository.findFirstByUserOrderByAssessedAtDesc(user)
                .map(HealthAssessmentResponse::fromHealthAssessment);
    }

    @Transactional(readOnly = true)
    public List<HealthAssessmentResponse> getAssessmentsByType(
            Long userId, HealthAssessment.AssessmentType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return healthAssessmentRepository.findByUserAndTypeOrderByAssessedAtDesc(user, type).stream()
                .map(HealthAssessmentResponse::fromHealthAssessment)
                .collect(Collectors.toList());
    }

    public void deleteAssessment(Long id) {
        if (!healthAssessmentRepository.existsById(id)) {
            throw new RuntimeException("Assessment not found");
        }
        healthAssessmentRepository.deleteById(id);
    }
}
