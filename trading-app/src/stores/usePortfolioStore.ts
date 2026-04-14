import { create } from 'zustand'
import { Portfolio, Holding, MarketData } from '@/types'

interface PortfolioState {
  portfolio: Portfolio | null
  holdings: Holding[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Actions
  setPortfolio: (portfolio: Portfolio) => void
  updateHoldings: (holdings: Holding[]) => void
  updateHoldingPrice: (symbol: string, newPrice: number) => void
  addHolding: (holding: Holding) => void
  removeHolding: (symbol: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  refreshPortfolio: () => Promise<void>
  
  // Computed values
  getTotalValue: () => number
  getTotalPnL: () => number
  getWinRate: () => number
  getBestPerformer: () => Holding | null
  getWorstPerformer: () => Holding | null
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  holdings: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  setPortfolio: (portfolio) => {
    set({ 
      portfolio, 
      holdings: portfolio.holdings || [],
      lastUpdated: new Date(),
      error: null 
    })
  },

  updateHoldings: (holdings) => {
    set({ 
      holdings, 
      lastUpdated: new Date(),
      error: null 
    })
  },

  updateHoldingPrice: (symbol, newPrice) => {
    const { holdings } = get()
    const updatedHoldings = holdings.map(holding => {
      if (holding.symbol === symbol) {
        const pnl = (newPrice - holding.averagePrice) * holding.quantity
        const pnlPercentage = ((newPrice - holding.averagePrice) / holding.averagePrice) * 100
        return {
          ...holding,
          currentPrice: newPrice,
          totalValue: newPrice * holding.quantity,
          pnl,
          pnlPercentage,
          updatedAt: new Date().toISOString(),
        }
      }
      return holding
    })

    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.totalValue, 0)
    const portfolio = get().portfolio
    
    if (portfolio) {
      const updatedPortfolio = {
        ...portfolio,
        holdings: updatedHoldings,
        totalValue,
        lastUpdated: new Date().toISOString(),
      }
      set({ portfolio: updatedPortfolio, holdings: updatedHoldings })
    }
  },

  addHolding: (holding) => {
    const { holdings } = get()
    const existingIndex = holdings.findIndex(h => h.symbol === holding.symbol)
    
    let updatedHoldings: Holding[]
    if (existingIndex >= 0) {
      // Update existing holding
      updatedHoldings = holdings.map((h, index) => 
        index === existingIndex ? holding : h
      )
    } else {
      // Add new holding
      updatedHoldings = [...holdings, holding]
    }

    set({ holdings: updatedHoldings })
  },

  removeHolding: (symbol) => {
    const { holdings } = get()
    const updatedHoldings = holdings.filter(h => h.symbol !== symbol)
    set({ holdings: updatedHoldings })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error, isLoading: false })
  },

  refreshPortfolio: async () => {
    set({ isLoading: true, error: null })
    try {
      // This would be an actual API call in production
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        totalValue: 125000,
        availableBalance: 15000,
        investedAmount: 110000,
        dailyPnL: 2500,
        dailyPnLPercentage: 2.04,
        totalPnL: 15000,
        totalPnLPercentage: 13.64,
        holdings: get().holdings,
        createdAt: '2024-01-01',
        updatedAt: new Date().toISOString(),
      }
      
      set({ 
        portfolio: mockPortfolio, 
        isLoading: false,
        lastUpdated: new Date(),
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh portfolio',
        isLoading: false 
      })
    }
  },

  // Computed values
  getTotalValue: () => {
    const { portfolio } = get()
    return portfolio?.totalValue || 0
  },

  getTotalPnL: () => {
    const { portfolio } = get()
    return portfolio?.totalPnL || 0
  },

  getWinRate: () => {
    const { holdings } = get()
    if (holdings.length === 0) return 0
    const winners = holdings.filter(h => h.pnl > 0).length
    return (winners / holdings.length) * 100
  },

  getBestPerformer: () => {
    const { holdings } = get()
    if (holdings.length === 0) return null
    return holdings.reduce((best, current) => 
      current.pnlPercentage > best.pnlPercentage ? current : best
    )
  },

  getWorstPerformer: () => {
    const { holdings } = get()
    if (holdings.length === 0) return null
    return holdings.reduce((worst, current) => 
      current.pnlPercentage < worst.pnlPercentage ? current : worst
    )
  },
}))
