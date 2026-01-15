package com.audit.system.controller;

import com.audit.system.model.PersonalFinance;
import com.audit.system.service.PersonalFinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular
public class PersonalFinanceController {

    private final PersonalFinanceService service;

    @PostMapping("/save")
    public ResponseEntity<PersonalFinance> saveCalculation(@RequestBody PersonalFinance finance) {
        return ResponseEntity.ok(service.saveCalculation(finance));
    }

    @GetMapping("/history")
    public ResponseEntity<List<PersonalFinance>> getHistory(@RequestParam String email) {
        return ResponseEntity.ok(service.getHistory(email));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@RequestParam String email) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("netWorth", service.calculateNetWorth(email));
        // Latest Monthly Savings (Balance + Savings from latest entry)
        summary.put("avgMonthlySavings", service.calculateLifetimeAverageSavings(email));
        summary.put("totalMoneySavings", service.calculateTotalMoneySavings(email));
        summary.put("totalGoldSavings", service.calculateTotalGoldSavings(email));

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/latest")
    public ResponseEntity<PersonalFinance> getLatest(@RequestParam String email) {
        return ResponseEntity.ok(service.getLatestRecord(email));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCalculation(@PathVariable Long id) {
        service.deleteCalculation(id);
        return ResponseEntity.ok().build();
    }
}
