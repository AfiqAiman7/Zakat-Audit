package com.audit.system.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "employee_vehicles")
public class EmployeeVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    @ToString.Exclude
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;

    @Column(name = "registration_no", nullable = false)
    private String registrationNo;

    private String model;

    @Column(name = "fuel_allowance_limit")
    private BigDecimal fuelAllowanceLimit;

    @Column(name = "is_active")
    private boolean isActive = true;
}
