package com.audit.system.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "claims")
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "claim_type", nullable = false)
    private String claimType; // e.g., "FUEL", "MEDICAL"

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "receipt_ref")
    private String receiptRef;

    @Column(name = "claim_date", nullable = false)
    private LocalDate claimDate;

    private String description;

    private String status = "PENDING";

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private EmployeeVehicle vehicle;
}
