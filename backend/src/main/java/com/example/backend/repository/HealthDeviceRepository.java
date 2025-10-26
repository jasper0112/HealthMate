package com.example.backend.repository;

import com.example.backend.entity.HealthDevice;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthDeviceRepository extends JpaRepository<HealthDevice, Long> {
    
    List<HealthDevice> findByUser(User user);
    
    List<HealthDevice> findByUserAndIsConnectedTrue(User user);
    
    Optional<HealthDevice> findByUserAndDeviceIdentifier(User user, String deviceIdentifier);
    
    List<HealthDevice> findByDeviceType(HealthDevice.DeviceType deviceType);
}
