package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "insurance_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long insuranceId;
    
    @Column(nullable = false, length = 200)
    private String insuranceName;
    
    @Column(length = 500)
    private String providerName;
    
    @Column(length = 20)
    private String phoneNumber;
    
    @Column(length = 100)
    private String email;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String insuranceInfo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType productType;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String coverageDetails;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String benefits;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;
    
    private BigDecimal monthlyPremium;
    
    private BigDecimal annualPremium;
    
    @Column(length = 500)
    private String targetAudience; // e.g., "International students", "New immigrants"
    
    private Boolean isRecommendedForStudents = false;
    
    private Boolean isRecommendedForImmigrants = false;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    public enum ProductType {
        PRIVATE_HEALTH,         // Private health insurance
        STUDENT_HEALTH,         // Student health insurance
        TRAVEL_HEALTH,          // Travel health insurance
        FAMILY_HEALTH,          // Family health insurance
        VISITOR_HEALTH          // Visitor health insurance
    }
}
