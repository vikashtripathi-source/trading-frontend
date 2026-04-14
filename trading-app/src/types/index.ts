export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  address?: Address
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Portfolio {
  id: string
  userId: string
  totalValue: number
  availableBalance: number
  investedAmount: number
  dailyPnL: number
  dailyPnLPercentage: number
  totalPnL: number
  totalPnLPercentage: number
  holdings: Holding[]
  createdAt: string
  updatedAt: string
}

export interface Holding {
  id: string
  symbol: string
  companyName: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  pnl: number
  pnlPercentage: number
  sector?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  symbol: string
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'STOP_LIMIT'
  side: 'BUY' | 'SELL'
  quantity: number
  price?: number
  stopPrice?: number
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED'
  filledQuantity?: number
  averagePrice?: number
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface Trade {
  id: string
  orderId: string
  userId: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  commission: number
  createdAt: string
}

export interface MarketData {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  dayHigh: number
  dayLow: number
  week52High: number
  week52Low: number
  peRatio?: number
  dividend?: number
  sector?: string
  industry?: string
}

export interface MarketIndex {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
}

export interface TradingStatistics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  sharpeRatio?: number
  maxDrawdown?: number
  averageHoldingTime?: number
  period: string
}

export interface Watchlist {
  id: string
  userId: string
  name: string
  symbols: string[]
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
  }[]
}

export interface DataPoint {
  x: string | number
  y: number
  label?: string
}
