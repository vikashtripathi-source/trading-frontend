'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, ColumnDef } from '@/components/ui/Table'
import { StatusBadge, PriceChangeBadge } from '@/components/ui/Badge'
import PortfolioChart from '@/components/charts/PortfolioChart'
import AssetAllocationChart from '@/components/charts/AssetAllocationChart'
import { apiService } from '@/services/api'
import { 
  Portfolio, 
  MarketIndex, 
  MarketData, 
  TradingStatistics, 
  Order, 
  Holding 
} from '@/types'
import { 
  formatCurrency, 
  formatPercentage, 
  getProfitLossClass, 
  getMarketStatusClass 
} from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [topGainers, setTopGainers] = useState<MarketData[]>([])
  const [topLosers, setTopLosers] = useState<MarketData[]>([])
  const [tradingStats, setTradingStats] = useState<TradingStatistics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'])
  const [newWatchlistSymbol, setNewWatchlistSymbol] = useState('')

  // Quick trade form
  const [quickTradeForm, setQuickTradeForm] = useState({
    symbol: '',
    quantity: 1,
    orderType: 'MARKET' as 'MARKET' | 'LIMIT',
    side: 'BUY' as 'BUY' | 'SELL',
    price: 0,
  })

  useEffect(() => {
    loadDashboardData()
    initializeRealTimeData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    
    try {
      // Load portfolio data
      const portfolioResponse = await apiService.getMockPortfolio()
      if (portfolioResponse.code === 200) {
        setPortfolio(portfolioResponse.data)
      }

      // Load market indices
      const indicesResponse = await apiService.getMockMarketIndices()
      if (indicesResponse.code === 200) {
        setMarketIndices(indicesResponse.data.indices)
      }

      // Load top gainers
      const gainersResponse = await apiService.getMockTopGainers()
      if (gainersResponse.code === 200) {
        setTopGainers(gainersResponse.data)
      }

      // Load top losers
      const losersResponse = await apiService.getMockTopLosers()
      if (losersResponse.code === 200) {
        setTopLosers(losersResponse.data)
      }

      // Load trading statistics
      const statsResponse = await apiService.getMockTradingStatistics()
      if (statsResponse.code === 200) {
        setTradingStats(statsResponse.data)
      }

      // Load recent orders
      const ordersResponse = await apiService.getMockUserOrders()
      if (ordersResponse.code === 200) {
        setRecentOrders(ordersResponse.data)
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeRealTimeData = () => {
    // Simulate real-time updates (in real app, this would use WebSocket)
    const interval = setInterval(() => {
      if (portfolio && marketIndices.length > 0) {
        updateRealTimePrices()
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }

  const updateRealTimePrices = () => {
    // Simulate price updates for portfolio holdings
    if (portfolio && portfolio.holdings) {
      setPortfolio(prev => {
        if (!prev) return prev
        return {
          ...prev,
          holdings: prev.holdings.map(holding => {
            const changePercent = (Math.random() - 0.5) * 2 // Random change between -1% and +1%
            const newCurrentPrice = holding.averagePrice * (1 + changePercent / 100)
            return {
              ...holding,
              currentPrice: newCurrentPrice,
              pnl: (newCurrentPrice - holding.averagePrice) * holding.quantity,
              pnlPercentage: changePercent,
            }
          }),
          totalValue: prev.holdings.reduce((total, holding) => 
            total + (holding.averagePrice * (1 + (Math.random() - 0.5) * 0.02)) * holding.quantity, 0
          ),
        }
      })
    }
  }

  // Quick trade functionality
  const executeQuickTrade = async () => {
    if (!quickTradeForm.symbol || quickTradeForm.quantity <= 0) {
      toast.error('Please enter symbol and quantity')
      return
    }

    const order = {
      userId: 'current-user',
      symbol: quickTradeForm.symbol.toUpperCase(),
      orderType: quickTradeForm.orderType,
      side: quickTradeForm.side,
      quantity: quickTradeForm.quantity,
      price: quickTradeForm.price || 0,
      stopPrice: 0,
      status: 'PENDING' as const,
    }

    try {
      await apiService.createOrder(order)
      toast.success('Order placed successfully!')
      resetQuickTradeForm()
      loadDashboardData() // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order')
    }
  }

  const resetQuickTradeForm = () => {
    setQuickTradeForm({
      symbol: '',
      quantity: 1,
      orderType: 'MARKET',
      side: 'BUY',
      price: 0,
    })
  }

  // Watchlist functionality
  const addToWatchlist = () => {
    if (newWatchlistSymbol && !watchlist.includes(newWatchlistSymbol.toUpperCase())) {
      setWatchlist([...watchlist, newWatchlistSymbol.toUpperCase()])
      setNewWatchlistSymbol('')
      toast.success('Added to watchlist')
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol))
    toast.success('Removed from watchlist')
  }

  // Navigation
  const navigateTo = (path: string) => {
    router.push(path)
  }

  // Table columns
  const holdingsColumns: ColumnDef<Holding>[] = [
    {
      id: 'symbol',
      header: 'Symbol',
      className: 'font-medium',
    },
    {
      id: 'companyName',
      header: 'Company',
    },
    {
      id: 'quantity',
      header: 'Shares',
    },
    {
      id: 'currentPrice',
      header: 'Price',
      accessor: (row) => formatCurrency(row.currentPrice),
    },
    {
      id: 'totalValue',
      header: 'Value',
      accessor: (row) => formatCurrency(row.totalValue),
    },
    {
      id: 'pnl',
      header: 'P&L',
      accessor: (row) => (
        <span className={getProfitLossClass(row.pnl)}>
          {formatCurrency(row.pnl)}
        </span>
      ),
    },
    {
      id: 'pnlPercentage',
      header: 'P&L %',
      accessor: (row) => (
        <span className={getProfitLossClass(row.pnlPercentage)}>
          {formatPercentage(row.pnlPercentage)}
        </span>
      ),
    },
  ]

  const ordersColumns: ColumnDef<Order>[] = [
    {
      id: 'symbol',
      header: 'Symbol',
      className: 'font-medium',
    },
    {
      id: 'side',
      header: 'Side',
      accessor: (row) => (
        <Badge variant={row.side === 'BUY' ? 'success' : 'danger'} size="sm">
          {row.side}
        </Badge>
      ),
    },
    {
      id: 'orderType',
      header: 'Type',
    },
    {
      id: 'quantity',
      header: 'Qty',
    },
    {
      id: 'price',
      header: 'Price',
      accessor: (row) => row.price ? formatCurrency(row.price) : 'Market',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => loadDashboardData()}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              <Button onClick={() => router.push('/trading')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Quick Trade
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {portfolio ? formatCurrency(portfolio.totalValue) : '$0'}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily P&L</p>
                  <p className={`text-2xl font-bold ${portfolio ? getProfitLossClass(portfolio.dailyPnL) : ''}`}>
                    {portfolio ? formatCurrency(portfolio.dailyPnL) : '$0'}
                  </p>
                  <p className={`text-sm ${portfolio ? getProfitLossClass(portfolio.dailyPnL) : ''}`}>
                    {portfolio ? formatPercentage(portfolio.dailyPnLPercentage) : '0%'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${portfolio ? (portfolio.dailyPnL >= 0 ? 'bg-success-100 dark:bg-success-900' : 'bg-danger-100 dark:bg-danger-900') : ''}`}>
                  <svg className={`w-6 h-6 ${portfolio ? (portfolio.dailyPnL >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400') : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {portfolio ? formatCurrency(portfolio.availableBalance) : '$0'}
                  </p>
                </div>
                <div className="p-3 bg-info-100 dark:bg-info-900 rounded-full">
                  <svg className="w-6 h-6 text-info-600 dark:text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {portfolio ? formatCurrency(portfolio.investedAmount) : '$0'}
                  </p>
                </div>
                <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-full">
                  <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => navigateTo('/trading')} className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buy/Sell
              </Button>
              <Button variant="outline" onClick={() => navigateTo('/portfolio')} className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Transfer
              </Button>
              <Button variant="outline" onClick={() => navigateTo('/watchlist')} className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Watchlist
              </Button>
              <Button variant="outline" onClick={() => navigateTo('/analytics')} className="w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </Button>
            </div>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <PortfolioChart
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    values: [110000, 115000, 112000, 118000, 122000, 125000],
                  }}
                  height={300}
                />
              </div>
            </Card>
          </div>
          <div>
            <Card>
              <div className="p-6">
                <AssetAllocationChart
                  data={{
                    sectors: ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'],
                    values: [45000, 25000, 20000, 15000, 20000],
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'],
                  }}
                  height={300}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Market Indices
              </h3>
              <div className="space-y-3">
                {marketIndices.map((index) => (
                  <div key={index.symbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {index.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {index.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {index.value.toLocaleString()}
                      </p>
                      <p className={`text-sm ${getMarketStatusClass(index.change)}`}>
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Gainers
              </h3>
              <div className="space-y-3">
                {topGainers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {stock.symbol}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stock.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${stock.currentPrice.toFixed(2)}
                      </p>
                      <PriceChangeBadge change={stock.changePercent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Losers
              </h3>
              <div className="space-y-3">
                {topLosers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {stock.symbol}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stock.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${stock.currentPrice.toFixed(2)}
                      </p>
                      <PriceChangeBadge change={stock.changePercent} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Holdings and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Holdings
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateTo('/portfolio')}>
                  View All
                </Button>
              </div>
              {portfolio && (
                <Table
                  data={portfolio.holdings.slice(0, 5)}
                  columns={holdingsColumns}
                  onRowClick={(holding) => navigateTo(`/market/${holding.symbol}`)}
                />
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Orders
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigateTo('/orders')}>
                  View All
                </Button>
              </div>
              <Table
                data={recentOrders}
                columns={ordersColumns}
                onRowClick={(order) => navigateTo(`/orders/${order.id}`)}
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
