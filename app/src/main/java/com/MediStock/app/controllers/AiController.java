package com.MediStock.app.controllers;

import com.MediStock.app.dto.AiInsightResponse;
import com.MediStock.app.dto.AiRequest;
import com.MediStock.app.dto.AiResponse;
import com.MediStock.app.services.OllamaAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final OllamaAiService ollamaAiService;

    public AiController(OllamaAiService ollamaAiService) {
        this.ollamaAiService = ollamaAiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiResponse> handleChatQuery(@RequestBody AiRequest request) {
        AiResponse response = ollamaAiService.processChatQuery(request.getPrompt());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/executive-insights")
    public ResponseEntity<AiInsightResponse> getExecutiveInsights() {
        AiInsightResponse insights = ollamaAiService.generateExecutiveAdvisorInsights();
        return ResponseEntity.ok(insights);
    }
}