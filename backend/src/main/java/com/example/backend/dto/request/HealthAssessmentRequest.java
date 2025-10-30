package com.example.backend.dto.request;

import com.example.backend.entity.HealthAssessment;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request payload for triggering a health assessment.
 * Simplified: no "lastOnly" flag. Either use explicit start/end,
 * or a daysBack sliding window.
 */
@Data
public class HealthAssessmentRequest {

    private Long userId;

    private HealthAssessment.AssessmentType type = HealthAssessment.AssessmentType.GENERAL;

    /** Lookback window in days when start/end are not specified. */
    private Integer daysBack = 30;

    /** Kept for compatibility; not critical to trigger logic. */
    private Boolean includeHistoricalData = true;

    /** Optional explicit window (takes precedence over daysBack). */
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
