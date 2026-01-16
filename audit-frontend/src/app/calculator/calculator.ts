import { Component, computed, inject, signal, AfterViewInit, ViewChild, ElementRef, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CalculatorService } from './services/calculator';
import { CalculationResult, FinancialHealth, IncomeDetails, DeductionDetails, ExpenseDetails } from './models/calculator.model';
import { Chart, registerables } from 'chart.js';
import { ThemeService } from '../theme';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculator.html',
  styleUrls: ['./calculator.css']
})
export class CalculatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private calculatorService = inject(CalculatorService);
  private themeService = inject(ThemeService);
  public auth = inject(AuthService);
  private dashboardService = inject(DashboardService);

  @ViewChild('breakdownChart') breakdownChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | null = null;

  // Steps for the Wizard
  currentStep = signal(0); // 0 = Mode Selection
  mode = signal<'select' | 'monthly' | 'assets'>('select');

  steps = [
    { number: 1, title: 'Select Period' }, // New Step 1
    { number: 2, title: 'Income & Allowance' },
    { number: 3, title: 'Deductions & Zakat' },
    { number: 4, title: 'Expenses & Commitments' },
    { number: 5, title: 'Current Assets' },
    { number: 6, title: 'Financial Health Result' }
  ];

  currentTheme = signal('light');
  isAssetLocked = signal(false); // Signal to track lock state

  // Period Form
  periodForm = this.fb.group({
    month: [new Date().getMonth() + 1, [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]]
  });

  selectMode(newMode: 'monthly' | 'assets' | 'select') {
    this.mode.set(newMode);

    if (newMode === 'monthly') {
      this.currentStep.set(1); // Start Wizard at Date
    } else if (newMode === 'assets') {
      this.currentStep.set(1); // Start at Date Selection for Assets too (To fix date issue)
      // Do not load data yet, let user pick date first
      this.loadDataForPeriod();
    } else {
      this.currentStep.set(0); // Back to selection
    }
  }

  // Forms
  incomeForm = this.fb.group({
    basicSalary: [0, [Validators.required, Validators.min(0)]],
    fixedAllowance: [0],
    variableAllowance: [0],
    overtime: [0],
    bonus: [0],
    otherIncome: [0],
    gift: [0]
  });

  deductionsForm = this.fb.group({
    epf: [null], // Auto-calculated if null
    socso: [null],
    eis: [null],
    pcb: [null],
    zakat: [0],
    otherDeductions: [0]
  });

  expensesForm = this.fb.group({
    housing: [0],
    transport: [0],
    food: [0],
    investment: [0],
    donation: [0],
    utilities: [0],
    telecommunications: [0],
    childcare: [0],
    insurance: [0],
    miscellaneous: [0]
  });

  assetsForm = this.fb.group({
    savings: [0],
    goldSavings: [0]
  });

  // Results
  result: CalculationResult | null = null;
  financialHealth: FinancialHealth | null = null;

  constructor() {
    // Initialize theme subscription
    effect(() => {
      this.themeService.theme$.subscribe((theme: string) => {
        this.currentTheme.set(theme);
      });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const month = params['month'];
      const year = params['year'];
      if (month && year) {
        this.periodForm.patchValue({ month: +month, year: +year });
        this.loadDataForPeriod();
      }
    });
  }

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  loadDataForPeriod() {
    const user = this.auth.currentUser();
    const { month, year } = this.periodForm.value;

    if (!user || !user.email || !month || !year) return;

    this.dashboardService.getHistory(user.email).subscribe({
      next: (history) => {
        const match = history.find(h => h.month == month && h.year == year);
        if (match) {
          console.log('Found existing data for', month, year, match);
          this.patchForms(match);
        } else {
          console.log('No data for', month, year, ' - Starting fresh');
          this.resetForms();
        }
      },
      error: (err) => console.error('Error fetching history', err)
    });
  }

  patchForms(data: any) {
    this.incomeForm.patchValue({
      basicSalary: data.basicSalary || 0,
      fixedAllowance: data.fixedAllowance || 0,
      variableAllowance: data.variableAllowance || 0,
      bonus: data.bonus || 0,
      // Map other fields if they exist in history DTO
    });

    this.deductionsForm.patchValue({
      epf: data.epf,
      pcb: data.pcb,
      zakat: data.zakatMonthly
    });

    this.expensesForm.patchValue({
      housing: data.housing || 0,
      transport: data.transport || 0,
      food: data.food || 0,
      investment: data.investment || 0,
      donation: data.donation || 0,
      // Map others
    });

    this.assetsForm.patchValue({
      savings: data.savings || 0,
      goldSavings: data.goldSavings || 0
    });
  }

  resetForms() {
    this.incomeForm.reset({ basicSalary: 0 });
    this.deductionsForm.reset();
    this.expensesForm.reset();
    this.assetsForm.reset();
  }

  nextStep() {
    // Mode: Monthly Calculator
    if (this.mode() === 'monthly') {
      if (this.currentStep() === 1) {
        this.loadDataForPeriod();
      }

      if (this.currentStep() === 4) {
        // SKIP Step 5 (Assets) -> Go to Calculate -> Step 6
        this.calculate();
        this.currentStep.set(6);
        setTimeout(() => this.renderChart(), 100);
        return;
      }

      if (this.currentStep() === 6) { return; }

      this.currentStep.update(v => v + 1);
    }
    // Mode: Assets Only
    else if (this.mode() === 'assets') {
      // Step 1 (Date) -> Step 5 (Assets)
      if (this.currentStep() === 1) {
        this.loadDataForPeriod(); // Load existing data for selected date
        this.currentStep.set(5);
        return;
      }
      // Step 5 -> Save
      if (this.currentStep() === 5) {
        this.saveResult();
      }
    }
  }

  prevStep() {
    if (this.mode() === 'monthly') {
      if (this.currentStep() === 6) {
        this.currentStep.set(4); // Go back to Expenses (Skip 5)
        return;
      }
      this.currentStep.update(v => Math.max(v - 1, 1));
    } else if (this.mode() === 'assets') {
      // If at Step 5, go back to Step 1 (Date)
      if (this.currentStep() === 5) {
        this.currentStep.set(1);
        return;
      }
      // If at Step 1, go back to Selection
      if (this.currentStep() === 1) {
        this.mode.set('select');
        this.currentStep.set(0);
      }
    } else {
      this.currentStep.set(0);
    }
  }

  calculate() {
    const income = this.incomeForm.value as IncomeDetails;
    const deductions = this.deductionsForm.value as Partial<DeductionDetails>;
    const expenses = this.expensesForm.value as ExpenseDetails;
    // CRITICAL: Use getRawValue() to include disabled fields
    // Fix: Explicitly cast 'assets' to match AssetDetails (handle nulls)
    const rawAssets = this.assetsForm.getRawValue();
    const assets = {
      savings: rawAssets.savings || 0,
      goldSavings: rawAssets.goldSavings || 0
    };

    this.result = this.calculatorService.calculate(income, deductions, expenses, assets);
    this.financialHealth = this.calculatorService.calculateFinancialHealth(this.result);
  }

  isSaving = signal(false);
  saveSuccess = signal(false);

  saveResult() {
    let user = this.auth.currentUser();
    const res = this.result; // Access result directly as it's not a signal anymore

    // Auto-login if guest
    if (!user) {
      if (confirm("You need to be logged in to save. Login as Guest?")) {
        this.auth.login('guest@user.com');
        user = this.auth.currentUser(); // Refresh
      } else {
        return;
      }
    }

    // Verify user
    if (!user || (!user.email && user.name !== 'Guest')) return;

    // Check if we have a result (Monthly Mode) OR if we are in Assets Mode (Partial Save)
    // If Monthly mode and no result, return.
    if (this.mode() === 'monthly' && !res) return;

    this.isSaving.set(true);

    const income = this.incomeForm.value as IncomeDetails;
    const expenses = this.expensesForm.value as ExpenseDetails;
    const { month, year } = this.periodForm.value; // Get selected period

    // Fix: Redefine assets here since it's not in scope from calculate()
    const rawAssets = this.assetsForm.getRawValue();
    const assets = {
      savings: rawAssets.savings || 0,
      goldSavings: rawAssets.goldSavings || 0
    };

    // Construct Payload
    let financeData: any = {
      userEmail: user.email,
      year: year,
      month: month,
      createdAt: new Date().toISOString(),

      // Always include Assets as they might be updated in either mode
      savings: assets.savings,
      goldSavings: assets.goldSavings,
    };

    if (this.mode() === 'monthly' && res) {
      // Full Monthly Calculation Save
      financeData = {
        ...financeData,
        // Income
        basicSalary: income.basicSalary,
        fixedAllowance: income.fixedAllowance,
        variableAllowance: income.variableAllowance,
        bonus: income.bonus,
        totalIncome: res.grossIncome,

        // Deductions
        epf: res.epf,
        pcb: res.pcb,
        zakatMonthly: res.zakatDetails.amountDue,
        totalDeductions: res.totalDeductions,

        // Expenses
        housing: expenses.housing,
        transport: expenses.transport,
        food: expenses.food,
        investment: expenses.investment,
        donation: expenses.donation,
        totalExpenses: res.totalExpenses,

        // Calculated
        netSalary: res.netSalary || 0,
        balance: res.balance || 0,
      };
    } else {
      // Assets Only Mode - Zero out flow fields or leave null? 
      // Backend entity has primitive double/BigDecimal. 
      // Better to send 0 for flow if undefined, OR rely on backend to handle nulls?
      // Let's send 0 for critical flow fields to avoid NPEs if backend assumes them.
      financeData = {
        ...financeData,
        totalIncome: 0,
        totalDeductions: 0,
        totalExpenses: 0,
        balance: 0,
        netSalary: 0,
        // Zakat on Income is 0 since no income entered
        zakatMonthly: 0
      };
    }

    this.dashboardService.saveCalculation(financeData).subscribe({
      next: (saved) => {
        console.log('Calculation saved', saved);
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000); // Reset success message
      },
      error: (err) => {
        console.error('Failed to save calculation', err);
        this.isSaving.set(false);
      }
    });
  }

  renderChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    if (!this.breakdownChartRef) return;

    const ctx = this.breakdownChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const r = this.result; // Access directly
    if (!r) return;

    // Islamic Finance color scheme
    const isDark = this.currentTheme() === 'dark';
    const colors = isDark ? {
      salary: '#3fa37c',      // Primary green for halal income
      deductions: '#c9a24d',  // Gold for zakat/deductions
      expenses: '#6b7280',    // Neutral for expenses
      background: '#162923',
      text: '#e6f4ee'
    } : {
      salary: '#2f855a',      // Primary green for halal income
      deductions: '#b7791f',  // Gold for zakat/deductions
      expenses: '#6b7280',    // Neutral for expenses
      background: '#ffffff',
      text: '#1f2933'
    };

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Net Salary (Halal Income)', 'Deductions & Zakat', 'Monthly Expenses'],
        datasets: [{
          data: [r.netSalary, r.totalDeductions, r.totalExpenses],
          backgroundColor: [
            colors.salary,     // Green for halal income
            colors.deductions, // Gold for zakat/deductions
            colors.expenses    // Neutral for expenses
          ],
          borderColor: colors.background,
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverBorderColor: colors.text,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%', // Thinner ring for elegance
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: 500
              },
              color: colors.text
            }
          },
          tooltip: {
            backgroundColor: colors.background,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.salary,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: RM ${value.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // Getters for template
  get activeStepTitle() {
    return this.steps.find(s => s.number === this.currentStep())?.title;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
