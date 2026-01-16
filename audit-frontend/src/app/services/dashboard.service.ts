import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MonthlyTrendDTO {
    month: string;
    totalPayout: number;
}

export interface DepartmentCostDTO {
    departmentName: string;
    totalCost: number;
}

export interface AuditLog {
    action: string;
    tableName: string;
    changedBy: string;
    changedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;
    private payrollUrl = `${environment.apiUrl}/payroll`;

    constructor(private http: HttpClient) { }

    getYearlyTrend(year: number): Observable<MonthlyTrendDTO[]> {
        return this.http.get<MonthlyTrendDTO[]>(`${this.apiUrl}/trend?year=${year}`);
    }

    getDepartmentCosts(year: number): Observable<DepartmentCostDTO[]> {
        return this.http.get<DepartmentCostDTO[]>(`${this.apiUrl}/cost-by-dept?year=${year}`);
    }

    getRecentLogs(): Observable<AuditLog[]> {
        return this.http.get<AuditLog[]>(`${this.apiUrl}/recent-logs`);
    }

    runPayroll(month: number, year: number): Observable<any> {
        return this.http.post(`${this.payrollUrl}/generate?month=${month}&year=${year}`, {});
    }

    // --- Personal Finance Endpoints ---

    saveCalculation(data: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/finance/save`, data);
    }

    getHistory(email: string): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/finance/history?email=${email}`);
    }

    getFinanceSummary(email: string): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/finance/summary?email=${email}`);
    }

    getLatestCalculation(email: string): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/finance/latest?email=${email}`);
    }

    deleteRecord(id: number): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/finance/delete/${id}`);
    }
}
