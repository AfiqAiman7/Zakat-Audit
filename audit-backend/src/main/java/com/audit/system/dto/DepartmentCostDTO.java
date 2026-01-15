package com.audit.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DepartmentCostDTO {
    private String departmentName;
    private BigDecimal totalCost;
}
