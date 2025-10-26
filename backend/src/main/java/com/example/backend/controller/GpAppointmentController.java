package com.example.backend.controller;

import com.example.backend.dto.GpAppointmentRequest;
import com.example.backend.dto.GpAppointmentResponse;
import com.example.backend.service.GpAppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gp-appointments")
@CrossOrigin(origins = "*")
public class GpAppointmentController {
    
    @Autowired
    private GpAppointmentService gpAppointmentService;
    
    /**
     * Book a GP appointment
     * POST /api/gp-appointments
     */
    @PostMapping
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody GpAppointmentRequest request) {
        try {
            GpAppointmentResponse appointment = gpAppointmentService.bookAppointment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get appointment by ID
     * GET /api/gp-appointments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        return gpAppointmentService.getAppointmentById(id)
                .map(appointment -> ResponseEntity.ok(appointment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get user's appointments
     * GET /api/gp-appointments/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAppointments(@PathVariable Long userId) {
        try {
            List<GpAppointmentResponse> appointments = gpAppointmentService.getUserAppointments(userId);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get upcoming appointments
     * GET /api/gp-appointments/user/{userId}/upcoming
     */
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<?> getUpcomingAppointments(@PathVariable Long userId) {
        try {
            List<GpAppointmentResponse> appointments = gpAppointmentService.getUpcomingAppointments(userId);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Cancel appointment
     * PUT /api/gp-appointments/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
        try {
            GpAppointmentResponse appointment = gpAppointmentService.cancelAppointment(id);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Reschedule appointment
     * PUT /api/gp-appointments/{id}/reschedule
     */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, 
                                                   @RequestParam LocalDateTime newDateTime) {
        try {
            GpAppointmentResponse appointment = gpAppointmentService.rescheduleAppointment(id, newDateTime);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
