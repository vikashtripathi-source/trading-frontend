import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterOutlet
  ],
  template: `
    <div class="app-container">
      <mat-toolbar class="app-header" color="primary">
        <div class="header-left">
          <mat-icon class="app-logo">trending_up</mat-icon>
          <span class="app-title">TradingHub</span>
        </div>
        <div class="nav-buttons">
          <button mat-button [routerLink]="['/dashboard']">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          <button mat-button [routerLink]="['/portfolio']">
            <mat-icon>account_balance_wallet</mat-icon>
            Portfolio
          </button>
          <button mat-button [routerLink]="['/orders']">
            <mat-icon>receipt_long</mat-icon>
            Orders
          </button>
          <button mat-button [routerLink]="['/trades']">
            <mat-icon>history</mat-icon>
            Trades
          </button>
          <button mat-button [routerLink]="['/watchlist']">
            <mat-icon>star</mat-icon>
            Watchlist
          </button>
          <button mat-button [routerLink]="['/market']">
            <mat-icon>search</mat-icon>
            Market
          </button>
          <button mat-button [routerLink]="['/analytics']">
            <mat-icon>analytics</mat-icon>
            Analytics
          </button>
          <button mat-button [routerLink]="['/login']" class="auth-btn">
            <mat-icon>login</mat-icon>
            Login
          </button>
          <button mat-button [routerLink]="['/signup']" class="auth-btn">
            <mat-icon>person_add</mat-icon>
            Signup
          </button>
        </div>
      </mat-toolbar>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .app-header {
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .app-logo {
      font-size: 24px;
      color: white;
    }
    
    .app-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
    }
    
    .nav-buttons {
      display: flex;
      gap: 12px;
    }
    
    .main-content {
      flex: 1;
      background: #f5f7fa;
    }
    
    @media (max-width: 768px) {
      .app-header {
        padding: 0 16px;
        flex-wrap: wrap;
      }
      
      .nav-buttons {
        order: 2;
        width: 100%;
        justify-content: center;
        margin-top: 8px;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      .header-left {
        order: 1;
        width: 100%;
        justify-content: center;
        margin-bottom: 8px;
      }
      
      .auth-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    }
  `]
})
export class SimpleAppComponent {
  constructor(private router: Router) {}
}
