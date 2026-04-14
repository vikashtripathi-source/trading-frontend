import { useEffect, useRef, useCallback, useMemo } from 'react'

// Debounce hook
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Throttle hook
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      }
    },
    [callback, delay]
  ) as T

  return throttledCallback
}

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useRef(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.current / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop.current + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [items.length, itemHeight, containerHeight, overscan, scrollTop.current])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  const offsetY = visibleRange.startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTop.current = e.currentTarget.scrollTop
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  }
}

// Lazy loading hook
export const useLazyLoad = (
  threshold: number = 0.1,
  rootMargin: string = '0px'
) => {
  const elementRef = useRef<HTMLElement>(null)
  const [isIntersecting, setIsIntersecting] = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting.current = entry.isIntersecting
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin])

  return {
    elementRef,
    isIntersecting: isIntersecting.current,
  }
}

// Memoized expensive calculations
export const useMemoizedCalculation = <T>(
  calculation: () => T,
  dependencies: any[]
) => {
  return useMemo(calculation, dependencies)
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())

  useEffect(() => {
    renderCount.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${componentName} render #${renderCount.current}, time since last: ${timeSinceLastRender}ms`
      )
    }

    // Warn about slow renders
    if (timeSinceLastRender > 100) {
      console.warn(
        `${componentName} slow render detected: ${timeSinceLastRender}ms`
      )
    }
  })

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
  }
}

// Image optimization hook
export const useOptimizedImage = (src: string, options?: {
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  size?: { width: number; height: number }
}) => {
  const optimizedSrc = useMemo(() => {
    if (!src) return ''

    const params = new URLSearchParams()
    
    if (options?.quality) {
      params.set('q', options.quality.toString())
    }
    
    if (options?.format) {
      params.set('f', options.format)
    }
    
    if (options?.size) {
      params.set('w', options.size.width.toString())
      params.set('h', options.size.height.toString())
    }

    const queryString = params.toString()
    return queryString ? `${src}?${queryString}` : src
  }, [src, options])

  return optimizedSrc
}

// Resource loading hook
export const useResourceLoader = <T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useRef<T | null>(null)
  const [isLoading, setIsLoading] = useRef(false)
  const [error, setError] = useRef<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading.current = true
    setError.current = null

    try {
      const result = await loader()
      setData.current = result
    } catch (err) {
      setError.current = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      setIsLoading.current = false
    }
  }, [loader])

  useEffect(() => {
    load()
  }, dependencies)

  return {
    data: data.current,
    isLoading: isLoading.current,
    error: error.current,
    reload: load,
  }
}

// Batch state updates hook
export const useBatchedUpdates = () => {
  const pendingUpdates = useRef<Array<() => void>>([])
  const isScheduled = useRef(false)

  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdates.current.push(update)

    if (!isScheduled.current) {
      isScheduled.current = true
      
      requestAnimationFrame(() => {
        const updates = pendingUpdates.current
        pendingUpdates.current = []
        isScheduled.current = false

        updates.forEach(update => update())
      })
    }
  }, [])

  return batchUpdate
}
