package com.audit.system.service;

import com.audit.system.model.PersonalFinance;
import com.audit.system.repository.PersonalFinanceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PersonalFinanceServiceTest {

    @Mock
    private PersonalFinanceRepository repository;

    @InjectMocks
    private PersonalFinanceService service;

    @Test
    void testCalculateLifetimeAverageSavings_WithBalances() {
        String email = "test@example.com";

        PersonalFinance p1 = new PersonalFinance();
        p1.setBalance(new BigDecimal("2000"));

        PersonalFinance p2 = new PersonalFinance();
        p2.setBalance(new BigDecimal("1000"));

        when(repository.findByUserEmailOrderByYearDescMonthDesc(email)).thenReturn(Arrays.asList(p1, p2));

        BigDecimal average = service.calculateLifetimeAverageSavings(email);

        // (2000 + 1000) / 2 = 1500
        assertEquals(new BigDecimal("1500.00"), average);
    }

    @Test
    void testCalculateLifetimeAverageSavings_WithFallback() {
        String email = "fallback@example.com";

        PersonalFinance p1 = new PersonalFinance();
        // Balance is null, so it should use Income - Deductions - Expenses
        // 5000 - 500 - 2000 = 2500
        p1.setTotalIncome(new BigDecimal("5000"));
        p1.setTotalDeductions(new BigDecimal("500"));
        p1.setTotalExpenses(new BigDecimal("2000"));

        PersonalFinance p2 = new PersonalFinance();
        // 4000 - 200 - 1000 = 2800
        p2.setTotalIncome(new BigDecimal("4000"));
        p2.setTotalDeductions(new BigDecimal("200"));
        p2.setTotalExpenses(new BigDecimal("1000"));

        when(repository.findByUserEmailOrderByYearDescMonthDesc(email)).thenReturn(Arrays.asList(p1, p2));

        BigDecimal average = service.calculateLifetimeAverageSavings(email);

        // (2500 + 2800) / 2 = 5300 / 2 = 2650
        assertEquals(new BigDecimal("2650.00"), average);
    }

    @Test
    void testCalculateLifetimeAverageSavings_Empty() {
        String email = "empty@example.com";
        when(repository.findByUserEmailOrderByYearDescMonthDesc(email)).thenReturn(Collections.emptyList());

        BigDecimal average = service.calculateLifetimeAverageSavings(email);

        assertEquals(BigDecimal.ZERO, average);
    }
}
