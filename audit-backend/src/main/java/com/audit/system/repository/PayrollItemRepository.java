package com.audit.system.repository;

import com.audit.system.model.PayrollItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PayrollItemRepository extends JpaRepository<PayrollItem, Long> {
    List<PayrollItem> findByPayrollRunId(Long payrollRunId);

    List<PayrollItem> findByPayrollRunIdAndEmployeeId(Long payrollRunId, Long employeeId);
}
