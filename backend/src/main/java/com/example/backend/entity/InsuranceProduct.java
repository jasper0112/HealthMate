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
    
    @Column(length = 2000)
    private String insuranceInfo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType productType;
    
    @Column(length = 3000)
    private String coverageDetails;
    
    @Column(length = 2000)
    private String benefits;
    
    @Column(length = 2000)
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
        PRIVATE_HEALTH,         // 私人健康保险
        STUDENT_HEALTH,         // 学生健康保险
        TRAVEL_HEALTH,          // 旅游健康保险
        FAMILY_HEALTH,          // 家庭健康保险
        VISITOR_HEALTH          // 访客健康保险
    }
}
