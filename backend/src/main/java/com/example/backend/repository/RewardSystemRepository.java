package com.example.backend.repository;

import com.example.backend.entity.RewardSystem;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardSystemRepository extends JpaRepository<RewardSystem, Long> {
    
    Optional<RewardSystem> findByUser(User user);
}
