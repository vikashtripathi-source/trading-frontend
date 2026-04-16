import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ApiService, Portfolio, Holding } from '../../../services/api.service';

@Component({
  selector: 'app-portfolio-holdings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="holdings-container">
      <mat-card class="holdings-card">
        <mat-card-header>
          <h2>Your Holdings</h2>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort by</mat-label>
              <mat-select (selectionChange)="onSortChange($event.value)">
                <mat-option value="symbol">Symbol</mat-option>
                <mat-option value="value">Total Value</mat-option>
                <mat-option value="pnl">P&L</mat-option>
                <mat-option value="quantity">Quantity</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="refreshHoldings()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <div class="holdings-summary" *ngIf="sortedHoldings.length > 0">
            <div class="summary-item">
              <span class="label">Total Holdings:</span>
              <span class="value">{{ sortedHoldings.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Value:</span>
              <span class="value">{{ formatCurrency(getTotalValue()) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total P&L:</span>
              <span class="value" [ngClass]="getProfitLossClass(getTotalPnL())">
                {{ formatCurrency(getTotalPnL()) }}
              </span>
            </div>
          </div>

          <div class="table-container" *ngIf="sortedHoldings.length > 0; else noHoldings">
            <!-- <table mat-table [dataSource]="sortedHoldings" [displayedColumns]="holdingsColumns"> -->
              <!-- Symbol Column -->
              <ng-container matColumnDef="symbol">
                <th mat-header-cell *matHeaderCellDef>Symbol</th>
                <td mat-cell *matCellDef="let holding">
                  <div class="symbol-cell">
                    <strong>{{ holding.symbol }}</strong>
                    <button mat-icon-button size="small" (click)="viewSymbolDetails(holding.symbol)">
                      <mat-icon>info</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <!-- Quantity Column -->
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let holding">
                  {{ holding.quantity.toLocaleString() }}
                </td>
              </ng-container>

              <!-- Avg Price Column -->
              <ng-container matColumnDef="avgPrice">
                <th mat-header-cell *matHeaderCellDef>Avg Price</th>
                <td mat-cell *matCellDef="let holding">
                  {{ formatCurrency(holding.averagePrice) }}
                </td>
              </ng-container>

              <!-- Current Price Column -->
              <ng-container matColumnDef="currentPrice">
                <th mat-header-cell *matHeaderCellDef>Current Price</th>
                <td mat-cell *matCellDef="let holding">
                  {{ formatCurrency(holding.currentPrice) }}
                </td>
              </ng-container>

              <!-- Total Value Column -->
              <ng-container matColumnDef="totalValue">
                <th mat-header-cell *matHeaderCellDef>Total Value</th>
                <td mat-cell *matCellDef="let holding">
                  <strong>{{ formatCurrency(holding.totalValue) }}</strong>
                </td>
              </ng-container>

              <!-- P&L Column -->
              <ng-container matColumnDef="pnl">
                <th mat-header-cell *matHeaderCellDef>P&L</th>
                <td mat-cell *matCellDef="let holding">
                  <div class="pnl-cell" [ngClass]="getProfitLossClass(holding.pnl)">
                    {{ formatCurrency(holding.pnl) }}
                  </div>
                </td>
              </ng-container>

              <!-- P&L % Column -->
              <ng-container matColumnDef="pnlPercentage">
                <th mat-header-cell *matHeaderCellDef>P&L %</th>
                <td mat-cell *matCellDef="let holding">
                  <div class="pnl-percentage" [ngClass]="getProfitLossClass(holding.pnl)">
                    {{ formatPercentage(holding.pnlPercentage) }}
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let holding">
                  <div class="action-buttons">
                    <button mat-icon-button size="small" color="primary" 
                            (click)="buyMore(holding.symbol)" 
                            matTooltip="Buy More">
                      <mat-icon>trending_up</mat-icon>
                    </button>
                    <button mat-icon-button size="small" color="warn" 
                            (click)="sellPosition(holding.symbol)" 
                            matTooltip="Sell">
                      <mat-icon>trending_down</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="holdingsColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: holdingsColumns;"></tr>
            <!-- </table> -->
          </div>

          <ng-template #noHoldings>
            <div class="no-holdings">
              <mat-icon class="no-data-icon">account_balance_wallet</mat-icon>
              <h3>No Holdings Found</h3>
              <p>You don't have any holdings yet. Start building your portfolio!</p>
              <button mat-raised-button color="primary" (click)="goToMarket()">
                <mat-icon>add</mat-icon>
                Start Trading
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .holdings-container {
      padding: 20px;
    }

    .holdings-card {
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sort-field {
      width: 150px;
    }

    .holdings-summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .summary-item .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .summary-item .value {
      font-size: 16px;
      font-weight: 600;
    }

    .table-container {
      overflow-x: auto;
    }

    .symbol-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pnl-cell, .pnl-percentage {
      font-weight: 600;
    }

    .profit {
      color: #4caf50;
    }

    .loss {
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .no-holdings {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-holdings h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .no-holdings p {
      margin: 0 0 20px 0;
    }

    @media (max-width: 768px) {
      .holdings-container {
        padding: 10px;
      }

      .holdings-summary {
        flex-direction: column;
        gap: 15px;
      }

      .header-actions {
        flex-direction: column;
        align-items: flex-end;
      }
    }
  `]
})
export class PortfolioHoldingsComponent implements OnInit {
  holdings: Holding[] = [];
  sortedHoldings: Holding[] = [];
  isLoading = false;
  sortBy = 'symbol';

  holdingsColumns: string[] = [
    'symbol',
    'quantity', 
    'avgPrice',
    'currentPrice',
    'totalValue',
    'pnl',
    'pnlPercentage',
    'actions'
  ];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadHoldings();
  }

  loadHoldings(): void {
    this.isLoading = true;
    const userId = 'current-user';
    
    this.apiService.getUserPortfolio(userId).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.holdings = response.data.holdings || [];
          this.sortHoldings();
        }
      },
      error: (error) => {
        console.error('Error loading holdings:', error);
        this.snackBar.open('Failed to load holdings', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  sortHoldings(): void {
    this.sortedHoldings = [...this.holdings].sort((a, b) => {
      switch (this.sortBy) {
        case 'symbol':
          return a.symbol.localeCompare(b.symbol);
        case 'value':
          return b.totalValue - a.totalValue;
        case 'pnl':
          return b.pnl - a.pnl;
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.sortHoldings();
  }

  refreshHoldings(): void {
    this.loadHoldings();
  }

  viewSymbolDetails(symbol: string): void {
    // Navigate to symbol details or show modal
    console.log('View details for:', symbol);
  }

  buyMore(symbol: string): void {
    // Navigate to order page with pre-filled symbol
    console.log('Buy more of:', symbol);
  }

  sellPosition(symbol: string): void {
    // Navigate to order page with pre-filled sell order
    console.log('Sell position:', symbol);
  }

  goToMarket(): void {
    // Navigate to market data page
    console.log('Go to market');
  }

  getTotalValue(): number {
    return this.holdings.reduce((total, holding) => total + holding.totalValue, 0);
  }

  getTotalPnL(): number {
    return this.holdings.reduce((total, holding) => total + holding.pnl, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  getProfitLossClass(value: number): string {
    return value >= 0 ? 'profit' : 'loss';
  }
}
