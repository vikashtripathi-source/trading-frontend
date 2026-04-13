import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { ApiService, Trade } from '../../../services/api.service';

@Component({
  selector: 'app-trades-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  template: `
    <div class="trades-list-container">
      <mat-card class="trades-card">
        <mat-card-header>
          <h2>Your Trade History</h2>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Type</mat-label>
              <mat-select (selectionChange)="onTypeFilterChange($event.value)" [value]="typeFilter">
                <mat-option value="">All Trades</mat-option>
                <mat-option value="BUY">Buy Trades</mat-option>
                <mat-option value="SELL">Sell Trades</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Date Range</mat-label>
              <mat-datepicker #picker></mat-datepicker>
              <input matInput 
                     [matDatepicker]="picker" 
                     (dateChange)="onDateChange($event.value)"
                     placeholder="Select date">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            </mat-form-field>
            <button mat-icon-button (click)="refreshTrades()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <div class="trades-summary" *ngIf="filteredTrades.length > 0">
            <div class="summary-item">
              <span class="label">Total Trades:</span>
              <span class="value">{{ filteredTrades.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Buy Trades:</span>
              <span class="value buy">{{ getBuyCount() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Sell Trades:</span>
              <span class="value sell">{{ getSellCount() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Volume:</span>
              <span class="value">{{ getTotalVolume().toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Value:</span>
              <span class="value">{{ formatCurrency(getTotalValue()) }}</span>
            </div>
          </div>

          <div class="table-container" *ngIf="filteredTrades.length > 0; else noTrades">
            <table class="trades-table" *ngIf="filteredTrades.length > 0">
              <thead>
                <tr>
                  <th>Trade ID</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let trade of filteredTrades">
                  <td>
                    <span class="trade-id">{{ trade.id.substring(0, 8) }}...</span>
                  </td>
                  <td>
                    <strong>{{ trade.symbol }}</strong>
                  </td>
                  <td>
                    <span class="trade-type" [ngClass]="trade.type === 'BUY' ? 'buy-type' : 'sell-type'">
                      <mat-icon>{{ trade.type === 'BUY' ? 'trending_up' : 'trending_down' }}</mat-icon>
                      {{ trade.type }}
                    </span>
                  </td>
                  <td>
                    {{ trade.quantity.toLocaleString() }}
                  </td>
                  <td>
                    {{ formatCurrency(trade.price) }}
                  </td>
                  <td>
                    <strong>{{ formatCurrency(trade.quantity * trade.price) }}</strong>
                  </td>
                  <td>
                    <span class="trade-status" [ngClass]="getStatusClass(trade.status)">
                      {{ trade.status }}
                    </span>
                  </td>
                  <td>
                    {{ formatDate(trade.createdAt) }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button mat-icon-button size="small" color="primary" 
                              (click)="viewTradeDetails(trade.id)" 
                              matTooltip="View Details">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button size="small" color="accent" 
                              (click)="downloadTradeReceipt(trade)" 
                              matTooltip="Download Receipt">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noTrades>
            <div class="no-trades">
              <mat-icon class="no-data-icon">history</mat-icon>
              <h3>No Trades Found</h3>
              <p>You haven't executed any trades yet.</p>
              <button mat-raised-button color="primary" (click)="goToOrders()">
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
    .trades-list-container {
      padding: 20px;
    }

    .trades-card {
      margin-bottom: 20px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-field {
      width: 150px;
    }

    .date-field {
      width: 200px;
    }

    .trades-summary {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 100px;
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

    .summary-item .value.buy {
      color: #4caf50;
    }

    .summary-item .value.sell {
      color: #f44336;
    }

    .table-container {
      overflow-x: auto;
    }

    .trade-id {
      font-family: monospace;
      font-size: 12px;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .no-trades {
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

    .no-trades h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .no-trades p {
      margin: 0 0 20px 0;
    }

    @media (max-width: 768px) {
      .trades-list-container {
        padding: 10px;
      }

      .trades-summary {
        flex-direction: column;
        gap: 15px;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-field, .date-field {
        width: 100%;
      }
    }
  `]
})
export class TradesListComponent implements OnInit {
  trades: Trade[] = [];
  filteredTrades: Trade[] = [];
  isLoading = false;
  typeFilter = '';
  dateFilter: Date | null = null;

  tradesColumns: string[] = [
    'id',
    'symbol',
    'type',
    'quantity',
    'price',
    'totalValue',
    'status',
    'createdAt',
    'actions'
  ];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTrades();
  }

  loadTrades(): void {
    this.isLoading = true;
    
    this.apiService.getAllTrades().subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.trades = response.data;
          this.filterTrades();
        } else {
          this.snackBar.open(response.message || 'Failed to load trades', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading trades:', error);
        this.snackBar.open('Failed to load trades', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  filterTrades(): void {
    this.filteredTrades = this.trades.filter(trade => {
      let matchesType = !this.typeFilter || trade.type === this.typeFilter;
      let matchesDate = !this.dateFilter || this.isSameDay(new Date(trade.createdAt), this.dateFilter);
      return matchesType && matchesDate;
    });
  }

  onTypeFilterChange(type: string): void {
    this.typeFilter = type;
    this.filterTrades();
  }

  onDateChange(date: Date | null): void {
    this.dateFilter = date;
    this.filterTrades();
  }

  refreshTrades(): void {
    this.loadTrades();
  }

  viewTradeDetails(tradeId: string): void {
    console.log('View trade details:', tradeId);
    // Navigate to trade details page
  }

  downloadTradeReceipt(trade: Trade): void {
    console.log('Download receipt for trade:', trade);
    this.snackBar.open('Receipt download feature coming soon', 'Close', { duration: 2000 });
  }

  goToOrders(): void {
    // Navigate to orders page
    console.log('Go to orders');
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getBuyCount(): number {
    return this.filteredTrades.filter(trade => trade.type === 'BUY').length;
  }

  getSellCount(): number {
    return this.filteredTrades.filter(trade => trade.type === 'SELL').length;
  }

  getTotalVolume(): number {
    return this.filteredTrades.reduce((total, trade) => total + trade.quantity, 0);
  }

  getTotalValue(): number {
    return this.filteredTrades.reduce((total, trade) => total + (trade.quantity * trade.price), 0);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'EXECUTED': return 'primary';
      case 'PENDING': return 'accent';
      case 'CANCELLED': return 'warn';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EXECUTED': return 'executed-status';
      case 'PENDING': return 'pending-status';
      case 'CANCELLED': return 'cancelled-status';
      default: return '';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
