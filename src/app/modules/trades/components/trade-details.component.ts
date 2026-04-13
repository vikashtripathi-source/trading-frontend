import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Trade } from '../../../services/api.service';

@Component({
  selector: 'app-trade-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="trade-details-container">
      <mat-card class="trade-card" *ngIf="trade; else loading">
        <mat-card-header>
          <div class="header-content">
            <div class="trade-info">
              <h2>Trade Details</h2>
              <div class="trade-chips">
                <span class="trade-type-chip" [ngClass]="trade.type === 'BUY' ? 'buy-type' : 'sell-type'">
                  {{ trade.type }}
                </span>
                <span class="trade-status-chip" [ngClass]="getStatusClass(trade.status)">
                  {{ trade.status }}
                </span>
              </div>
            </div>
            <div class="header-actions">
              <button mat-icon-button (click)="refreshData()">
                <mat-icon>refresh</mat-icon>
              </button>
              <button mat-icon-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Trade Summary -->
          <div class="trade-summary">
            <div class="summary-item">
              <span class="label">Trade ID:</span>
              <span class="value">{{ trade.id }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Symbol:</span>
              <span class="value">{{ trade.symbol }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Type:</span>
              <span class="value" [ngClass]="trade.type.toLowerCase()">{{ trade.type }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Quantity:</span>
              <span class="value">{{ trade.quantity.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Price:</span>
              <span class="value">{{ formatCurrency(trade.price) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Value:</span>
              <span class="value total">{{ formatCurrency(trade.quantity * trade.price) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Status:</span>
              <span class="value">{{ trade.status }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(trade.createdAt) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button mat-button color="primary" (click)="downloadReceipt()">
              <mat-icon>download</mat-icon>
              Download Receipt
            </button>
            <button mat-button color="accent" (click)="viewSymbol()">
              <mat-icon>visibility</mat-icon>
              View Symbol
            </button>
            <button mat-button (click)="duplicateTrade()">
              <mat-icon>content_copy</mat-icon>
              Duplicate Trade
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>Loading trade details...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .trade-details-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .trade-card {
      margin-bottom: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .trade-info h2 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .trade-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .summary-item .label {
      color: #666;
      font-weight: 500;
    }

    .summary-item .value {
      font-weight: 600;
      color: #333;
    }

    .summary-item .value.total {
      font-size: 18px;
      color: #667eea;
    }

    .summary-item .value.buy {
      color: #4caf50;
    }

    .summary-item .value.sell {
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 30px;
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
      .trade-details-container {
        padding: 10px;
      }

      .header-content {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .trade-summary {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class TradeDetailsComponent implements OnInit {
  trade: Trade | null = null;
  tradeId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tradeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tradeId) {
      this.loadTradeDetails();
    }
  }

  loadTradeDetails(): void {
    this.apiService.getTradeById(this.tradeId).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.trade = response.data;
        } else {
          this.snackBar.open(response.message || 'Failed to load trade details', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading trade details:', error);
        this.snackBar.open('Failed to load trade details', 'Close', { duration: 3000 });
      }
    });
  }

  refreshData(): void {
    this.loadTradeDetails();
  }

  goBack(): void {
    this.router.navigate(['/trades']);
  }

  downloadReceipt(): void {
    console.log('Download receipt for trade:', this.tradeId);
    this.snackBar.open('Receipt download feature coming soon', 'Close', { duration: 2000 });
  }

  viewSymbol(): void {
    if (this.trade) {
      this.router.navigate(['/market/data', this.trade.symbol]);
    }
  }

  duplicateTrade(): void {
    if (this.trade) {
      this.router.navigate(['/orders/create'], { 
        queryParams: { 
          symbol: this.trade.symbol, 
          side: this.trade.type,
          quantity: this.trade.quantity,
          price: this.trade.price
        } 
      });
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
    return date.toLocaleString();
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
}
