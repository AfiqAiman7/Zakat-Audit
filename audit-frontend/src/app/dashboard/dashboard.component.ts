import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { ThemeService } from '../theme';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';

import { FormsModule } from '@angular/forms'; // Added

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('incomeChart') incomeChartRef!: ElementRef;

    // Personal Stats
    netWorth = 0;
    filteredNetWorth = 0; // The total sum displayed
    totalMoneySavings = 0;
    totalGoldSavings = 0;

    monthlySavings = 0;
    zakatDue = 0;
    zakatSavingsDue = 0;
    zakatEligibility: 'ELIGIBLE' | 'BELOW_NISAB' | 'HAUL_NOT_MET' = 'BELOW_NISAB';
    formattedZakatMessage = '';

    isZakatPaid = false;

    // Nisab for Savings (Approx 85g Gold * Current Gold Price ~RM300/g = RM25,500)
    // Using a safe estimate or the same as CalculatorService
    readonly NISAB_SAVINGS = 25000;

    // Mock Data for Charts
    // Mock Data for Charts
    monthlyIncome: any[] = [];
    monthlyExpenses: any[] = [];

    incomeChart: any;
    currentTheme = 'light';

    constructor(
        private themeService: ThemeService,
        public auth: AuthService,
        private dashboardService: DashboardService,
        private router: Router
    ) {
        Chart.register(...registerables);
        this.themeService.theme$.subscribe(theme => {
            this.currentTheme = theme;
            if (!this.auth.isGuest()) {
                this.loadDashboardData();
            }
        });
    }

    ngOnInit(): void {
        if (!this.auth.isGuest()) {
            this.loadDashboardData();
        }
    }

    ngAfterViewInit() {
        if (this.auth.isGuest()) {
            // Use timeout to ensure canvas is ready
            setTimeout(() => this.initIncomeChart(), 0);
        }
    }

    // Filter State
    startMonth: string = '';
    endMonth: string = '';
    currentFilter: '6months' | 'year' | '5years' = 'year';
    fullHistory: any[] = [];
    filteredHistoryList: any[] = []; // Sub-list required for filtered display in UI
    chartLabels: string[] = [];

    loadDashboardData() {
        const user = this.auth.currentUser();
        if (!user || !user.email) return;

        // 1. Get History for Charts & Calculations
        this.dashboardService.getHistory(user.email).subscribe(history => {
            this.fullHistory = history.reverse(); // Indexes: 0 = Oldest, Length-1 = Latest

            // --- Custom Aggregation Logic per User Request ---
            if (this.fullHistory.length > 0) {
                // 1. Total Savings (Net Worth) - ANCHOR + FLOW LOGIC
                // Find the latest record where the user manually updated assets (The Anchor)
                let anchorIndex = -1;
                // Iterate backwards to find the latest "Asset Update"
                for (let i = this.fullHistory.length - 1; i >= 0; i--) {
                    if ((this.fullHistory[i].savings || 0) > 0 || (this.fullHistory[i].goldSavings || 0) > 0) {
                        anchorIndex = i;
                        break;
                    }
                }

                // If never updated assets, start from the beginning OR treat as zero base.
                // We'll treat index 0 (oldest) as the start if no explicit anchor found.
                const startIndex = anchorIndex === -1 ? 0 : anchorIndex;
                const anchorRecord = this.fullHistory[startIndex];

                // Base Assets from Anchor Snapshot
                // We use Number() to prevent string concatenation issues.
                const baseMoney = Number(anchorRecord.savings) || 0;
                const baseGold = Number(anchorRecord.goldSavings) || 0;

                // Calculate Flows from Anchor onwards (inclusive of Anchor month)
                // Why inclusive? If user says "In Dec I have 19k total", and Dec also has +RM900 surplus,
                // usually "Total Savings" implies the closing balance.
                // However, user said: "add on all of that to get new total savings."
                // So we add the flow (Surplus/Investment) of the anchor month itself + subsequent months.

                let accumulatedBalance = 0;
                let accumulatedInvestment = 0;

                for (let i = startIndex; i < this.fullHistory.length; i++) {
                    const r = this.fullHistory[i];

                    // Balance = Cash Surplus (Income - Expenses - Deductions)
                    // If balance is already calculated in backend, use it. Otherwise calc on fly.
                    let balance = 0;
                    if (r.balance !== undefined && r.balance !== null) {
                        balance = Number(r.balance);
                    } else {
                        balance = (Number(r.totalIncome) || 0) - (Number(r.totalExpenses) || 0) - (Number(r.totalDeductions) || 0);
                    }
                    accumulatedBalance += balance;

                    // Investment = Gold Flow
                    accumulatedInvestment += Number(r.investment || 0);
                }

                this.totalMoneySavings = baseMoney + accumulatedBalance;
                this.totalGoldSavings = baseGold + accumulatedInvestment;

                this.netWorth = this.totalMoneySavings + this.totalGoldSavings;
                this.filteredNetWorth = this.netWorth;

                // 2. Monthly Savings (Average Surplus)
                const count = this.fullHistory.length;

                const totalMonthlyWealthFlow = this.fullHistory.reduce((sum, record) => {
                    const balance = record.balance !== undefined ? record.balance : (record.totalIncome - record.totalExpenses - (record.totalDeductions || 0));
                    return sum + Number(balance);
                }, 0);

                this.monthlySavings = count > 0 ? (totalMonthlyWealthFlow / count) : 0;

                // Update Zakat DueEstimate
                const latestRecord = this.fullHistory[this.fullHistory.length - 1];

                // 1. Zakat Income (Monthly Estimate * 12)
                // User Feedback: "Wrong" to show if savings < Nisab. 
                // We will disable Income Zakat display essentially, or set to 0 to strictly follow "Wealth + Haul" view.
                this.zakatDue = 0; // (latestRecord.zakatMonthly * 12);

                // 2. Zakat Savings (Wealth)
                // Logic Update: Strict Haul (1 Year) Check + Nisab
                const isNisabMet = this.netWorth >= this.NISAB_SAVINGS;

                // Haul Check: Do we have history > 12 months? 
                // Or checking if the user had > Nisab 1 year ago?
                // For MVP: If total tracking duration < 12 months, we assume Haul NOT MET yet.
                const historyDurationMonths = this.fullHistory.length;
                const isHaulMet = historyDurationMonths >= 12;

                // Refined Logic based on User Request
                if (!isNisabMet) {
                    this.zakatEligibility = 'BELOW_NISAB';
                    this.zakatSavingsDue = 0;
                    this.formattedZakatMessage = 'Not Eligible (Below 25k)';
                } else if (!isHaulMet) {
                    this.zakatEligibility = 'HAUL_NOT_MET';
                    this.zakatSavingsDue = 0; // Not due yet
                    this.formattedZakatMessage = 'Not Eligible (< 1 Year)';
                } else {
                    this.zakatEligibility = 'ELIGIBLE';
                    this.zakatSavingsDue = this.netWorth * 0.025;
                    this.formattedZakatMessage = 'Eligible';
                }

                // AUTOMATION: Auto-set Date Range
                // Only set if not already set (prevents reset on theme toggle/reload)
                if (!this.startMonth || !this.endMonth) {
                    const oldest = this.fullHistory[0];
                    if (oldest) {
                        this.startMonth = `${oldest.year}-${oldest.month.toString().padStart(2, '0')}`;

                        const now = new Date();
                        const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
                        const latestRecord = this.fullHistory[this.fullHistory.length - 1];
                        const latestRecordDate = `${latestRecord.year}-${latestRecord.month.toString().padStart(2, '0')}`;

                        this.endMonth = latestRecordDate > currentMonth ? latestRecordDate : currentMonth;
                    }
                }

                // Initial Calc based on Latest Record
                if (this.fullHistory.length > 0) {
                    const latest = this.fullHistory[this.fullHistory.length - 1];
                    this.calculateNetWorthUntil(latest.year, latest.month);
                }
            } else {
                this.netWorth = 0;
                this.monthlySavings = 0;
                this.totalMoneySavings = 0;
                this.totalGoldSavings = 0;
            }

            // Apply default filter
            this.onDateFilterChange();

            // 3. Calculate Trends
            this.calculateTrends();
        });

        // Note: We are bypassing 'getFinanceSummary' metrics for netWorth/monthlySavings 
        // as we are calculating them manually from history to satisfy specific logic.
    }

    // Helper to calculate Net Worth up to a specific date (Anchor + Flow)
    private calculateNetWorthUntil(targetYear: number, targetMonth: number) {
        if (!this.fullHistory || this.fullHistory.length === 0) return;

        // 1. Filter history up to target date
        const relevantHistory = this.fullHistory.filter(r =>
            (r.year < targetYear) || (r.year === targetYear && r.month <= targetMonth)
        );

        if (relevantHistory.length === 0) {
            this.netWorth = 0;
            this.totalMoneySavings = 0;
            this.totalGoldSavings = 0;
            this.filteredNetWorth = 0;
            return;
        }

        // 2. Find Anchor in relevant history
        let anchorIndex = -1;
        for (let i = relevantHistory.length - 1; i >= 0; i--) {
            if ((relevantHistory[i].savings || 0) > 0 || (relevantHistory[i].goldSavings || 0) > 0) {
                anchorIndex = i;
                break;
            }
        }

        const startIndex = anchorIndex === -1 ? 0 : anchorIndex;
        const anchorRecord = relevantHistory[startIndex];

        // 3. Base Assets
        const baseMoney = Number(anchorRecord.savings) || 0;
        const baseGold = Number(anchorRecord.goldSavings) || 0;

        // 4. Sum Flows from Anchor to End of Relevant History
        let accumulatedBalance = 0;
        let accumulatedInvestment = 0;

        for (let i = startIndex; i < relevantHistory.length; i++) {
            const r = relevantHistory[i];

            // Balance logic
            let balance = 0;
            if (r.balance !== undefined && r.balance !== null) {
                balance = Number(r.balance);
            } else {
                balance = (Number(r.totalIncome) || 0) - (Number(r.totalExpenses) || 0) - (Number(r.totalDeductions) || 0);
            }
            accumulatedBalance += balance;

            // Investment logic
            accumulatedInvestment += Number(r.investment || 0);
        }

        this.totalMoneySavings = baseMoney + accumulatedBalance;
        this.totalGoldSavings = baseGold + accumulatedInvestment;
        this.netWorth = this.totalMoneySavings + this.totalGoldSavings;
        this.filteredNetWorth = this.netWorth;
    }

    // Trend Properties
    netWorthTrend: number = 0;
    savingsTrend: string = 'Analyzing...';
    isSavingsTrendGood: boolean = true;

    calculateTrends() {
        if (!this.fullHistory || this.fullHistory.length === 0) return;

        // --- Net Worth Trend (vs Last Year) ---
        // Net worth is cumulative. We need to approximate Net Worth 1 year ago.
        // Formula: Current Net Worth - (Sum of savings/balance added in the last 12 months)
        // Or simply: Compare with a snapshot if we had one. Since we calculate Net Worth on the fly:
        // Let's assume 'Net Worth' trend is actually 'Growth Rate' of Net Worth over last year.

        // Better Approach given data: Compare current Year's Total Savings vs Last Year's Total Savings? 
        // User asked for "Net Worth" trend. 
        // Let's calculate: (Current Net Worth - Net Worth 12 months ago) / Net Worth 12 months ago.
        // Net Worth 12 months ago = Current Net Worth - (Sum of 'savings' + 'balance' in last 12 months).

        const currentNetWorth = this.netWorth;
        let savingsLast12Months = 0;

        // Sort history by date desc first just to be sure
        const sortedHistory = [...this.fullHistory].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });

        // Sum savings for the last 12 entries (approx 1 year)
        // Note: this assumes we have monthly data. 
        const last12MonthsData = sortedHistory.slice(0, 12);
        last12MonthsData.forEach(h => {
            const bal = h.balance || 0;
            const sav = h.savings || 0;
            savingsLast12Months += (bal + sav);
        });

        const netWorthOneYearAgo = currentNetWorth - savingsLast12Months;

        if (netWorthOneYearAgo > 0) {
            this.netWorthTrend = ((currentNetWorth - netWorthOneYearAgo) / netWorthOneYearAgo) * 100;
        } else {
            this.netWorthTrend = 100; // 100% growth if starting from 0 or negative
        }


        // --- Monthly Savings Trend ---
        // Compare Latest Month Savings vs Avg of Last 6 Months
        if (sortedHistory.length > 0) {
            const latest = sortedHistory[0];
            const latestSavings = (latest.balance || 0) + (latest.savings || 0);

            // Avg of last 6 months (excluding current if we want 'trend vs history')
            // Let's include current in trend or compare current vs previous 6? 
            // Usually "On Track" means compared to target or Average.
            const last6Months = sortedHistory.slice(0, 6);
            if (last6Months.length > 0) {
                const sumSavings = last6Months.reduce((sum, h) => sum + (h.balance || 0) + (h.savings || 0), 0);
                const avgSavings = sumSavings / last6Months.length;

                if (latestSavings >= avgSavings) {
                    this.savingsTrend = 'On Track';
                    this.isSavingsTrendGood = true;
                } else {
                    const diff = avgSavings - latestSavings;
                    this.savingsTrend = `RM ${diff.toFixed(0)} below avg`;
                    this.isSavingsTrendGood = false;
                }
            }
        }
    }

    onDateFilterChange() {
        if (!this.startMonth || !this.endMonth) return;

        // FIX: Manual parse to avoid UTC shift issues
        // "YYYY-MM" -> [YYYY, MM]
        const [sYear, sMonth] = this.startMonth.split('-').map(Number);
        const [eYear, eMonth] = this.endMonth.split('-').map(Number);

        const start = new Date(sYear, sMonth - 1, 1);
        const end = new Date(eYear, eMonth - 1, 1);

        // Update Net Worth based on End Date
        this.calculateNetWorthUntil(end.getFullYear(), end.getMonth() + 1);

        // 1. Generate all months in range
        const labels: string[] = [];
        const incomes: number[] = [];
        const expenses: number[] = [];

        // Helper to loop months
        const current = new Date(start);
        // Normalize to first day of month to avoid overflow issues
        current.setDate(1);

        const endCap = new Date(end);
        endCap.setDate(1);

        // 0. Update Filtered History List for UI Display
        // We want strict filtering: start <= item.date <= end
        this.filteredHistoryList = this.fullHistory.filter(h => {
            const hDate = new Date(h.year, h.month - 1, 1);
            return hDate >= current && hDate <= endCap;
        });

        // Map for fast lookup of existing data
        const historyMap = new Map();
        this.fullHistory.forEach(h => {
            const key = `${h.year}-${h.month.toString().padStart(2, '0')}`;
            // If duplicate, we take the latest due to reverse() order previously or we can sum? 
            // Previous logic took "last entry". Let's assume unique or take first found if multiple?
            // Actually, best to handle duplicates if any. 
            // For now, simple map.
            if (!historyMap.has(key)) {
                historyMap.set(key, h);
            }
        });

        let filteredDataUsageForAvg: any[] = [];

        while (current <= endCap) {
            const year = current.getFullYear();
            const month = current.getMonth() + 1; // 1-12
            const key = `${year}-${month.toString().padStart(2, '0')}`;

            // Label
            const monthName = current.toLocaleString('default', { month: 'short' });
            labels.push(`${monthName} ${year}`);

            // Data
            if (historyMap.has(key)) {
                const item = historyMap.get(key);
                incomes.push(item.totalIncome || 0);
                expenses.push(item.totalExpenses || 0);
                filteredDataUsageForAvg.push(item);
            } else {
                incomes.push(0);
                expenses.push(0);
            }

            // Next month
            current.setMonth(current.getMonth() + 1);
        }

        // Update Chart Data
        this.chartLabels = labels;
        this.monthlyIncome = incomes;
        this.monthlyExpenses = expenses;

        // Update Average Monthly Savings based on Range Data (only existing data)
        if (filteredDataUsageForAvg.length > 0) {
            const totalRangeSavings = filteredDataUsageForAvg.reduce((sum, item) => {
                return sum + this.getCleanMonthlySavings(item);
            }, 0);
            this.monthlySavings = totalRangeSavings / filteredDataUsageForAvg.length;
        } else {
            this.monthlySavings = 0;
        }

        // Wait for *ngIf to render the canvas
        setTimeout(() => {
            this.initIncomeChart();
        }, 0);
    }

    getMonthName(monthNum: number): string {
        const date = new Date();
        date.setMonth(monthNum - 1);
        return date.toLocaleString('default', { month: 'short' });
    }

    login() {
        this.router.navigate(['/login']); // Assuming login route exists
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/']); // Reload/Reset
        // Clear data
        this.netWorth = 0;
        this.monthlySavings = 0;
        this.zakatDue = 0;
        this.zakatSavingsDue = 0;
        this.zakatEligibility = 'BELOW_NISAB';
        this.ifIncomeChartExistDestroy();
    }

    deleteHistory(id: number) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.dashboardService.deleteRecord(id).subscribe({
                next: () => {
                    // Update UI locally by filtering out the deleted item
                    this.fullHistory = this.fullHistory.filter(item => item.id !== id);
                    if (this.fullHistory.length === 0) {
                        this.netWorth = 0;
                        this.monthlySavings = 0;
                        this.zakatSavingsDue = 0;
                    } else {
                        // Re-run calculations based on new history state
                        // Actually, easiest is to just re-load data to ensure consistency
                        this.loadDashboardData();
                    }
                },
                error: (err) => console.error('Failed to delete record', err)
            });
        }
    }

    ifIncomeChartExistDestroy() {
        if (this.incomeChart) {
            this.incomeChart.destroy();
            this.incomeChart = null;
        }
    }

    markZakatPaid() {
        this.isZakatPaid = true;
    }

    initIncomeChart() {
        if (this.incomeChart) this.incomeChart.destroy();
        if (!this.incomeChartRef) return;

        const ctx = this.incomeChartRef.nativeElement.getContext('2d');
        const isDark = this.currentTheme === 'dark';

        const incomeColor = isDark ? '#3fa37c' : '#2f855a'; // Green
        const expenseColor = isDark ? '#9b2c2c' : '#c53030'; // Red

        this.incomeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.chartLabels,
                datasets: [
                    {
                        label: 'Income',
                        data: this.monthlyIncome,
                        backgroundColor: incomeColor,
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Expenses',
                        data: this.monthlyExpenses,
                        backgroundColor: expenseColor,
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: isDark ? '#e6f4ee' : '#1f2933' }
                    }
                },
                scales: {
                    y: {
                        grid: { color: isDark ? '#4a5d53' : '#f3f4f6' },
                        ticks: { color: isDark ? '#b6d6c7' : '#6b7280' }
                    },
                    x: {
                        grid: { color: isDark ? '#4a5d53' : '#f3f4f6' },
                        ticks: { color: isDark ? '#b6d6c7' : '#6b7280' }
                    }
                }
            }
        });
    }

    private getCleanMonthlySavings(record: any): number {
        // Use balance if available (Income - Deductions - Expenses)
        if (record.balance !== undefined && record.balance !== null) {
            return record.balance;
        }
        // Fallback: Income - Deductions - Expenses
        const income = record.totalIncome || 0;
        const deductions = record.totalDeductions || 0;
        const expenses = record.totalExpenses || 0;
        return income - deductions - expenses;
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}
