'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, ColumnDef } from '@/components/ui/Table'
import { StatusBadge, PriceChangeBadge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import PortfolioChart from '@/components/charts/PortfolioChart'
import AssetAllocationChart from '@/components/charts/AssetAllocationChart'
import { apiService } from '@/services/api'
import { Portfolio, Holding } from '@/types'
import { 
  formatCurrency, 
  formatPercentage, 
  getProfitLossClass, 
  getProfitLossBgClass,
  downloadCSV 
} from '@/lib/utils'
import toast from 'react-hot-toast'

export default function PortfolioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [filteredHoldings, setFilteredHoldings] = useState<Holding[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [sortBy, setSortBy] = useState<keyof Holding>('symbol')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [timeRange, setTimeRange] = useState('1M')

  useEffect(() => {
    loadPortfolioData()
  }, [])

  useEffect(() => {
    filterAndSortHoldings()
  }, [portfolio, searchTerm, selectedSector, sortBy, sortDirection])

  const loadPortfolioData = async () => {
    setIsLoading(true)
    
    try {
      const response = await apiService.getMockPortfolio()
      if (response.code === 200) {
        setPortfolio(response.data)
      }
    } catch (error) {
      console.error('Portfolio data loading error:', error)
      toast.error('Failed to load portfolio data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortHoldings = () => {
    if (!portfolio) return

    let filtered = [...portfolio.holdings]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(holding =>
        holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by sector
    if (selectedSector !== 'all') {
      filtered = filtered.filter(holding => holding.sector === selectedSector)
    }

    // Sort holdings
    filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    setFilteredHoldings(filtered)
  }

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortBy(column as keyof Holding)
    setSortDirection(direction)
  }

  const exportToCSV = () => {
    if (!portfolio) return
    
    const csvData = portfolio.holdings.map(holding => ({
      Symbol: holding.symbol,
      Company: holding.companyName,
      Quantity: holding.quantity,
      'Average Price': holding.averagePrice.toFixed(2),
      'Current Price': holding.currentPrice.toFixed(2),
      'Total Value': holding.totalValue.toFixed(2),
      'P&L': holding.pnl.toFixed(2),
      'P&L %': `${holding.pnlPercentage.toFixed(2)}%`,
      Sector: holding.sector || 'N/A',
    }))
    
    downloadCSV(csvData, 'portfolio_holdings.csv')
    toast.success('Portfolio exported successfully')
  }

  const getSectorOptions = () => {
    if (!portfolio) return []
    const sectors = [...new Set(portfolio.holdings.map(h => h.sector).filter(Boolean))]
    return sectors
  }

  const holdingsColumns: ColumnDef<Holding>[] = [
    {
      id: 'symbol',
      header: 'Symbol',
      className: 'font-medium',
      sortable: true,
    },
    {
      id: 'companyName',
      header: 'Company Name',
      sortable: true,
    },
    {
      id: 'sector',
      header: 'Sector',
      accessor: (row) => row.sector || 'N/A',
      sortable: true,
    },
    {
      id: 'quantity',
      header: 'Quantity',
      sortable: true,
    },
    {
      id: 'averagePrice',
      header: 'Avg Price',
      accessor: (row) => formatCurrency(row.averagePrice),
      sortable: true,
    },
    {
      id: 'currentPrice',
      header: 'Current Price',
      accessor: (row) => formatCurrency(row.currentPrice),
      sortable: true,
    },
    {
      id: 'totalValue',
      header: 'Total Value',
      accessor: (row) => formatCurrency(row.totalValue),
      sortable: true,
    },
    {
      id: 'pnl',
      header: 'P&L',
      accessor: (row) => (
        <span className={getProfitLossClass(row.pnl)}>
          {formatCurrency(row.pnl)}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'pnlPercentage',
      header: 'P&L %',
      accessor: (row) => (
        <span className={getProfitLossClass(row.pnlPercentage)}>
          {formatPercentage(row.pnlPercentage)}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/trading?symbol=${row.symbol}&side=BUY`)}
          >
            Buy More
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/trading?symbol=${row.symbol}&side=SELL`)}
          >
            Sell
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/market/${row.symbol}`)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load portfolio data. Please try again later.
          </p>
          <Button onClick={loadPortfolioData} className="mt-4">
            Retry
          </Button>
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
                Portfolio Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={exportToCSV}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </Button>
              <Button onClick={() => router.push('/trading')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Trade
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.totalValue)}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
                  <p className={`text-2xl font-bold ${getProfitLossClass(portfolio.totalPnL)}`}>
                    {formatCurrency(portfolio.totalPnL)}
                  </p>
                  <p className={`text-sm ${getProfitLossClass(portfolio.totalPnL)}`}>
                    {formatPercentage(portfolio.totalPnLPercentage)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getProfitLossBgClass(portfolio.totalPnL)}`}>
                  <svg className={`w-6 h-6 ${getProfitLossClass(portfolio.totalPnL)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Holdings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {portfolio.holdings.length}
                  </p>
                </div>
                <div className="p-3 bg-info-100 dark:bg-info-900 rounded-full">
                  <svg className="w-6 h-6 text-info-600 dark:text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Cash</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.availableBalance)}
                  </p>
                </div>
                <div className="p-3 bg-success-100 dark:bg-success-900 rounded-full">
                  <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <PortfolioChart
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    values: [110000, 115000, 112000, 118000, 122000, portfolio.totalValue],
                  }}
                  height={350}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
              </div>
            </Card>
          </div>
          <div>
            <Card>
              <div className="p-6">
                <AssetAllocationChart
                  data={{
                    sectors: getSectorOptions().length > 0 ? getSectorOptions() : ['Technology', 'Healthcare', 'Finance'],
                    values: getSectorOptions().length > 0 
                      ? getSectorOptions().map(sector => 
                          portfolio.holdings
                            .filter(h => h.sector === sector)
                            .reduce((sum, h) => sum + h.totalValue, 0)
                        )
                      : [45000, 25000, 20000],
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'],
                  }}
                  height={350}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Holdings Table */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Holdings ({filteredHoldings.length})
              </h3>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder="Search holdings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="all">All Sectors</option>
                  {getSectorOptions().map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
            </div>

            <Table
              data={filteredHoldings}
              columns={holdingsColumns}
              sorting={{
                column: sortBy,
                direction: sortDirection,
                onSort: handleSort,
              }}
              onRowClick={(holding) => router.push(`/market/${holding.symbol}`)}
              emptyMessage="No holdings found matching your criteria"
            />
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <Card>
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Best Performer
              </h4>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {portfolio.holdings.reduce((best, current) => 
                    current.pnlPercentage > best.pnlPercentage ? current : best
                  ).symbol}
                </p>
                <p className={`text-sm ${getProfitLossClass(
                  portfolio.holdings.reduce((best, current) => 
                    current.pnlPercentage > best.pnlPercentage ? current : best
                  ).pnlPercentage
                )}`}>
                  {formatPercentage(
                    portfolio.holdings.reduce((best, current) => 
                      current.pnlPercentage > best.pnlPercentage ? current : best
                    ).pnlPercentage
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Worst Performer
              </h4>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {portfolio.holdings.reduce((worst, current) => 
                    current.pnlPercentage < worst.pnlPercentage ? current : worst
                  ).symbol}
                </p>
                <p className={`text-sm ${getProfitLossClass(
                  portfolio.holdings.reduce((worst, current) => 
                    current.pnlPercentage < worst.pnlPercentage ? current : worst
                  ).pnlPercentage
                )}`}>
                  {formatPercentage(
                    portfolio.holdings.reduce((worst, current) => 
                      current.pnlPercentage < worst.pnlPercentage ? current : worst
                    ).pnlPercentage
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Largest Position
              </h4>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {portfolio.holdings.reduce((largest, current) => 
                    current.totalValue > largest.totalValue ? current : largest
                  ).symbol}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(
                    portfolio.holdings.reduce((largest, current) => 
                      current.totalValue > largest.totalValue ? current : largest
                    ).totalValue
                  )}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Most Diversified Sector
              </h4>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getSectorOptions().length > 0 ? (() => {
                    const sectorCounts = getSectorOptions().map(sector => ({
                      sector,
                      count: portfolio.holdings.filter(h => h.sector === sector).length
                    }))
                    return sectorCounts.reduce((most, current) => 
                      current.count > most.count ? current : most
                    ).sector
                  })() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getSectorOptions().length > 0 ? (() => {
                    const sectorCounts = getSectorOptions().map(sector => ({
                      sector,
                      count: portfolio.holdings.filter(h => h.sector === sector).length
                    }))
                    return `${sectorCounts.reduce((most, current) => 
                      current.count > most.count ? current : most
                    ).count} positions`
                  })() : 'No sectors'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
