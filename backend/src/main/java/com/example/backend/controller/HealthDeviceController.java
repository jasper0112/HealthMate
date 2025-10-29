package com.example.backend.controller;

import com.example.backend.dto.response.HealthDeviceResponse;
import com.example.backend.entity.HealthDevice;
import com.example.backend.service.HealthDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-devices")
@CrossOrigin(origins = "*")
public class HealthDeviceController {
    
    @Autowired
    private HealthDeviceService healthDeviceService;
    
    /**
     * Connect a health device
     * POST /api/health-devices?userId={userId}
     */
    @PostMapping
    public ResponseEntity<?> connectDevice(@RequestParam Long userId, @RequestBody HealthDevice device) {
        try {
            HealthDeviceResponse response = healthDeviceService.connectDevice(userId, device);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get user's devices
     * GET /api/health-devices/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserDevices(@PathVariable Long userId) {
        try {
            List<HealthDeviceResponse> devices = healthDeviceService.getUserDevices(userId);
            return ResponseEntity.ok(devices);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get connected devices
     * GET /api/health-devices/user/{userId}/connected
     */
    @GetMapping("/user/{userId}/connected")
    public ResponseEntity<?> getConnectedDevices(@PathVariable Long userId) {
        try {
            List<HealthDeviceResponse> devices = healthDeviceService.getConnectedDevices(userId);
            return ResponseEntity.ok(devices);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Disconnect device
     * PUT /api/health-devices/{deviceId}/disconnect
     */
    @PutMapping("/{deviceId}/disconnect")
    public ResponseEntity<?> disconnectDevice(@PathVariable Long deviceId) {
        try {
            HealthDeviceResponse response = healthDeviceService.disconnectDevice(deviceId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Update device sync time
     * PUT /api/health-devices/{deviceId}/sync
     */
    @PutMapping("/{deviceId}/sync")
    public ResponseEntity<?> updateSync(@PathVariable Long deviceId) {
        try {
            HealthDeviceResponse response = healthDeviceService.updateSyncTime(deviceId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
