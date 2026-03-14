'use client'

import { useEffect, useRef, useState } from 'react'
import { useWebSocket as useBrowserWebSocket } from '@/lib/websocket'

interface WebSocketOptions {
  token?: string
  type?: 'user' | 'partner' | 'admin'
  id?: string
}

interface WebSocketMessage {
  type: string
  data?: any
  timestamp?: string
}

interface UseWebSocketReturn {
  socket: any
  isConnected: boolean
  sendMessage: (message: WebSocketMessage) => void
  lastMessage: WebSocketMessage | null
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  disconnect: () => void
}

export function useWebSocket(options: WebSocketOptions = {}): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const messageQueue = useRef<WebSocketMessage[]>([])

  // Use browser WebSocket implementation
  const { socket, isConnected } = useBrowserWebSocket({
    token: options.token || '',
    type: options.type || 'user',
    id: options.id || ''
  })

  const sendMessage = (message: WebSocketMessage) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    }

    if (socket && isConnected) {
      socket.send(messageWithTimestamp)
    } else {
      // Queue message for when socket reconnects
      messageQueue.current.push(messageWithTimestamp)
    }
  }

  const joinRoom = (room: string) => {
    if (socket && isConnected) {
      socket.send({
        type: 'join_room',
        data: { room },
        timestamp: new Date().toISOString()
      })
    }
  }

  const leaveRoom = (room: string) => {
    if (socket && isConnected) {
      socket.send({
        type: 'leave_room',
        data: { room },
        timestamp: new Date().toISOString()
      })
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
    }
  }

  // Listen for messages
  useEffect(() => {
    if (socket) {
      const handleMessage = (data: any) => {
        setLastMessage(data)
        
        // Process queued messages
        if (messageQueue.current.length > 0) {
          const queuedMessages = [...messageQueue.current]
          messageQueue.current = []
          
          queuedMessages.forEach(queuedMessage => {
            if (socket && isConnected) {
              socket.send(queuedMessage)
            }
          })
        }
      }

      // Register message listener
      socket.on('message', handleMessage)
      
      // Cleanup
      return () => {
        socket.off('message', handleMessage)
      }
    }
  }, [socket, isConnected])

  return {
    socket,
    isConnected,
    sendMessage,
    lastMessage,
    joinRoom,
    leaveRoom,
    disconnect
  }
}

// Export for use in components
export { useWebSocket }

// Real-time tracking hook
export function useRealTimeTracking(bookingId: string) {
  const [trackingData, setTrackingData] = useState<any>(null)
  const [isTracking, setIsTracking] = useState(false)
  const { socket, isConnected } = useWebSocket({
    token: '',
    type: 'user',
    id: ''
  })

  useEffect(() => {
    if (socket && isConnected && bookingId) {
      // Subscribe to tracking updates
      socket.send({
        type: 'subscribe_tracking',
        data: { bookingId },
        timestamp: new Date().toISOString()
      })

      // Listen for tracking updates
      const handleTrackingUpdate = (data: any) => {
        if (data.type === 'tracking_update' && data.data.bookingId === bookingId) {
          setTrackingData(data.data)
          setIsTracking(true)
        }
      }

      socket.on('message', handleTrackingUpdate)

      return () => {
        socket.off('message', handleTrackingUpdate)
        // Unsubscribe from tracking updates
        socket.send({
          type: 'unsubscribe_tracking',
          data: { bookingId },
          timestamp: new Date().toISOString()
        })
      }
    }
  }, [socket, isConnected, bookingId])

  return {
    trackingData,
    isTracking,
    startTracking: () => {
      if (socket && isConnected && bookingId) {
        socket.send({
          type: 'start_tracking',
          data: { bookingId },
          timestamp: new Date().toISOString()
        })
      }
    },
    stopTracking: () => {
      if (socket && isConnected && bookingId) {
        socket.send({
          type: 'stop_tracking',
          data: { bookingId },
          timestamp: new Date().toISOString()
        })
        setIsTracking(false)
      }
    }
  }
}