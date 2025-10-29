package com.example.backend.service;

import com.example.backend.dto.response.HealthDataResponse;
import com.example.backend.dto.request.HealthPlanRequest;
import com.example.backend.dto.response.HealthPlanResponse;
import com.example.backend.entity.HealthPlan;
import com.example.backend.entity.User;
import com.example.backend.repository.HealthPlanRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ai.GeminiPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class HealthPlanService {
    
    @Autowired
    private HealthPlanRepository healthPlanRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HealthDataService healthDataService;
    
    @Autowired
    private GeminiPlanService geminiPlanService;
    
    /**
     * Generate personalized health plan
     */
    public HealthPlanResponse generateHealthPlan(HealthPlanRequest request) {
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
        
        // Generate health plan using Gemini
        HealthPlan healthPlan = geminiPlanService.generateGeminiHealthPlan(
            healthDataList, 
            user, 
            request.getType(),
            request.getHealthGoals());
        
        // Save plan
        HealthPlan savedPlan = healthPlanRepository.save(healthPlan);
        
        return HealthPlanResponse.fromHealthPlan(savedPlan);
    }
    
    /**
     * Get all health plans
     */
    @Transactional(readOnly = true)
    public List<HealthPlanResponse> getAllHealthPlans() {
        return healthPlanRepository.findAll().stream()
                .map(HealthPlanResponse::fromHealthPlan)
                .collect(Collectors.toList());
    }
    
    /**
     * Get health plan by ID
     */
    @Transactional(readOnly = true)
    public Optional<HealthPlanResponse> getHealthPlanById(Long id) {
        return healthPlanRepository.findById(id)
                .map(HealthPlanResponse::fromHealthPlan);
    }
    
    /**
     * Get all health plans for a user
     */
    @Transactional(readOnly = true)
    public List<HealthPlanResponse> getHealthPlansByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthPlanRepository.findByUserOrderByPlanDateDesc(user).stream()
                .map(HealthPlanResponse::fromHealthPlan)
                .collect(Collectors.toList());
    }
    
    /**
     * Get latest health plan for a user
     */
    @Transactional(readOnly = true)
    public Optional<HealthPlanResponse> getLatestHealthPlanByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthPlanRepository.findFirstByUserOrderByPlanDateDesc(user)
                .map(HealthPlanResponse::fromHealthPlan);
    }
    
    /**
     * Get health plans by type for a user
     */
    @Transactional(readOnly = true)
    public List<HealthPlanResponse> getHealthPlansByType(Long userId, HealthPlan.PlanType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthPlanRepository.findByUserAndTypeOrderByPlanDateDesc(user, type).stream()
                .map(HealthPlanResponse::fromHealthPlan)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active health plan for a user (current date within plan's date range)
     */
    @Transactional(readOnly = true)
    public Optional<HealthPlanResponse> getActiveHealthPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime now = LocalDateTime.now();
        return healthPlanRepository.findByUserAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByPlanDateDesc(user, now, now)
                .stream()
                .findFirst()
                .map(HealthPlanResponse::fromHealthPlan);
    }
    
    /**
     * Delete health plan
     */
    public void deleteHealthPlan(Long id) {
        if (!healthPlanRepository.existsById(id)) {
            throw new RuntimeException("Health plan not found");
        }
        healthPlanRepository.deleteById(id);
    }
}
