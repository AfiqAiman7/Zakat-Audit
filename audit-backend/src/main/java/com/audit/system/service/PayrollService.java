package com.audit.system.service;

import com.audit.system.model.*;
import com.audit.system.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryStructureRepository salaryStructureRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PayrollItemRepository payrollItemRepository;

    @Transactional
    public PayrollRun generatePayroll(int month, int year) {
        // 1. Create or Get Payroll Run
        PayrollRun run = payrollRunRepository.findByMonthAndYear(month, year)
                .orElseGet(() -> {
                    PayrollRun newRun = new PayrollRun();
                    newRun.setMonth(month);
                    newRun.setYear(year);
                    return payrollRunRepository.save(newRun);
                });

        if ("FINALIZED".equals(run.getStatus())) {
            throw new RuntimeException("Payroll for this month is already finalized.");
        }

        LocalDate runDate = LocalDate.of(year, month, 1).plusMonths(1).minusDays(1); // End of month
        List<Employee> employees = employeeRepository.findAll(); // optimized: filter by active status

        BigDecimal totalRunPayout = BigDecimal.ZERO;

        for (Employee emp : employees) {
            // Get active components
            List<EmployeeSalaryStructure> components = salaryStructureRepository
                    .findActiveByEmployeeAndDate(emp.getId(), runDate);

            BigDecimal grossPay = BigDecimal.ZERO;
            BigDecimal totalDeductions = BigDecimal.ZERO;

            for (EmployeeSalaryStructure struct : components) {
                BigDecimal amount = struct.getAmount();
                SalaryComponentType type = struct.getComponent().getType();

                // Create Item
                PayrollItem item = new PayrollItem();
                item.setPayrollRun(run);
                item.setEmployee(emp);
                item.setComponent(struct.getComponent());
                item.setAmount(amount);
                item.setCalculationBase(amount); // Simplified

                payrollItemRepository.save(item);

                if (type == SalaryComponentType.EARNING) {
                    grossPay = grossPay.add(amount);
                } else if (type == SalaryComponentType.DEDUCTION || type == SalaryComponentType.STATUTORY_DEDUCTION) {
                    totalDeductions = totalDeductions.add(amount);
                }
            }

            BigDecimal netPay = grossPay.subtract(totalDeductions);
            totalRunPayout = totalRunPayout.add(netPay);
        }

        run.setTotalPayout(totalRunPayout);
        return payrollRunRepository.save(run);
    }
}
