package com.audit.system.service;

import com.audit.system.model.PersonalFinance;
import com.audit.system.repository.PersonalFinanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonalFinanceService {

    private final PersonalFinanceRepository repository;

    public PersonalFinance saveCalculation(PersonalFinance finance) {
        // Prevent duplicates for the same month/year
        List<PersonalFinance> existingList = repository.findByUserEmailAndYearAndMonth(
                finance.getUserEmail(), finance.getYear(), finance.getMonth());

        PersonalFinance existing = existingList.isEmpty() ? null : existingList.get(0);

        if (existing != null) {
            System.out.println("Updating existing record for: " + finance.getUserEmail() + " " + finance.getMonth()
                    + "/" + finance.getYear());
            finance.setId(existing.getId()); // Update existing record

            // Preserve createdAt
            if (existing.getCreatedAt() != null) {
                finance.setCreatedAt(existing.getCreatedAt());
            } else {
                finance.setCreatedAt(java.time.LocalDateTime.now());
            }
        } else {
            System.out.println("Creating NEW record for: " + finance.getUserEmail() + " " + finance.getMonth() + "/"
                    + finance.getYear());
            if (finance.getCreatedAt() == null) {
                finance.setCreatedAt(java.time.LocalDateTime.now());
            }
        }

        return repository.save(finance);
    }

    public PersonalFinance getLatestRecord(String email) {
        List<PersonalFinance> history = getHistory(email);
        return history.isEmpty() ? null : history.get(0);
    }

    public List<PersonalFinance> getHistory(String email) {
        return repository.findByUserEmailOrderByYearDescMonthDesc(email);
    }

    // Aggregations needed for Dashboard
    public BigDecimal calculateNetWorth(String email) {
        List<PersonalFinance> history = getHistory(email);
        if (history.isEmpty())
            return BigDecimal.ZERO;

        // Methodology:
        // "Savings" and "Gold" are Assets (Snapshots) entered by the user.
        // We use the LATEST snapshot as the current truth.
        // We DO NOT add accumulated balances, as the user updates the snapshot
        // manually.

        PersonalFinance latest = history.get(0); // History is sorted Desc
        BigDecimal latestBaseSavings = latest.getSavings() != null ? latest.getSavings() : BigDecimal.ZERO;
        BigDecimal latestGold = latest.getGoldSavings() != null ? latest.getGoldSavings() : BigDecimal.ZERO;

        return latestBaseSavings.add(latestGold);
    }

    public BigDecimal calculateTotalMoneySavings(String email) {
        List<PersonalFinance> history = getHistory(email);
        if (history.isEmpty())
            return BigDecimal.ZERO;

        PersonalFinance latest = history.get(0);
        return latest.getSavings() != null ? latest.getSavings() : BigDecimal.ZERO;
    }

    public BigDecimal calculateTotalGoldSavings(String email) {
        List<PersonalFinance> history = getHistory(email);
        if (history.isEmpty())
            return BigDecimal.ZERO;

        PersonalFinance latest = history.get(0);
        return latest.getGoldSavings() != null ? latest.getGoldSavings() : BigDecimal.ZERO;
    }

    public BigDecimal calculateLifetimeAverageSavings(String email) {
        List<PersonalFinance> history = getHistory(email);
        if (history.isEmpty())
            return BigDecimal.ZERO;

        BigDecimal totalSurplus = history.stream()
                .map(pf -> {
                    // If balance is pre-calculated, use it. Otherwise calculate on fly.
                    if (pf.getBalance() != null)
                        return pf.getBalance();

                    // Fallback calculation: Total Income - Total Deductions - Total Expenses
                    BigDecimal income = pf.getTotalIncome() != null ? pf.getTotalIncome() : BigDecimal.ZERO;
                    BigDecimal deductions = pf.getTotalDeductions() != null ? pf.getTotalDeductions() : BigDecimal.ZERO;
                    BigDecimal expenses = pf.getTotalExpenses() != null ? pf.getTotalExpenses() : BigDecimal.ZERO;
                    return income.subtract(deductions).subtract(expenses);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Total surplus / number of months
        return totalSurplus.divide(BigDecimal.valueOf(history.size()), 2, java.math.RoundingMode.HALF_UP);
    }

    public BigDecimal calculateTotalZakat(String email, int year) {
        List<PersonalFinance> yearly = repository.findByUserEmailAndYear(email, year);
        return yearly.stream()
                .map(pf -> pf.getZakatMonthly() != null ? pf.getZakatMonthly() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void deleteCalculation(Long id) {
        if (id != null) {
            repository.deleteById(id);
        }
    }
}
