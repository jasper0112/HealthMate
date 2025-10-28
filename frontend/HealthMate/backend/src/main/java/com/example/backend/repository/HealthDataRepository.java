package com.example.backend.repository;

import com.example.backend.entity.HealthData;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthDataRepository extends JpaRepository<HealthData, Long> {
    
    List<HealthData> findByUserOrderByRecordedAtDesc(User user);
    
    List<HealthData> findByUserAndRecordedAtBetweenOrderByRecordedAtDesc(
        User user, LocalDateTime startDate, LocalDateTime endDate);
    
    Optional<HealthData> findFirstByUserOrderByRecordedAtDesc(User user);
    
    List<HealthData> findByUserAndMoodOrderByRecordedAtDesc(User user, HealthData.MoodLevel mood);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.recordedAt >= :startDate ORDER BY h.recordedAt DESC")
    List<HealthData> findRecentByUser(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.weight IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findWeightHistoryByUser(@Param("user") User user);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.bmi IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findBMIHistoryByUser(@Param("user") User user);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.heartRate IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findHeartRateHistoryByUser(@Param("user") User user);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.systolicPressure IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findBloodPressureHistoryByUser(@Param("user") User user);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.steps IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findStepsHistoryByUser(@Param("user") User user);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.sleepHours IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findSleepHistoryByUser(@Param("user") User user);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.exerciseMinutes IS NOT NULL ORDER BY h.recordedAt DESC")
    List<HealthData> findExerciseHistoryByUser(@Param("user") User user);
    
    @Query("SELECT AVG(h.weight) FROM HealthData h WHERE h.user = :user AND h.weight IS NOT NULL AND h.recordedAt >= :startDate")
    Double findAverageWeightByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(h.bmi) FROM HealthData h WHERE h.user = :user AND h.bmi IS NOT NULL AND h.recordedAt >= :startDate")
    Double findAverageBMIByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(h.heartRate) FROM HealthData h WHERE h.user = :user AND h.heartRate IS NOT NULL AND h.recordedAt >= :startDate")
    Double findAverageHeartRateByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(h.steps) FROM HealthData h WHERE h.user = :user AND h.steps IS NOT NULL AND h.recordedAt >= :startDate")
    Double findAverageStepsByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(h.sleepHours) FROM HealthData h WHERE h.user = :user AND h.sleepHours IS NOT NULL AND h.recordedAt >= :startDate")
    Double findAverageSleepHoursByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(h.exerciseMinutes) FROM HealthData h WHERE h.user = :user AND h.exerciseMinutes IS NOT NULL AND h.recordedAt >= :startDate")
    Double findAverageExerciseMinutesByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(h) FROM HealthData h WHERE h.user = :user AND h.recordedAt >= :startDate")
    Long countRecordsByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.recordedAt BETWEEN :startDate AND :endDate ORDER BY h.recordedAt DESC")
    List<HealthData> findByUserAndDateRange(@Param("user") User user, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT h FROM HealthData h WHERE h.user = :user AND h.recordedAt >= :startDate AND h.recordedAt < :endDate ORDER BY h.recordedAt DESC")
    List<HealthData> findTodayRecordsByUser(@Param("user") User user, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
}
