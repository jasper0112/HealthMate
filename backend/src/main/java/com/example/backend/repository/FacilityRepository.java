package com.example.backend.repository;

import com.example.backend.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    
    List<Facility> findByFacilityType(Facility.FacilityType facilityType);
    
    List<Facility> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT f FROM Facility f WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(f.latitude)) * " +
           "cos(radians(f.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(f.latitude)))) < :distance " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(f.latitude)) * " +
           "cos(radians(f.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(f.latitude))))")
    List<Facility> findNearbyFacilities(@Param("lat") BigDecimal latitude, 
                                       @Param("lng") BigDecimal longitude, 
                                       @Param("distance") double distanceInKm);
    
    @Query("SELECT f FROM Facility f WHERE f.facilityType = :type")
    List<Facility> findByType(@Param("type") Facility.FacilityType type);
    
    List<Facility> findBySpecialtiesContainingIgnoreCase(String specialty);
}
