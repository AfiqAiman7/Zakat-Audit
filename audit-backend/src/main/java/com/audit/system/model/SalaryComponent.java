package com.audit.system.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "salary_components")
public class SalaryComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalaryComponentType type;

    @Enumerated(EnumType.STRING)
    private SalaryFrequency frequency;

    @Column(name = "is_taxable")
    private boolean isTaxable;

    @Column(name = "is_epf_applicable")
    private boolean isEpfApplicable;

    @Column(name = "is_socso_applicable")
    private boolean isSocsoApplicable;
}
