package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import io.netty.channel.ChannelOption;
import java.time.Duration;

@Configuration
@ConditionalOnProperty(name = "gemini.enabled", havingValue = "true")
public class GeminiConfig {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Bean
    public WebClient geminiWebClient() {
        // Configure HTTP client with longer timeouts for Gemini API
        // Response timeout: 3 minutes (180 seconds) - needed for long AI responses like health plans
        // Connection timeout: 30 seconds - time to establish connection
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(180))  // 3 minutes response timeout
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000);  // 30 seconds connection timeout
        
        return WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("Content-Type", "application/json")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
    
    public String getApiKey() {
        return apiKey;
    }
}
