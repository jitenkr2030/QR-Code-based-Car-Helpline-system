'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ExternalLink,
  Clock,
  User,
  Building
} from 'lucide-react'

interface Notification {
  id: string
  userId?: string
  partnerId?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
  actionText?: string
  metadata?: any
  isRead: boolean
  readAt?: string
  createdAt: string
}

interface NotificationCenterProps {
  userId?: string
  partnerId?: string
  maxNotifications?: number
  showUnreadOnly?: boolean
  onNotificationClick?: (notification: Notification) => void
}

export default function NotificationCenter({ 
  userId, 
  partnerId, 
  maxNotifications = 10, 
  showUnreadOnly = false,
  onNotificationClick 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [userId, partnerId, showUnreadOnly])

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (partnerId) params.append('partnerId', partnerId)
      if (showUnreadOnly) params.append('isRead', 'false')
      params.append('limit', maxNotifications.toString())

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
          isRead: true,
          readAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      await Promise.all(
        unreadNotifications.map(notification => 
          markAsRead(notification.id)
        )
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-orange-50 border-orange-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {/* Notification Bell with Badge */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-8 w-96 bg-white shadow-lg border z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm font-medium truncate ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm text-gray-600 mb-2 ${
                            !notification.isRead ? 'font-medium' : ''
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Metadata display */}
                          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                            <div className="text-xs text-gray-500 mb-2">
                              {notification.metadata.orderId && (
                                <div className="flex items-center space-x-1">
                                  <ShoppingCart className="w-3 h-3" />
                                  <span>Order: {notification.metadata.orderId}</span>
                                </div>
                              )}
                              {notification.metadata.bookingId && (
                                <div className="flex items-center space-x-1">
                                  <Car className="w-3 h-3" />
                                  <span>Booking: {notification.metadata.bookingId}</span>
                                </div>
                              )}
                              {notification.metadata.partnerName && (
                                <div className="flex items-center space-x-1">
                                  <Building className="w-3 h-3" />
                                  <span>{notification.metadata.partnerName}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action button */}
                          {notification.actionUrl && notification.actionText && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.location.href = notification.actionUrl
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Notification Bell Component (for use in headers)
export function NotificationBell({ 
  userId, 
  partnerId, 
  onNotificationClick 
}: { 
  userId?: string
  partnerId?: string
  onNotificationClick?: (notification: Notification) => void 
}) {
  return (
    <NotificationCenter
      userId={userId}
      partnerId={partnerId}
      maxNotifications={5}
      showUnreadOnly={false}
      onNotificationClick={onNotificationClick}
    />
  )
}

// Notification List Component (for use in dashboards)
export function NotificationList({ 
  userId, 
  partnerId, 
  maxNotifications = 10 
}: { 
  userId?: string
  partnerId?: string
  maxNotifications?: number 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Notifications</h3>
        <NotificationCenter
          userId={userId}
          partnerId={partnerId}
          maxNotifications={maxNotifications}
          showUnreadOnly={false}
        />
      </div>
      
      <NotificationCenter
        userId={userId}
        partnerId={partnerId}
        maxNotifications={maxNotifications}
        showUnreadOnly={false}
      />
    </div>
  )
}