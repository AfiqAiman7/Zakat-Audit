export interface IncomeDetails {
    basicSalary: number;
    fixedAllowance: number;
    variableAllowance: number;
    overtime: number;
    bonus: number;
    otherIncome: number;
    gift: number;
}

export interface DeductionDetails {
    epf: number;
    socso: number;
    eis: number;
    pcb: number;
    zakat: number;
    otherDeductions: number;
}

export interface ExpenseDetails {
    housing: number;
    transport: number;
    food: number;
    investment: number;
    donation: number;
    utilities: number;
    telecommunications: number;
    childcare: number;
    insurance: number;
    miscellaneous: number;
}

export interface AssetDetails {
    savings: number;
    goldSavings: number;
}

export interface CalculationResult {
    grossIncome: number;
    totalDeductions: number;
    epf: number;
    pcb: number;
    netSalary: number;
    totalExpenses: number;
    balance: number;
    zakatDetails: ZakatDetails;
    emergencyFund: EmergencyFundDetails;
}

export interface EmergencyFundDetails {
    essentialExpenses: number;
    target3Months: number;
    target6Months: number;
    target12Months: number;
    currentStatus: 'Safe' | 'Warning' | 'Critical';
    monthsCovered: number;
}


export interface ZakatDetails {
    eligibleAmount: number;
    amountDue: number;
    status: 'ELIGIBLE' | 'NOT_ELIGIBLE';
}

export interface FinancialHealth {
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    score: number;
    comments: string[];
}

export interface CalculationPayload {
    userEmail: string;
    month: number;
    year: number;
    basicSalary: number;
    fixedAllowance: number;
    variableAllowance: number;
    bonus: number;
    totalIncome: number;
    epf: number;
    pcb: number;
    zakatMonthly: number;
    totalDeductions: number;
    housing: number;
    transport: number;
    food: number;
    investment: number;
    donation: number;
    savings: number; // Asset
    goldSavings: number; // Asset
    totalExpenses: number;
    netSalary: number;
    balance: number;
}
