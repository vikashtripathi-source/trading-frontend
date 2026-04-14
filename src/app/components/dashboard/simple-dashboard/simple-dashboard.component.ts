import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService, Portfolio, MarketData, MarketIndex, TradingStatistics, Holding } from '../../../services/api.service';

@Component({
  selector: 'app-simple-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './simple-dashboard.component.html',
  styleUrls: ['./simple-dashboard.component.css']
})
export class SimpleDashboardComponent implements OnInit {
  isLoading = true;
  currentUser: any = null;
  portfolio: Portfolio | null = null;
  marketIndices: MarketIndex[] = [];
  topGainers: MarketData[] = [];
  topLosers: MarketData[] = [];
  tradingStats: TradingStatistics | null = null;

  // Table columns
  holdingsColumns: string[] = ['symbol', 'quantity', 'avgPrice', 'currentPrice', 'totalValue', 'pnl', 'pnlPercentage'];
  gainersColumns: string[] = ['symbol', 'currentPrice', 'change', 'changePercentage', 'volume'];
  losersColumns: string[] = ['symbol', 'currentPrice', 'change', 'changePercentage', 'volume'];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  private loadUserData(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('jwt_token');
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData);
      } else {
        this.router.navigate(['/login']);
        return;
      }
    }
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all dashboard data in parallel and track completion
    let completedRequests = 0;
    const totalRequests = 5;
    
    const markComplete = () => {
      completedRequests++;
      console.log(`API request completed. ${completedRequests}/${totalRequests} requests done.`);
      if (completedRequests === totalRequests) {
        console.log('All requests completed, setting isLoading to false');
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          console.log('isLoading is now:', this.isLoading);
          this.changeDetectorRef.detectChanges();
        });
      }
    };
    
    // Load all dashboard data in parallel
    this.apiService.getUserPortfolio('current-user').subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.portfolio = response.data;
          console.log('Portfolio loaded:', this.portfolio);
        } else {
          this.showSnackBar(response.message || 'Failed to load portfolio data', 'error');
        }
      },
      error: (error) => {
        console.error('Portfolio error:', error);
        this.showSnackBar('Failed to load portfolio data', 'error');
      },
      complete: markComplete
    });

    this.apiService.getMarketIndices().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.marketIndices = response.data.indices;
          console.log('Market indices loaded:', this.marketIndices);
        } else {
          this.showSnackBar(response.message || 'Failed to load market data', 'error');
        }
      },
      error: (error) => {
        console.error('Market indices error:', error);
        this.showSnackBar('Failed to load market data', 'error');
      },
      complete: markComplete
    });

    this.apiService.getTopGainers(5).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.topGainers = response.data;
          console.log('Top gainers loaded:', this.topGainers);
        } else {
          this.showSnackBar(response.message || 'Failed to load market gainers', 'error');
        }
      },
      error: (error) => {
        console.error('Top gainers error:', error);
        this.showSnackBar('Failed to load market gainers', 'error');
      },
      complete: markComplete
    });

    this.apiService.getTopLosers(5).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.topLosers = response.data;
          console.log('Top losers loaded:', this.topLosers);
        } else {
          this.showSnackBar(response.message || 'Failed to load market losers', 'error');
        }
      },
      error: (error) => {
        console.error('Top losers error:', error);
        this.showSnackBar('Failed to load market losers', 'error');
      },
      complete: markComplete
    });

    this.apiService.getTradingStatistics('current-user', '30d').subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.tradingStats = response.data;
          console.log('Trading stats loaded:', this.tradingStats);
        } else {
          this.showSnackBar(response.message || 'Failed to load trading statistics', 'error');
        }
      },
      error: (error) => {
        console.error('Trading stats error:', error);
        this.showSnackBar('Failed to load trading statistics', 'error');
      },
      complete: markComplete
    });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
    }
    this.showSnackBar('Logged out successfully', 'success');
    this.router.navigate(['/login']);
  }

  refreshData(): void {
    this.loadDashboardData();
    this.showSnackBar('Data refreshed', 'success');
  }

  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
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
