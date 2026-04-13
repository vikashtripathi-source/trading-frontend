import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';

import { ApiService, PerformanceMetrics } from '../../../services/api.service';

@Component({
  selector: 'app-portfolio-performance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule
  ],
  template: `
    <div class="performance-container">
      <div class="performance-header">
        <mat-form-field appearance="outline" class="period-selector">
          <mat-label>Time Period</mat-label>
          <mat-select (selectionChange)="onPeriodChange($event.value)" [value]="selectedPeriod">
            <mat-option value="1D">1 Day</mat-option>
            <mat-option value="1W">1 Week</mat-option>
            <mat-option value="1M">1 Month</mat-option>
            <mat-option value="3M">3 Months</mat-option>
            <mat-option value="6M">6 Months</mat-option>
            <mat-option value="1Y">1 Year</mat-option>
            <mat-option value="ALL">All Time</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-icon-button (click)="refreshPerformance()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <div class="performance-content" *ngIf="metrics; else loading">
        <!-- Key Metrics -->
        <mat-card class="metrics-card">
          <mat-card-header>
            <h2>Performance Metrics</h2>
          </mat-card-header>
          <mat-card-content>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Total Return</div>
                <div class="metric-value" [ngClass]="getReturnClass(metrics.totalReturn)">
                  {{ formatPercentage(metrics.totalReturn) }}
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Annualized Return</div>
                <div class="metric-value" [ngClass]="getReturnClass(metrics.annualizedReturn)">
                  {{ formatPercentage(metrics.annualizedReturn) }}
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Sharpe Ratio</div>
                <div class="metric-value">{{ formatNumber(metrics.sharpeRatio, 2) }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value negative">
                  {{ formatPercentage(metrics.maxDrawdown) }}
                </div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Volatility</div>
                <div class="metric-value">{{ formatPercentage(metrics.volatility) }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Beta</div>
                <div class="metric-value">{{ formatNumber(metrics.beta, 2) }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Alpha</div>
                <div class="metric-value" [ngClass]="getReturnClass(metrics.alpha)">
                  {{ formatPercentage(metrics.alpha) }}
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Performance Chart -->
        <mat-card class="chart-card">
          <mat-card-header>
            <h2>Performance Chart</h2>
            <div class="chart-actions">
              <button mat-button (click)="exportData()">
                <mat-icon>download</mat-icon>
                Export
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon class="chart-icon">show_chart</mat-icon>
              <p>Performance chart will be displayed here</p>
              <p class="chart-note">Chart integration with Chart.js or similar library</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Risk Analysis -->
        <mat-card class="risk-card">
          <mat-card-header>
            <h2>Risk Analysis</h2>
          </mat-card-header>
          <mat-card-content>
            <div class="risk-metrics">
              <div class="risk-item">
                <div class="risk-label">Risk Level</div>
                <div class="risk-indicator" [ngClass]="getRiskLevel(metrics.volatility)">
                  {{ getRiskLevelText(metrics.volatility) }}
                </div>
              </div>
              <div class="risk-item">
                <div class="risk-label">Maximum Loss</div>
                <div class="risk-value negative">
                  {{ formatPercentage(metrics.maxDrawdown) }}
                </div>
              </div>
              <div class="risk-item">
                <div class="risk-label">Risk-Adjusted Return</div>
                <div class="risk-value">
                  {{ formatNumber(metrics.sharpeRatio, 2) }}
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Benchmark Comparison -->
        <mat-card class="benchmark-card">
          <mat-card-header>
            <h2>Benchmark Comparison</h2>
          </mat-card-header>
          <mat-card-content>
            <div class="benchmark-comparison">
              <div class="benchmark-item">
                <div class="benchmark-label">Your Portfolio</div>
                <div class="benchmark-value" [ngClass]="getReturnClass(metrics.totalReturn)">
                  {{ formatPercentage(metrics.totalReturn) }}
                </div>
              </div>
              <div class="benchmark-item">
                <div class="benchmark-label">S&P 500</div>
                <div class="benchmark-value positive">+12.5%</div>
              </div>
              <div class="benchmark-item">
                <div class="benchmark-label">NASDAQ</div>
                <div class="benchmark-value positive">+15.2%</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>Loading performance data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .performance-container {
      padding: 20px;
    }

    .performance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .period-selector {
      width: 150px;
    }

    .metrics-card, .chart-card, .risk-card, .benchmark-card {
      margin-bottom: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .metric-value.positive {
      color: #4caf50;
    }

    .metric-value.negative {
      color: #f44336;
    }

    .chart-actions {
      display: flex;
      gap: 10px;
    }

    .chart-placeholder {
      text-align: center;
      padding: 60px 20px;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }

    .chart-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .chart-note {
      font-size: 12px;
      margin-top: 10px;
      opacity: 0.7;
    }

    .risk-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .risk-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .risk-label {
      font-weight: 500;
      color: #333;
    }

    .risk-indicator {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .risk-indicator.low {
      background: #e8f5e8;
      color: #4caf50;
    }

    .risk-indicator.medium {
      background: #fff3cd;
      color: #ff9800;
    }

    .risk-indicator.high {
      background: #ffebee;
      color: #f44336;
    }

    .risk-value {
      font-weight: 600;
      font-size: 16px;
    }

    .benchmark-comparison {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .benchmark-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .benchmark-label {
      font-weight: 500;
      color: #333;
    }

    .benchmark-value {
      font-weight: 600;
      font-size: 16px;
    }

    .benchmark-value.positive {
      color: #4caf50;
    }

    .benchmark-value.negative {
      color: #f44336;
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
      .performance-container {
        padding: 10px;
      }

      .performance-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .risk-metrics {
        grid-template-columns: 1fr;
      }

      .benchmark-comparison {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PortfolioPerformanceComponent implements OnInit {
  metrics: PerformanceMetrics | null = null;
  selectedPeriod = '1M';
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPerformanceMetrics();
  }

  loadPerformanceMetrics(): void {
    this.isLoading = true;
    const userId = 'current-user';
    
    this.apiService.getPerformanceMetrics(userId, this.selectedPeriod).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.metrics = response.data;
        } else {
          this.snackBar.open(response.message || 'Failed to load performance metrics', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error) => {
        console.error('Error loading performance metrics:', error);
        this.snackBar.open('Failed to load performance metrics', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadPerformanceMetrics();
  }

  refreshPerformance(): void {
    this.loadPerformanceMetrics();
  }

  exportData(): void {
    // Export performance data functionality
    console.log('Export performance data');
    this.snackBar.open('Export feature coming soon', 'Close', { duration: 2000 });
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

  getRiskLevel(volatility: number): string {
    if (volatility < 0.15) return 'low';
    if (volatility < 0.25) return 'medium';
    return 'high';
  }

  getRiskLevelText(volatility: number): string {
    if (volatility < 0.15) return 'Low Risk';
    if (volatility < 0.25) return 'Medium Risk';
    return 'High Risk';
  }
}
