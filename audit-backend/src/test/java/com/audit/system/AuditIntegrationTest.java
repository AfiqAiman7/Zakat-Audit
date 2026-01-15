package com.audit.system;

import com.audit.system.model.AuditLog;
import com.audit.system.model.Employee;
import com.audit.system.model.EmploymentStatus;
import com.audit.system.repository.AuditLogRepository;
import com.audit.system.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // Rolls back changes after test
class AuditIntegrationTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void testEmployeeInsertionTriggersAudit() {
        // 1. Create Employee
        Employee emp = new Employee();
        emp.setEmployeeCode("TEST-001");
        emp.setFullName("Audit Tester");
        emp.setIdentityNo("990101-10-1234");
        emp.setJoinDate(LocalDate.now());
        emp.setStatus(EmploymentStatus.PROBATION);

        employeeRepository.saveAndFlush(emp);

        // 2. Verify Audit Log exists
        List<AuditLog> logs = auditLogRepository.findByTableNameAndRecordId("employees", emp.getId());
        assertFalse(logs.isEmpty(), "Audit log should be created for INSERT");

        AuditLog insertLog = logs.get(0);
        assertEquals("INSERT", insertLog.getAction());
        assertTrue(insertLog.getNewValues().contains("Audit Tester"));
    }

    @Test
    void testEmployeeUpdateTriggersAudit() {
        // 1. Create
        Employee emp = new Employee();
        emp.setEmployeeCode("TEST-002");
        emp.setFullName("Original Name");
        emp.setIdentityNo("880202-10-5678");
        emp.setJoinDate(LocalDate.now());
        emp = employeeRepository.saveAndFlush(emp);

        // 2. Update
        emp.setFullName("Updated Name");
        employeeRepository.saveAndFlush(emp);

        // 3. Verify Logs (Should have INSERT and UPDATE)
        List<AuditLog> logs = auditLogRepository.findByTableNameAndRecordId("employees", emp.getId());
        assertEquals(2, logs.size());

        AuditLog updateLog = logs.stream()
                .filter(l -> "UPDATE".equals(l.getAction()))
                .findFirst()
                .orElseThrow();

        assertTrue(updateLog.getOldValues().contains("Original Name"));
        assertTrue(updateLog.getNewValues().contains("Updated Name"));
    }
}
