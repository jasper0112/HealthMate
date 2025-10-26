package com.example.backend.controller;

import com.example.backend.dto.FacilityResponse;
import com.example.backend.entity.Facility;
import com.example.backend.service.FacilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "*")
public class FacilityController {
    
    @Autowired
    private FacilityService facilityService;
    
    /**
     * Get all facilities
     * GET /api/facilities
     */
    @GetMapping
    public ResponseEntity<List<FacilityResponse>> getAllFacilities() {
        List<FacilityResponse> facilities = facilityService.getAllFacilities();
        return ResponseEntity.ok(facilities);
    }
    
    /**
     * Get facility by ID
     * GET /api/facilities/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFacilityById(@PathVariable Long id) {
        return facilityService.getFacilityById(id)
                .map(facility -> ResponseEntity.ok(facility))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get facilities by type
     * GET /api/facilities/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<FacilityResponse>> getFacilitiesByType(@PathVariable Facility.FacilityType type) {
        List<FacilityResponse> facilities = facilityService.getFacilitiesByType(type);
        return ResponseEntity.ok(facilities);
    }
    
    /**
     * Search facilities by name
     * GET /api/facilities/search?name={name}
     */
    @GetMapping("/search")
    public ResponseEntity<List<FacilityResponse>> searchFacilities(@RequestParam String name) {
        List<FacilityResponse> facilities = facilityService.searchFacilitiesByName(name);
        return ResponseEntity.ok(facilities);
    }
    
    /**
     * Get nearby facilities
     * GET /api/facilities/nearby?lat={latitude}&lng={longitude}&distance={distance}
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<FacilityResponse>> getNearbyFacilities(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "10.0") double distance) {
        List<FacilityResponse> facilities = facilityService.getNearbyFacilities(lat, lng, distance);
        return ResponseEntity.ok(facilities);
    }
    
    /**
     * Get facilities by specialty
     * GET /api/facilities/specialty/{specialty}
     */
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<FacilityResponse>> getFacilitiesBySpecialty(@PathVariable String specialty) {
        List<FacilityResponse> facilities = facilityService.getFacilitiesBySpecialty(specialty);
        return ResponseEntity.ok(facilities);
    }
}
