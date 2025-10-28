package com.example.backend.service;

import com.example.backend.dto.FacilityResponse;
import com.example.backend.entity.Facility;
import com.example.backend.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FacilityService {
    
    @Autowired
    private FacilityRepository facilityRepository;
    
    @Transactional(readOnly = true)
    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(FacilityResponse::fromFacility)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<FacilityResponse> getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .map(FacilityResponse::fromFacility);
    }
    
    @Transactional(readOnly = true)
    public List<FacilityResponse> getFacilitiesByType(Facility.FacilityType type) {
        return facilityRepository.findByFacilityType(type).stream()
                .map(FacilityResponse::fromFacility)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FacilityResponse> searchFacilitiesByName(String name) {
        return facilityRepository.findByNameContainingIgnoreCase(name).stream()
                .map(FacilityResponse::fromFacility)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FacilityResponse> getNearbyFacilities(BigDecimal latitude, BigDecimal longitude, double distanceInKm) {
        return facilityRepository.findNearbyFacilities(latitude, longitude, distanceInKm).stream()
                .map(FacilityResponse::fromFacility)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<FacilityResponse> getFacilitiesBySpecialty(String specialty) {
        return facilityRepository.findBySpecialtiesContainingIgnoreCase(specialty).stream()
                .map(FacilityResponse::fromFacility)
                .collect(Collectors.toList());
    }
    
    public FacilityResponse createFacility(Facility facility) {
        Facility savedFacility = facilityRepository.save(facility);
        return FacilityResponse.fromFacility(savedFacility);
    }
    
    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new RuntimeException("Facility not found");
        }
        facilityRepository.deleteById(id);
    }
}
