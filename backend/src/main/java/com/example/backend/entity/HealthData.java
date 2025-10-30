package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    @DecimalMin(value = "0.0", message = "Weight must be positive")
    @DecimalMax(value = "1000.0", message = "Weight must be reasonable")
    private BigDecimal weight;

    @DecimalMin(value = "0.0", message = "Height must be positive")
    @DecimalMax(value = "300.0", message = "Height must be reasonable")
    private BigDecimal height; // NOTE: stored in **meters** after normalization

    @DecimalMin(value = "0.0", message = "BMI must be positive")
    @DecimalMax(value = "100.0", message = "BMI must be reasonable")
    private BigDecimal bmi;

    @Min(value = 0, message = "Systolic pressure must be positive")
    @Max(value = 300, message = "Systolic pressure must be reasonable")
    private Integer systolicPressure;

    @Min(value = 0, message = "Diastolic pressure must be positive")
    @Max(value = 200, message = "Diastolic pressure must be reasonable")
    private Integer diastolicPressure;

    @Min(value = 30, message = "Heart rate must be at least 30")
    @Max(value = 250, message = "Heart rate must be reasonable")
    private Integer heartRate;

    @DecimalMin(value = "0.0", message = "Body temperature must be positive")
    @DecimalMax(value = "50.0", message = "Body temperature must be reasonable")
    private BigDecimal bodyTemperature;

    @Min(value = 0, message = "Blood sugar must be positive")
    @Max(value = 1000, message = "Blood sugar must be reasonable")
    private Integer bloodSugar;

    @Enumerated(EnumType.STRING)
    private MoodLevel mood = MoodLevel.NEUTRAL;

    @Min(value = 0, message = "Sleep hours must be positive")
    @Max(value = 24, message = "Sleep hours cannot exceed 24")
    private Integer sleepHours;

    @Min(value = 0, message = "Exercise minutes must be positive")
    @Max(value = 1440, message = "Exercise minutes cannot exceed 24 hours")
    private Integer exerciseMinutes;

    @Min(value = 0, message = "Water intake must be positive")
    @Max(value = 10000, message = "Water intake must be reasonable")
    private Integer waterIntake;

    @Min(value = 0, message = "Steps must be positive")
    @Max(value = 100000, message = "Steps must be reasonable")
    private Integer steps;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        // Normalize height to meters if client submitted centimeters
        normalizeHeightToMeters();
        calculateBMI();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        normalizeHeightToMeters();
        calculateBMI();
    }

    /**
     * If height is clearly in centimeters (e.g., 160–200), convert to meters.
     * We treat any value > 3.0 as centimeters.
     */
    private void normalizeHeightToMeters() {
        if (height != null) {
            if (height.compareTo(new BigDecimal("3.0")) > 0) {
                // Convert cm -> m
                height = height.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            }
        }
    }

    /**
     * Calculate BMI = kg / (m^2) with scale=2.
     * Requires non-null weight and height (> 0).
     */
    public void calculateBMI() {
        if (weight != null && height != null && height.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal h2 = height.multiply(height);
            if (h2.compareTo(BigDecimal.ZERO) > 0) {
                this.bmi = weight.divide(h2, 2, RoundingMode.HALF_UP);
                return;
            }
        }
        this.bmi = null; // if inputs are invalid, drop BMI so UI/AI can report missing
    }

    public enum MoodLevel {
        VERY_HAPPY, HAPPY, NEUTRAL, SAD, VERY_SAD, ANXIOUS, STRESSED, ENERGETIC, TIRED
    }
}
