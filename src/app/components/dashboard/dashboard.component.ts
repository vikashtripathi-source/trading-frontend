import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Portfolio, MarketData, MarketIndex, TradingStatistics } from '../../services/api.service';
import { WebSocketService, PortfolioUpdate, MarketDataUpdate } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  portfolio: Portfolio | null = null;
  marketIndices: MarketIndex[] = [];
  topGainers: MarketData[] = [];
  topLosers: MarketData[] = [];
  statistics: TradingStatistics | null = null;
  isLoading = true;
  error: string | null = null;

  private wsSubscription: Subscription | null = null;
  private portfolioSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupWebSocket();
  }

  
  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.loadingCount = 0; // Reset loading counter
    this.error = null; // Clear any previous errors

    // Make actual API calls to get real data
    this.loadPortfolio();
    this.loadMarketData();
    this.loadTradingStatistics();
  }

  private loadPortfolio(): void {
    // Debug: Check if JWT token exists
    const token = localStorage.getItem('jwt_token');
    console.log('JWT Token exists:', !!token);
    console.log('JWT Token exists:', !!token);
    
    this.apiService.getUserPortfolio('current-user').subscribe({
      next: (response) => {
        console.log('Portfolio API response:', response);
        if (response.data) {
          this.portfolio = response.data;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Portfolio loading error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        this.error = `Failed to load portfolio data (${error.status}). Please try again.`;
        this.isLoading = false;
      }
    });
  }

  private loadMarketData(): void {
    // Load market indices
    this.apiService.getMarketIndices().subscribe({
      next: (response) => {
        if (response.data) {
          // Backend returns object with index names as keys, convert to array
          const indicesData = response.data as any;
          this.marketIndices = Object.keys(indicesData).map(name => ({
            name,
            ...indicesData[name]
          }));
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Market indices loading error:', error);
        this.error = 'Failed to load market indices. Please try again.';
        this.isLoading = false;
      }
    });

    // Load top gainers
    this.apiService.getTopGainers(10).subscribe({
      next: (response) => {
        if (response.data) {
          this.topGainers = response.data;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Top gainers loading error:', error);
        this.error = 'Failed to load top gainers. Please try again.';
        this.isLoading = false;
      }
    });

    // Load top losers
    this.apiService.getTopLosers(10).subscribe({
      next: (response) => {
        if (response.data) {
          this.topLosers = response.data;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Top losers loading error:', error);
        this.error = 'Failed to load top losers. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private loadTradingStatistics(): void {
    this.apiService.getTradingStatistics('current-user', '30d').subscribe({
      next: (response) => {
        if (response.data) {
          this.statistics = response.data;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Trading statistics loading error:', error);
        this.error = 'Failed to load trading statistics. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private loadingCount = 0;
  private totalApiCalls = 5; // Portfolio, Market Indices, Top Gainers, Top Losers, Statistics

  private checkLoadingComplete(): void {
    this.loadingCount++;
    if (this.loadingCount >= this.totalApiCalls) {
      this.isLoading = false;
    }
  }

  private setupWebSocket(): void {
    this.wsService.connect();
    
    this.wsSubscription = this.wsService.getMessages().subscribe((message) => {
      if (message.type === 'portfolio-update') {
        this.handlePortfolioUpdate(message);
      } else if (message.type === 'market-data') {
        this.handleMarketDataUpdate(message);
      }
    });

    this.portfolioSubscription = this.wsService.getConnectionStatus().subscribe((connected) => {
      if (connected) {
        console.log('WebSocket connected for real-time updates');
      }
    });
  }

  private handlePortfolioUpdate(update: PortfolioUpdate): void {
    if (this.portfolio) {
      this.portfolio.totalValue = update.data.totalValue;
      this.portfolio.dailyPnL = update.data.dailyPnL;
    }
  }

  private handleMarketDataUpdate(update: MarketDataUpdate): void {
    // Update market data for the symbol
    // This would update charts and real-time prices
    console.log('Market data update:', update);
  }

  getPositiveChangeClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  formatLargeNumber(num: number): string {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toString();
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
