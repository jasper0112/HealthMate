package com.example.backend.repository;

import com.example.backend.entity.InsuranceRecommendation;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRecommendationRepository extends JpaRepository<InsuranceRecommendation, Long> {
    
    List<InsuranceRecommendation> findByUserOrderByRecommendationDateDesc(User user);
    
    Optional<InsuranceRecommendation> findFirstByUserOrderByRecommendationDateDesc(User user);
}
