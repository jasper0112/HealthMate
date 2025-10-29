package com.example.backend.service;

import com.example.backend.dto.response.MedicationGuidanceResponse;
import com.example.backend.entity.MedicationGuidance;
import com.example.backend.entity.User;
import com.example.backend.repository.MedicationGuidanceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ai.GeminiMedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicationGuidanceService {
    
    @Autowired
    private MedicationGuidanceRepository medicationGuidanceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired(required = false)
    private GeminiMedicationService geminiMedicationService;
    
    @Value("${gemini.enabled:false}")
    private Boolean geminiEnabled;
    
    public MedicationGuidanceResponse generateMedicationGuidance(Long userId, String symptoms) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        MedicationGuidance guidance;
        
        // Try to use Gemini AI if enabled, otherwise fall back to basic guidance
        if (geminiEnabled && geminiMedicationService != null) {
            try {
                guidance = geminiMedicationService.generateGeminiMedicationGuidance(user, symptoms);
            } catch (Exception e) {
                System.err.println("Gemini medication guidance failed, falling back to basic guidance: " + e.getMessage());
                guidance = createBasicMedicationGuidance(user, symptoms);
            }
        } else {
            // Fall back to basic guidance
            guidance = createBasicMedicationGuidance(user, symptoms);
        }
        
        MedicationGuidance savedGuidance = medicationGuidanceRepository.save(guidance);
        return MedicationGuidanceResponse.fromMedicationGuidance(savedGuidance);
    }
    
    private MedicationGuidance createBasicMedicationGuidance(User user, String symptoms) {
        MedicationGuidance guidance = new MedicationGuidance();
        guidance.setUser(user);
        guidance.setSymptoms(symptoms);
        
        // Basic guidance - fallback when Gemini is not available
        if (symptoms.toLowerCase().contains("headache")) {
            guidance.setConditionDescription("Mild to moderate headache");
            guidance.setOtcMedications("• Ibuprofen 200-400mg every 4-6 hours\n• Paracetamol 500mg every 4-6 hours\n• Ensure adequate hydration");
            guidance.setUsageInstructions("Take with food. Do not exceed recommended dosage.");
            guidance.setPrecautions("Avoid if allergic. Consult doctor if persistent for more than 48 hours.");
            guidance.setSideEffects("Possible stomach upset, dizziness");
            guidance.setGuidance("For headaches: Rest, hydration, and over-the-counter pain relievers. If severe or persistent, consult a doctor.");
        } else {
            guidance.setConditionDescription("General symptoms");
            guidance.setOtcMedications("Please consult with a pharmacist for appropriate over-the-counter medications.");
            guidance.setUsageInstructions("Follow package instructions carefully.");
            guidance.setPrecautions("Consult healthcare professional if symptoms persist.");
            guidance.setGuidance("Consider consulting with a healthcare professional for proper diagnosis and treatment.");
        }
        
        return guidance;
    }
    
    @Transactional(readOnly = true)
    public List<MedicationGuidanceResponse> getUserGuidance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return medicationGuidanceRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(MedicationGuidanceResponse::fromMedicationGuidance)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<MedicationGuidanceResponse> getGuidanceById(Long id) {
        return medicationGuidanceRepository.findById(id)
                .map(MedicationGuidanceResponse::fromMedicationGuidance);
    }
    
    @Transactional(readOnly = true)
    public List<MedicationGuidanceResponse> searchBySymptoms(String symptoms) {
        return medicationGuidanceRepository.findBySymptomsContainingIgnoreCase(symptoms).stream()
                .map(MedicationGuidanceResponse::fromMedicationGuidance)
                .collect(Collectors.toList());
    }
    
    public void deleteGuidance(Long id) {
        if (!medicationGuidanceRepository.existsById(id)) {
            throw new RuntimeException("Medication guidance not found");
        }
        medicationGuidanceRepository.deleteById(id);
    }
}
