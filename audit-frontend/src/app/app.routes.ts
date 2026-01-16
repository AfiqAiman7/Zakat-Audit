import { Routes } from '@angular/router';
// Routes Config
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeListComponent } from './employees/employee-list.component';
import { EmployeeFormComponent } from './employees/employee-form.component';
import { EmployeeDetailComponent } from './employees/employee-detail/employee-detail.component';

export const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'employees', component: EmployeeListComponent },

    { path: 'employees/new', component: EmployeeFormComponent },
    { path: 'employees/:id/edit', component: EmployeeFormComponent },
    { path: 'employees/:id', component: EmployeeDetailComponent },
    {
        path: 'calculator',
        loadComponent: () => import('./calculator/calculator').then(m => m.CalculatorComponent)
    }
];
