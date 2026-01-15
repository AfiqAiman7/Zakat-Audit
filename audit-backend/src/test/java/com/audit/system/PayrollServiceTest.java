package com.audit.system;

import com.audit.system.model.*;
import com.audit.system.repository.*;
import com.audit.system.service.PayrollService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class PayrollServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private EmployeeSalaryStructureRepository salaryStructureRepository;
    @Mock
    private PayrollRunRepository payrollRunRepository;
    @Mock
    private PayrollItemRepository payrollItemRepository;

    @InjectMocks
    private PayrollService payrollService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @SuppressWarnings("null")
    void testCalculateNetSalary() {
        // Setup Mock Employee
        Employee emp = new Employee();
        emp.setId(1L);
        when(employeeRepository.findAll()).thenReturn(Collections.singletonList(emp));

        // Setup Payroll Run
        PayrollRun run = new PayrollRun();
        when(payrollRunRepository.findByMonthAndYear(anyInt(), anyInt())).thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any(PayrollRun.class)))
                .thenAnswer(i -> i.getArguments()[0]);

        // Setup Components (Basic 5000 + Allowance 1000 - Deduction 500)
        SalaryComponent basic = new SalaryComponent();
        basic.setType(SalaryComponentType.EARNING);
        SalaryComponent allow = new SalaryComponent();
        allow.setType(SalaryComponentType.EARNING);
        SalaryComponent deduct = new SalaryComponent();
        deduct.setType(SalaryComponentType.DEDUCTION);

        EmployeeSalaryStructure s1 = new EmployeeSalaryStructure();
        s1.setComponent(basic);
        s1.setAmount(new BigDecimal("5000"));
        EmployeeSalaryStructure s2 = new EmployeeSalaryStructure();
        s2.setComponent(allow);
        s2.setAmount(new BigDecimal("1000"));
        EmployeeSalaryStructure s3 = new EmployeeSalaryStructure();
        s3.setComponent(deduct);
        s3.setAmount(new BigDecimal("500"));

        when(salaryStructureRepository.findActiveByEmployeeAndDate(any(), any()))
                .thenReturn(Arrays.asList(s1, s2, s3));

        // Execute
        PayrollRun result = payrollService.generatePayroll(1, 2026);

        // Verify: Net = 5000 + 1000 - 500 = 5500
        assertEquals(new BigDecimal("5500"), result.getTotalPayout());
    }
}
