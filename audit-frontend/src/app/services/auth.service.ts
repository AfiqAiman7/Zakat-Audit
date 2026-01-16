import { Injectable, signal, WritableSignal } from '@angular/core';

export interface User {
    name: string;
    email: string;
    avatar?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Using Signals for reactive state
    currentUser: WritableSignal<User | null> = signal(null);

    constructor() {
        this.loadUser();
    }

    private loadUser() {
        const stored = localStorage.getItem('audit_user');
        if (stored) {
            try {
                this.currentUser.set(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse user', e);
                localStorage.removeItem('audit_user');
            }
        }
    }

    login(email: string) {
        // Mock Login
        const mockUser: User = {
            name: email.split('@')[0], // Use part before @ as name
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${email.substring(0, 2)}&background=10b981&color=fff`
        };

        this.currentUser.set(mockUser);
        localStorage.setItem('audit_user', JSON.stringify(mockUser));
    }

    logout() {
        this.currentUser.set(null);
        localStorage.removeItem('audit_user');
    }

    isGuest(): boolean {
        return this.currentUser() === null;
    }
}
