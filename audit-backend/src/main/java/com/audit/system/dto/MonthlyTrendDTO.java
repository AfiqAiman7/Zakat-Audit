package com.audit.system.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MonthlyTrendDTO {
    private String month; // "Jan", "Feb"
    private BigDecimal totalPayout;
}
