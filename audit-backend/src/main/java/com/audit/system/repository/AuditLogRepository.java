package com.audit.system.repository;

import com.audit.system.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTableNameAndRecordId(String tableName, Long recordId);

    List<AuditLog> findTop10ByOrderByChangedAtDesc();
}
