package com.audit.system.controller;

import com.audit.system.model.Employee;
import com.audit.system.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id,
            @RequestBody Employee details) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setFullName(details.getFullName());
                    employee.setIdentityNo(details.getIdentityNo());
                    employee.setEpfNo(details.getEpfNo());
                    employee.setSocsoNo(details.getSocsoNo());
                    employee.setTaxNo(details.getTaxNo());
                    employee.setStatus(details.getStatus());
                    // Other fields...
                    return ResponseEntity.ok(employeeRepository.save(employee));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
