package com.audit.system.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "personal_finance")
public class PersonalFinance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    private int year;
    private int month;

    // Income
    private BigDecimal basicSalary;
    private BigDecimal fixedAllowance;
    private BigDecimal variableAllowance;
    private BigDecimal bonus;
    private BigDecimal totalIncome;

    // Deductions
    private BigDecimal epf;
    private BigDecimal pcb;
    private BigDecimal zakatMonthly;
    private BigDecimal totalDeductions;

    // Expenses
    private BigDecimal housing;
    private BigDecimal transport;
    private BigDecimal food;
    private BigDecimal investment;
    private BigDecimal donation;
    private BigDecimal savings;
    private BigDecimal goldSavings;
    private BigDecimal totalExpenses;

    // Calculated
    private BigDecimal netSalary;
    private BigDecimal balance; // Net Salary - Total Expenses

    // Health Stats
    private BigDecimal netWorth; // Accumulation logic handled in service or passed from FE

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
