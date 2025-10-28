package com.example.backend.repository;

import com.example.backend.entity.SmartTriage;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmartTriageRepository extends JpaRepository<SmartTriage, Long> {
    
    List<SmartTriage> findByUserOrderByTriageTimeDesc(User user);
    
    Optional<SmartTriage> findFirstByUserOrderByTriageTimeDesc(User user);
    
    List<SmartTriage> findByPriorityOrderByTriageTimeDesc(SmartTriage.TriagePriority priority);
}
