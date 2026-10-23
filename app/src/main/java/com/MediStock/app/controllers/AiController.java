
package com.MediStock.app.controllers;

import com.MediStock.app.dto.AiInsightResponse;
import com.MediStock.app.dto.AiRequest;
import com.MediStock.app.dto.AiResponse;
import com.MediStock.app.services.OllamaAiService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<AiResponse> handleChatQuery(
            @RequestBody(required = false) AiRequest request) {

        if (request == null
                || request.getPrompt() == null
                || request.getPrompt().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(new AiResponse(
                            "Please provide a question for the MediStock AI assistant."
                    ));
        }

        AiResponse response =
                ollamaAiService.processChatQuery(request.getPrompt());

        if (response == null
                || response.getResponse() == null
                || response.getResponse().isBlank()
                || isServiceError(response.getResponse())) {

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(response != null
                            ? response
                            : new AiResponse(
                                    "The AI service returned no response."
                            ));
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/executive-insights")
    public ResponseEntity<AiInsightResponse> getExecutiveInsights() {

        AiInsightResponse insights =
                ollamaAiService.generateExecutiveAdvisorInsights();

        if (insights == null
                || insights.getExecutiveSummary() == null
                || insights.getExecutiveSummary().isBlank()
                || isServiceError(insights.getExecutiveSummary())) {

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(insights != null
                            ? insights
                            : new AiInsightResponse(
                                    "The AI service returned no insights."
                            ));
        }

        return ResponseEntity.ok(insights);
    }

    private boolean isServiceError(String response) {
        String message = response.toLowerCase();

        return message.contains("error connecting to local ollama")
                || message.contains("unable to connect to ollama")
                || message.contains("unexpected error occurred")
                || message.contains("ollama returned an empty response")
                || message.contains("ollama did not generate an answer");
    }
}
