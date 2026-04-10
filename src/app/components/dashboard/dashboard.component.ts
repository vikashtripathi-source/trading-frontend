import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Portfolio, MarketData, MarketIndex, TradingStatistics } from '../../services/api.service';
import { WebSocketService, PortfolioUpdate, MarketDataUpdate } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
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
    const userId = 'user123'; // This should come from auth service

    // Load all data in parallel
    this.apiService.getUserPortfolio(userId).subscribe({
      next: (response) => {
        this.portfolio = response.data;
      },
      error: (err) => {
        this.error = 'Failed to load portfolio data';
        console.error('Portfolio error:', err);
      }
    });

    this.apiService.getMarketIndices().subscribe({
      next: (response) => {
        this.marketIndices = response.data.indices;
      },
      error: (err) => {
        console.error('Market indices error:', err);
      }
    });

    this.apiService.getTopGainers(5).subscribe({
      next: (response) => {
        this.topGainers = response.data;
      },
      error: (err) => {
        console.error('Top gainers error:', err);
      }
    });

    this.apiService.getTopLosers(5).subscribe({
      next: (response) => {
        this.topLosers = response.data;
      },
      error: (err) => {
        console.error('Top losers error:', err);
      }
    });

    this.apiService.getTradingStatistics(userId, '1M').subscribe({
      next: (response) => {
        this.statistics = response.data;
      },
      error: (err) => {
        console.error('Statistics error:', err);
      }
    }).add(() => {
      this.isLoading = false;
    });
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
    if (this.portfolio && this.portfolio.userId === update.data.userId) {
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
