import { Injectable } from '@angular/core';
import { DeductionDetails, ExpenseDetails, IncomeDetails, CalculationResult, ZakatDetails, FinancialHealth, EmergencyFundDetails, AssetDetails } from '../models/calculator.model';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  // Current Nisab (Example value, should ideally be dynamic)
  private readonly NISAB_YEARLY = 24000; // Approx based on gold price

  constructor() { }

  calculate(income: IncomeDetails, existingDeductions: Partial<DeductionDetails>, expenses: ExpenseDetails, assets: AssetDetails): CalculationResult {
    const grossIncome = this.calculateGrossIncome(income);

    // 1. Calculate Statutory Deductions (Auto-calculate if not provided)
    const epf = existingDeductions.epf ?? this.calculateEPF(grossIncome);
    const socso = existingDeductions.socso ?? this.calculateSOCSO(grossIncome);
    const eis = existingDeductions.eis ?? this.calculateEIS(grossIncome);

    // 2. Tax Calculation (PCB approximation)
    const taxableIncome = grossIncome - epf; // Simplified
    const pcb = existingDeductions.pcb ?? this.calculatePCB(taxableIncome);

    // 3. Zakat Calculation
    const zakatDetails = this.calculateZakat(grossIncome, expenses);
    const zakat = existingDeductions.zakat ?? 0;

    // 4. Emergency Fund Calculation
    const emergencyFund = this.calculateEmergencyFund(expenses, assets);

    const totalDeductions = epf + socso + eis + pcb + zakat;
    const netSalary = grossIncome - totalDeductions;

    // Filter logic removed as savings/gold are no longer in expenses object
    const totalExpenses = Object.values(expenses).reduce((sum, value) => sum + (value as number), 0);
    const balance = netSalary - totalExpenses;

    return {
      grossIncome,
      totalDeductions,
      epf,
      pcb,
      netSalary,
      totalExpenses,
      balance,
      zakatDetails,
      emergencyFund
    };
  }

  private calculateGrossIncome(income: IncomeDetails): number {
    return income.basicSalary + income.fixedAllowance + income.variableAllowance +
      income.overtime + income.bonus + income.otherIncome + income.gift;
  }

  private calculateEPF(grossIncome: number): number {
    // 11% contribution rate cap
    return grossIncome * 0.11;
  }

  private calculateSOCSO(grossIncome: number): number {
    // Simplified SOCSO table approximation (capped around RM 5000 salary -> ~RM 19.75)
    if (grossIncome > 5000) return 19.75;
    return grossIncome * 0.005;
  }

  private calculateEIS(grossIncome: number): number {
    // ~0.2% capped at around RM 7.90
    if (grossIncome > 4000) return 7.90;
    return grossIncome * 0.002;
  }

  // Simplified Annual Tax / 12 for PCB
  private calculatePCB(monthlyTaxableBeforeRelief: number): number {
    const annual = monthlyTaxableBeforeRelief * 12;
    // Standard Reliefs: Individual (9000)
    let taxable = Math.max(0, annual - 9000);

    let tax = 0;
    // 2024/2025 Brackets (Simplified)
    if (taxable > 100000) {
      tax += (taxable - 100000) * 0.25; // Estimate top bracket
      taxable = 100000;
    }
    if (taxable > 70000) {
      tax += (taxable - 70000) * 0.21;
      taxable = 70000;
    }
    // ... Lower brackets skipped for brevity in simplified version
    if (taxable > 50000) {
      tax += (taxable - 50000) * 0.11;
      taxable = 50000;
    }

    return tax / 12;
  }

  private calculateZakat(monthlyGross: number, expenses: ExpenseDetails): ZakatDetails {
    const annualIncome = monthlyGross * 12;

    // Had al-Kifayah (Basic Needs Exemption) - Example calculation
    // Self + Wife + Kids etc. Simplified here to a flat rate or expense based
    const basicNeeds = (expenses.housing + expenses.food + expenses.transport + expenses.utilities) * 12;
    // Or use fixed state board averages, e.g., RM 24,000 / year for single

    const assessableAmount = Math.max(0, annualIncome - basicNeeds);

    if (assessableAmount > this.NISAB_YEARLY) {
      const yearlyZakat = assessableAmount * 0.025;
      return {
        eligibleAmount: assessableAmount,
        amountDue: yearlyZakat / 12, // Monthly
        status: 'ELIGIBLE'
      };
    }

    return {
      eligibleAmount: 0,
      amountDue: 0,
      status: 'NOT_ELIGIBLE'
    };
  }

  private calculateEmergencyFund(expenses: ExpenseDetails, assets: AssetDetails): EmergencyFundDetails {
    // Essential = Housing + Food + Utilities + Transport
    // Excludes "Miscalleneous", "Savings"
    const essential = expenses.housing + expenses.food + expenses.utilities + expenses.transport + expenses.childcare;

    // Default to a minimum if 0 to show targets
    const monthlyEssential = essential === 0 ? 1500 : essential;

    const currentSavings = assets.savings; // Use existing Liquid Savings

    const monthsCovered = currentSavings / monthlyEssential;

    let currentStatus: 'Safe' | 'Warning' | 'Critical' = 'Critical';
    if (monthsCovered >= 6) currentStatus = 'Safe';
    else if (monthsCovered >= 3) currentStatus = 'Warning';

    return {
      essentialExpenses: monthlyEssential,
      target3Months: monthlyEssential * 3,
      target6Months: monthlyEssential * 6,
      target12Months: monthlyEssential * 12,
      currentStatus,
      monthsCovered
    };
  }

  calculateFinancialHealth(result: CalculationResult): FinancialHealth {
    const savingsRatio = (result.balance / result.netSalary) * 100;

    let status: FinancialHealth['status'] = 'Poor';
    let score = 0;
    const comments: string[] = [];

    if (savingsRatio >= 20) {
      status = 'Excellent';
      score = 90;
      comments.push('Great savings rate! Mashallah.');
    } else if (savingsRatio >= 10) {
      status = 'Good';
      score = 75;
      comments.push('Good standardized savings.');
    } else if (savingsRatio > 0) {
      status = 'Fair';
      score = 50;
      comments.push('You are saving, but try to increase to 10-20%.');
    } else {
      status = 'Poor';
      score = 30;
      comments.push('Warning: Expenses exceed income. Review your spending.');
    }

    return { status, score, comments };
  }
}
