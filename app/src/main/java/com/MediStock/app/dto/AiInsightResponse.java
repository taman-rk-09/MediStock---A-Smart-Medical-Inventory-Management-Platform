package com.MediStock.app.dto;

import java.time.LocalDateTime;

public class AiInsightResponse {
    private String executiveSummary;
    private LocalDateTime generatedAt;

    public AiInsightResponse() {
        this.generatedAt = LocalDateTime.now();
    }

    public AiInsightResponse(String executiveSummary) {
        this.executiveSummary = executiveSummary;
        this.generatedAt = LocalDateTime.now();
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}