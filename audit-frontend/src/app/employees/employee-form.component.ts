import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService, Employee } from '../services/employee.service';
import { ThemeService } from '../theme';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Nav moved to App Component -->

      <div class="form-container">
        <h1>{{ isEditMode ? 'Edit Employee' : 'New Employee' }}</h1>
      <form (ngSubmit)="onSubmit()" #empForm="ngForm">
        <div class="form-group">
          <label>Employee Code</label>
          <input [(ngModel)]="employee.employeeCode" name="code" required [disabled]="isEditMode">
        </div>
        <div class="form-group">
          <label>Full Name</label>
          <input [(ngModel)]="employee.fullName" name="name" required>
        </div>
        <div class="form-group">
          <label>IC / Passport</label>
          <input [(ngModel)]="employee.identityNo" name="ic" required>
        </div>
        <div class="form-group">
          <label>Join Date</label>
          <input type="date" [(ngModel)]="employee.joinDate" name="joinDate" required>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select [(ngModel)]="employee.status" name="status">
            <option value="PROBATION">Probation</option>
            <option value="PERMANENT">Permanent</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
        
        <div class="actions">
          <button type="button" (click)="cancel()" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="!empForm.valid">{{ isEditMode ? 'Update' : 'Save' }} Employee</button>
        </div>
      </form>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 0; background-color: var(--bg-main); min-height: 100vh; font-family: var(--font-primary); color: var(--neutral-900); }
    .nav-bar { background: var(--bg-card); padding: var(--space-lg) var(--space-xl); display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm); border-bottom: 1px solid var(--neutral-100); margin-bottom: var(--space-xl); }
    .nav-right { display: flex; align-items: center; gap: var(--space-lg); }
    .theme-toggle { background: var(--bg-muted); border: 1px solid var(--neutral-300); border-radius: var(--radius-md); padding: var(--space-xs) var(--space-sm); cursor: pointer; transition: var(--transition-base); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; }
    .theme-toggle:hover { background: var(--neutral-100); transform: scale(1.05); }
    .theme-icon { font-size: var(--text-lg); }
    .brand { font-weight: 700; font-size: var(--text-lg); color: var(--neutral-900); }
    .links a { margin-left: var(--space-lg); text-decoration: none; color: var(--neutral-500); font-weight: 500; transition: var(--transition-fast); }
    .links a:hover { color: var(--primary-500); }
    .links a.active { color: var(--primary-700); font-weight: 600; }
    .form-container { max-width: 600px; margin: 0 auto; padding: var(--space-2xl); background: var(--bg-card); box-shadow: var(--shadow-lg); border-radius: var(--radius-lg); border: 1px solid var(--neutral-100); }
    h1 { font-size: var(--text-xl); font-weight: 700; color: var(--neutral-900); margin-bottom: var(--space-xl); text-align: center; }
    .form-group { margin-bottom: var(--space-lg); }
    label { display: block; margin-bottom: var(--space-xs); font-weight: 600; color: var(--neutral-700); font-size: var(--text-sm); }
    input, select { width: 100%; padding: var(--space-md); border: 1px solid var(--neutral-300); border-radius: var(--radius-md); font-size: var(--text-md); font-family: var(--font-primary); transition: var(--transition-fast); background: var(--bg-muted); }
    input:focus, select:focus { outline: none; border-color: var(--primary-500); box-shadow: var(--focus-ring); background: var(--bg-card); }
    input:disabled { background: var(--neutral-100); cursor: not-allowed; color: var(--neutral-500); }
    .actions { display: flex; gap: var(--space-md); margin-top: var(--space-xl); justify-content: flex-end; }
    .btn-primary { background: var(--primary-500); color: white; border: none; padding: var(--space-md) var(--space-lg); border-radius: var(--radius-md); cursor: pointer; flex: 1; font-size: var(--text-md); font-weight: 600; transition: var(--transition-base); box-shadow: var(--shadow-sm); }
    .btn-primary:hover:not(:disabled) { background: var(--primary-700); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    .btn-primary:disabled { background: var(--neutral-300); cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-secondary { background: var(--bg-muted); color: var(--neutral-700); border: 1px solid var(--neutral-300); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-md); cursor: pointer; flex: 1; font-size: var(--text-md); font-weight: 500; transition: var(--transition-base); }
    .btn-secondary:hover { background: var(--neutral-100); }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employee: Employee = {
    employeeCode: '',
    fullName: '',
    identityNo: '',
    joinDate: '',
    status: 'PROBATION'
  };

  isEditMode = false;
  employeeId: number | null = null;
  currentTheme = 'light';

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) {
    this.themeService.theme$.subscribe((theme: string) => {
      this.currentTheme = theme;
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employeeId = Number(id);
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployee(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load employee:', err);
        this.router.navigate(['/employees']);
      }
    });
  }

  onSubmit() {
    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, this.employee).subscribe({
        next: () => {
          this.router.navigate(['/employees', this.employeeId]);
        },
        error: (err: any) => {
          console.error('Update failed:', err);
        }
      });
    } else {
      this.employeeService.createEmployee(this.employee).subscribe({
        next: () => {
          this.router.navigate(['/employees']);
        },
        error: (err: any) => {
          console.error('Create failed:', err);
        }
      });
    }
  }

  cancel() {
    if (this.isEditMode && this.employeeId) {
      this.router.navigate(['/employees', this.employeeId]);
    } else {
      this.router.navigate(['/employees']);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
