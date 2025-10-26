package com.example.backend.repository;

import com.example.backend.entity.Facility;
import com.example.backend.entity.GpAppointment;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GpAppointmentRepository extends JpaRepository<GpAppointment, Long> {
    
    List<GpAppointment> findByUserOrderByAppointmentDateDesc(User user);
    
    Optional<GpAppointment> findFirstByUserOrderByAppointmentDateDesc(User user);
    
    List<GpAppointment> findByFacilityOrderByAppointmentDateDesc(Facility facility);
    
    List<GpAppointment> findByStatusOrderByAppointmentDateAsc(GpAppointment.AppointmentStatus status);
    
    List<GpAppointment> findByUserAndStatusOrderByAppointmentDateDesc(User user, GpAppointment.AppointmentStatus status);
    
    List<GpAppointment> findByAppointmentDateBetweenOrderByAppointmentDateAsc(LocalDateTime start, LocalDateTime end);
}
