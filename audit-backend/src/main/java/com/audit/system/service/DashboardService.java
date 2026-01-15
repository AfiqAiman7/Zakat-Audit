package com.audit.system.service;

import com.audit.system.dto.DepartmentCostDTO;
import com.audit.system.dto.MonthlyTrendDTO;
import com.audit.system.model.AuditLog;
import com.audit.system.model.PayrollRun;
import com.audit.system.repository.AuditLogRepository;
import com.audit.system.repository.PayrollRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PayrollRunRepository payrollRunRepository;
    private final AuditLogRepository auditLogRepository;

    public List<MonthlyTrendDTO> getYearlyTrend(int year) {
        List<MonthlyTrendDTO> trends = new ArrayList<>();
        // In a real scenario, we might want to fetch all runs for the year in one query
        // keeping it simple for now
        for (int month = 1; month <= 12; month++) {
            MonthlyTrendDTO dto = new MonthlyTrendDTO();
            dto.setMonth(getMonthName(month));

            PayrollRun run = payrollRunRepository.findByMonthAndYear(month, year).orElse(null);
            dto.setTotalPayout(run != null ? run.getTotalPayout() : BigDecimal.ZERO);

            trends.add(dto);
        }
        return trends;
    }

    public List<DepartmentCostDTO> getDepartmentCosts(int year) {
        // Mocking logic for department costs using Payroll Items would be ideal
        // But for "Visual" demo, we can aggregate from Employees if Linked
        // For now, let's return some realistic mock data for the Pie Chart
        // In real app: Join PayrollItem -> Employee -> Department
        List<DepartmentCostDTO> costs = new ArrayList<>();
        costs.add(new DepartmentCostDTO("IT", new BigDecimal("45000")));
        costs.add(new DepartmentCostDTO("HR", new BigDecimal("15000")));
        costs.add(new DepartmentCostDTO("Finance", new BigDecimal("28000")));
        costs.add(new DepartmentCostDTO("Operations", new BigDecimal("32000")));
        return costs;
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop10ByOrderByChangedAtDesc();
    }

    private String getMonthName(int month) {
        return java.time.Month.of(month).name();
    }
}
