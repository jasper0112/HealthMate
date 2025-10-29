package com.example.backend.service;

import com.example.backend.dto.request.GpAppointmentRequest;
import com.example.backend.dto.response.GpAppointmentResponse;
import com.example.backend.entity.Facility;
import com.example.backend.entity.GpAppointment;
import com.example.backend.entity.User;
import com.example.backend.repository.FacilityRepository;
import com.example.backend.repository.GpAppointmentRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GpAppointmentService {
    
    @Autowired
    private GpAppointmentRepository gpAppointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FacilityRepository facilityRepository;
    
    public GpAppointmentResponse bookAppointment(GpAppointmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        GpAppointment appointment = new GpAppointment();
        appointment.setUser(user);
        appointment.setFacility(facility);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());
        appointment.setReminderTime(request.getReminderTime());
        appointment.setStatus(GpAppointment.AppointmentStatus.SCHEDULED);
        
        GpAppointment savedAppointment = gpAppointmentRepository.save(appointment);
        return GpAppointmentResponse.fromGpAppointment(savedAppointment);
    }
    
    @Transactional(readOnly = true)
    public List<GpAppointmentResponse> getUserAppointments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return gpAppointmentRepository.findByUserOrderByAppointmentDateDesc(user).stream()
                .map(GpAppointmentResponse::fromGpAppointment)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<GpAppointmentResponse> getAppointmentById(Long id) {
        return gpAppointmentRepository.findById(id)
                .map(GpAppointmentResponse::fromGpAppointment);
    }
    
    public GpAppointmentResponse cancelAppointment(Long id) {
        GpAppointment appointment = gpAppointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(GpAppointment.AppointmentStatus.CANCELLED);
        GpAppointment updatedAppointment = gpAppointmentRepository.save(appointment);
        return GpAppointmentResponse.fromGpAppointment(updatedAppointment);
    }
    
    public GpAppointmentResponse rescheduleAppointment(Long id, LocalDateTime newDateTime) {
        GpAppointment appointment = gpAppointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setAppointmentDate(newDateTime);
        appointment.setStatus(GpAppointment.AppointmentStatus.SCHEDULED);
        GpAppointment updatedAppointment = gpAppointmentRepository.save(appointment);
        return GpAppointmentResponse.fromGpAppointment(updatedAppointment);
    }
    
    @Transactional(readOnly = true)
    public List<GpAppointmentResponse> getUpcomingAppointments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        LocalDateTime now = LocalDateTime.now();
        return gpAppointmentRepository.findByUserAndStatusOrderByAppointmentDateDesc(
                user, GpAppointment.AppointmentStatus.SCHEDULED).stream()
                .filter(a -> a.getAppointmentDate().isAfter(now))
                .map(GpAppointmentResponse::fromGpAppointment)
                .collect(Collectors.toList());
    }
}
