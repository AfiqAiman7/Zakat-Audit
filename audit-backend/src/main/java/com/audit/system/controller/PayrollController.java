package com.audit.system.controller;

import com.audit.system.model.PayrollRun;
import com.audit.system.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*") // Allow Angular to access
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    public ResponseEntity<PayrollRun> generatePayroll(@RequestParam int month, @RequestParam int year) {
        PayrollRun run = payrollService.generatePayroll(month, year);
        return ResponseEntity.ok(run);
    }
}
