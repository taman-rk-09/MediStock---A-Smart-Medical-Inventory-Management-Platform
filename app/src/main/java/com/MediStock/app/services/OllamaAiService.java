package com.MediStock.app.services;

import com.MediStock.app.dto.AiInsightResponse;
import com.MediStock.app.dto.AiResponse;
import com.MediStock.app.repositories.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaAiService {

    private final MedicineRepository medicineRepository;
    private final InventoryRepository inventoryRepository;
    private final SaleRepository saleRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final NotificationRepository notificationRepository;
    private final StockLogRepository stockLogRepository;
    
    private final RestTemplate restTemplate;

    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL_NAME = "llama3.2:3b";

    public OllamaAiService(MedicineRepository medicineRepository,
                           InventoryRepository inventoryRepository,
                           SaleRepository saleRepository,
                           SupplierRepository supplierRepository,
                           UserRepository userRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           NotificationRepository notificationRepository,
                           StockLogRepository stockLogRepository) {
        this.medicineRepository = medicineRepository;
        this.inventoryRepository = inventoryRepository;
        this.saleRepository = saleRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.notificationRepository = notificationRepository;
        this.stockLogRepository = stockLogRepository;
        this.restTemplate = new RestTemplate();
    }

    public AiInsightResponse generateExecutiveAdvisorInsights() {
        // Safe count queries prevent null pointer crashes or uninitialized table errors
        long totalMedicines = safeCount(medicineRepository);
        long totalBatches = safeCount(inventoryRepository);
        long totalSuppliers = safeCount(supplierRepository);
        long totalSales = safeCount(saleRepository);
        long totalOrders = safeCount(purchaseOrderRepository);
        long activeNotifications = safeCount(notificationRepository);

        StringBuilder snapshot = new StringBuilder();
        snapshot.append("=== MEDISTOCK REAL-TIME SNAPSHOT ===\n");
        snapshot.append("- Total Registered Medicines: ").append(totalMedicines).append("\n");
        snapshot.append("- Active Inventory Batches: ").append(totalBatches).append("\n");
        snapshot.append("- Registered Suppliers: ").append(totalSuppliers).append("\n");
        snapshot.append("- Total Sales Transactions: ").append(totalSales).append("\n");
        snapshot.append("- Purchase Orders Logged: ").append(totalOrders).append("\n");
        snapshot.append("- Active Stock/Expiry Alerts: ").append(activeNotifications).append("\n");

        String prompt = snapshot.toString() + "\n\n" +
                "Task: You are the MediStock Chief Inventory Advisor. Analyze the system snapshot above and provide a 3-part Executive Action Plan:\n" +
                "1. **Inventory & Expiry Risk Assessment**: High-level evaluation of active batches vs pending alerts.\n" +
                "2. **Reorder & Supplier Recommendation**: Strategic advice on purchase orders and supplier reorders.\n" +
                "3. **Operational Optimization**: A direct, actionable advice bullet point for the pharmacy administrator.\n\n" +
                "Format the output cleanly in Markdown with bold headers and bullet points. Keep it professional, concise, and actionable.";

        AiResponse response = callLocalOllama(prompt);
        return new AiInsightResponse(response.getResponse());
    }

    public AiResponse processChatQuery(String userPrompt) {
        String systemContext = buildFullSystemContext();
        String fullPrompt = systemContext + "\n\nUser Question: " + userPrompt +
                "\n\nInstructions: You are the MediStock AI Assistant. Use the complete system data provided above to answer the user's question accurately. Keep responses professional.";

        return callLocalOllama(fullPrompt);
    }

    private String buildFullSystemContext() {
        long totalMedicines = safeCount(medicineRepository);
        long totalSuppliers = safeCount(supplierRepository);
        long totalSales = safeCount(saleRepository);
        long totalBatches = safeCount(inventoryRepository);
        long totalUsers = safeCount(userRepository);
        long totalOrders = safeCount(purchaseOrderRepository);
        long activeNotifications = safeCount(notificationRepository);
        long totalStockMovements = safeCount(stockLogRepository);

        StringBuilder context = new StringBuilder();
        context.append("--- MEDISTOCK COMPLETE SYSTEM METRICS ---\n");
        context.append("Total Registered Users: ").append(totalUsers).append("\n");
        context.append("Total Registered Medicines: ").append(totalMedicines).append("\n");
        context.append("Total Active Inventory Batches: ").append(totalBatches).append("\n");
        context.append("Total Active Suppliers: ").append(totalSuppliers).append("\n");
        context.append("Total Purchase Orders: ").append(totalOrders).append("\n");
        context.append("Total Sales Transactions Recorded: ").append(totalSales).append("\n");
        context.append("Total Stock Movements Logged: ").append(totalStockMovements).append("\n");
        context.append("Pending System Notifications/Alerts: ").append(activeNotifications).append("\n");

        return context.toString();
    }

    // Safely executes counts even if a table or repository is empty or missing
    private long safeCount(org.springframework.data.repository.CrudRepository<?, ?> repository) {
        try {
            return repository != null ? repository.count() : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private AiResponse callLocalOllama(String promptText) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL_NAME);
            requestBody.put("prompt", promptText);
            requestBody.put("stream", false);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    OLLAMA_URL, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getBody() != null && response.getBody().containsKey("response")) {
                return new AiResponse((String) response.getBody().get("response"));
            }
            return new AiResponse("Ollama returned an empty response.");
        } catch (Exception e) {
            return new AiResponse("Error connecting to local Ollama instance: " + e.getMessage());
        }
    }
}