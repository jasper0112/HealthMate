package com.example.backend.service;

import com.example.backend.dto.SmartTriageRequest;
import com.example.backend.dto.SmartTriageResponse;
import com.example.backend.entity.SmartTriage;
import com.example.backend.entity.User;
import com.example.backend.repository.SmartTriageRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SmartTriageService {
    
    @Autowired
    private SmartTriageRepository smartTriageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private GeminiTriageService geminiTriageService;
    
    public SmartTriageResponse generateTriage(SmartTriageRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SmartTriage triage = geminiTriageService.generateGeminiTriage(
            request.getSymptomsInfo(), 
            user, 
            request.getAdditionalContext());
        
        SmartTriage savedTriage = smartTriageRepository.save(triage);
        
        return SmartTriageResponse.fromSmartTriage(savedTriage);
    }
    
    @Transactional(readOnly = true)
    public List<SmartTriageResponse> getTriageHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return smartTriageRepository.findByUserOrderByTriageTimeDesc(user).stream()
                .map(SmartTriageResponse::fromSmartTriage)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<SmartTriageResponse> getLatestTriage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return smartTriageRepository.findFirstByUserOrderByTriageTimeDesc(user)
                .map(SmartTriageResponse::fromSmartTriage);
    }
    
    @Transactional(readOnly = true)
    public Optional<SmartTriageResponse> getTriageById(Long id) {
        return smartTriageRepository.findById(id)
                .map(SmartTriageResponse::fromSmartTriage);
    }
    
    public void deleteTriage(Long id) {
        if (!smartTriageRepository.existsById(id)) {
            throw new RuntimeException("Triage record not found");
        }
        smartTriageRepository.deleteById(id);
    }
}
