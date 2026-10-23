
package com.MediStock.app.services;

import com.MediStock.app.dto.AiInsightResponse;
import com.MediStock.app.dto.AiResponse;
import com.MediStock.app.entities.Inventory;
import com.MediStock.app.enums.NotificationStatus;
import com.MediStock.app.repositories.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private static final String OLLAMA_URL =
            "http://localhost:11434/api/generate";

    private static final String MODEL_NAME = "llama3.2:3b";

    private static final int MAX_INVENTORY_RECORDS = 100;

    public OllamaAiService(
            MedicineRepository medicineRepository,
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

        long totalMedicines = medicineRepository.count();
        long totalBatches = inventoryRepository.count();
        long totalStockUnits = inventoryRepository.getTotalStockUnits();
        BigDecimal totalStockValue =
                inventoryRepository.getTotalStockValue();

        long totalSuppliers = supplierRepository.count();
        long totalSales = saleRepository.count();
        long totalOrders = purchaseOrderRepository.count();

        long unresolvedNotifications =
                notificationRepository.countByStatusIn(
                        EnumSet.of(
                                NotificationStatus.ACTIVE,
                                NotificationStatus.REVIEWED
                        )
                );

        LocalDate today = LocalDate.now();
        LocalDate expiryThreshold = today.plusDays(90);

        List<Inventory> inventoryRecords =
                inventoryRepository.findAllByOrderByBatchIdAsc();

        long lowStockBatches = inventoryRecords.stream()
                .filter(inventory ->
                        inventory.getQuantity() != null
                                && inventory.getQuantity() <= 10)
                .count();

        long expiredBatches = inventoryRecords.stream()
                .filter(inventory ->
                        inventory.getExpDate() != null
                                && inventory.getExpDate().isBefore(today))
                .count();

        long expiringSoonBatches = inventoryRecords.stream()
                .filter(inventory ->
                        inventory.getExpDate() != null
                                && !inventory.getExpDate().isBefore(today)
                                && !inventory.getExpDate().isAfter(expiryThreshold))
                .count();

        String snapshot = """
                MEDISTOCK EXECUTIVE INVENTORY SNAPSHOT
                Report date: %s
                Registered medicines: %d
                Inventory batch records: %d
                Total stock units: %d
                Total stock value at recorded medicine prices: %s
                Registered suppliers: %d
                Sales transactions: %d
                Purchase orders: %d
                Unresolved notifications (ACTIVE + REVIEWED): %d
                Batches with 10 or fewer units: %d
                Expired batches: %d
                Batches expiring within 90 days: %d
                """.formatted(
                today,
                totalMedicines,
                totalBatches,
                totalStockUnits,
                totalStockValue,
                totalSuppliers,
                totalSales,
                totalOrders,
                unresolvedNotifications,
                lowStockBatches,
                expiredBatches,
                expiringSoonBatches
        );

        String prompt = """
                You are the MediStock Executive Inventory Advisor.

                Analyze these actual application metrics. Do not invent
                figures, medicine names, or supplier details.

                %s

                Write a concise Markdown report with these sections:

                1. Inventory and Expiry Risk Assessment
                2. Reordering and Supplier Recommendations
                3. Operational Optimization

                Explain risks and provide practical recommendations.
                State that the total stock value uses the recorded medicine
                price; do not assume it represents purchase cost.
                """.formatted(snapshot);

        AiResponse response = callLocalOllama(prompt);
        return new AiInsightResponse(response.getResponse());
    }

    public AiResponse processChatQuery(String userPrompt) {

        if (userPrompt == null || userPrompt.isBlank()) {
            return new AiResponse(
                    "Please enter a question for the MediStock AI assistant."
            );
        }

        String question = userPrompt.trim();

        /*
         * Exact application figures are retrieved from the database.
         * Ollama is not asked to guess these values.
         */
        String inventoryAnswer = answerInventoryQuestion(question);

        if (inventoryAnswer != null) {
            return new AiResponse(inventoryAnswer);
        }

        String systemContext = buildFullSystemContext();

        String fullPrompt = """
                You are MediStock AI, a friendly general-purpose assistant
                whose primary specialty is the MediStock medical inventory
                management application.

                Answer naturally, as in a normal conversation.

                RULES:
                - Use the supplied system data when discussing MediStock.
                - Never invent inventory quantities, prices, dates, sales,
                  suppliers, purchase orders, or notifications.
                - If the supplied data is insufficient, say so.
                - Answer general educational and everyday questions too.
                - For basic medicine questions, provide general educational
                  information, not a personal diagnosis or prescription.
                - Encourage consulting a pharmacist or clinician for
                  personal treatment decisions.
                - Remember that the recorded medicine price is not
                  necessarily its purchase cost.
                - Use clear language and Markdown when helpful.

                APPLICATION DATA:
                %s

                USER QUESTION:
                %s
                """.formatted(systemContext, question);

        return callLocalOllama(fullPrompt);
    }

    /**
     * Handles questions that require exact database calculations.
     * Returns null when the question should be handled by Ollama.
     */
    private String answerInventoryQuestion(String question) {

        String normalized = question.toLowerCase().trim();

        boolean asksAboutInventory =
                containsAny(normalized,
                        "stock", "inventory", "batch", "batches",
                        "medicine", "medicines", "expiry", "expire",
                        "expired", "expiring", "quantity", "quantities",
                        "units", "price", "value", "worth");

        if (!asksAboutInventory) {
            return null;
        }

        if (containsAny(normalized,
                "total inventory value", "total stock value",
                "value of all inventory", "value of all stock",
                "total value of inventory", "total value of all medicines")) {

            BigDecimal totalValue = inventoryRepository.getTotalStockValue();

            return "The total inventory value at the recorded medicine prices "
                    + "is **" + totalValue + "**. This uses each batch's "
                    + "quantity multiplied by its medicine's recorded price; "
                    + "it is not necessarily the purchase-cost value.";
        }

        if (containsAny(normalized,
                "how many stock units", "total stock units",
                "total number of units", "how many units in total")) {

            Long totalUnits = inventoryRepository.getTotalStockUnits();

            return "MediStock currently has **" + totalUnits
                    + " stock units** across all inventory batches.";
        }

        if (containsAny(normalized,
                "expired batches", "which batches are expired",
                "which medicines are expired", "already expired")) {

            LocalDate today = LocalDate.now();

            List<Inventory> expired =
                    inventoryRepository.findByExpDateBefore(today);

            if (expired.isEmpty()) {
                return "There are no inventory batches with an expiry date "
                        + "before " + today + " in the current database.";
            }

            StringBuilder answer = new StringBuilder();
            answer.append("**Expired inventory batches** (as of ")
                    .append(today).append("):\n\n");

            for (Inventory item : expired) {
                answer.append("- Medicine: ")
                        .append(item.getMedicine().getName())
                        .append(", batch: ")
                        .append(item.getBatchNumber())
                        .append(", quantity: ")
                        .append(item.getQuantity())
                        .append(", expiry date: ")
                        .append(item.getExpDate())
                        .append("\n");
            }

            return answer.toString();
        }

        if (containsAny(normalized,
                "expiring in the next", "expire in the next",
                "expiry in the next", "expiring soon",
                "batches expiring within")) {

            int days = extractDays(normalized);

            if (days <= 0) {
                days = 30;
            }

            LocalDate today = LocalDate.now();
            LocalDate endDate = today.plusDays(days);

            List<Inventory> expiring =
                    inventoryRepository
                            .findByExpDateGreaterThanEqualAndExpDateLessThanEqual(
                                    today, endDate
                            );

            if (expiring.isEmpty()) {
                return "No batches are recorded as expiring between "
                        + today + " and " + endDate + ".";
            }

            StringBuilder answer = new StringBuilder();
            answer.append("**Batches expiring in the next ")
                    .append(days).append(" days** (")
                    .append(today).append(" to ").append(endDate)
                    .append("):\n\n");

            for (Inventory item : expiring) {
                answer.append("- ")
                        .append(item.getMedicine().getName())
                        .append(" — batch ")
                        .append(item.getBatchNumber())
                        .append(", quantity ")
                        .append(item.getQuantity())
                        .append(", expiry ")
                        .append(item.getExpDate())
                        .append("\n");
            }

            return answer.toString();
        }

        String medicineName = extractMedicineName(question);

        if (medicineName == null) {
            return null;
        }

        List<Inventory> batches =
                inventoryRepository.findByMedicine_NameIgnoreCase(
                        medicineName
                );

        if (batches.isEmpty()) {
            return "I couldn't find an inventory record for **"
                    + medicineName
                    + "**. Check the medicine name in MediStock.";
        }

        if (containsAny(normalized, "stock value", "total value",
                "value of", "worth", "inventory value")) {

            BigDecimal value =
                    inventoryRepository.getStockValueByMedicineName(
                            medicineName
                    );

            Long units =
                    inventoryRepository.getTotalStockUnitsByMedicineName(
                            medicineName
                    );

            BigDecimal price = batches.get(0).getMedicine().getPrice();

            return "For **" + medicineName + "**:\n\n"
                    + "- Total stock units: **" + units + "**\n"
                    + "- Recorded price per unit: **" + price + "**\n"
                    + "- Stock value at recorded price: **" + value + "**\n\n"
                    + "This value uses the medicine's recorded price, which "
                    + "may be its selling price rather than its purchase cost.";
        }

        if (containsAny(normalized,
                "expiry", "expire", "expiring", "batch number",
                "batch details", "manufacturing date")) {

            StringBuilder answer = new StringBuilder();
            answer.append("**Inventory details for ")
                    .append(medicineName).append("**\n\n");

            for (Inventory item : batches) {
                answer.append("- Batch: ")
                        .append(item.getBatchNumber())
                        .append(", quantity: ")
                        .append(item.getQuantity())
                        .append(", manufactured: ")
                        .append(item.getMfgDate())
                        .append(", expires: ")
                        .append(item.getExpDate())
                        .append("\n");
            }

            return answer.toString();
        }

        if (containsAny(normalized,
                "how many", "quantity", "quantities",
                "units", "in stock", "available stock")) {

            Long units =
                    inventoryRepository.getTotalStockUnitsByMedicineName(
                            medicineName
                    );

            return "MediStock records **" + units
                    + " units of " + medicineName
                    + "** across " + batches.size() + " inventory batches.";
        }

        return null;
    }

    private int extractDays(String question) {

        Matcher matcher = Pattern.compile(
                "(?:next|within)\\s+(\\d+)\\s+days?"
        ).matcher(question);

        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {
                return 30;
            }
        }

        return 30;
    }

    /**
     * Attempts to extract a medicine name from common question patterns.
     * If extraction is uncertain, general AI handling is used instead.
     */
    private String extractMedicineName(String question) {

        Pattern[] patterns = {
                Pattern.compile(
                        "(?i)\\b(?:stock value|inventory value|total value|"
                                + "worth|price|quantity|stock|expiry|expiry date|"
                                + "batch details|how many units of|how many)\\s+"
                                + "(?:of\\s+)?([a-z0-9][a-z0-9 -]{1,60}?)"
                                + "(?=\\s+(?:in stock|do we have|are in stock|"
                                + "is in stock|expire|expiring|expiry|worth|"
                                + "value|cost|price|currently|in inventory)\\b|"
                                + "[?.!,]|$)"
                ),
                Pattern.compile(
                        "(?i)\\b(?:of|for)\\s+([a-z0-9][a-z0-9 -]{1,60}?)"
                                + "\\s+(?:stock|inventory|expiry|quantity|"
                                + "units|value|price|worth)\\b"
                )
        };

        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(question);

            if (matcher.find()) {
                String candidate = matcher.group(1).trim();

                candidate = candidate.replaceAll(
                        "(?i)\\b(the|our|my|medicine|medicines)\\b",
                        ""
                ).trim();

                if (!candidate.isBlank()) {
                    return candidate;
                }
            }
        }

        return null;
    }

    private boolean containsAny(String text, String... phrases) {
        for (String phrase : phrases) {
            if (text.contains(phrase)) {
                return true;
            }
        }
        return false;
    }

    private String buildFullSystemContext() {

        long totalMedicines = medicineRepository.count();
        long totalBatches = inventoryRepository.count();
        long totalStockUnits = inventoryRepository.getTotalStockUnits();
        BigDecimal totalStockValue = inventoryRepository.getTotalStockValue();
        long totalSuppliers = supplierRepository.count();
        long totalSales = saleRepository.count();
        long totalUsers = userRepository.count();
        long totalOrders = purchaseOrderRepository.count();
        long totalStockMovements = stockLogRepository.count();

        long unresolvedNotifications =
                notificationRepository.countByStatusIn(
                        EnumSet.of(
                                NotificationStatus.ACTIVE,
                                NotificationStatus.REVIEWED
                        )
                );

        LocalDate today = LocalDate.now();

        List<Inventory> allInventory =
                inventoryRepository.findAllByOrderByBatchIdAsc();

        long lowStockBatches = allInventory.stream()
                .filter(item ->
                        item.getQuantity() != null
                                && item.getQuantity() <= 10)
                .count();

        long expiredBatches = allInventory.stream()
                .filter(item ->
                        item.getExpDate() != null
                                && item.getExpDate().isBefore(today))
                .count();

        long expiringSoonBatches = allInventory.stream()
                .filter(item ->
                        item.getExpDate() != null
                                && !item.getExpDate().isBefore(today)
                                && !item.getExpDate().isAfter(today.plusDays(90)))
                .count();

        StringBuilder context = new StringBuilder();

        context.append("MEDISTOCK SYSTEM METRICS\n");
        context.append("Report date: ").append(today).append("\n");
        context.append("Registered users: ").append(totalUsers).append("\n");
        context.append("Registered medicines: ").append(totalMedicines).append("\n");
        context.append("Inventory batches: ").append(totalBatches).append("\n");
        context.append("Total stock units: ").append(totalStockUnits).append("\n");
        context.append("Total stock value at recorded prices: ")
                .append(totalStockValue).append("\n");
        context.append("Registered suppliers: ").append(totalSuppliers).append("\n");
        context.append("Purchase orders: ").append(totalOrders).append("\n");
        context.append("Sales transactions: ").append(totalSales).append("\n");
        context.append("Stock movements: ").append(totalStockMovements).append("\n");
        context.append("Unresolved notifications: ").append(unresolvedNotifications).append("\n");
        context.append("Low-stock batches (10 or fewer units): ").append(lowStockBatches).append("\n");
        context.append("Expired batches: ").append(expiredBatches).append("\n");
        context.append("Batches expiring within 90 days: ").append(expiringSoonBatches).append("\n");

        context.append("\nINVENTORY BATCH DETAILS\n");

        int recordsToInclude = Math.min(
                allInventory.size(),
                MAX_INVENTORY_RECORDS
        );

        for (int index = 0; index < recordsToInclude; index++) {

            Inventory item = allInventory.get(index);

            context.append("Medicine: ")
                    .append(item.getMedicine().getName())
                    .append(", category: ")
                    .append(item.getMedicine().getCategory())
                    .append(", recorded price: ")
                    .append(item.getMedicine().getPrice())
                    .append(", batch: ")
                    .append(item.getBatchNumber())
                    .append(", quantity: ")
                    .append(item.getQuantity())
                    .append(", manufactured: ")
                    .append(item.getMfgDate())
                    .append(", expires: ")
                    .append(item.getExpDate())
                    .append("\n");
        }

        if (allInventory.size() > MAX_INVENTORY_RECORDS) {
            context.append("Only the first ")
                    .append(MAX_INVENTORY_RECORDS)
                    .append(" batches are listed. Summary metrics cover all batches.\n");
        }

        return context.toString();
    }

    private AiResponse callLocalOllama(String promptText) {

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL_NAME);
            requestBody.put("prompt", promptText);
            requestBody.put("stream", false);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> response =
                    restTemplate.exchange(
                            OLLAMA_URL,
                            HttpMethod.POST,
                            entity,
                            new ParameterizedTypeReference<Map<String, Object>>() {}
                    );

            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null) {
                return new AiResponse(
                        "Ollama returned an empty response. Please try again."
                );
            }

            Object generatedText = responseBody.get("response");

            if (!(generatedText instanceof String text)
                    || text.isBlank()) {
                return new AiResponse(
                        "Ollama did not generate an answer. Check that "
                                + MODEL_NAME + " is installed and running."
                );
            }

            return new AiResponse(text.trim());

        } catch (RestClientException exception) {
            return new AiResponse(
                    "Unable to connect to Ollama at " + OLLAMA_URL
                            + ". Make sure Ollama is running and model "
                            + MODEL_NAME + " is installed. Details: "
                            + exception.getMessage()
            );
        } catch (Exception exception) {
            return new AiResponse(
                    "An unexpected error occurred while generating the AI "
                            + "response: " + exception.getMessage()
            );
        }
    }
}
