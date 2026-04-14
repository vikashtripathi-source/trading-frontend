'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, ColumnDef } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { PriceChangeBadge } from '@/components/ui/Badge'
import { apiService } from '@/services/api'
import { MarketData, MarketIndex } from '@/types'
import { formatCurrency, formatPercentage, getMarketStatusClass } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MarketPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [topGainers, setTopGainers] = useState<MarketData[]>([])
  const [topLosers, setTopLosers] = useState<MarketData[]>([])
  const [mostActive, setMostActive] = useState<MarketData[]>([])
  const [searchResults, setSearchResults] = useState<MarketData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'overview' | 'gainers' | 'losers' | 'active' | 'search'>('overview')

  useEffect(() => {
    loadMarketData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      searchStocks()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadMarketData = async () => {
    setIsLoading(true)
    
    try {
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

      // Mock most active stocks
      setMostActive([
        {
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          currentPrice: 175.50,
          change: 2.50,
          changePercent: 1.44,
          volume: 52000000,
          marketCap: 2700000000000,
          dayHigh: 178.00,
          dayLow: 174.20,
          week52High: 198.23,
          week52Low: 124.17,
          peRatio: 29.5,
          dividend: 0.96,
          sector: 'Technology',
          industry: 'Consumer Electronics',
        },
        {
          symbol: 'TSLA',
          companyName: 'Tesla Inc.',
          currentPrice: 185.75,
          change: -3.25,
          changePercent: -1.72,
          volume: 120000000,
          marketCap: 590000000000,
          dayHigh: 189.50,
          dayLow: 184.80,
          week52High: 299.29,
          week52Low: 152.37,
          peRatio: 71.2,
          dividend: 0,
          sector: 'Consumer Cyclical',
          industry: 'Auto Manufacturers',
        },
        {
          symbol: 'NVDA',
          companyName: 'NVIDIA Corporation',
          currentPrice: 875.50,
          change: 15.25,
          changePercent: 1.77,
          volume: 45000000,
          marketCap: 2150000000000,
          dayHigh: 880.00,
          dayLow: 865.20,
          week52High: 880.00,
          week52Low: 393.35,
          peRatio: 65.8,
          dividend: 0.16,
          sector: 'Technology',
          industry: 'Semiconductors',
        },
      ])
    } catch (error) {
      console.error('Market data loading error:', error)
      toast.error('Failed to load market data')
    } finally {
      setIsLoading(false)
    }
  }

  const searchStocks = async () => {
    if (!searchQuery.trim()) return

    try {
      // Mock search results
      const mockResults = [
        {
          symbol: 'AAPL',
          companyName: 'Apple Inc.',
          currentPrice: 175.50,
          change: 2.50,
          changePercent: 1.44,
          volume: 52000000,
          marketCap: 2700000000000,
          dayHigh: 178.00,
          dayLow: 174.20,
          week52High: 198.23,
          week52Low: 124.17,
          peRatio: 29.5,
          dividend: 0.96,
          sector: 'Technology',
          industry: 'Consumer Electronics',
        },
        {
          symbol: 'GOOGL',
          companyName: 'Alphabet Inc.',
          currentPrice: 2950.00,
          change: 45.25,
          changePercent: 1.56,
          volume: 25000000,
          marketCap: 1820000000000,
          dayHigh: 2980.00,
          dayLow: 2925.50,
          week52High: 2985.00,
          week52Low: 2125.00,
          peRatio: 25.8,
          dividend: 0,
          sector: 'Technology',
          industry: 'Internet Content & Information',
        },
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setSearchResults(mockResults)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to search stocks')
    }
  }

  const stockColumns: ColumnDef<MarketData>[] = [
    {
      id: 'symbol',
      header: 'Symbol',
      className: 'font-medium',
    },
    {
      id: 'companyName',
      header: 'Company Name',
    },
    {
      id: 'currentPrice',
      header: 'Price',
      accessor: (row) => formatCurrency(row.currentPrice),
    },
    {
      id: 'change',
      header: 'Change',
      accessor: (row) => (
        <span className={getMarketStatusClass(row.change)}>
          {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'changePercent',
      header: 'Change %',
      accessor: (row) => <PriceChangeBadge change={row.changePercent} />,
    },
    {
      id: 'volume',
      header: 'Volume',
      accessor: (row) => row.volume.toLocaleString(),
    },
    {
      id: 'marketCap',
      header: 'Market Cap',
      accessor: (row) => {
        if (row.marketCap >= 1e12) return `$${(row.marketCap / 1e12).toFixed(1)}T`
        if (row.marketCap >= 1e9) return `$${(row.marketCap / 1e9).toFixed(1)}B`
        if (row.marketCap >= 1e6) return `$${(row.marketCap / 1e6).toFixed(1)}M`
        return formatCurrency(row.marketCap)
      },
    },
    {
      id: 'sector',
      header: 'Sector',
      accessor: (row) => row.sector || 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/market/${row.symbol}`)}
          >
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/trading?symbol=${row.symbol}&side=BUY`)}
          >
            Trade
          </Button>
        </div>
      ),
    },
  ]

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'gainers':
        return topGainers
      case 'losers':
        return topLosers
      case 'active':
        return mostActive
      case 'search':
        return searchResults
      default:
        return []
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Market Data
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/screener')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Stock Screener
              </Button>
              <Button onClick={() => router.push('/watchlist')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Watchlist
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Overview */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Market Indices */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Market Indices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {marketIndices.map((index) => (
                    <div key={index.symbol} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {index.name}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {index.symbol}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {index.value.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${getMarketStatusClass(index.change)}`}>
                            {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                          </span>
                          <span className={`text-sm font-medium ${getMarketStatusClass(index.change)}`}>
                            ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Gainers
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTab('gainers')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {topGainers.slice(0, 5).map((stock) => (
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Losers
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTab('losers')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {topLosers.slice(0, 5).map((stock) => (
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Most Active
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTab('active')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {mostActive.slice(0, 5).map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {stock.volume.toLocaleString()} shares
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
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('gainers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'gainers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setSelectedTab('losers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'losers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Top Losers
              </button>
              <button
                onClick={() => setSelectedTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'active'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Most Active
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <Input
              placeholder="Search stocks by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            {searchQuery && (
              <button
                onClick={() => setSelectedTab('search')}
                className="mt-2 text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Search Results ({searchResults.length})
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {(selectedTab !== 'overview' || searchQuery) && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {selectedTab === 'gainers' && 'Top Gainers'}
                {selectedTab === 'losers' && 'Top Losers'}
                {selectedTab === 'active' && 'Most Active Stocks'}
                {selectedTab === 'search' && 'Search Results'}
              </h3>
              <Table
                data={getCurrentData()}
                columns={stockColumns}
                onRowClick={(stock) => router.push(`/market/${stock.symbol}`)}
                emptyMessage="No stocks found"
              />
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
