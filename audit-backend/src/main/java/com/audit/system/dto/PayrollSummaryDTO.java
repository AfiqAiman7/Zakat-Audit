package com.audit.system.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PayrollSummaryDTO {
    private String employeeName;
    private String employeeCode;
    private BigDecimal basicSalary;
    private BigDecimal totalAllowances;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
}
