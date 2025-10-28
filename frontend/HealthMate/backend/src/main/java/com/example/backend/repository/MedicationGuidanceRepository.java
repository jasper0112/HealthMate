package com.example.backend.repository;

import com.example.backend.entity.MedicationGuidance;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicationGuidanceRepository extends JpaRepository<MedicationGuidance, Long> {
    
    List<MedicationGuidance> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<MedicationGuidance> findFirstByUserOrderByCreatedAtDesc(User user);
    
    List<MedicationGuidance> findBySymptomsContainingIgnoreCase(String symptoms);
}
