package com.example.backend.repository;

import com.example.backend.entity.InsuranceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsuranceProductRepository extends JpaRepository<InsuranceProduct, Long> {
    
    List<InsuranceProduct> findByActiveTrue();
    
    List<InsuranceProduct> findByProductTypeAndActiveTrue(InsuranceProduct.ProductType productType);
    
    List<InsuranceProduct> findByIsRecommendedForStudentsTrue();
    
    List<InsuranceProduct> findByIsRecommendedForImmigrantsTrue();
    
    List<InsuranceProduct> findByInsuranceNameContainingIgnoreCase(String name);
}
