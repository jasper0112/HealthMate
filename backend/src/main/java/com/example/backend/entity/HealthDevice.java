package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthDevice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 100)
    private String deviceName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType deviceType;
    
    @Column(length = 100)
    private String manufacturer;
    
    @Column(length = 200)
    private String deviceModel;
    
    @Column(length = 200)
    private String connectionProtocol; // Bluetooth, WiFi, USB, etc.
    
    @Column(length = 500)
    private String deviceIdentifier; // MAC address, serial number, etc.
    
    @Column(nullable = false)
    private Boolean isConnected = false;
    
    private LocalDateTime lastSyncTime;
    
    private LocalDateTime lastDataReceivedTime;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum DeviceType {
        SMARTWATCH,         // Smartwatch
        FITNESS_TRACKER,    // Fitness tracker
        BLOOD_PRESSURE_MONITOR, // Blood pressure monitor
        GLUCOSE_METER,      // Glucose meter
        WEIGHT_SCALE,       // Smart scale
        PULSE_OXIMETER,     // Pulse oximeter
        OTHER               // Other
    }
}
