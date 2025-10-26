package com.example.backend.service;

import com.example.backend.dto.MedicationGuidanceResponse;
import com.example.backend.entity.MedicationGuidance;
import com.example.backend.entity.User;
import com.example.backend.repository.MedicationGuidanceRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    public MedicationGuidanceResponse generateMedicationGuidance(Long userId, String symptoms) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // TODO: Integrate with Gemini AI for generating medication guidance
        // For now, create a basic guidance
        MedicationGuidance guidance = createBasicMedicationGuidance(user, symptoms);
        
        MedicationGuidance savedGuidance = medicationGuidanceRepository.save(guidance);
        return MedicationGuidanceResponse.fromMedicationGuidance(savedGuidance);
    }
    
    private MedicationGuidance createBasicMedicationGuidance(User user, String symptoms) {
        MedicationGuidance guidance = new MedicationGuidance();
        guidance.setUser(user);
        guidance.setSymptoms(symptoms);
        
        // Basic guidance - should be replaced with AI-generated content
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
