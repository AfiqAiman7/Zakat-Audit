package com.audit.system.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payroll_runs")
public class PayrollRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "run_date")
    private LocalDateTime runDate = LocalDateTime.now();

    private String status = "DRAFT";

    @Column(name = "processed_by")
    private String processedBy;

    @Column(name = "total_payout")
    private BigDecimal totalPayout;
}
