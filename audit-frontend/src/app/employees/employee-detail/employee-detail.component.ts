import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
    selector: 'app-employee-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './employee-detail.component.html',
    styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
    employee: Employee | null = null;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.employeeService.getEmployee(Number(id)).subscribe({
                next: (data) => {
                    this.employee = data;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    getGradeColor(grade: string | undefined): string {
        if (!grade) return 'bg-gray-500';
        if (grade.includes('G4') || grade.includes('G5')) return 'bg-purple-600';
        if (grade.includes('G3')) return 'bg-blue-600';
        return 'bg-teal-600';
    }
}
