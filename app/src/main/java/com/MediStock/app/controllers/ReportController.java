package com.MediStock.app.controllers;

import com.MediStock.app.dto.DashboardResponse;
import com.MediStock.app.dto.SaleResponse;
import com.MediStock.app.services.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService
    ) {

        this.reportService = reportService;

    }


    /*
     |--------------------------------------------------------------------------
     | Dashboard Report
     |--------------------------------------------------------------------------
     */

    @GetMapping("/dashboard")
    public DashboardResponse getDashboardReport() {

        return reportService.getDashboardReport();

    }


    /*
     |--------------------------------------------------------------------------
     | Total Sales Revenue
     |--------------------------------------------------------------------------
     */

    @GetMapping("/sales/total")
    public ResponseEntity<BigDecimal> getTotalSales() {

        return ResponseEntity.ok(
                reportService.getTotalSales()
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Total Sales Transactions
     |--------------------------------------------------------------------------
     */

    @GetMapping("/sales/transactions")
    public ResponseEntity<Long> getTotalTransactions() {

        return ResponseEntity.ok(
                reportService.getTotalTransactions()
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Total Units Sold
     |--------------------------------------------------------------------------
     */

    @GetMapping("/sales/units")
    public ResponseEntity<Long> getTotalUnitsSold() {

        return ResponseEntity.ok(
                reportService.getTotalUnitsSold()
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Sales Revenue Between Dates
     |--------------------------------------------------------------------------
     *
     * Example:
     *
     * GET /api/reports/sales/revenue
     *     ?startDate=2026-08-01
     *     &endDate=2026-08-16
     *
     */

    @GetMapping("/sales/revenue")
    public ResponseEntity<BigDecimal> getSalesRevenue(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                reportService.getSalesBetween(
                        startDate,
                        endDate
                )
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Detailed Sales Report Between Dates
     |--------------------------------------------------------------------------
     *
     * Example:
     *
     * GET /api/reports/sales
     *     ?startDate=2026-08-01
     *     &endDate=2026-08-16
     *
     */

    @GetMapping("/sales")
    public ResponseEntity<List<SaleResponse>> getSalesReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        return ResponseEntity.ok(
                reportService.getSalesBetweenDates(
                        startDate,
                        endDate
                )
        );

    }

}