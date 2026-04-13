import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, MarketData } from '../../../services/api.service';

@Component({
  selector: 'app-market-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule
  ],
  template: `
    <div class="market-data-container">
      <mat-card class="market-data-card" *ngIf="marketData; else loading">
        <mat-card-header>
          <div class="header-content">
            <div class="symbol-info">
              <h2>{{ marketData.symbol }}</h2>
              <span class="symbol-chip">{{ marketData.symbol }}</span>
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
          <!-- Price Information -->
          <div class="price-section">
            <div class="current-price">
              <span class="price">{{ formatCurrency(marketData.currentPrice) }}</span>
              <span class="change" [ngClass]="getProfitLossClass(marketData.change)">
                {{ formatCurrency(marketData.change) }} ({{ formatPercentage(marketData.changePercentage) }})
              </span>
            </div>
          </div>

          <!-- Market Data Tabs -->
          <mat-tab-group class="data-tabs">
            <mat-tab label="Overview">
              <ng-template matTabContent>
                <div class="overview-grid">
                  <div class="data-item">
                    <span class="label">Open Price:</span>
                    <span class="value">{{ formatCurrency(marketData.openPrice) }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">High Price:</span>
                    <span class="value">{{ formatCurrency(marketData.highPrice) }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">Low Price:</span>
                    <span class="value">{{ formatCurrency(marketData.lowPrice) }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">Previous Close:</span>
                    <span class="value">{{ formatCurrency(marketData.previousClose) }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">Volume:</span>
                    <span class="value">{{ marketData.volume.toLocaleString() }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">Average Volume:</span>
                    <span class="value">{{ marketData.averageVolume.toLocaleString() }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">Market Cap:</span>
                    <span class="value">{{ formatMarketCap(marketData.marketCap) }}</span>
                  </div>
                  <div class="data-item">
                    <span class="label">P/E Ratio:</span>
                    <span class="value">{{ marketData.peRatio.toFixed(2) }}</span>
                  </div>
                </div>
              </ng-template>
            </mat-tab>
            
            <mat-tab label="Trading">
              <ng-template matTabContent>
                <div class="trading-section">
                  <div class="action-buttons">
                    <button mat-raised-button color="primary" (click)="buyStock()">
                      <mat-icon>trending_up</mat-icon>
                      Buy
                    </button>
                    <button mat-raised-button color="warn" (click)="sellStock()">
                      <mat-icon>trending_down</mat-icon>
                      Sell
                    </button>
                    <button mat-button (click)="addToWatchlist()">
                      <mat-icon>star</mat-icon>
                      Add to Watchlist
                    </button>
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          <p>Loading market data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .market-data-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .market-data-card {
      margin-bottom: 20px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .symbol-info h2 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .price-section {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }

    .current-price {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .price {
      font-size: 36px;
      font-weight: 700;
      color: #333;
    }

    .change {
      font-size: 18px;
      font-weight: 600;
    }

    .profit {
      color: #4caf50;
    }

    .loss {
      color: #f44336;
    }

    .data-tabs {
      margin-top: 20px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }

    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .data-item .label {
      color: #666;
      font-weight: 500;
    }

    .data-item .value {
      font-weight: 600;
      color: #333;
    }

    .trading-section {
      margin-top: 20px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
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
      .market-data-container {
        padding: 10px;
      }

      .header-content {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .price {
        font-size: 28px;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class MarketDataComponent implements OnInit {
  marketData: MarketData | null = null;
  symbol: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.symbol = this.route.snapshot.paramMap.get('symbol') || '';
    if (this.symbol) {
      this.loadMarketData();
    }
  }

  loadMarketData(): void {
    this.apiService.getMarketData(this.symbol).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.marketData = response.data;
        } else {
          this.snackBar.open(response.message || 'Failed to load market data', 'Close', { 
            duration: 3000 
          });
        }
      },
      error: (error: any) => {
        console.error('Error loading market data:', error);
        this.snackBar.open('Failed to load market data', 'Close', { duration: 3000 });
      }
    });
  }

  refreshData(): void {
    this.loadMarketData();
  }

  goBack(): void {
    this.router.navigate(['/market']);
  }

  buyStock(): void {
    this.router.navigate(['/orders/create'], { 
      queryParams: { symbol: this.symbol, side: 'BUY' } 
    });
  }

  sellStock(): void {
    this.router.navigate(['/orders/create'], { 
      queryParams: { symbol: this.symbol, side: 'SELL' } 
    });
  }

  addToWatchlist(): void {
    console.log('Add to watchlist:', this.symbol);
    this.snackBar.open('Added to watchlist feature coming soon', 'Close', { duration: 2000 });
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

  formatMarketCap(value: number): string {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(1)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  }

  getProfitLossClass(value: number): string {
    return value >= 0 ? 'profit' : 'loss';
  }
}
