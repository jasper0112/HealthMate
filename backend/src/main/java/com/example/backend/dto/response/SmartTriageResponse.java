package com.example.backend.dto.response;

import com.example.backend.entity.SmartTriage;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SmartTriageResponse {
    
    private Long triageId;
    private Long userId;
    private String username;
    private String symptomsInfo;
    private SmartTriage.TriagePriority priority;
    private String triageResult;
    private String recommendedAction;
    private String aiAnalysis;
    private LocalDateTime triageTime;
    private Long associatedAppointmentId;
    private LocalDateTime createdAt;
    
    public static SmartTriageResponse fromSmartTriage(SmartTriage triage) {
        SmartTriageResponse response = new SmartTriageResponse();
        response.setTriageId(triage.getTriageId());
        response.setUserId(triage.getUser().getId());
        response.setUsername(triage.getUser().getUsername());
        response.setSymptomsInfo(triage.getSymptomsInfo());
        response.setPriority(triage.getPriority());
        response.setTriageResult(triage.getTriageResult());
        response.setRecommendedAction(triage.getRecommendedAction());
        response.setAiAnalysis(triage.getAiAnalysis());
        response.setTriageTime(triage.getTriageTime());
        response.setAssociatedAppointmentId(triage.getAssociatedAppointmentId());
        response.setCreatedAt(triage.getCreatedAt());
        return response;
    }
}

