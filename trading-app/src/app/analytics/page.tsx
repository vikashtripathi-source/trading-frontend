'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, ColumnDef } from '@/components/ui/Table'
import PortfolioChart from '@/components/charts/PortfolioChart'
import { apiService } from '@/services/api'
import { TradingStatistics } from '@/types'
import { 
  formatCurrency, 
  formatPercentage, 
  getProfitLossClass, 
  getProfitLossBgClass,
  downloadCSV 
} from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tradingStats, setTradingStats] = useState<TradingStatistics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedReport, setSelectedReport] = useState<'performance' | 'risk' | 'tax'>('performance')

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    
    try {
      const response = await apiService.getMockTradingStatistics()
      if (response.code === 200) {
        setTradingStats(response.data)
      }
    } catch (error) {
      console.error('Analytics data loading error:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePerformanceReport = () => {
    if (!tradingStats) return

    const reportData = {
      Period: selectedPeriod,
      'Total Trades': tradingStats.totalTrades,
      'Winning Trades': tradingStats.winningTrades,
      'Losing Trades': tradingStats.losingTrades,
      'Win Rate': `${tradingStats.winRate.toFixed(2)}%`,
      'Total P&L': formatCurrency(tradingStats.totalPnL),
      'Average Win': formatCurrency(tradingStats.averageWin),
      'Average Loss': formatCurrency(tradingStats.averageLoss),
      'Profit Factor': tradingStats.profitFactor.toFixed(2),
      'Sharpe Ratio': tradingStats.sharpeRatio?.toFixed(2) || 'N/A',
      'Max Drawdown': `${tradingStats.maxDrawdown?.toFixed(2)}%` || 'N/A',
      'Avg Holding Time': `${tradingStats.averageHoldingTime?.toFixed(1)} days` || 'N/A',
    }

    const csvData = [reportData]
    downloadCSV(csvData, `performance_report_${selectedPeriod}.csv`)
    toast.success('Performance report generated successfully')
  }

  const generateTaxReport = () => {
    if (!tradingStats) return

    // Mock tax report data
    const taxData = [
      {
        'Trade Date': '2024-01-15',
        Symbol: 'AAPL',
        'Action': 'SELL',
        Quantity: 50,
        'Proceeds': '$8,775.00',
        'Cost Basis': '$7,500.00',
        'Gain/Loss': '$1,275.00',
        'Term': 'Long Term',
        'Tax Rate': '15%',
        'Tax Amount': '$191.25',
      },
      {
        'Trade Date': '2024-02-20',
        Symbol: 'TSLA',
        'Action': 'SELL',
        Quantity: 25,
        'Proceeds': '$4,643.75',
        'Cost Basis': '$5,125.00',
        'Gain/Loss': '-$481.25',
        'Term': 'Short Term',
        'Tax Rate': '0%',
        'Tax Amount': '$0.00',
      },
      {
        'Trade Date': '2024-03-10',
        Symbol: 'GOOGL',
        'Action': 'SELL',
        Quantity: 10,
        'Proceeds': '$29,500.00',
        'Cost Basis': '$28,000.00',
        'Gain/Loss': '$1,500.00',
        'Term': 'Short Term',
        'Tax Rate': '35%',
        'Tax Amount': '$525.00',
      },
    ]

    downloadCSV(taxData, `tax_report_${selectedPeriod}.csv`)
    toast.success('Tax report generated successfully')
  }

  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [2500, 3200, 2800, 4500],
  }

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

  if (!tradingStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load analytics data. Please try again later.
          </p>
          <Button onClick={loadAnalyticsData} className="mt-4">
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
                Analytics & Insights
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
                  <p className={`text-2xl font-bold ${getProfitLossClass(tradingStats.totalPnL)}`}>
                    {formatCurrency(tradingStats.totalPnL)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getProfitLossBgClass(tradingStats.totalPnL)}`}>
                  <svg className={`w-6 h-6 ${getProfitLossClass(tradingStats.totalPnL)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tradingStats.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-success-100 dark:bg-success-900 rounded-full">
                  <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tradingStats.totalTrades}
                  </p>
                </div>
                <div className="p-3 bg-info-100 dark:bg-info-900 rounded-full">
                  <svg className="w-6 h-6 text-info-600 dark:text-info-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profit Factor</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tradingStats.profitFactor.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-full">
                  <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-8">
          <div className="p-6">
            <PortfolioChart
              data={performanceData}
              height={350}
              timeRange={selectedPeriod}
            />
          </div>
        </Card>

        {/* Report Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedReport('performance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedReport === 'performance'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Performance Report
              </button>
              <button
                onClick={() => setSelectedReport('risk')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedReport === 'risk'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Risk Analysis
              </button>
              <button
                onClick={() => setSelectedReport('tax')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedReport === 'tax'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Tax Report
              </button>
            </nav>
          </div>
        </div>

        {/* Performance Report */}
        {selectedReport === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Trading Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Total Trades</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tradingStats.totalTrades}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Winning Trades</span>
                      <span className="font-medium text-success-600">{tradingStats.winningTrades}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Losing Trades</span>
                      <span className="font-medium text-danger-600">{tradingStats.losingTrades}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tradingStats.winRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Average Win</span>
                      <span className="font-medium text-success-600">{formatCurrency(tradingStats.averageWin)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400">Average Loss</span>
                      <span className="font-medium text-danger-600">{formatCurrency(tradingStats.averageLoss)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Risk Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tradingStats.sharpeRatio?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                      <span className="font-medium text-danger-600">
                        {tradingStats.maxDrawdown ? `${tradingStats.maxDrawdown.toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Profit Factor</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tradingStats.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 dark:text-gray-400">Avg Holding Time</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tradingStats.averageHoldingTime ? `${tradingStats.averageHoldingTime.toFixed(1)} days` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance Breakdown
                  </h3>
                  <Button onClick={generatePerformanceReport}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full mb-4">
                      <span className="text-2xl font-bold text-success-600 dark:text-success-400">
                        {tradingStats.winningTrades}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Winning Trades</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avg: {formatCurrency(tradingStats.averageWin)}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 dark:bg-danger-900 rounded-full mb-4">
                      <span className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                        {tradingStats.losingTrades}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Losing Trades</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avg: {formatCurrency(tradingStats.averageLoss)}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {tradingStats.winRate.toFixed(0)}%
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Win Rate</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tradingStats.totalTrades} total trades
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Risk Analysis */}
        {selectedReport === 'risk' && (
          <div className="space-y-8">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Risk Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Volatility Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Daily Volatility</span>
                        <span className="font-medium text-gray-900 dark:text-white">2.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Weekly Volatility</span>
                        <span className="font-medium text-gray-900 dark:text-white">5.8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Volatility</span>
                        <span className="font-medium text-gray-900 dark:text-white">12.3%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Risk Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Value at Risk (95%)</span>
                        <span className="font-medium text-danger-600">-$2,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Expected Shortfall</span>
                        <span className="font-medium text-danger-600">-$3,200</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Beta Coefficient</span>
                        <span className="font-medium text-gray-900 dark:text-white">1.15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Portfolio Risk Breakdown
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Technology</span>
                      <span className="font-medium text-gray-900 dark:text-white">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Healthcare</span>
                      <span className="font-medium text-gray-900 dark:text-white">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-success-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Finance</span>
                      <span className="font-medium text-gray-900 dark:text-white">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-warning-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Energy</span>
                      <span className="font-medium text-gray-900 dark:text-white">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-danger-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tax Report */}
        {selectedReport === 'tax' && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tax Summary
                </h3>
                <Button onClick={generateTaxReport}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Tax Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full mb-4">
                    <span className="text-2xl font-bold text-success-600 dark:text-success-400">
                      $2,775
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Total Gains</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Realized profits</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 dark:bg-danger-900 rounded-full mb-4">
                    <span className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                      $481
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Total Losses</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Realized losses</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      $716
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tax Liability</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimated tax amount</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Tax Implications by Term</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Short Term (&lt; 1 year)</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Gains</span>
                        <span className="font-medium text-success-600">$1,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Losses</span>
                        <span className="font-medium text-danger-600">-$481</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Net</span>
                        <span className="font-medium text-gray-900 dark:text-white">$1,019</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Tax Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">35%</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">Tax Amount</span>
                        <span className="font-medium text-primary-600">$357</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Long Term (&gt; 1 year)</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Gains</span>
                        <span className="font-medium text-success-600">$1,275</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Losses</span>
                        <span className="font-medium text-gray-900 dark:text-white">$0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Net</span>
                        <span className="font-medium text-gray-900 dark:text-white">$1,275</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Tax Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">15%</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">Tax Amount</span>
                        <span className="font-medium text-primary-600">$191</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
