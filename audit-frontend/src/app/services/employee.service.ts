import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Employee {
    id?: number;
    employeeCode: string;
    fullName: string;
    identityNo: string;
    joinDate: string;
    resignDate?: string;
    epfNo?: string;
    socsoNo?: string;
    taxNo?: string;
    status: string;
    department?: { id: number, name: string };
    grade?: { id: number, name: string, minSalary: number, maxSalary: number };
    vehicles?: any[];
    salaryStructures?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {
    private apiUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) { }

    getEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(this.apiUrl);
    }

    getEmployee(id: number): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/${id}`);
    }

    createEmployee(employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(this.apiUrl, employee);
    }

    updateEmployee(id: number, employee: Employee): Observable<Employee> {
        return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
    }
}
