package com.example.backend.repository;

import com.example.backend.entity.DietGuidance;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DietGuidanceRepository extends JpaRepository<DietGuidance, Long> {
    
    List<DietGuidance> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<DietGuidance> findFirstByUserOrderByCreatedAtDesc(User user);
    
    List<DietGuidance> findByHealthIssueContainingIgnoreCase(String healthIssue);
}
