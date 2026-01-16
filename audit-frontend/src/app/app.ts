import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('audit-frontend');
  public themeService = inject(ThemeService);
  public router = inject(Router);

  currentTheme = signal('light');

  constructor() {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme.set(theme);
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
