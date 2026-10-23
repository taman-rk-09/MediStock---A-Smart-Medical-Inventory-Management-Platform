
package com.MediStock.app.repositories;

import com.MediStock.app.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findAllByOrderByBatchIdAsc();

    List<Inventory> findByMedicine_MedicineId(Long medicineId);

    List<Inventory> findByQuantityLessThanEqual(Integer quantity);

    List<Inventory> findByExpDateBefore(LocalDate date);

    List<Inventory> findByExpDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<Inventory> findByBatchNumber(String batchNumber);

    List<Inventory> findByMedicine_NameContainingIgnoreCase(String name);

    List<Inventory> findByMedicine_CategoryContainingIgnoreCase(String category);

    List<Inventory> findByMedicine_NameIgnoreCase(String name);

    List<Inventory> findByExpDateGreaterThanEqualAndExpDateLessThanEqual(
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i")
    Long getTotalStockUnits();

    @Query("""
            SELECT COALESCE(SUM(i.quantity), 0)
            FROM Inventory i
            WHERE LOWER(i.medicine.name) = LOWER(:medicineName)
            """)
    Long getTotalStockUnitsByMedicineName(
            @Param("medicineName") String medicineName
    );

    @Query("""
            SELECT COALESCE(SUM(i.quantity * i.medicine.price), 0)
            FROM Inventory i
            WHERE LOWER(i.medicine.name) = LOWER(:medicineName)
            """)
    BigDecimal getStockValueByMedicineName(
            @Param("medicineName") String medicineName
    );

    @Query("""
            SELECT COALESCE(SUM(i.quantity * i.medicine.price), 0)
            FROM Inventory i
            """)
    BigDecimal getTotalStockValue();
}
