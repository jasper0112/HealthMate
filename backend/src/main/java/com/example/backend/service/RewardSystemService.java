package com.example.backend.service;

import com.example.backend.dto.response.RewardSystemResponse;
import com.example.backend.entity.RewardSystem;
import com.example.backend.entity.User;
import com.example.backend.repository.RewardSystemRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class RewardSystemService {
    
    @Autowired
    private RewardSystemRepository rewardSystemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public RewardSystemResponse dailyCheckIn(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        RewardSystem rewardSystem = rewardSystemRepository.findByUser(user)
                .orElseGet(() -> createRewardSystem(user));
        
        rewardSystem.dailyCheckIn();
        
        RewardSystem saved = rewardSystemRepository.save(rewardSystem);
        return RewardSystemResponse.fromRewardSystem(saved);
    }
    
    @Transactional(readOnly = true)
    public Optional<RewardSystemResponse> getUserRewards(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return rewardSystemRepository.findByUser(user)
                .map(RewardSystemResponse::fromRewardSystem);
    }
    
    private RewardSystem createRewardSystem(User user) {
        RewardSystem rewardSystem = new RewardSystem();
        rewardSystem.setUser(user);
        rewardSystem.setTotalPoints(0);
        rewardSystem.setLifetimePoints(0);
        rewardSystem.setTier(1);
        rewardSystem.setTierName("Bronze");
        return rewardSystemRepository.save(rewardSystem);
    }
    
    public RewardSystemResponse recordHealthDataEntry(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        RewardSystem rewardSystem = rewardSystemRepository.findByUser(user)
                .orElseGet(() -> createRewardSystem(user));
        
        rewardSystem.recordHealthDataEntry();
        RewardSystem saved = rewardSystemRepository.save(rewardSystem);
        return RewardSystemResponse.fromRewardSystem(saved);
    }
    
    public RewardSystemResponse recordAssessmentCompletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        RewardSystem rewardSystem = rewardSystemRepository.findByUser(user)
                .orElseGet(() -> createRewardSystem(user));
        
        rewardSystem.recordAssessmentCompletion();
        RewardSystem saved = rewardSystemRepository.save(rewardSystem);
        return RewardSystemResponse.fromRewardSystem(saved);
    }
}
