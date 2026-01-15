package com.audit.system.repository;

import com.audit.system.model.EmployeeSalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmployeeSalaryStructureRepository extends JpaRepository<EmployeeSalaryStructure, Long> {

    // Find active components for a given date (e.g., payroll run date)
    @Query("SELECT s FROM EmployeeSalaryStructure s WHERE s.employee.id = :employeeId AND s.isActive = true AND s.effectiveStartDate <= :date AND (s.effectiveEndDate IS NULL OR s.effectiveEndDate >= :date)")
    List<EmployeeSalaryStructure> findActiveByEmployeeAndDate(Long employeeId, LocalDate date);
}
