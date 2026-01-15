package com.audit.system.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_code", unique = true, nullable = false)
    private String employeeCode;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "identity_no", nullable = false)
    private String identityNo;

    @Column(name = "epf_no")
    private String epfNo;

    @Column(name = "socso_no")
    private String socsoNo;

    @Column(name = "tax_no")
    private String taxNo;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Column(name = "resign_date")
    private LocalDate resignDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EmploymentStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "current_grade_id")
    private Grade grade;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private java.util.List<EmployeeVehicle> vehicles;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private java.util.List<EmployeeSalaryStructure> salaryStructures;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
