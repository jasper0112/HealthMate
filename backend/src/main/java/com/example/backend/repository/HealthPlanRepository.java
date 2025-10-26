package com.example.backend.repository;

import com.example.backend.entity.HealthPlan;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthPlanRepository extends JpaRepository<HealthPlan, Long> {
    
    List<HealthPlan> findByUserOrderByPlanDateDesc(User user);
    
    Optional<HealthPlan> findFirstByUserOrderByPlanDateDesc(User user);
    
    List<HealthPlan> findByUserAndTypeOrderByPlanDateDesc(User user, HealthPlan.PlanType type);
    
    List<HealthPlan> findByUserAndPlanDateBetweenOrderByPlanDateDesc(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    List<HealthPlan> findByUserAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByPlanDateDesc(User user, LocalDateTime date, LocalDateTime date2);
}
