package com.audit.system.controller;

import com.audit.system.dto.DepartmentCostDTO;
import com.audit.system.dto.MonthlyTrendDTO;
import com.audit.system.model.AuditLog;
import com.audit.system.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/trend")
    public ResponseEntity<List<MonthlyTrendDTO>> getYearlyTrend(@RequestParam int year) {
        List<MonthlyTrendDTO> trends = dashboardService.getYearlyTrend(year);
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/cost-by-dept")
    public ResponseEntity<List<DepartmentCostDTO>> getDepartmentCosts(@RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getDepartmentCosts(year));
    }

    @GetMapping("/recent-logs")
    public ResponseEntity<List<AuditLog>> getRecentAuditLogs() {
        return ResponseEntity.ok(dashboardService.getRecentAuditLogs());
    }
}
