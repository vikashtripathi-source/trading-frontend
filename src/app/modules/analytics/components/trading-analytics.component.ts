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

import { ApiService, TradingStatistics } from '../../../services/api.service';

@Component({
  selector: 'app-trading-analytics',
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
    <div class="trading-analytics-container">
      <mat-card class="analytics-card">
        <mat-card-header>
          <h2>Trading Analytics</h2>
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
          <div class="analytics-content" *ngIf="statistics; else loading">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>swap_horiz</mat-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.totalTrades }}</div>
                  <div class="stat-label">Total Trades</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>trending_up</mat-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.winRate }}%</div>
                  <div class="stat-label">Win Rate</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>show_chart</mat-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ statistics.profitFactor }}</div>
                  <div class="stat-label">Profit Factor</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon">
                  <mat-icon>attach_money</mat-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value" [ngClass]="getPnLClass(statistics.totalPnL)">
                    {{ formatCurrency(statistics.totalPnL) }}
                  </div>
                  <div class="stat-label">Total P&L</div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-container">
              <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
              <p>Loading trading analytics...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .trading-analytics-container {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
    }

    .stat-icon mat-icon {
      color: white;
      font-size: 24px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .profit {
      color: #4caf50;
    }

    .loss {
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
      .trading-analytics-container {
        padding: 10px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class TradingAnalyticsComponent implements OnInit {
  statistics: TradingStatistics | null = null;
  selectedPeriod = '1M';
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    const userId = 'current-user';
    
    this.apiService.getTradingStatistics(userId, this.selectedPeriod).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.statistics = response.data;
        } else {
          this.snackBar.open(response.message || 'Failed to load statistics', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading statistics:', error);
        this.snackBar.open('Failed to load statistics', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadStatistics();
  }

  refreshData(): void {
    this.loadStatistics();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getPnLClass(value: number): string {
    return value >= 0 ? 'profit' : 'loss';
  }
}
