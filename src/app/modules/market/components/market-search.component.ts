import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { ApiService, SymbolSearchResult, MarketData } from '../../../services/api.service';

@Component({
  selector: 'app-market-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="market-search-container">
      <mat-card class="search-card">
        <mat-card-header>
          <h2>Stock Search</h2>
          <p class="card-subtitle">Search for stocks and view real-time market data</p>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
            <div class="search-input-group">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search Stocks</mat-label>
                <input matInput 
                       formControlName="query" 
                       placeholder="Enter stock symbol or company name"
                       (keyup.enter)="onSearch()">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      [disabled]="searchForm.invalid || isSearching">
                <mat-icon *ngIf="isSearching" class="spinner">refresh</mat-icon>
                {{ isSearching ? 'Searching...' : 'Search' }}
              </button>
            </div>
          </form>

          <!-- Search Results -->
          <div class="search-results" *ngIf="searchResults.length > 0">
            <h3>Search Results</h3>
            <table class="search-results-table" *ngIf="searchResults.length > 0">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Exchange</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let result of searchResults">
                  <td>
                    <strong>{{ result.symbol }}</strong>
                  </td>
                  <td>
                    {{ result.name }}
                  </td>
                  <td>
                    <span class="result-type">{{ result.type }}</span>
                  </td>
                  <td>
                    {{ result.exchange }}
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button mat-icon-button size="small" color="primary" 
                              (click)="viewMarketData(result.symbol)" 
                              matTooltip="View Market Data">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button size="small" color="accent" 
                              (click)="addToWatchlist(result.symbol)" 
                              matTooltip="Add to Watchlist">
                        <mat-icon>star</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Market Data Preview -->
          <div class="market-data-preview" *ngIf="selectedMarketData">
            <h3>Market Data: {{ selectedMarketData.symbol }}</h3>
            <div class="market-data-grid">
              <div class="data-item">
                <span class="label">Current Price:</span>
                <span class="value">{{ formatCurrency(selectedMarketData.currentPrice) }}</span>
              </div>
              <div class="data-item">
                <span class="label">Change:</span>
                <span class="value" [ngClass]="getProfitLossClass(selectedMarketData.change)">
                  {{ formatCurrency(selectedMarketData.change) }}
                </span>
              </div>
              <div class="data-item">
                <span class="label">Change %:</span>
                <span class="value" [ngClass]="getProfitLossClass(selectedMarketData.change)">
                  {{ formatPercentage(selectedMarketData.changePercentage) }}
                </span>
              </div>
              <div class="data-item">
                <span class="label">Volume:</span>
                <span class="value">{{ selectedMarketData.volume.toLocaleString() }}</span>
              </div>
              <div class="data-item">
                <span class="label">Market Cap:</span>
                <span class="value">{{ formatMarketCap(selectedMarketData.marketCap) }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .market-search-container {
      padding: 20px;
    }

    .search-card {
      margin-bottom: 20px;
    }

    .card-subtitle {
      color: #666;
      margin: 0;
    }

    .search-form {
      margin-bottom: 20px;
    }

    .search-input-group {
      display: flex;
      gap: 15px;
      align-items: flex-end;
    }

    .search-field {
      flex: 1;
    }

    .search-results {
      margin-top: 30px;
    }

    .search-results h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
    }

    .market-data-preview {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .market-data-preview h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .market-data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: white;
      border-radius: 6px;
    }

    .data-item .label {
      color: #666;
      font-weight: 500;
    }

    .data-item .value {
      font-weight: 600;
    }

    .profit {
      color: #4caf50;
    }

    .loss {
      color: #f44336;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .market-search-container {
        padding: 10px;
      }

      .search-input-group {
        flex-direction: column;
        align-items: stretch;
      }

      .market-data-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MarketSearchComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: SymbolSearchResult[] = [];
  selectedMarketData: MarketData | null = null;
  isSearching = false;

  searchColumns: string[] = ['symbol', 'name', 'type', 'exchange', 'actions'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      query: ['', []]
    });
  }

  ngOnInit(): void {
  }

  onSearch(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (!query) return;

    this.isSearching = true;
    this.selectedMarketData = null;

    this.apiService.searchSymbols(query, 20).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.searchResults = response.data;
        } else {
          this.snackBar.open(response.message || 'Search failed', 'Close', { duration: 3000 });
        }
      },
      error: (error: any) => {
        console.error('Search error:', error);
        this.snackBar.open('Search failed', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isSearching = false;
      }
    });
  }

  viewMarketData(symbol: string): void {
    this.apiService.getMarketData(symbol).subscribe({
      next: (response: any) => {
        if (response.code === 200) {
          this.selectedMarketData = response.data;
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

  addToWatchlist(symbol: string): void {
    console.log('Add to watchlist:', symbol);
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
