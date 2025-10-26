package com.example.backend.dto;

import com.example.backend.entity.HealthDevice;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HealthDeviceResponse {
    
    private Long deviceId;
    private Long userId;
    private String username;
    private String deviceName;
    private HealthDevice.DeviceType deviceType;
    private String manufacturer;
    private String deviceModel;
    private String connectionProtocol;
    private String deviceIdentifier;
    private Boolean isConnected;
    private LocalDateTime lastSyncTime;
    private LocalDateTime lastDataReceivedTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static HealthDeviceResponse fromHealthDevice(HealthDevice device) {
        HealthDeviceResponse response = new HealthDeviceResponse();
        response.setDeviceId(device.getDeviceId());
        response.setUserId(device.getUser().getId());
        response.setUsername(device.getUser().getUsername());
        response.setDeviceName(device.getDeviceName());
        response.setDeviceType(device.getDeviceType());
        response.setManufacturer(device.getManufacturer());
        response.setDeviceModel(device.getDeviceModel());
        response.setConnectionProtocol(device.getConnectionProtocol());
        response.setDeviceIdentifier(device.getDeviceIdentifier());
        response.setIsConnected(device.getIsConnected());
        response.setLastSyncTime(device.getLastSyncTime());
        response.setLastDataReceivedTime(device.getLastDataReceivedTime());
        response.setCreatedAt(device.getCreatedAt());
        response.setUpdatedAt(device.getUpdatedAt());
        return response;
    }
}
