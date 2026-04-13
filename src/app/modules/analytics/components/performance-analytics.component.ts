import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ApiService, PerformanceMetrics } from '../../../services/api.service';

@Component({
  selector: 'app-performance-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="performance-analytics-container">
      <mat-card class="analytics-card">
        <mat-card-header>
          <h2>Performance Analytics</h2>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="period-field">
              <mat-label>Period</mat-label>
              <mat-select (selectionChange)="onPeriodChange($event.value)" [value]="selectedPeriod">
                <mat-option value="1D">1 Day</mat-option>
                <mat-option value="1W">1 Week</mat-option>
                <mat-option value="1M">1 Month</mat-option>
                <mat-option value="3M">3 Months</mat-option>
                <mat-option value="6M">6 Months</mat-option>
                <mat-option value="1Y">1 Year</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <div class="analytics-content" *ngIf="metrics; else loading">
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">trending_up</mat-icon>
                  <span class="metric-title">Total Return</span>
                </div>
                <div class="metric-value" [ngClass]="getReturnClass(metrics.totalReturn)">
                  {{ formatPercentage(metrics.totalReturn) }}
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">speed</mat-icon>
                  <span class="metric-title">Annualized Return</span>
                </div>
                <div class="metric-value" [ngClass]="getReturnClass(metrics.annualizedReturn)">
                  {{ formatPercentage(metrics.annualizedReturn) }}
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">balance</mat-icon>
                  <span class="metric-title">Sharpe Ratio</span>
                </div>
                <div class="metric-value">{{ formatNumber(metrics.sharpeRatio, 2) }}</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">warning</mat-icon>
                  <span class="metric-title">Max Drawdown</span>
                </div>
                <div class="metric-value negative">
                  {{ formatPercentage(metrics.maxDrawdown) }}
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">waves</mat-icon>
                  <span class="metric-title">Volatility</span>
                </div>
                <div class="metric-value">{{ formatPercentage(metrics.volatility) }}</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">compare_arrows</mat-icon>
                  <span class="metric-title">Beta</span>
                </div>
                <div class="metric-value">{{ formatNumber(metrics.beta, 2) }}</div>
              </div>
              
              <div class="metric-item">
                <div class="metric-header">
                  <mat-icon class="metric-icon">stars</mat-icon>
                  <span class="metric-title">Alpha</span>
                </div>
                <div class="metric-value" [ngClass]="getReturnClass(metrics.alpha)">
                  {{ formatPercentage(metrics.alpha) }}
                </div>
              </div>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-container">
              <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
              <p>Loading performance analytics...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .performance-analytics-container {
      padding: 20px;
    }

    .analytics-card {
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .period-field {
      width: 150px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric-item {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
    }

    .metric-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .metric-icon {
      color: #667eea;
      margin-right: 10px;
      font-size: 20px;
    }

    .metric-title {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .metric-value.positive {
      color: #4caf50;
    }

    .metric-value.negative {
      color: #f44336;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .performance-analytics-container {
        padding: 10px;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class PerformanceAnalyticsComponent implements OnInit {
  metrics: PerformanceMetrics | null = null;
  selectedPeriod = '1M';
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading = true;
    const userId = 'current-user';
    
    this.apiService.getPerformanceMetrics(userId, this.selectedPeriod).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.metrics = response.data;
        } else {
          this.snackBar.open(response.message || 'Failed to load metrics', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading metrics:', error);
        this.snackBar.open('Failed to load metrics', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadMetrics();
  }

  refreshData(): void {
    this.loadMetrics();
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  getReturnClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }
}
