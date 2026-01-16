import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from '../services/employee.service';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../theme';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <!-- Nav moved to App Component -->
      
      <div class="header">
        <h1>Employees</h1>
        <button routerLink="/employees/new" class="btn-primary">Add Employee</button>
      </div>

      <div *ngIf="errorMessage" style="padding: 15px; background: #fee; color: #c00; border: 1px solid #d00; margin-bottom: 20px; border-radius: 5px;">
        <strong>Error:</strong> {{ errorMessage }}
      </div>

      <div *ngIf="loading" style="padding: 20px; text-align: center; color: #666;">
        Loading employees...
      </div>

      <div *ngIf="!loading && !errorMessage && employees.length === 0" style="padding: 20px; text-align: center; color: #666;">
        No employees found.
      </div>

      <table class="employee-table" *ngIf="!loading && employees.length > 0">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>IC / Passport</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let emp of employees">
            <td>{{ emp.employeeCode }}</td>
            <td><a [routerLink]="['/employees', emp.id]" class="employee-link">{{ emp.fullName }}</a></td>
            <td>{{ emp.identityNo }}</td>
            <td><span class="badge" [class]="emp.status.toLowerCase()">{{ emp.status }}</span></td>
            <td>
              <button [routerLink]="['/employees', emp.id]" class="btn-sm btn-view">View</button>
              <button [routerLink]="['/employees', emp.id, 'edit']" class="btn-sm btn-edit">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .container { padding: 0; background-color: var(--bg-main); min-height: 100vh; font-family: var(--font-primary); color: var(--neutral-900); }
    .nav-bar { background: var(--bg-card); padding: var(--space-lg) var(--space-xl); display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm); border-bottom: 1px solid var(--neutral-100); margin-bottom: var(--space-lg); }
    .nav-right { display: flex; align-items: center; gap: var(--space-lg); }
    .theme-toggle { background: var(--bg-muted); border: 1px solid var(--neutral-300); border-radius: var(--radius-md); padding: var(--space-xs) var(--space-sm); cursor: pointer; transition: var(--transition-base); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
    .theme-toggle:hover { background: var(--neutral-100); transform: scale(1.05); }
    .theme-icon { font-size: var(--text-lg); }
    .brand { font-weight: 700; font-size: var(--text-lg); color: var(--neutral-900); }
    .links a { margin-left: var(--space-lg); text-decoration: none; color: var(--neutral-500); font-weight: 500; transition: var(--transition-fast); }
    .links a:hover { color: var(--primary-500); }
    .links a.active { color: var(--primary-700); font-weight: 600; }
    .header { display: flex; justify-content: space-between; align-items: center; margin: 0 var(--space-xl) var(--space-lg); }
    h1 { font-size: var(--text-xl); font-weight: 600; color: var(--neutral-900); margin: 0; }
    .employee-table { width: 100%; border-collapse: collapse; background: var(--bg-card); box-shadow: var(--shadow-md); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--neutral-100); }
    th, td { padding: var(--space-md) var(--space-lg); text-align: left; border-bottom: 1px solid var(--neutral-100); }
    th { background-color: var(--bg-muted); font-weight: 600; color: var(--neutral-900); text-transform: uppercase; font-size: var(--text-sm); letter-spacing: 0.05em; }
    .btn-primary { background: var(--primary-500); color: white; border: none; padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); cursor: pointer; font-weight: 600; transition: var(--transition-base); box-shadow: var(--shadow-sm); }
    .btn-primary:hover { background: var(--primary-700); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    .btn-sm { padding: var(--space-xs) var(--space-sm); background: var(--bg-muted); border: 1px solid var(--neutral-300); border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-sm); font-weight: 500; transition: var(--transition-fast); color: var(--neutral-700); }
    .btn-sm:hover { background: var(--neutral-100); }
    .btn-view { color: var(--primary-500); }
    .btn-edit { color: var(--warning); margin-left: var(--space-xs); }
    .employee-link { color: var(--primary-500); text-decoration: none; font-weight: 500; transition: var(--transition-fast); }
    .employee-link:hover { color: var(--primary-700); text-decoration: underline; }
    .badge { padding: var(--space-2xs) var(--space-sm); border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge.permanent { background: var(--primary-50); color: var(--success); }
    .badge.probation { background: var(--warning); color: var(--neutral-900); opacity: 0.8; }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  errorMessage: string = '';
  loading: boolean = true;
  currentTheme = 'light';

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {
    this.themeService.theme$.subscribe((theme: string) => {
      this.currentTheme = theme;
    });
  }

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('Employees loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load employees:', err);
        this.errorMessage = 'Failed to load data: ' + (err.message || 'Unknown Error');
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
