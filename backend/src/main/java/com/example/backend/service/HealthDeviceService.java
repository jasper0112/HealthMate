package com.example.backend.service;

import com.example.backend.dto.response.HealthDeviceResponse;
import com.example.backend.entity.HealthDevice;
import com.example.backend.entity.User;
import com.example.backend.repository.HealthDeviceRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HealthDeviceService {
    
    @Autowired
    private HealthDeviceRepository healthDeviceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public HealthDeviceResponse connectDevice(Long userId, HealthDevice device) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        device.setUser(user);
        device.setIsConnected(true);
        device.setLastSyncTime(LocalDateTime.now());
        
        HealthDevice savedDevice = healthDeviceRepository.save(device);
        return HealthDeviceResponse.fromHealthDevice(savedDevice);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDeviceResponse> getUserDevices(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthDeviceRepository.findByUser(user).stream()
                .map(HealthDeviceResponse::fromHealthDevice)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<HealthDeviceResponse> getConnectedDevices(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return healthDeviceRepository.findByUserAndIsConnectedTrue(user).stream()
                .map(HealthDeviceResponse::fromHealthDevice)
                .collect(Collectors.toList());
    }
    
    public HealthDeviceResponse disconnectDevice(Long deviceId) {
        HealthDevice device = healthDeviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        
        device.setIsConnected(false);
        HealthDevice savedDevice = healthDeviceRepository.save(device);
        return HealthDeviceResponse.fromHealthDevice(savedDevice);
    }
    
    public HealthDeviceResponse updateSyncTime(Long deviceId) {
        HealthDevice device = healthDeviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        
        device.setLastSyncTime(LocalDateTime.now());
        device.setLastDataReceivedTime(LocalDateTime.now());
        
        HealthDevice savedDevice = healthDeviceRepository.save(device);
        return HealthDeviceResponse.fromHealthDevice(savedDevice);
    }
}
