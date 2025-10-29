package com.example.backend.dto.response;

import com.example.backend.entity.GpAppointment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GpAppointmentResponse {
    
    private Long appointmentId;
    private Long userId;
    private String username;
    private Long facilityId;
    private String facilityName;
    private String facilityAddress;
    private LocalDateTime appointmentDate;
    private GpAppointment.AppointmentStatus status;
    private String notes;
    private String reason;
    private LocalDateTime reminderTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static GpAppointmentResponse fromGpAppointment(GpAppointment appointment) {
        GpAppointmentResponse response = new GpAppointmentResponse();
        response.setAppointmentId(appointment.getAppointmentId());
        response.setUserId(appointment.getUser().getId());
        response.setUsername(appointment.getUser().getUsername());
        response.setFacilityId(appointment.getFacility().getFacilityId());
        response.setFacilityName(appointment.getFacility().getName());
        response.setFacilityAddress(appointment.getFacility().getAddress());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setStatus(appointment.getStatus());
        response.setNotes(appointment.getNotes());
        response.setReason(appointment.getReason());
        response.setReminderTime(appointment.getReminderTime());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        return response;
    }
}

