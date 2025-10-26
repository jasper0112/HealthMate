package com.example.backend.repository;

import com.example.backend.entity.HealthAssessment;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthAssessmentRepository extends JpaRepository<HealthAssessment, Long> {
    
    List<HealthAssessment> findByUserOrderByAssessedAtDesc(User user);
    
    Optional<HealthAssessment> findFirstByUserOrderByAssessedAtDesc(User user);
    
    List<HealthAssessment> findByUserAndAssessedAtBetweenOrderByAssessedAtDesc(
        User user, LocalDateTime startDate, LocalDateTime endDate);
    
    List<HealthAssessment> findByUserAndTypeOrderByAssessedAtDesc(User user, HealthAssessment.AssessmentType type);
    
    @Query("SELECT h FROM HealthAssessment h WHERE h.user = :user AND h.assessedAt >= :startDate ORDER BY h.assessedAt DESC")
    List<HealthAssessment> findRecentByUser(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(h) FROM HealthAssessment h WHERE h.user = :user AND h.assessedAt >= :startDate")
    Long countByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
}
