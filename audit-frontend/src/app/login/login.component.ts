import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    constructor(private auth: AuthService, private router: Router) { }

    login() {
        const email = prompt('Enter your email to login (Simulation):', 'user@example.com');
        if (email) {
            this.auth.login(email);
            this.router.navigate(['/dashboard']);
        }
    }

    guest() {
        this.router.navigate(['/dashboard']);
    }
}
