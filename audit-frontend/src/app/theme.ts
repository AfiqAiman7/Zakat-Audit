import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<string>('light');
  public theme$ = this.currentTheme.asObservable();

  constructor() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

  setTheme(theme: string) {
    this.currentTheme.next(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): string {
    return this.currentTheme.value;
  }
}
