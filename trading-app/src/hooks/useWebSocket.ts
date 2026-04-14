import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketHook {
  socket: Socket | null
  isConnected: boolean
  error: string | null
  connect: () => void
  disconnect: () => void
  subscribe: (event: string, callback: (data: any) => void) => void
  unsubscribe: (event: string, callback?: (data: any) => void) => void
  emit: (event: string, data: any) => void
}

export const useWebSocket = (url?: string): WebSocketHook => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const callbacksRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

  const connect = () => {
    if (socket?.connected) return

    try {
      const newSocket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxHttpBufferSize: 1e8,
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        setError(null)
        console.log('WebSocket connected')
      })

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false)
        console.log('WebSocket disconnected:', reason)
      })

      newSocket.on('connect_error', (error) => {
        setError(error.message)
        setIsConnected(false)
        console.error('WebSocket connection error:', error)
      })

      // Re-attach existing callbacks
      callbacksRef.current.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          newSocket.on(event, callback)
        })
      })

      setSocket(newSocket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket')
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!callbacksRef.current.has(event)) {
      callbacksRef.current.set(event, new Set())
    }
    callbacksRef.current.get(event)!.add(callback)

    if (socket) {
      socket.on(event, callback)
    }
  }

  const unsubscribe = (event: string, callback?: (data: any) => void) => {
    if (callback) {
      callbacksRef.current.get(event)?.delete(callback)
      if (socket) {
        socket.off(event, callback)
      }
    } else {
      const callbacks = callbacksRef.current.get(event)
      if (callbacks && socket) {
        callbacks.forEach(cb => socket.off(event, cb))
      }
      callbacksRef.current.delete(event)
    }
  }

  const emit = (event: string, data: any) => {
    if (socket && socket.connected) {
      socket.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event)
    }
  }

  // Auto-connect on mount
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    emit,
  }
}
