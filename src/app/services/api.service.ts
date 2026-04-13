import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { MockApiService } from './mock-api.service';

export interface ApiResponse<T> {
  code: number;
  message: string;
  timestamp: number;
  requestId: string;
  fieldsErrors: any[] | null;
  data: T;
  path: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  createdAt: string;
}

export interface CreateTradeRequest {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING';
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  totalValue: number;
  availableBalance: number;
  totalInvested: number;
  totalPnL: number;
  dailyPnL: number;
  lastUpdated: string;
  holdings: Holding[];
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopPrice: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED' | 'PARTIALLY_FILLED';
  createdAt: string;
}

export interface CreateOrderRequest {
  userId: string;
  symbol: string;
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopPrice: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  createdDate: string;
  lastUpdated: string;
  isDefault: boolean;
}

export interface CreateWatchlistRequest {
  userId: string;
  name: string;
  symbols: string[];
  isDefault: boolean;
}

export interface MarketData {
  symbol: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  change: number;
  changePercentage: number;
  volume: number;
  averageVolume: number;
  marketCap: number;
  peRatio: number;
  timestamp: number;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercentage: number;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface TradingStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  totalPnL: number;
  averageHoldingPeriod: number;
}

export interface PerformanceMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  alpha: number;
  totalReturn: number;
  annualizedReturn: number;
}

export interface TradeAnalysis {
  bestTrade: {
    symbol: string;
    pnl: number;
    percentage: number;
  };
  worstTrade: {
    symbol: string;
    pnl: number;
    percentage: number;
  };
  symbolPerformance: Array<{
    symbol: string;
    trades: number;
    pnl: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    trades: number;
    pnl: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:8081/api';
  private wsUrl = environment.wsUrl || 'ws://localhost:8081/ws';
  private useMockApi = environment.useMockApi;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private mockApiService: MockApiService
  ) {
    console.log('API Service initialized with:', {
      baseUrl: this.baseUrl,
      wsUrl: this.wsUrl,
      useMockApi: this.useMockApi
    });
  }

  private getHeaders(): HttpHeaders {
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwt_token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private getAuthHeaders(): HttpHeaders {
    let token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('jwt_token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Authentication Methods
  register(userData: any): Observable<ApiResponse<any>> {
    if (this.useMockApi) {
      return this.mockApiService.register(userData);
    }
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/register`, userData);
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<{ user: any; token: string }>> {
    console.log('API Service login called with:', credentials);
    console.log('useMockApi:', this.useMockApi);
    if (this.useMockApi) {
      console.log('Using mock API for login');
      return this.mockApiService.login(credentials);
    }
    console.log('Using real HTTP API for login');
    return this.http.post<ApiResponse<{ user: any; token: string }>>(`${this.baseUrl}/auth/login`, credentials);
  }

  logout(): Observable<ApiResponse<void>> {
    if (this.useMockApi) {
      return this.mockApiService.logout();
    }
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getProfile(): Observable<ApiResponse<any>> {
    if (this.useMockApi) {
      return this.mockApiService.getProfile();
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  // Trade API
  getAllTrades(): Observable<ApiResponse<Trade[]>> {
    return this.http.get<ApiResponse<Trade[]>>(`${this.baseUrl}/trades`, {
      headers: this.getHeaders()
    });
  }

  getTradeById(id: string): Observable<ApiResponse<Trade>> {
    return this.http.get<ApiResponse<Trade>>(`${this.baseUrl}/trades/${id}`, {
      headers: this.getHeaders()
    });
  }

  createTrade(trade: CreateTradeRequest): Observable<ApiResponse<Trade>> {
    return this.http.post<ApiResponse<Trade>>(`${this.baseUrl}/trades`, trade, {
      headers: this.getHeaders()
    });
  }

  updateTrade(id: string, trade: Partial<CreateTradeRequest>): Observable<ApiResponse<Trade>> {
    return this.http.put<ApiResponse<Trade>>(`${this.baseUrl}/trades/${id}`, trade, {
      headers: this.getHeaders()
    });
  }

  deleteTrade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/trades/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Portfolio API
  getUserPortfolio(userId: string): Observable<ApiResponse<Portfolio>> {
    if (this.useMockApi) {
      return this.mockApiService.getUserPortfolio(userId);
    }
    return this.http.get<ApiResponse<Portfolio>>(`${this.baseUrl}/portfolios/user/${userId}`, {
      headers: this.getHeaders()
    });
  }

  getPortfolioPerformance(userId: string, period: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/portfolios/user/${userId}/performance?period=${period}`, {
      headers: this.getHeaders()
    });
  }

  getPortfolioHoldings(userId: string): Observable<ApiResponse<Holding[]>> {
    return this.http.get<ApiResponse<Holding[]>>(`${this.baseUrl}/portfolios/user/${userId}/holdings`, {
      headers: this.getHeaders()
    });
  }

  // Order API
  createOrder(order: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.baseUrl}/orders`, order, {
      headers: this.getHeaders()
    });
  }

  getUserOrders(userId: string, status?: string): Observable<ApiResponse<Order[]>> {
    let url = `${this.baseUrl}/orders/user/${userId}`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<ApiResponse<Order[]>>(url, {
      headers: this.getHeaders()
    });
  }

  cancelOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}/cancel`, {}, {
      headers: this.getHeaders()
    });
  }

  // Watchlist API
  getUserWatchlists(userId: string): Observable<ApiResponse<Watchlist[]>> {
    return this.http.get<ApiResponse<Watchlist[]>>(`${this.baseUrl}/watchlists/user/${userId}`, {
      headers: this.getHeaders()
    });
  }

  createWatchlist(watchlist: CreateWatchlistRequest): Observable<ApiResponse<Watchlist>> {
    return this.http.post<ApiResponse<Watchlist>>(`${this.baseUrl}/watchlists`, watchlist, {
      headers: this.getHeaders()
    });
  }

  addSymbolToWatchlist(id: string, symbol: string): Observable<ApiResponse<Watchlist>> {
    return this.http.post<ApiResponse<Watchlist>>(`${this.baseUrl}/watchlists/${id}/symbols?symbol=${symbol}`, {}, {
      headers: this.getHeaders()
    });
  }

  removeSymbolFromWatchlist(id: string, symbol: string): Observable<ApiResponse<Watchlist>> {
    return this.http.delete<ApiResponse<Watchlist>>(`${this.baseUrl}/watchlists/${id}/symbols/${symbol}`, {
      headers: this.getHeaders()
    });
  }

  // Market Data API
  getMarketData(symbol: string): Observable<ApiResponse<MarketData>> {
    return this.http.get<ApiResponse<MarketData>>(`${this.baseUrl}/market/data/${symbol}`, {
      headers: this.getHeaders()
    });
  }

  getBatchMarketData(symbols: string[]): Observable<ApiResponse<MarketData[]>> {
    return this.http.get<ApiResponse<MarketData[]>>(`${this.baseUrl}/market/data/batch?symbols=${symbols.join(',')}`, {
      headers: this.getHeaders()
    });
  }

  getMarketIndices(): Observable<ApiResponse<{ indices: MarketIndex[] }>> {
    if (this.useMockApi) {
      return this.mockApiService.getMarketIndices();
    }
    return this.http.get<ApiResponse<{ indices: MarketIndex[] }>>(`${this.baseUrl}/market/indices`, {
      headers: this.getHeaders()
    });
  }

  getTopGainers(limit: number = 10): Observable<ApiResponse<MarketData[]>> {
    if (this.useMockApi) {
      return this.mockApiService.getTopGainers(limit);
    }
    return this.http.get<ApiResponse<MarketData[]>>(`${this.baseUrl}/market/top-gainers?limit=${limit}`, {
      headers: this.getHeaders()
    });
  }

  getTopLosers(limit: number = 10): Observable<ApiResponse<MarketData[]>> {
    if (this.useMockApi) {
      return this.mockApiService.getTopLosers(limit);
    }
    return this.http.get<ApiResponse<MarketData[]>>(`${this.baseUrl}/market/top-losers?limit=${limit}`, {
      headers: this.getHeaders()
    });
  }

  searchSymbols(query: string, limit: number = 10): Observable<ApiResponse<SymbolSearchResult[]>> {
    return this.http.get<ApiResponse<SymbolSearchResult[]>>(`${this.baseUrl}/market/search?query=${query}&limit=${limit}`, {
      headers: this.getHeaders()
    });
  }

  // Analytics API
  getTradingStatistics(userId: string, period: string): Observable<ApiResponse<TradingStatistics>> {
    if (this.useMockApi) {
      return this.mockApiService.getTradingStatistics(userId, period);
    }
    return this.http.get<ApiResponse<TradingStatistics>>(`${this.baseUrl}/analytics/user/${userId}/statistics?period=${period}`, {
      headers: this.getHeaders()
    });
  }

  getPerformanceMetrics(userId: string, period: string): Observable<ApiResponse<PerformanceMetrics>> {
    if (this.useMockApi) {
      return this.mockApiService.getPerformanceMetrics(userId, period);
    }
    return this.http.get<ApiResponse<PerformanceMetrics>>(`${this.baseUrl}/analytics/user/${userId}/performance?period=${period}`, {
      headers: this.getHeaders()
    });
  }

  getTradeAnalysis(userId: string, period: string): Observable<ApiResponse<TradeAnalysis>> {
    if (this.useMockApi) {
      return this.mockApiService.getTradeAnalysis(userId, period);
    }
    return this.http.get<ApiResponse<TradeAnalysis>>(`${this.baseUrl}/analytics/user/${userId}/trade-analysis?period=${period}`, {
      headers: this.getHeaders()
    });
  }

  // WebSocket connection
  getWebSocketUrl(): string {
    return this.wsUrl;
  }
}
