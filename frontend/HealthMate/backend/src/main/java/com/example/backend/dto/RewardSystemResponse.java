package com.example.backend.dto;

import com.example.backend.entity.RewardSystem;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class RewardSystemResponse {
    
    private Long rewardId;
    private Long userId;
    private String username;
    private Integer totalPoints;
    private Integer lifetimePoints;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDate lastCheckInDate;
    private Map<LocalDate, Boolean> checkInRecords;
    private Integer healthDataEntries;
    private Integer completedAssessments;
    private Integer completedPlans;
    private Integer tier;
    private String tierName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static RewardSystemResponse fromRewardSystem(RewardSystem reward) {
        RewardSystemResponse response = new RewardSystemResponse();
        response.setRewardId(reward.getRewardId());
        response.setUserId(reward.getUser().getId());
        response.setUsername(reward.getUser().getUsername());
        response.setTotalPoints(reward.getTotalPoints());
        response.setLifetimePoints(reward.getLifetimePoints());
        response.setCurrentStreak(reward.getCurrentStreak());
        response.setLongestStreak(reward.getLongestStreak());
        response.setLastCheckInDate(reward.getLastCheckInDate());
        response.setCheckInRecords(reward.getCheckInRecords());
        response.setHealthDataEntries(reward.getHealthDataEntries());
        response.setCompletedAssessments(reward.getCompletedAssessments());
        response.setCompletedPlans(reward.getCompletedPlans());
        response.setTier(reward.getTier());
        response.setTierName(reward.getTierName());
        response.setCreatedAt(reward.getCreatedAt());
        response.setUpdatedAt(reward.getUpdatedAt());
        return response;
    }
}
