import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  ApiResponse, 
  Trade, 
  Portfolio, 
  Holding, 
  MarketData, 
  MarketIndex, 
  TradingStatistics,
  PerformanceMetrics,
  TradeAnalysis,
  Order,
  Watchlist
} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {

  constructor() {}

  // Mock data generators
  private generateMockPortfolio(): Portfolio {
    return {
      totalValue: 125000,
      availableBalance: 15000,
      totalPnL: 15000,
      dailyPnL: 2500,
      holdings: [
        {
          symbol: 'AAPL',
          quantity: 100,
          averagePrice: 150,
          currentPrice: 175,
          totalValue: 17500,
          pnl: 2500,
          pnlPercentage: 16.67
        },
        {
          symbol: 'GOOGL',
          quantity: 50,
          averagePrice: 2800,
          currentPrice: 2950,
          totalValue: 147500,
          pnl: 7500,
          pnlPercentage: 5.36
        },
        {
          symbol: 'MSFT',
          quantity: 75,
          averagePrice: 300,
          currentPrice: 320,
          totalValue: 24000,
          pnl: 1500,
          pnlPercentage: 6.67
        }
      ]
    };
  }

  private generateMockMarketData(symbol: string): MarketData {
    const basePrice = Math.random() * 1000 + 100;
    const change = (Math.random() - 0.5) * 20;
    return {
      symbol,
      currentPrice: basePrice,
      openPrice: basePrice - change / 2,
      highPrice: basePrice + Math.random() * 10,
      lowPrice: basePrice - Math.random() * 10,
      previousClose: basePrice - change,
      change,
      changePercentage: (change / (basePrice - change)) * 100,
      volume: Math.floor(Math.random() * 10000000),
      averageVolume: Math.floor(Math.random() * 10000000),
      marketCap: basePrice * Math.floor(Math.random() * 1000000000),
      peRatio: Math.random() * 30 + 10,
      timestamp: Date.now()
    };
  }

  private generateMockMarketIndices(): MarketIndex[] {
    return [
      { name: 'S&P 500', value: 4500, change: 25, changePercent: 0.56 },
      { name: 'NASDAQ', value: 14000, change: -50, changePercent: -0.36 },
      { name: 'DOW JONES', value: 35000, change: 100, changePercent: 0.29 },
      { name: 'RUSSELL 2000', value: 2000, change: 15, changePercent: 0.75 }
    ];
  }

  private generateMockTradingStatistics(): TradingStatistics {
    return {
      totalTrades: 156,
      winRate: 62.8,
      profitFactor: 1.92,
      netProfit: 45000
    };
  }

  private generateMockPerformanceMetrics(): PerformanceMetrics {
    return {
      sharpeRatio: 1.45,
      maxDrawdown: -12.5,
      volatility: 18.3,
      beta: 1.1,
      alpha: 3.2,
      totalReturn: 28.5,
      annualizedReturn: 15.2
    };
  }

  // Authentication Methods
  login(credentials: { email: string; password: string }): Observable<ApiResponse<{ user: any; token: string }>> {
    console.log('Mock API login received:', credentials);
    if (credentials.email === 'vikash.tripathi@example.com' && credentials.password === 'password') {
      return of({
        status: 200,
        message: 'Login successful',
        data: {
          user: { id: '1', email: credentials.email, name: 'Test User' },
          token: 'mock-jwt-token'
        },
        path: '/auth/login'
      }).pipe(delay(1000));
    }
    return throwError(() => new Error('Invalid credentials'));
  }

  register(userData: any): Observable<ApiResponse<any>> {
    return of({
      status: 201,
      message: 'Registration successful',
      data: { id: '2', email: userData.email, name: userData.name },
      path: '/auth/register'
    }).pipe(delay(1000));
  }

  // Portfolio Methods
  getUserPortfolio(userId: string): Observable<ApiResponse<Portfolio>> {
    return of({
      status: 200,
      message: 'Portfolio retrieved successfully',
      data: this.generateMockPortfolio(),
      path: '/portfolios/user/' + userId
    }).pipe(delay(500));
  }

  // Market Data Methods
  getMarketData(symbol: string): Observable<ApiResponse<MarketData>> {
    return of({
      status: 200,
      message: 'Market data retrieved successfully',
      data: this.generateMockMarketData(symbol),
      path: '/market/data/' + symbol
    }).pipe(delay(300));
  }

  getMarketIndices(): Observable<ApiResponse<{ indices: MarketIndex[] }>> {
    return of({
      status: 200,
      message: 'Market indices retrieved successfully',
      data: { indices: this.generateMockMarketIndices() },
      path: '/market/indices'
    }).pipe(delay(300));
  }

  getTopGainers(limit: number = 10): Observable<ApiResponse<MarketData[]>> {
    const gainers = Array.from({ length: limit }, (_, i) => 
      this.generateMockMarketData(`GAINER${i + 1}`)
    ).map(stock => ({
      ...stock,
      change: Math.abs(stock.change),
      changePercentage: Math.abs(stock.changePercentage)
    }));
    
    return of({
      status: 200,
      message: 'Top gainers retrieved successfully',
      data: gainers,
      path: '/market/top-gainers'
    }).pipe(delay(400));
  }

  getTopLosers(limit: number = 10): Observable<ApiResponse<MarketData[]>> {
    const losers = Array.from({ length: limit }, (_, i) => 
      this.generateMockMarketData(`LOSER${i + 1}`)
    ).map(stock => ({
      ...stock,
      change: -Math.abs(stock.change),
      changePercentage: -Math.abs(stock.changePercentage)
    }));
    
    return of({
      status: 200,
      message: 'Top losers retrieved successfully',
      data: losers,
      path: '/market/top-losers'
    }).pipe(delay(400));
  }

  // Analytics Methods
  getTradingStatistics(userId: string, period: string): Observable<ApiResponse<TradingStatistics>> {
    return of({
      status: 200,
      message: 'Trading statistics retrieved successfully',
      data: this.generateMockTradingStatistics(),
      path: '/analytics/user/' + userId + '/statistics'
    }).pipe(delay(600));
  }

  getPerformanceMetrics(userId: string, period: string): Observable<ApiResponse<PerformanceMetrics>> {
    return of({
      status: 200,
      message: 'Performance metrics retrieved successfully',
      data: this.generateMockPerformanceMetrics(),
      path: '/analytics/user/' + userId + '/performance'
    }).pipe(delay(600));
  }

  getTradeAnalysis(userId: string, period: string): Observable<ApiResponse<TradeAnalysis>> {
    const analysis: TradeAnalysis = {
      bestTrade: { symbol: 'AAPL', pnl: 5000, percentage: 25 },
      worstTrade: { symbol: 'TSLA', pnl: -2000, percentage: -15 },
      symbolPerformance: [
        { symbol: 'AAPL', trades: 25, pnl: 8000 },
        { symbol: 'GOOGL', trades: 18, pnl: 4500 },
        { symbol: 'MSFT', trades: 22, pnl: 3200 }
      ],
      monthlyBreakdown: [
        { month: '2024-01', trades: 12, pnl: 2500 },
        { month: '2024-02', trades: 15, pnl: 3200 },
        { month: '2024-03', trades: 18, pnl: 4100 }
      ]
    };
    
    return of({
      status: 200,
      message: 'Trade analysis retrieved successfully',
      data: analysis,
      path: '/analytics/user/' + userId + '/trade-analysis'
    }).pipe(delay(800));
  }

  // Other methods can be added as needed
  logout(): Observable<ApiResponse<void>> {
    return of({
      status: 200,
      message: 'Logout successful',
      data: undefined,
      path: '/auth/logout'
    }).pipe(delay(500));
  }

  getProfile(): Observable<ApiResponse<any>> {
    return of({
      status: 200,
      message: 'Profile retrieved successfully',
      data: { id: '1', email: 'test@example.com', name: 'Test User' },
      path: '/auth/profile'
    }).pipe(delay(300));
  }
}
