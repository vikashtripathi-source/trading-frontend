import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ApiService, Portfolio, MarketData, MarketIndex, TradingStatistics, Holding, Order } from '../../../services/api.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-advanced-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './advanced-dashboard.component.html',
  styleUrls: ['./advanced-dashboard.component.css']
})
export class AdvancedDashboardComponent implements OnInit, OnDestroy {
  isLoading = true;
  currentUser: any = null;
  portfolio: Portfolio | null = null;
  marketIndices: MarketIndex[] = [];
  topGainers: MarketData[] = [];
  topLosers: MarketData[] = [];
  tradingStats: TradingStatistics | null = null;
  recentOrders: Order[] = [];
  
  // Real-time data
  private destroy$ = new Subject<void>();
  
  // Quick trade form
  quickTradeForm = {
    symbol: '',
    quantity: 1,
    orderType: 'MARKET' as 'MARKET' | 'LIMIT',
    side: 'BUY' as 'BUY' | 'SELL',
    price: 0
  };

  // Watchlist
  watchlist: string[] = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];
  newWatchlistSymbol = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.initializeRealTimeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('jwt_token');
    
    if (userData && token) {
      this.currentUser = JSON.parse(userData);
    } else {
      this.router.navigate(['/login']);
      return;
    }
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all dashboard data in parallel
    this.apiService.getUserPortfolio('current-user').pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.portfolio = response.data;
        }
      },
      error: (error) => {
        console.error('Portfolio error:', error);
        this.showSnackBar('Failed to load portfolio data', 'error');
      }
    });

    this.apiService.getMarketIndices().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.marketIndices = response.data.indices;
        }
      },
      error: (error) => {
        console.error('Market indices error:', error);
        this.showSnackBar('Failed to load market data', 'error');
      }
    });

    this.apiService.getTopGainers(5).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.topGainers = response.data;
        }
      },
      error: (error) => {
        console.error('Top gainers error:', error);
        this.showSnackBar('Failed to load market gainers', 'error');
      }
    });

    this.apiService.getTopLosers(5).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.topLosers = response.data;
        }
      },
      error: (error) => {
        console.error('Top losers error:', error);
        this.showSnackBar('Failed to load market losers', 'error');
      }
    });

    this.apiService.getTradingStatistics('current-user', '30d').pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.tradingStats = response.data;
        }
      },
      error: (error) => {
        console.error('Trading stats error:', error);
        this.showSnackBar('Failed to load trading statistics', 'error');
      }
    });

    this.apiService.getUserOrders('current-user').pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.recentOrders = response.data.slice(0, 5); // Show last 5 orders
        }
      },
      error: (error) => {
        console.error('Recent orders error:', error);
        this.showSnackBar('Failed to load recent orders', 'error');
      },
      complete: () => {
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }
    });
  }

  private initializeRealTimeData(): void {
    // Simulate real-time updates (in real app, this would use WebSocket)
    setInterval(() => {
      if (this.portfolio && this.marketIndices.length > 0) {
        this.updateRealTimePrices();
      }
    }, 5000); // Update every 5 seconds
  }

  private updateRealTimePrices(): void {
    // Simulate price updates for portfolio holdings
    if (this.portfolio && this.portfolio.holdings) {
      this.portfolio.holdings.forEach(holding => {
        const changePercent = (Math.random() - 0.5) * 2; // Random change between -1% and +1%
        holding.currentPrice = holding.averagePrice * (1 + changePercent);
        holding.pnl = (holding.currentPrice - holding.averagePrice) * holding.quantity;
        holding.pnlPercentage = changePercent;
      });
    }
  }

  // Quick trade functionality
  executeQuickTrade(): void {
    if (!this.quickTradeForm.symbol || this.quickTradeForm.quantity <= 0) {
      this.showSnackBar('Please enter symbol and quantity', 'error');
      return;
    }

    const order = {
      userId: 'current-user',
      symbol: this.quickTradeForm.symbol.toUpperCase(),
      orderType: this.quickTradeForm.orderType,
      side: this.quickTradeForm.side,
      quantity: this.quickTradeForm.quantity,
      price: this.quickTradeForm.price || 0,
      stopPrice: 0,
      status: 'PENDING'
    };

    this.apiService.createOrder(order).subscribe({
      next: (response) => {
        this.showSnackBar('Order placed successfully!', 'success');
        this.resetQuickTradeForm();
        this.loadDashboardData(); // Refresh data
      },
      error: (error) => {
        console.error('Quick trade error:', error);
        this.showSnackBar('Failed to place order', 'error');
      }
    });
  }

  resetQuickTradeForm(): void {
    this.quickTradeForm = {
      symbol: '',
      quantity: 1,
      orderType: 'MARKET' as 'MARKET' | 'LIMIT',
      side: 'BUY' as 'BUY' | 'SELL',
      price: 0
    };
  }

  // Watchlist functionality
  addToWatchlist(): void {
    if (this.newWatchlistSymbol && !this.watchlist.includes(this.newWatchlistSymbol.toUpperCase())) {
      this.watchlist.push(this.newWatchlistSymbol.toUpperCase());
      this.newWatchlistSymbol = '';
      this.showSnackBar('Added to watchlist', 'success');
    }
  }

  removeFromWatchlist(symbol: string): void {
    const index = this.watchlist.indexOf(symbol);
    if (index > -1) {
      this.watchlist.splice(index, 1);
      this.showSnackBar('Removed from watchlist', 'success');
    }
  }

  // Navigation
  navigateToPortfolio(): void {
    this.router.navigate(['/portfolio']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  navigateToTrades(): void {
    this.router.navigate(['/trades']);
  }

  navigateToMarket(): void {
    this.router.navigate(['/market']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  // Utility methods
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

  getMarketStatusClass(change: number): string {
    return change >= 0 ? 'market-up' : 'market-down';
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
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

  // Table columns
  holdingsColumns: string[] = ['symbol', 'quantity', 'avgPrice', 'currentPrice', 'totalValue', 'pnl', 'pnlPercentage'];
  ordersColumns: string[] = ['symbol', 'type', 'quantity', 'price', 'status', 'createdAt'];
  watchlistColumns: string[] = ['symbol', 'price', 'change', 'volume'];
}
