import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService, Portfolio } from '../../../services/api.service';
import { PortfolioHoldingsComponent } from './portfolio-holdings.component';
import { PortfolioPerformanceComponent } from './portfolio-performance.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    PortfolioHoldingsComponent,
    PortfolioPerformanceComponent
  ],
  styleUrls: ['./portfolio.component.css'],
  template: `
    <div class="portfolio-container">
      <div class="portfolio-header">
        <button mat-icon-button (click)="goBack()" class="header-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="header-title">Portfolio Management</h1>
        <button mat-icon-button (click)="refreshData()" class="header-btn">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <div class="portfolio-content" *ngIf="portfolio; else loading">
        <mat-card class="portfolio-summary">
          <mat-card-header>
            <h2>Portfolio Overview</h2>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="label">Total Value</div>
                <div class="value">{{ formatCurrency(portfolio.totalValue) }}</div>
              </div>
              <div class="summary-item">
                <div class="label">Available Balance</div>
                <div class="value">{{ formatCurrency(portfolio.availableBalance) }}</div>
              </div>
              <div class="summary-item">
                <div class="label">Total Invested</div>
                <div class="value">{{ formatCurrency(portfolio.totalValue) }}</div>
              </div>
              <div class="summary-item">
                <div class="label">Total P&L</div>
                <div class="value" [ngClass]="getProfitLossClass(portfolio.totalPnL)">
                  {{ formatCurrency(portfolio.totalPnL) }}
                </div>
              </div>
              <div class="summary-item">
                <div class="label">Daily P&L</div>
                <div class="value" [ngClass]="getProfitLossClass(portfolio.dailyPnL)">
                  {{ formatCurrency(portfolio.dailyPnL) }}
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-tab-group class="portfolio-tabs">
          <mat-tab label="Holdings">
            <ng-template matTabContent>
              <app-portfolio-holdings></app-portfolio-holdings>
            </ng-template>
          </mat-tab>
          <mat-tab label="Performance">
            <ng-template matTabContent>
              <app-portfolio-performance></app-portfolio-performance>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>Loading portfolio data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .portfolio-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .portfolio-header {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-title {
      font-size: 20px;
      font-weight: 600;
      flex: 1;
      text-align: center;
    }

    .portfolio-summary {
      margin-bottom: 20px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .summary-item {
      text-align: center;
      padding: 15px;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .summary-item .label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .summary-item .value {
      font-size: 18px;
      font-weight: 600;
    }

    .profit {
      color: #4caf50;
    }

    .loss {
      color: #f44336;
    }

    .portfolio-tabs {
      margin-top: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .portfolio-container {
        padding: 10px;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PortfolioComponent implements OnInit {
  portfolio: Portfolio | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    const userId = 'current-user'; // This should come from auth service
    this.apiService.getUserPortfolio(userId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.portfolio = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading portfolio:', error);
      }
    });
  }

  refreshData(): void {
    this.loadPortfolio();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getProfitLossClass(value: number): string {
    return value >= 0 ? 'profit' : 'loss';
  }
}
