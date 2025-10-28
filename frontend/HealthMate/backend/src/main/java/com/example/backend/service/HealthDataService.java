package com.example.backend.service;

import com.example.backend.dto.HealthDataCreateRequest;
import com.example.backend.dto.HealthDataResponse;
import com.example.backend.dto.HealthDataStatisticsResponse;
import com.example.backend.dto.HealthDataUpdateRequest;
import com.example.backend.entity.HealthData;
import com.example.backend.entity.User;
import com.example.backend.repository.HealthDataRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class HealthDataService {
    
    @Autowired
    private HealthDataRepository healthDataRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public HealthDataResponse createHealthData(HealthDataCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        HealthData healthData = new HealthData();
        healthData.setUser(user);
        healthData.setRecordedAt(request.getRecordedAt() != null ? request.getRecordedAt() : LocalDateTime.now());
        healthData.setWeight(request.getWeight());
        healthData.setHeight(request.getHeight());
        healthData.setSystolicPressure(request.getSystolicPressure());
        healthData.setDiastolicPressure(request.getDiastolicPressure());
        healthData.setHeartRate(request.getHeartRate());
        healthData.setBodyTemperature(request.getBodyTemperature());
        healthData.setBloodSugar(request.getBloodSugar());
        healthData.setMood(request.getMood() != null ? request.getMood() : HealthData.MoodLevel.NEUTRAL);
        healthData.setSleepHours(request.getSleepHours());
        healthData.setExerciseMinutes(request.getExerciseMinutes());
        healthData.setWaterIntake(request.getWaterIntake());
        healthData.setSteps(request.getSteps());
        healthData.setNotes(request.getNotes());
        
        HealthData savedHealthData = healthDataRepository.save(healthData);
        return HealthDataResponse.fromHealthData(savedHealthData);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataResponse> getAllHealthData() {
        return healthDataRepository.findAll().stream()
                .map(HealthDataResponse::fromHealthData)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<HealthDataResponse> getHealthDataById(Long id) {
        return healthDataRepository.findById(id)
                .map(HealthDataResponse::fromHealthData);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataResponse> getHealthDataByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthDataRepository.findByUserOrderByRecordedAtDesc(user).stream()
                .map(HealthDataResponse::fromHealthData)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataResponse> getHealthDataByUserAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthDataRepository.findByUserAndRecordedAtBetweenOrderByRecordedAtDesc(user, startDate, endDate).stream()
                .map(HealthDataResponse::fromHealthData)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<HealthDataResponse> getLatestHealthDataByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthDataRepository.findFirstByUserOrderByRecordedAtDesc(user)
                .map(HealthDataResponse::fromHealthData);
    }
    
    public HealthDataResponse updateHealthData(Long id, HealthDataUpdateRequest request) {
        HealthData healthData = healthDataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health data not found"));
        
        if (request.getRecordedAt() != null) {
            healthData.setRecordedAt(request.getRecordedAt());
        }
        if (request.getWeight() != null) {
            healthData.setWeight(request.getWeight());
        }
        if (request.getHeight() != null) {
            healthData.setHeight(request.getHeight());
        }
        if (request.getSystolicPressure() != null) {
            healthData.setSystolicPressure(request.getSystolicPressure());
        }
        if (request.getDiastolicPressure() != null) {
            healthData.setDiastolicPressure(request.getDiastolicPressure());
        }
        if (request.getHeartRate() != null) {
            healthData.setHeartRate(request.getHeartRate());
        }
        if (request.getBodyTemperature() != null) {
            healthData.setBodyTemperature(request.getBodyTemperature());
        }
        if (request.getBloodSugar() != null) {
            healthData.setBloodSugar(request.getBloodSugar());
        }
        if (request.getMood() != null) {
            healthData.setMood(request.getMood());
        }
        if (request.getSleepHours() != null) {
            healthData.setSleepHours(request.getSleepHours());
        }
        if (request.getExerciseMinutes() != null) {
            healthData.setExerciseMinutes(request.getExerciseMinutes());
        }
        if (request.getWaterIntake() != null) {
            healthData.setWaterIntake(request.getWaterIntake());
        }
        if (request.getSteps() != null) {
            healthData.setSteps(request.getSteps());
        }
        if (request.getNotes() != null) {
            healthData.setNotes(request.getNotes());
        }
        
        HealthData updatedHealthData = healthDataRepository.save(healthData);
        return HealthDataResponse.fromHealthData(updatedHealthData);
    }
    
    public void deleteHealthData(Long id) {
        if (!healthDataRepository.existsById(id)) {
            throw new RuntimeException("Health data not found");
        }
        healthDataRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataResponse> getHealthDataByMood(Long userId, HealthData.MoodLevel mood) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthDataRepository.findByUserAndMoodOrderByRecordedAtDesc(user, mood).stream()
                .map(HealthDataResponse::fromHealthData)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public HealthDataStatisticsResponse getHealthDataStatistics(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        HealthDataStatisticsResponse statistics = new HealthDataStatisticsResponse();
        statistics.setUserId(userId);
        statistics.setUsername(user.getUsername());
        statistics.setStartDate(startDate);
        statistics.setEndDate(endDate);
        
        List<HealthData> healthDataList = healthDataRepository.findByUserAndDateRange(user, startDate, endDate);
        statistics.setTotalRecords((long) healthDataList.size());
        
        if (!healthDataList.isEmpty()) {
            // Calculate averages
            Double avgWeight = healthDataRepository.findAverageWeightByUserAndDateRange(user, startDate);
            Double avgBMI = healthDataRepository.findAverageBMIByUserAndDateRange(user, startDate);
            Double avgHeartRate = healthDataRepository.findAverageHeartRateByUserAndDateRange(user, startDate);
            Double avgSteps = healthDataRepository.findAverageStepsByUserAndDateRange(user, startDate);
            Double avgSleepHours = healthDataRepository.findAverageSleepHoursByUserAndDateRange(user, startDate);
            Double avgExerciseMinutes = healthDataRepository.findAverageExerciseMinutesByUserAndDateRange(user, startDate);
            
            statistics.setAverageWeight(avgWeight != null ? BigDecimal.valueOf(avgWeight) : null);
            statistics.setAverageBMI(avgBMI != null ? BigDecimal.valueOf(avgBMI) : null);
            statistics.setAverageHeartRate(avgHeartRate);
            statistics.setAverageSteps(avgSteps);
            statistics.setAverageSleepHours(avgSleepHours);
            statistics.setAverageExerciseMinutes(avgExerciseMinutes);
            
            // Calculate min/max values
            List<BigDecimal> weights = healthDataList.stream()
                    .map(HealthData::getWeight)
                    .filter(w -> w != null)
                    .collect(Collectors.toList());
            if (!weights.isEmpty()) {
                statistics.setMinWeight(weights.stream().min(BigDecimal::compareTo).orElse(null));
                statistics.setMaxWeight(weights.stream().max(BigDecimal::compareTo).orElse(null));
            }
            
            List<BigDecimal> bmis = healthDataList.stream()
                    .map(HealthData::getBmi)
                    .filter(b -> b != null)
                    .collect(Collectors.toList());
            if (!bmis.isEmpty()) {
                statistics.setMinBMI(bmis.stream().min(BigDecimal::compareTo).orElse(null));
                statistics.setMaxBMI(bmis.stream().max(BigDecimal::compareTo).orElse(null));
            }
            
            List<Integer> heartRates = healthDataList.stream()
                    .map(HealthData::getHeartRate)
                    .filter(h -> h != null)
                    .collect(Collectors.toList());
            if (!heartRates.isEmpty()) {
                statistics.setMinHeartRate(heartRates.stream().min(Integer::compareTo).orElse(null));
                statistics.setMaxHeartRate(heartRates.stream().max(Integer::compareTo).orElse(null));
            }
            
            List<Integer> steps = healthDataList.stream()
                    .map(HealthData::getSteps)
                    .filter(s -> s != null)
                    .collect(Collectors.toList());
            if (!steps.isEmpty()) {
                statistics.setMinSteps(steps.stream().min(Integer::compareTo).orElse(null));
                statistics.setMaxSteps(steps.stream().max(Integer::compareTo).orElse(null));
            }
            
            List<Integer> sleepHours = healthDataList.stream()
                    .map(HealthData::getSleepHours)
                    .filter(s -> s != null)
                    .collect(Collectors.toList());
            if (!sleepHours.isEmpty()) {
                statistics.setMinSleepHours(sleepHours.stream().min(Integer::compareTo).orElse(null));
                statistics.setMaxSleepHours(sleepHours.stream().max(Integer::compareTo).orElse(null));
            }
            
            List<Integer> exerciseMinutes = healthDataList.stream()
                    .map(HealthData::getExerciseMinutes)
                    .filter(e -> e != null)
                    .collect(Collectors.toList());
            if (!exerciseMinutes.isEmpty()) {
                statistics.setMinExerciseMinutes(exerciseMinutes.stream().min(Integer::compareTo).orElse(null));
                statistics.setMaxExerciseMinutes(exerciseMinutes.stream().max(Integer::compareTo).orElse(null));
            }
            
            // Get recent records (last 10)
            List<HealthDataResponse> recentRecords = healthDataList.stream()
                    .limit(10)
                    .map(HealthDataResponse::fromHealthData)
                    .collect(Collectors.toList());
            statistics.setRecentRecords(recentRecords);
        }
        
        return statistics;
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataResponse> getTodayHealthData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        return healthDataRepository.findTodayRecordsByUser(user, startOfDay, endOfDay).stream()
                .map(HealthDataResponse::fromHealthData)
                .collect(Collectors.toList());
    }
}
