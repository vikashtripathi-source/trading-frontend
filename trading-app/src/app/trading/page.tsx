'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, ColumnDef } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { apiService } from '@/services/api'
import { Order, MarketData } from '@/types'
import { formatCurrency, formatPercentage, getProfitLossClass } from '@/lib/utils'
import toast from 'react-hot-toast'

const orderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT']),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().optional(),
  stopPrice: z.number().optional(),
}).refine((data) => {
  if (data.orderType === 'LIMIT' && !data.price) {
    return false
  }
  if ((data.orderType === 'STOP_LOSS' || data.orderType === 'STOP_LIMIT') && !data.stopPrice) {
    return false
  }
  return true
}, {
  message: 'Price is required for limit orders, stop price is required for stop orders',
  path: ['price'],
})

type OrderFormData = z.infer<typeof orderSchema>

export default function TradingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [openOrders, setOpenOrders] = useState<Order[]>([])
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [selectedTab, setSelectedTab] = useState<'place-order' | 'open-orders' | 'order-history'>('place-order')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      symbol: searchParams.get('symbol') || '',
      side: (searchParams.get('side') as 'BUY' | 'SELL') || 'BUY',
      orderType: 'MARKET',
      quantity: 1,
    },
  })

  const watchedSymbol = watch('symbol')
  const watchedSide = watch('side')
  const watchedOrderType = watch('orderType')
  const watchedQuantity = watch('quantity')
  const watchedPrice = watch('price')

  useEffect(() => {
    // Set initial values from URL params
    const symbol = searchParams.get('symbol')
    const side = searchParams.get('side')
    if (symbol) setValue('symbol', symbol)
    if (side) setValue('side', side as 'BUY' | 'SELL')
  }, [searchParams, setValue])

  useEffect(() => {
    if (watchedSymbol) {
      fetchStockData(watchedSymbol)
    }
  }, [watchedSymbol])

  useEffect(() => {
    calculateEstimatedCost()
  }, [watchedQuantity, watchedPrice, watchedSide, currentPrice, watchedOrderType])

  const fetchStockData = async (symbol: string) => {
    try {
      // Mock stock data - in real app, call API
      setCurrentPrice(175.50 + Math.random() * 50) // Random price between 175.50 and 225.50
    } catch (error) {
      console.error('Error fetching stock data:', error)
    }
  }

  const calculateEstimatedCost = () => {
    let price = 0
    if (watchedOrderType === 'MARKET' && currentPrice) {
      price = currentPrice
    } else if (watchedOrderType === 'LIMIT' && watchedPrice) {
      price = watchedPrice
    }
    
    const cost = price * watchedQuantity
    setEstimatedCost(cost)
  }

  const onSubmit = async (data: OrderFormData) => {
    setIsPlacingOrder(true)
    
    try {
      const order = {
        userId: 'current-user',
        symbol: data.symbol.toUpperCase(),
        orderType: data.orderType,
        side: data.side,
        quantity: data.quantity,
        price: data.price || 0,
        stopPrice: data.stopPrice || 0,
        status: 'PENDING' as const,
      }

      await apiService.createOrder(order)
      toast.success('Order placed successfully!')
      reset()
      setCurrentPrice(null)
      loadOrders()
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const loadOrders = async () => {
    setIsLoading(true)
    
    try {
      const response = await apiService.getMockUserOrders()
      if (response.code === 200) {
        const orders = response.data
        setOpenOrders(orders.filter(order => order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED'))
        setOrderHistory(orders.filter(order => order.status === 'FILLED' || order.status === 'CANCELLED'))
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    try {
      await apiService.cancelOrder(orderId)
      toast.success('Order cancelled successfully')
      loadOrders()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order')
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const openOrdersColumns: ColumnDef<Order>[] = [
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
      id: 'filledQuantity',
      header: 'Filled',
      accessor: (row) => row.filledQuantity || 0,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          {row.status === 'PENDING' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelOrder(row.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  const orderHistoryColumns: ColumnDef<Order>[] = [
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
      id: 'averagePrice',
      header: 'Avg Price',
      accessor: (row) => row.averagePrice ? formatCurrency(row.averagePrice) : 'N/A',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trading
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/portfolio')}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Portfolio
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('place-order')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'place-order'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Place Order
              </button>
              <button
                onClick={() => setSelectedTab('open-orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'open-orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Open Orders ({openOrders.length})
              </button>
              <button
                onClick={() => setSelectedTab('order-history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'order-history'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>
        </div>

        {/* Place Order Tab */}
        {selectedTab === 'place-order' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Place Order
                  </h3>
                  
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Symbol Input */}
                    <Input
                      label="Symbol"
                      placeholder="Enter stock symbol (e.g., AAPL)"
                      {...register('symbol')}
                      error={errors.symbol?.message}
                    />

                    {/* Buy/Sell Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order Side
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant={watchedSide === 'BUY' ? 'primary' : 'outline'}
                          onClick={() => setValue('side', 'BUY')}
                          className="w-full"
                        >
                          Buy
                        </Button>
                        <Button
                          type="button"
                          variant={watchedSide === 'SELL' ? 'danger' : 'outline'}
                          onClick={() => setValue('side', 'SELL')}
                          className="w-full"
                        >
                          Sell
                        </Button>
                      </div>
                    </div>

                    {/* Order Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Order Type
                      </label>
                      <select
                        {...register('orderType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
                      >
                        <option value="MARKET">Market Order</option>
                        <option value="LIMIT">Limit Order</option>
                        <option value="STOP_LOSS">Stop Loss</option>
                        <option value="STOP_LIMIT">Stop Limit</option>
                      </select>
                      {errors.orderType && (
                        <p className="mt-1 text-sm text-danger-600">{errors.orderType.message}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <Input
                      label="Quantity"
                      type="number"
                      placeholder="Number of shares"
                      {...register('quantity', { valueAsNumber: true })}
                      error={errors.quantity?.message}
                    />

                    {/* Price (for limit orders) */}
                    {(watchedOrderType === 'LIMIT' || watchedOrderType === 'STOP_LIMIT') && (
                      <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        placeholder="Limit price"
                        {...register('price', { valueAsNumber: true })}
                        error={errors.price?.message}
                      />
                    )}

                    {/* Stop Price (for stop orders) */}
                    {(watchedOrderType === 'STOP_LOSS' || watchedOrderType === 'STOP_LIMIT') && (
                      <Input
                        label="Stop Price"
                        type="number"
                        step="0.01"
                        placeholder="Stop price"
                        {...register('stopPrice', { valueAsNumber: true })}
                        error={errors.stopPrice?.message}
                      />
                    )}

                    {/* Order Review */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Order Review
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
                          <span className="font-medium">{watchedSymbol?.toUpperCase() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Side:</span>
                          <span className={`font-medium ${watchedSide === 'BUY' ? 'text-success-600' : 'text-danger-600'}`}>
                            {watchedSide}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Type:</span>
                          <span className="font-medium">{watchedOrderType?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                          <span className="font-medium">{watchedQuantity}</span>
                        </div>
                        {(watchedOrderType === 'LIMIT' || watchedOrderType === 'STOP_LIMIT') && watchedPrice && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Price:</span>
                            <span className="font-medium">{formatCurrency(watchedPrice)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                          <span className="font-medium">{formatCurrency(estimatedCost)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      loading={isPlacingOrder}
                      disabled={!isValid || isPlacingOrder}
                    >
                      {isPlacingOrder ? 'Placing Order...' : `Place ${watchedSide} Order`}
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            {/* Market Info */}
            <div>
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Market Information
                  </h3>
                  
                  {watchedSymbol && currentPrice ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {watchedSymbol.toUpperCase()}
                        </h4>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(currentPrice)}
                        </p>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <span className={`text-sm font-medium ${getProfitLossClass(Math.random() * 10 - 5)}`}>
                            {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 10 - 5).toFixed(2)}
                          </span>
                          <span className={`text-sm font-medium ${getProfitLossClass(Math.random() * 5 - 2.5)}`}>
                            ({Math.random() > 0.5 ? '+' : ''}{(Math.random() * 5 - 2.5).toFixed(2)}%)
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          Quick Stats
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Day High:</span>
                            <span className="font-medium">{formatCurrency(currentPrice * 1.02)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Day Low:</span>
                            <span className="font-medium">{formatCurrency(currentPrice * 0.98)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                            <span className="font-medium">{(Math.random() * 10000000).toFixed(0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Market Cap:</span>
                            <span className="font-medium">${(Math.random() * 3000).toFixed(0)}B</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Enter a symbol to see market information</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Account Balance */}
              <Card className="mt-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Balance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Available:</span>
                      <span className="font-medium">{formatCurrency(15000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                      <span className="font-medium">{formatCurrency(125000)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Open Orders Tab */}
        {selectedTab === 'open-orders' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Open Orders
              </h3>
              <Table
                data={openOrders}
                columns={openOrdersColumns}
                emptyMessage="No open orders"
              />
            </div>
          </Card>
        )}

        {/* Order History Tab */}
        {selectedTab === 'order-history' && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order History
              </h3>
              <Table
                data={orderHistory}
                columns={orderHistoryColumns}
                emptyMessage="No order history"
              />
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
