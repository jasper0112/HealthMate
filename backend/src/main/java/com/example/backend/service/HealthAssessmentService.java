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
     * Trigger AI health assessment
     */
    public HealthAssessmentResponse triggerAssessment(HealthAssessmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Fetch health data
        List<HealthDataResponse> healthDataList;
        
        if (request.getStartDate() != null && request.getEndDate() != null) {
            healthDataList = healthDataService.getHealthDataByUserAndDateRange(
                request.getUserId(), request.getStartDate(), request.getEndDate());
        } else {
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusDays(request.getDaysBack());
            healthDataList = healthDataService.getHealthDataByUserAndDateRange(
                request.getUserId(), startDate, endDate);
        }
        
        // Use Gemini 2.5 Pro
        HealthAssessment assessment = geminiAssessmentService.generateGeminiAssessment(
            healthDataList, request.getType());
        
        // Set user information
        assessment.setUser(user);
        assessment.setAssessedAt(LocalDateTime.now());
        
        // Save assessment result
        HealthAssessment savedAssessment = healthAssessmentRepository.save(assessment);
        
        return HealthAssessmentResponse.fromHealthAssessment(savedAssessment);
    }
    
    /**
     * Get all assessment records
     */
    @Transactional(readOnly = true)
    public List<HealthAssessmentResponse> getAllAssessments() {
        return healthAssessmentRepository.findAll().stream()
                .map(HealthAssessmentResponse::fromHealthAssessment)
                .collect(Collectors.toList());
    }
    
    /**
     * Get assessment by ID
     */
    @Transactional(readOnly = true)
    public Optional<HealthAssessmentResponse> getAssessmentById(Long id) {
        return healthAssessmentRepository.findById(id)
                .map(HealthAssessmentResponse::fromHealthAssessment);
    }
    
    /**
     * Get all assessments for a user
     */
    @Transactional(readOnly = true)
    public List<HealthAssessmentResponse> getAssessmentsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthAssessmentRepository.findByUserOrderByAssessedAtDesc(user).stream()
                .map(HealthAssessmentResponse::fromHealthAssessment)
                .collect(Collectors.toList());
    }
    
    /**
     * Get latest assessment for a user
     */
    @Transactional(readOnly = true)
    public Optional<HealthAssessmentResponse> getLatestAssessmentByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthAssessmentRepository.findFirstByUserOrderByAssessedAtDesc(user)
                .map(HealthAssessmentResponse::fromHealthAssessment);
    }
    
    /**
     * Get assessments by type
     */
    @Transactional(readOnly = true)
    public List<HealthAssessmentResponse> getAssessmentsByType(Long userId, HealthAssessment.AssessmentType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthAssessmentRepository.findByUserAndTypeOrderByAssessedAtDesc(user, type).stream()
                .map(HealthAssessmentResponse::fromHealthAssessment)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete assessment
     */
    public void deleteAssessment(Long id) {
        if (!healthAssessmentRepository.existsById(id)) {
            throw new RuntimeException("Assessment not found");
        }
        healthAssessmentRepository.deleteById(id);
    }
}
