package com.audit.system.repository;

import com.audit.system.model.PersonalFinance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalFinanceRepository extends JpaRepository<PersonalFinance, Long> {
    List<PersonalFinance> findByUserEmailOrderByYearDescMonthDesc(String userEmail);

    List<PersonalFinance> findByUserEmailAndYear(String userEmail, int year);

    List<PersonalFinance> findByUserEmailAndYearAndMonth(String userEmail, int year, int month);
}
