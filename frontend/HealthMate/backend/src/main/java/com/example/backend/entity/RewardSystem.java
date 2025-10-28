package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "reward_systems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardSystem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rewardId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Integer totalPoints = 0;
    
    @Column(nullable = false)
    private Integer lifetimePoints = 0;
    
    private Integer currentStreak = 0; // Consecutive check-in days
    
    private Integer longestStreak = 0;
    
    private LocalDate lastCheckInDate;
    
    @ElementCollection
    @MapKeyColumn(name = "check_in_date")
    @Column(name = "checked_in")
    @CollectionTable(name = "check_in_records", joinColumns = @JoinColumn(name = "reward_id"))
    private Map<LocalDate, Boolean> checkInRecords = new HashMap<>();
    
    @Column(nullable = false)
    private Integer healthDataEntries = 0;
    
    @Column(nullable = false)
    private Integer completedAssessments = 0;
    
    @Column(nullable = false)
    private Integer completedPlans = 0;
    
    @Column(nullable = false)
    private Integer tier = 1; // User tier: 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
    
    @Column(length = 50)
    private String tierName; // Bronze, Silver, Gold, Platinum
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.tierName == null) {
            this.tierName = "Bronze";
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateTier();
    }
    
    public void dailyCheckIn() {
        LocalDate today = LocalDate.now();
        
        if (!checkInRecords.containsKey(today) || !checkInRecords.get(today)) {
            // New check-in
            checkInRecords.put(today, true);
            this.lastCheckInDate = today;
            
            // Update streak
            if (lastCheckInDate != null && lastCheckInDate.equals(today.minusDays(1))) {
                // Consecutive day
                currentStreak++;
            } else {
                // New streak
                currentStreak = 1;
            }
            
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
            
            // Award points
            int pointsAwarded = calculateDailyCheckInPoints();
            this.totalPoints += pointsAwarded;
            this.lifetimePoints += pointsAwarded;
            
            updateTier();
        }
    }
    
    private int calculateDailyCheckInPoints() {
        int basePoints = 10;
        int streakBonus = Math.min(currentStreak, 7) * 2; // Max 14 bonus points
        return basePoints + streakBonus;
    }
    
    private void updateTier() {
        if (lifetimePoints >= 10000) {
            this.tier = 4;
            this.tierName = "Platinum";
        } else if (lifetimePoints >= 5000) {
            this.tier = 3;
            this.tierName = "Gold";
        } else if (lifetimePoints >= 1000) {
            this.tier = 2;
            this.tierName = "Silver";
        } else {
            this.tier = 1;
            this.tierName = "Bronze";
        }
    }
    
    public void addPoints(int points, String reason) {
        this.totalPoints += points;
        this.lifetimePoints += points;
        updateTier();
    }
    
    public boolean redeemPoints(int pointsNeeded) {
        if (this.totalPoints >= pointsNeeded) {
            this.totalPoints -= pointsNeeded;
            return true;
        }
        return false;
    }
    
    public void recordHealthDataEntry() {
        this.healthDataEntries++;
        addPoints(5, "Health data entry");
    }
    
    public void recordAssessmentCompletion() {
        this.completedAssessments++;
        addPoints(50, "Assessment completion");
    }
    
    public void recordPlanCompletion() {
        this.completedPlans++;
        addPoints(100, "Plan completion");
    }
}
