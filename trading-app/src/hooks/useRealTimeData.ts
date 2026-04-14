import { useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import { usePortfolioStore } from '@/stores/usePortfolioStore'

interface RealTimeDataHook {
  isConnected: boolean
  subscribeToSymbol: (symbol: string) => void
  unsubscribeFromSymbol: (symbol: string) => void
  subscribeToPortfolio: () => void
  unsubscribeFromPortfolio: () => void
  subscribeToOrders: () => void
  unsubscribeFromOrders: () => void
}

export const useRealTimeData = (): RealTimeDataHook => {
  const { socket, isConnected, subscribe, unsubscribe, emit } = useWebSocket()
  const { updateHoldingPrice, setPortfolio } = usePortfolioStore()
  const subscribedSymbols = useRef<Set<string>>(new Set())
  const isPortfolioSubscribed = useRef(false)
  const isOrdersSubscribed = useRef(false)

  // Handle price updates
  const handlePriceUpdate = useCallback((data: { symbol: string; price: number; timestamp: number }) => {
    updateHoldingPrice(data.symbol, data.price)
  }, [updateHoldingPrice])

  // Handle portfolio updates
  const handlePortfolioUpdate = useCallback((data: any) => {
    setPortfolio(data)
  }, [setPortfolio])

  // Handle order updates
  const handleOrderUpdate = useCallback((data: any) => {
    // This would update orders in a real implementation
    console.log('Order update:', data)
  }, [])

  // Subscribe to a specific symbol's price updates
  const subscribeToSymbol = useCallback((symbol: string) => {
    if (!socket || !isConnected) return

    if (!subscribedSymbols.current.has(symbol)) {
      subscribe('price_update', handlePriceUpdate)
      emit('subscribe_symbol', { symbol })
      subscribedSymbols.current.add(symbol)
    }
  }, [socket, isConnected, subscribe, emit, handlePriceUpdate])

  // Unsubscribe from a specific symbol
  const unsubscribeFromSymbol = useCallback((symbol: string) => {
    if (!socket) return

    if (subscribedSymbols.current.has(symbol)) {
      unsubscribe('price_update', handlePriceUpdate)
      emit('unsubscribe_symbol', { symbol })
      subscribedSymbols.current.delete(symbol)
    }
  }, [socket, unsubscribe, emit, handlePriceUpdate])

  // Subscribe to portfolio updates
  const subscribeToPortfolio = useCallback(() => {
    if (!socket || !isConnected || isPortfolioSubscribed.current) return

    subscribe('portfolio_update', handlePortfolioUpdate)
    emit('subscribe_portfolio', {})
    isPortfolioSubscribed.current = true
  }, [socket, isConnected, subscribe, emit, handlePortfolioUpdate])

  // Unsubscribe from portfolio updates
  const unsubscribeFromPortfolio = useCallback(() => {
    if (!socket || !isPortfolioSubscribed.current) return

    unsubscribe('portfolio_update', handlePortfolioUpdate)
    emit('unsubscribe_portfolio', {})
    isPortfolioSubscribed.current = false
  }, [socket, unsubscribe, emit, handlePortfolioUpdate])

  // Subscribe to order updates
  const subscribeToOrders = useCallback(() => {
    if (!socket || !isConnected || isOrdersSubscribed.current) return

    subscribe('order_update', handleOrderUpdate)
    emit('subscribe_orders', {})
    isOrdersSubscribed.current = true
  }, [socket, isConnected, subscribe, emit, handleOrderUpdate])

  // Unsubscribe from order updates
  const unsubscribeFromOrders = useCallback(() => {
    if (!socket || !isOrdersSubscribed.current) return

    unsubscribe('order_update', handleOrderUpdate)
    emit('unsubscribe_orders', {})
    isOrdersSubscribed.current = false
  }, [socket, unsubscribe, emit, handleOrderUpdate])

  // Auto-subscribe to portfolio when connected
  useEffect(() => {
    if (isConnected && !isPortfolioSubscribed.current) {
      subscribeToPortfolio()
      subscribeToOrders()
    }
  }, [isConnected, subscribeToPortfolio, subscribeToOrders])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscribedSymbols.current.forEach(symbol => {
        unsubscribeFromSymbol(symbol)
      })
      unsubscribeFromPortfolio()
      unsubscribeFromOrders()
    }
  }, [unsubscribeFromSymbol, unsubscribeFromPortfolio, unsubscribeFromOrders])

  return {
    isConnected,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    subscribeToPortfolio,
    unsubscribeFromPortfolio,
    subscribeToOrders,
    unsubscribeFromOrders,
  }
}
