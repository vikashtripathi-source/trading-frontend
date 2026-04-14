import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('trading-application-ui');

  showNavbar = true;

  constructor(
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize Lucide icons
    this.initializeIcons();
    this.setupNavbarVisibility();
  }

  private initializeIcons(): void {
    // This will be handled by the lucide-angular library
    // Icons will be automatically rendered in templates
  }

  private setupNavbarVisibility(): void {
    this.router.events.subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const currentUrl = this.router.url;
        // Hide navbar on login and signup pages
        this.showNavbar = !currentUrl.includes('/login') && !currentUrl.includes('/signup');
      }
    });
  }
}
