package com.example.backend.dto;

import com.example.backend.entity.Facility;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FacilityResponse {
    
    private Long facilityId;
    private Facility.FacilityType facilityType;
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
    private String specialties;
    private String operatingHours;
    private String directions;
    private Integer distance; // Distance in meters
    private LocalDateTime createdAt;
    
    public static FacilityResponse fromFacility(Facility facility) {
        FacilityResponse response = new FacilityResponse();
        response.setFacilityId(facility.getFacilityId());
        response.setFacilityType(facility.getFacilityType());
        response.setName(facility.getName());
        response.setAddress(facility.getAddress());
        response.setPhoneNumber(facility.getPhoneNumber());
        response.setEmail(facility.getEmail());
        response.setLatitude(facility.getLatitude());
        response.setLongitude(facility.getLongitude());
        response.setDescription(facility.getDescription());
        response.setSpecialties(facility.getSpecialties());
        response.setOperatingHours(facility.getOperatingHours());
        response.setDirections(facility.getDirections());
        response.setDistance(facility.getDistance());
        response.setCreatedAt(facility.getCreatedAt());
        return response;
    }
}
