import { ApiResponse, User, LoginRequest, RegisterRequest, AuthResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class ApiService {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('jwt_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.data.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refreshToken)
        localStorage.setItem('user_data', JSON.stringify(response.data.user))
      }
    }

    return response
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.data.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', response.data.token)
        localStorage.setItem('refresh_token', response.data.refreshToken)
        localStorage.setItem('user_data', JSON.stringify(response.data.user))
      }
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } finally {
      this.token = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
      }
    }
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })

    if (response.data.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', response.data.token)
        localStorage.setItem('user_data', JSON.stringify(response.data.user))
      }
    }

    return response
  }

  // Portfolio
  async getUserPortfolio(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/portfolio/${userId}`)
  }

  // Orders
  async getUserOrders(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${userId}`)
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    })
  }

  // Market Data
  async getMarketIndices(): Promise<ApiResponse<any>> {
    return this.request('/market/indices')
  }

  async getTopGainers(limit: number = 5): Promise<ApiResponse<any>> {
    return this.request(`/market/gainers?limit=${limit}`)
  }

  async getTopLosers(limit: number = 5): Promise<ApiResponse<any>> {
    return this.request(`/market/losers?limit=${limit}`)
  }

  async getStockData(symbol: string): Promise<ApiResponse<any>> {
    return this.request(`/market/stock/${symbol}`)
  }

  async searchStocks(query: string): Promise<ApiResponse<any>> {
    return this.request(`/market/search?q=${encodeURIComponent(query)}`)
  }

  // Trading Statistics
  async getTradingStatistics(userId: string, period: string): Promise<ApiResponse<any>> {
    return this.request(`/analytics/statistics/${userId}?period=${period}`)
  }

  // Watchlist
  async getWatchlists(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/watchlist/${userId}`)
  }

  async createWatchlist(userId: string, name: string, symbols: string[]): Promise<ApiResponse<any>> {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ userId, name, symbols }),
    })
  }

  async updateWatchlist(watchlistId: string, symbols: string[]): Promise<ApiResponse<any>> {
    return this.request(`/watchlist/${watchlistId}`, {
      method: 'PUT',
      body: JSON.stringify({ symbols }),
    })
  }

  async deleteWatchlist(watchlistId: string): Promise<ApiResponse<any>> {
    return this.request(`/watchlist/${watchlistId}`, {
      method: 'DELETE',
    })
  }

  // Mock data methods for development
  async getMockPortfolio(): Promise<any> {
    return {
      code: 200,
      message: 'Success',
      data: {
        id: 'portfolio-1',
        userId: 'user-1',
        totalValue: 125000,
        availableBalance: 15000,
        investedAmount: 110000,
        dailyPnL: 2500,
        dailyPnLPercentage: 2.04,
        totalPnL: 15000,
        totalPnLPercentage: 13.64,
        holdings: [
          {
            id: 'holding-1',
            symbol: 'AAPL',
            companyName: 'Apple Inc.',
            quantity: 100,
            averagePrice: 150.00,
            currentPrice: 175.50,
            totalValue: 17550,
            pnl: 2550,
            pnlPercentage: 17.00,
            sector: 'Technology',
            createdAt: '2024-01-15',
            updatedAt: '2024-04-14'
          },
          {
            id: 'holding-2',
            symbol: 'GOOGL',
            companyName: 'Alphabet Inc.',
            quantity: 50,
            averagePrice: 2800.00,
            currentPrice: 2950.00,
            totalValue: 147500,
            pnl: 7500,
            pnlPercentage: 5.36,
            sector: 'Technology',
            createdAt: '2024-02-01',
            updatedAt: '2024-04-14'
          }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-04-14'
      }
    }
  }

  async getMockMarketIndices(): Promise<any> {
    return {
      code: 200,
      message: 'Success',
      data: {
        indices: [
          {
            name: 'S&P 500',
            symbol: 'SPX',
            value: 5123.45,
            change: 45.67,
            changePercent: 0.90
          },
          {
            name: 'NASDAQ',
            symbol: 'IXIC',
            value: 16234.56,
            change: 123.45,
            changePercent: 0.77
          },
          {
            name: 'DOW',
            symbol: 'DJI',
            value: 34567.89,
            change: -23.45,
            changePercent: -0.07
          }
        ]
      }
    }
  }

  async getMockTopGainers(): Promise<any> {
    return {
      code: 200,
      message: 'Success',
      data: [
        {
          symbol: 'NVDA',
          companyName: 'NVIDIA Corporation',
          currentPrice: 875.50,
          change: 45.25,
          changePercent: 5.46,
          volume: 45000000,
          marketCap: 2150000000000
        },
        {
          symbol: 'TSLA',
          companyName: 'Tesla Inc.',
          currentPrice: 185.75,
          change: 8.90,
          changePercent: 5.04,
          volume: 120000000,
          marketCap: 590000000000
        }
      ]
    }
  }

  async getMockTopLosers(): Promise<any> {
    return {
      code: 200,
      message: 'Success',
      data: [
        {
          symbol: 'META',
          companyName: 'Meta Platforms Inc.',
          currentPrice: 485.25,
          change: -12.50,
          changePercent: -2.51,
          volume: 25000000,
          marketCap: 1240000000000
        },
        {
          symbol: 'AMZN',
          companyName: 'Amazon.com Inc.',
          currentPrice: 175.80,
          change: -4.20,
          changePercent: -2.33,
          volume: 35000000,
          marketCap: 1820000000000
        }
      ]
    }
  }

  async getMockTradingStatistics(): Promise<any> {
    return {
      code: 200,
      message: 'Success',
      data: {
        totalTrades: 156,
        winningTrades: 98,
        losingTrades: 58,
        winRate: 62.82,
        totalPnL: 15000,
        averageWin: 285.50,
        averageLoss: -125.75,
        profitFactor: 2.27,
        sharpeRatio: 1.45,
        maxDrawdown: -8.5,
        averageHoldingTime: 14.5,
        period: '30d'
      }
    }
  }

  async getMockUserOrders(): Promise<any> {
    return {
      code: 200,
      message: 'Success',
      data: [
        {
          id: 'order-1',
          userId: 'user-1',
          symbol: 'AAPL',
          orderType: 'LIMIT',
          side: 'BUY',
          quantity: 50,
          price: 170.00,
          status: 'FILLED',
          filledQuantity: 50,
          averagePrice: 169.95,
          createdAt: '2024-04-14T10:30:00Z',
          updatedAt: '2024-04-14T10:32:00Z'
        },
        {
          id: 'order-2',
          userId: 'user-1',
          symbol: 'GOOGL',
          orderType: 'MARKET',
          side: 'SELL',
          quantity: 25,
          status: 'PENDING',
          createdAt: '2024-04-14T11:15:00Z',
          updatedAt: '2024-04-14T11:15:00Z'
        }
      ]
    }
  }
}

export const apiService = new ApiService()
export default apiService
