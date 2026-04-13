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
    this.loadingCount = 0; // Reset loading counter
    this.error = null; // Clear any previous errors

    // Make actual API calls to get real data
    this.loadPortfolio();
    this.loadMarketData();
    this.loadTradingStatistics();
  }

  private loadPortfolio(): void {
    this.apiService.getUserPortfolio('current-user').subscribe({
      next: (response) => {
        if (response.data) {
          this.portfolio = response.data;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Portfolio loading error:', error);
        // Fallback to mock data if API fails
        this.portfolio = {
          id: 'portfolio1',
          userId: 'user123',
          name: 'Main Portfolio',
          totalValue: 50000.00,
          availableBalance: 10000.00,
          totalInvested: 40000.00,
          totalPnL: 10000.00,
          dailyPnL: 250.00,
          lastUpdated: new Date().toISOString(),
          holdings: [
            {
              symbol: 'AAPL',
              quantity: 100,
              averagePrice: 150.25,
              currentPrice: 155.50,
              totalValue: 15550.00,
              pnl: 525.00,
              pnlPercentage: 3.49
            },
            {
              symbol: 'GOOGL',
              quantity: 50,
              averagePrice: 2800.00,
              currentPrice: 2850.00,
              totalValue: 142500.00,
              pnl: 2500.00,
              pnlPercentage: 1.79
            }
          ]
        };
        this.checkLoadingComplete();
      }
    });
  }

  private loadMarketData(): void {
    // Load market indices
    this.apiService.getMarketIndices().subscribe({
      next: (response) => {
        if (response.data) {
          this.marketIndices = response.data.indices;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Market indices loading error:', error);
        // Fallback to mock data if API fails
        this.marketIndices = [
          {
            name: 'S&P 500',
            symbol: '^GSPC',
            value: 4525.12,
            change: 25.34,
            changePercentage: 0.56
          },
          {
            name: 'NASDAQ',
            symbol: '^IXIC',
            value: 14250.89,
            change: 75.23,
            changePercentage: 0.53
          }
        ];
        this.checkLoadingComplete();
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
        // Fallback to mock data if API fails
        this.topGainers = [
          {
            symbol: 'TSLA',
            currentPrice: 245.80,
            openPrice: 230.60,
            highPrice: 248.90,
            lowPrice: 228.40,
            previousClose: 230.60,
            change: 15.20,
            changePercentage: 6.59,
            volume: 120000000,
            averageVolume: 98000000,
            marketCap: 780000000000,
            peRatio: 78.5,
            timestamp: Date.now()
          },
          {
            symbol: 'NVDA',
            currentPrice: 485.20,
            openPrice: 462.80,
            highPrice: 490.50,
            lowPrice: 458.90,
            previousClose: 462.80,
            change: 22.40,
            changePercentage: 4.84,
            volume: 45000000,
            averageVolume: 42000000,
            marketCap: 1200000000000,
            peRatio: 65.2,
            timestamp: Date.now()
          }
        ];
        this.checkLoadingComplete();
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
        // Fallback to mock data if API fails
        this.topLosers = [
          {
            symbol: 'META',
            currentPrice: 312.50,
            openPrice: 320.80,
            highPrice: 325.90,
            lowPrice: 310.40,
            previousClose: 320.80,
            change: -8.30,
            changePercentage: -2.59,
            volume: 18000000,
            averageVolume: 22000000,
            marketCap: 800000000000,
            peRatio: 28.9,
            timestamp: Date.now()
          },
          {
            symbol: 'AMZN',
            currentPrice: 127.80,
            openPrice: 131.00,
            highPrice: 133.20,
            lowPrice: 125.40,
            previousClose: 131.00,
            change: -3.20,
            changePercentage: -2.44,
            volume: 55000000,
            averageVolume: 68000000,
            marketCap: 1300000000000,
            peRatio: 52.3,
            timestamp: Date.now()
          }
        ];
        this.checkLoadingComplete();
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
        // Fallback to mock data if API fails
        this.statistics = {
          totalTrades: 45,
          winningTrades: 28,
          losingTrades: 17,
          winRate: 62.22,
          averageWin: 325.50,
          averageLoss: -125.75,
          profitFactor: 2.59,
          totalPnL: 5850.00,
          averageHoldingPeriod: 3.2
        };
        this.checkLoadingComplete();
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
