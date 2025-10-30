package com.example.backend.service.ai;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.response.HealthDataResponse;
import com.example.backend.entity.HealthAssessment;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.DoubleStream;

@Service
public class GeminiAssessmentService {

    @Value("${gemini.enabled:false}")
    private Boolean geminiEnabled;

    @Autowired(required = false)
    private WebClient geminiWebClient;

    @Autowired(required = false)
    private GeminiConfig geminiConfig;

    @Value("${gemini.model:gemini-2.5-pro}")
    private String model;

    @Value("${gemini.max-tokens:8000}")
    private Integer maxTokens;

    @Value("${gemini.temperature:0.7}")
    private Double temperature;

    /**
     * Main entry:
     * - If Gemini is available and enabled -> call Gemini with a strict JSON schema.
     * - Otherwise -> fall back to local heuristic scoring (never hard-code 75).
     */
    public HealthAssessment generateGeminiAssessment(
            List<HealthDataResponse> healthDataList,
            HealthAssessment.AssessmentType type
    ) {
        // If Gemini is disabled or not configured, return a heuristic assessment.
        if (!Boolean.TRUE.equals(geminiEnabled) || geminiWebClient == null || geminiConfig == null) {
            return buildHeuristicAssessment(healthDataList, type);
        }

        // Prepare the base entity
        HealthAssessment base = new HealthAssessment();
        base.setType(type);

        try {
            // Prepare prompt
            String healthDataSummary = formatHealthDataForGemini(healthDataList);
            String baseAssessmentSummary = "Preliminary analysis prepared, please produce a structured report.";
            String prompt = buildGeminiPrompt(healthDataSummary, baseAssessmentSummary, type);

            // Request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", List.of(Map.of("text", prompt)));
            requestBody.put("contents", List.of(contents));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("maxOutputTokens", maxTokens);
            generationConfig.put("temperature", temperature);
            requestBody.put("generationConfig", generationConfig);

            // Call Gemini
            String apiKey = geminiConfig.getApiKey();
            String uri = String.format("/models/%s:generateContent?key=%s", model, apiKey);

            String response = geminiWebClient.post()
                    .uri(uri)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Parse response -> fill assessment
            String text = extractResponseText(response);
            if (text == null || text.isBlank()) {
                // If parsing failed, fall back to heuristic
                return buildHeuristicAssessment(healthDataList, type);
            }
            HealthAssessment parsed = parseGeminiResponse(base, text);

            // If score/risk missing from AI, compute heuristics instead.
            if (parsed.getOverallScore() == null || parsed.getOverallRiskLevel() == null) {
                HealthAssessment h = buildHeuristicAssessment(healthDataList, type);
                if (parsed.getOverallScore() == null) {
                    parsed.setOverallScore(h.getOverallScore());
                }
                if (parsed.getOverallRiskLevel() == null) {
                    parsed.setOverallRiskLevel(h.getOverallRiskLevel());
                }
            }
            return parsed;

        } catch (Exception e) {
            // Any error -> fall back to heuristic assessment
            System.err.println("[Gemini] Falling back to heuristic scoring: " + e.getMessage());
            return buildHeuristicAssessment(healthDataList, type);
        }
    }

    /* ----------------------- Prompt & parsing ----------------------- */

    /**
     * Prompt now explicitly asks for numeric score and risk enum.
     * This avoids the "always 75" default.
     */
    private String buildGeminiPrompt(String healthDataSummary, String baseAssessment, HealthAssessment.AssessmentType type) {
        return String.format(
                "You are a professional health assessment assistant. Use the data to produce a structured report.\n\n" +
                        "Health Data Summary:\n%s\n\n" +
                        "Preliminary Assessment:\n%s\n\n" +
                        "Assessment Type: %s\n\n" +
                        "CRITICAL: Respond with VALID JSON ONLY. No prose around it. The JSON MUST include:\n" +
                        "{\n" +
                        "  \"summary\": string,\n" +
                        "  \"keyFindings\": string | string[],\n" +
                        "  \"recommendations\": string | string[],\n" +
                        "  \"aiInsights\": string,\n" +
                        "  \"overallScore\": number (0-100),\n" +
                        "  \"riskLevel\": \"LOW\" | \"MODERATE\" | \"HIGH\"\n" +
                        "}\n" +
                        "Keep it concise, evidence-based, and user-friendly.",
                healthDataSummary,
                baseAssessment,
                getTypeDescription(type)
        );
    }

    private String getTypeDescription(HealthAssessment.AssessmentType type) {
        switch (type) {
            case GENERAL: return "General Health Assessment";
            case CARDIOVASCULAR: return "Cardiovascular Health Assessment";
            case NUTRITION: return "Nutrition Health Assessment";
            case FITNESS: return "Fitness Health Assessment";
            case MENTAL_HEALTH: return "Mental Health Assessment";
            case COMPREHENSIVE: return "Comprehensive Health Assessment";
            default: return "Health Assessment";
        }
    }

    private String formatHealthDataForGemini(List<HealthDataResponse> dataList) {
        if (dataList == null || dataList.isEmpty()) {
            return "No health data available.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Total %d records:\n", dataList.size()));
        for (HealthDataResponse d : dataList) {
            sb.append("- ");
            if (d.getBmi() != null) sb.append(String.format("BMI: %.1f, ", d.getBmi().doubleValue()));
            if (d.getSystolicPressure() != null && d.getDiastolicPressure() != null)
                sb.append(String.format("BP: %d/%d, ", d.getSystolicPressure(), d.getDiastolicPressure()));
            if (d.getHeartRate() != null) sb.append(String.format("HR: %d, ", d.getHeartRate()));
            if (d.getSleepHours() != null) sb.append(String.format("Sleep: %d h, ", d.getSleepHours()));
            if (d.getSteps() != null) sb.append(String.format("Steps: %d", d.getSteps()));
            sb.append("\n");
        }
        return sb.toString();
    }

    private String extractResponseText(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.isBlank()) return null;
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.size() == 0) return null;
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.size() == 0) return null;
            String text = parts.get(0).path("text").asText(null);
            if (text == null) return null;

            // Strip ``` fences if present
            String t = text.trim();
            if (t.startsWith("```")) {
                t = t.replaceFirst("^```(json)?\\s*", "");
                if (t.endsWith("```")) t = t.substring(0, t.length() - 3);
                t = t.trim();
            }
            return t;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Parse JSON from Gemini. If fields missing, they will be filled by heuristic later.
     */
    private HealthAssessment parseGeminiResponse(HealthAssessment base, String geminiResponse) {
        try {
            String jsonText = extractJsonFromText(geminiResponse).trim();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(jsonText);

            // Textual sections
            String summary = textOrJoined(node.path("summary"), "\n");
            String keyFindings = textOrJoined(node.path("keyFindings"), "\n");
            String recommendations = textOrJoined(node.path("recommendations"), "\n");
            String aiInsights = textOrJoined(node.path("aiInsights"), "\n");

            base.setSummary(summary != null ? summary : "Health assessment completed.");
            base.setKeyFindings(keyFindings != null ? keyFindings : "No key findings.");
            base.setRecommendations(recommendations != null ? recommendations : "Keep a healthy lifestyle.");
            base.setAiInsights(aiInsights != null ? aiInsights : "AI analysis ready.");

            // Numeric score
            if (node.has("overallScore") && node.path("overallScore").isNumber()) {
                double s = node.path("overallScore").asDouble();
                s = Math.max(0, Math.min(100, s)); // clamp
                base.setOverallScore(BigDecimal.valueOf(s));
            }

            // Risk level enum
            if (node.has("riskLevel") && node.path("riskLevel").isTextual()) {
                String lvl = node.path("riskLevel").asText().toUpperCase(Locale.ROOT);
                try {
                    base.setOverallRiskLevel(HealthAssessment.RiskLevel.valueOf(lvl));
                } catch (IllegalArgumentException ignored) {
                    // leave null -> will be derived from score later
                }
            }

            // Detailed markdown
            base.setDetailedReport(
                    "# AI Health Assessment Report\n\n" +
                            (base.getSummary() != null ? base.getSummary() : "") + "\n\n" +
                            "## Key Findings\n" + (base.getKeyFindings() != null ? base.getKeyFindings() : "") + "\n\n" +
                            "## Recommendations\n" + (base.getRecommendations() != null ? base.getRecommendations() : "") + "\n\n" +
                            "## AI Insights\n" + (base.getAiInsights() != null ? base.getAiInsights() : "")
            );

            return base;

        } catch (Exception e) {
            // If parsing fails entirely, return base; caller will fall back to heuristic
            return base;
        }
    }

    private static String textOrJoined(JsonNode node, String sep) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;
        if (node.isTextual()) return node.asText();
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode it : node) if (it.isTextual()) sb.append(it.asText()).append(sep);
            String s = sb.toString().trim();
            return s.isEmpty() ? null : s;
        }
        return null;
    }

    /**
     * Extract a JSON object inside free text by brace matching.
     */
    private String extractJsonFromText(String text) {
        if (text == null) return "";
        String trimmed = text.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

        int start = text.indexOf('{');
        if (start < 0) return text;
        int count = 0;
        for (int i = start; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '{') count++;
            else if (c == '}') {
                count--;
                if (count == 0) return text.substring(start, i + 1);
            }
        }
        return text.substring(start);
    }

    /* ----------------------- Heuristic fallback ----------------------- */

    /**
     * Build a deterministic assessment using simple, transparent rules:
     * - Ideal BMI 18.5–24.9; ideal sleep 7–9h; steps target 8000+;
     * - BP: normal < 120/80, elevated 120–129/<80, high ≥ 130/80;
     * - Resting HR ideal ~60–80.
     */
    private HealthAssessment buildHeuristicAssessment(List<HealthDataResponse> data, HealthAssessment.AssessmentType type) {
        HealthAssessment a = new HealthAssessment();
        a.setType(type);

        int n = (data == null) ? 0 : data.size();
        Double avgBmi = avgOrNull(data, d -> d.getBmi() == null ? null : d.getBmi().doubleValue());
        Double avgSys = avgOrNull(data, d -> d.getSystolicPressure() == null ? null : d.getSystolicPressure().doubleValue());
        Double avgDia = avgOrNull(data, d -> d.getDiastolicPressure() == null ? null : d.getDiastolicPressure().doubleValue());
        Double avgHr  = avgOrNull(data, d -> d.getHeartRate() == null ? null : d.getHeartRate().doubleValue());
        Double avgSleep = avgOrNull(data, d -> d.getSleepHours() == null ? null : d.getSleepHours().doubleValue());
        Double avgSteps = avgOrNull(data, d -> d.getSteps() == null ? null : d.getSteps().doubleValue());

        double score = 100.0;

        // BMI penalties
        if (avgBmi == null) {
            score -= 5;
        } else {
            if (avgBmi < 18.5 || avgBmi > 24.9) {
                double distance = (avgBmi < 18.5) ? 18.5 - avgBmi : avgBmi - 24.9;
                score -= 10 + Math.min(20, distance * 2.5);
            }
        }

        // Blood pressure penalties
        if (avgSys == null || avgDia == null) {
            score -= 5;
        } else {
            if (avgSys >= 140 || avgDia >= 90) score -= 20;
            else if (avgSys >= 130 || avgDia >= 80) score -= 12;
            else if (avgSys >= 120 && avgDia < 80) score -= 6;
        }

        // Resting HR penalties
        if (avgHr == null) {
            score -= 5;
        } else {
            if (avgHr < 50 || avgHr > 90) score -= 10;
            else if (avgHr < 60 || avgHr > 80) score -= 5;
        }

        // Sleep adjustment
        if (avgSleep == null) {
            score -= 5;
        } else {
            if (avgSleep < 6) score -= 8;
            else if (avgSleep < 7) score -= 4;
            else if (avgSleep > 9) score -= 4;
        }

        // Steps adjustment
        if (avgSteps == null) {
            score -= 3;
        } else {
            if (avgSteps >= 10000) score += 3;
            else if (avgSteps >= 8000) score += 1.5;
            else if (avgSteps < 5000) score -= 6;
            else if (avgSteps < 7000) score -= 3;
        }

        // Fewer samples -> less confidence
        if (n == 0) score -= 15;
        else if (n < 3) score -= 5;

        // Clamp
        score = Math.max(0, Math.min(100, score));

        // Risk mapping
        HealthAssessment.RiskLevel risk =
                score >= 80 ? HealthAssessment.RiskLevel.LOW :
                        score >= 60 ? HealthAssessment.RiskLevel.MODERATE :
                                HealthAssessment.RiskLevel.HIGH;

        a.setOverallScore(BigDecimal.valueOf(score));
        a.setOverallRiskLevel(risk);

        // Simple narrative
        StringBuilder summary = new StringBuilder();
        summary.append("This assessment uses recent health records and a rule-based scoring model. ");
        if (avgBmi != null) summary.append(String.format("Average BMI is %.1f. ", avgBmi));
        if (avgSys != null && avgDia != null) summary.append(String.format("Average blood pressure is %.0f/%.0f. ", avgSys, avgDia));
        if (avgHr != null) summary.append(String.format("Average resting heart rate is %.0f bpm. ", avgHr));
        if (avgSleep != null) summary.append(String.format("Average sleep is %.1f hours/night. ", avgSleep));
        if (avgSteps != null) summary.append(String.format("Average daily steps are %.0f. ", avgSteps));
        summary.append("The score reflects alignment with broadly accepted wellness ranges.");

        String keyFindings =
                bullet(assessBmiFinding(avgBmi)) +
                        bullet(assessBpFinding(avgSys, avgDia)) +
                        bullet(assessHrFinding(avgHr)) +
                        bullet(assessSleepFinding(avgSleep)) +
                        bullet(assessStepsFinding(avgSteps));

        String recs =
                bullet(recommendBp(avgSys, avgDia)) +
                        bullet(recommendBmi(avgBmi)) +
                        bullet(recommendSleep(avgSleep)) +
                        bullet(recommendSteps(avgSteps));

        a.setSummary(summary.toString());
        a.setKeyFindings(keyFindings.trim().isEmpty() ? "No major issues detected." : keyFindings.trim());
        a.setRecommendations(recs.trim().isEmpty() ? "Maintain balanced diet, regular exercise, and periodic check-ups." : recs.trim());
        a.setAiInsights("This is a deterministic, transparent heuristic score. Enable Gemini to obtain a narrative generated by the LLM.");

        a.setDetailedReport(
                "# Heuristic Health Assessment Report\n\n" +
                        a.getSummary() + "\n\n" +
                        "## Key Findings\n" + a.getKeyFindings() + "\n\n" +
                        "## Recommendations\n" + a.getRecommendations() + "\n\n" +
                        "## Notes\n" + a.getAiInsights()
        );

        return a;
    }

    /* ----------------------- helpers ----------------------- */

    private static String bullet(String s) {
        return (s == null || s.isBlank()) ? "" : "• " + s + "\n";
    }

    private static String assessBmiFinding(Double bmi) {
        if (bmi == null) return "BMI not available.";
        if (bmi < 18.5) return String.format("BMI %.1f is under the normal range.", bmi);
        if (bmi > 24.9) return String.format("BMI %.1f is above the normal range.", bmi);
        return String.format("BMI %.1f is within the normal range.", bmi);
    }

    private static String assessBpFinding(Double sys, Double dia) {
        if (sys == null || dia == null) return "Blood pressure not available.";
        if (sys >= 140 || dia >= 90) return String.format("Average BP %.0f/%.0f is in the high range.", sys, dia);
        if (sys >= 130 || dia >= 80) return String.format("Average BP %.0f/%.0f is elevated.", sys, dia);
        if (sys >= 120 && dia < 80) return String.format("Average BP %.0f/%.0f is slightly elevated.", sys, dia);
        return String.format("Average BP %.0f/%.0f is within the normal range.", sys, dia);
    }

    private static String assessHrFinding(Double hr) {
        if (hr == null) return "Resting heart rate not available.";
        if (hr < 50 || hr > 90) return String.format("Resting HR %.0f bpm is outside the typical range.", hr);
        if (hr < 60 || hr > 80) return String.format("Resting HR %.0f bpm is slightly outside the ideal range.", hr);
        return String.format("Resting HR %.0f bpm is in the ideal range.", hr);
    }

    private static String assessSleepFinding(Double sleep) {
        if (sleep == null) return "Sleep duration not available.";
        if (sleep < 6) return String.format("Average sleep %.1f h is insufficient.", sleep);
        if (sleep < 7) return String.format("Average sleep %.1f h is slightly short.", sleep);
        if (sleep > 9) return String.format("Average sleep %.1f h is above the typical range.", sleep);
        return String.format("Average sleep %.1f h is in the recommended range.", sleep);
    }

    private static String assessStepsFinding(Double steps) {
        if (steps == null) return "Daily steps not available.";
        if (steps >= 10000) return String.format("Average steps %.0f indicate high activity.", steps);
        if (steps >= 8000) return String.format("Average steps %.0f meet activity target.", steps);
        if (steps >= 7000) return String.format("Average steps %.0f are close to target.", steps);
        if (steps >= 5000) return String.format("Average steps %.0f are below target.", steps);
        return String.format("Average steps %.0f are sedentary.", steps);
    }

    private static String recommendBp(Double sys, Double dia) {
        if (sys == null || dia == null) return "Track blood pressure regularly to identify trends.";
        if (sys >= 130 || dia >= 80) return "Reduce sodium, manage stress, and consult your GP for BP management.";
        if (sys >= 120 && dia < 80) return "Monitor BP; consider lifestyle tweaks (exercise, diet).";
        return "Maintain current BP habits.";
    }

    private static String recommendBmi(Double bmi) {
        if (bmi == null) return "Record weight/height to monitor BMI.";
        if (bmi < 18.5) return "Increase calorie-dense, nutritious foods and strength training.";
        if (bmi > 24.9) return "Adopt a calorie-controlled, protein-rich diet with regular exercise.";
        return "Maintain balanced diet and activity.";
    }

    private static String recommendSleep(Double sleep) {
        if (sleep == null) return "Establish a consistent sleep schedule (target 7–9 hours).";
        if (sleep < 7) return "Aim for 7–9 hours with good sleep hygiene (fixed schedule, low screens).";
        if (sleep > 9) return "Evaluate daytime sleepiness; consider adjusting schedule.";
        return "Keep your sleep routine.";
    }

    private static String recommendSteps(Double steps) {
        if (steps == null) return "Track daily steps; target at least 8,000.";
        if (steps < 5000) return "Add short walks after meals and light cardio to raise daily steps.";
        if (steps < 8000) return "Increase incidental activity (stairs, standing breaks).";
        return "Great activity level—keep it up.";
    }

    private static Double avgOrNull(List<HealthDataResponse> list, java.util.function.Function<HealthDataResponse, Double> f) {
        if (list == null || list.isEmpty()) return null;
        DoubleStream stream = list.stream()
                .map(f)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue);
        OptionalDouble od = stream.average();
        return od.isPresent() ? od.getAsDouble() : null;
    }
}
