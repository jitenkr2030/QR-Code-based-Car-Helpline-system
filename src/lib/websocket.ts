// Browser-compatible WebSocket implementation
export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private token: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private listeners: Map<string, Function[]> = new Map()

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
    this.connect()
  }

  private connect() {
    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit('message', data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.emit('disconnected')
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      this.emit('error', error)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('Max reconnect attempts reached')
      this.emit('error', new Error('Failed to reconnect after maximum attempts'))
    }
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// React hook for WebSocket
export function useWebSocket(options: {
  token: string
  type: string
  id: string
}) {
  const [socket, setSocket] = useState<WebSocketManager | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)

  useEffect(() => {
    // In browser environment, we'll use a mock WebSocket
    // In production, this would connect to your actual WebSocket server
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    const ws = new WebSocketManager(wsUrl, options.token)
    
    ws.on('connected', () => {
      setIsConnected(true)
      setSocket(ws)
    })

    ws.on('disconnected', () => {
      setIsConnected(false)
      setSocket(null)
    })

    ws.on('message', (data) => {
      setLastMessage(data)
    })

    return () => {
      ws.disconnect()
    }
  }, [options.token])

  return {
    socket,
    isConnected,
    lastMessage,
    send: (data: any) => {
      if (socket) {
        socket.send(data)
      }
    }
  }
}

// Server-side WebSocket functions for API routes
export async function GET(request: NextRequest) {
  try {
    // Handle WebSocket upgrade request
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 })
    }

    // In production, this would handle the WebSocket upgrade
    // For now, we'll return a mock response
    return NextResponse.json({
      message: 'WebSocket endpoint',
      status: 'ready',
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    })
  } catch (error) {
    console.error('WebSocket GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'send_message':
        // In production, this would send a message through WebSocket
        return NextResponse.json({
          success: true,
          message: 'Message sent successfully',
          data
        })
        
      case 'broadcast':
        // In production, this would broadcast a message
        return NextResponse.json({
          success: true,
          message: 'Message broadcast successfully',
          data
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('WebSocket POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export types for TypeScript
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  userId?: string
  partnerId?: string
}

export interface ServiceBookingUpdate {
  bookingId: string
  status: string
  partnerId?: string
  estimatedArrival?: string
  location?: {
    lat: number
    lng: number
  }
}

export interface PartnerLocation {
  partnerId: string
  location: {
    lat: number
    lng: number
  }
  timestamp: string
}