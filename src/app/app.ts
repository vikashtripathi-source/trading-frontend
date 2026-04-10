import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, MatIconModule, MatSnackBarModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('trading-application-ui');

  constructor() {
    // Initialize Lucide icons
    this.initializeIcons();
  }

  private initializeIcons(): void {
    // This will be handled by the lucide-angular library
    // Icons will be automatically rendered in templates
  }
}
