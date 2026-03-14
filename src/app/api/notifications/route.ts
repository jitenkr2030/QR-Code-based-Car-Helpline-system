import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface NotificationRequest {
  userId?: string
  partnerId?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
  actionText?: string
  metadata?: any
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json()
    const {
      userId,
      partnerId,
      title,
      message,
      type,
      actionUrl,
      actionText,
      metadata
    } = body

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, message' 
      }, { status: 400 })
    }

    // Validate type
    const validTypes = ['info', 'success', 'warning', 'error']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be one of: info, success, warning, error' 
      }, { status: 400 })
    }

    // Create notification
    const notification = await db.notification.create({
      data: {
        userId: userId || null,
        partnerId: partnerId || null,
        title,
        message,
        type,
        actionUrl: actionUrl || '',
        actionText: actionText || '',
        metadata: metadata ? JSON.stringify(metadata) : '{}',
        isRead: false,
        createdAt: new Date()
      }
    })

    // In production, you would send real notifications here
    // For demo purposes, we'll just simulate the notification
    await sendRealTimeNotification(notification)

    return NextResponse.json({ 
      success: true,
      message: 'Notification sent successfully',
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const partnerId = searchParams.get('partnerId')
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }

    if (partnerId) {
      whereClause.partnerId = partnerId
    }

    if (type && type !== 'all') {
      whereClause.type = type
    }

    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true'
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        ...whereClause,
        isRead: false
      }
    })

    return NextResponse.json({ 
      success: true,
      notifications: notifications.map(notification => ({
        id: notification.id,
        userId: notification.userId,
        partnerId: notification.partnerId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : {},
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString()
      })),
      unreadCount,
      totalCount: notifications.length
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead, readAt } = body

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (isRead !== undefined) {
      updateData.isRead = isRead
      if (isRead && !readAt) {
        updateData.readAt = new Date()
      }
    }
    if (readAt) {
      updateData.readAt = new Date(readAt)
    }

    const notification = await db.notification.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true,
      message: 'Notification updated successfully',
      notification
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Simulate real-time notification (in production, use WebSocket or push notifications)
async function sendRealTimeNotification(notification: any) {
  try {
    // Simulate sending notification to user
    console.log('📱 Notification sent:', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      userId: notification.userId,
      partnerId: notification.partnerId,
      createdAt: notification.createdAt
    })

    // In production, you would:
    // 1. Send WebSocket notification to connected clients
    // 2. Send push notification to mobile devices
    // 3. Send email notification
    // 4. Send SMS notification
    // 5. Send in-app notification

    // For demo purposes, we'll just log the notification
    return true
  } catch (error) {
    console.error('Error sending real-time notification:', error)
    return false
  }
}

// Helper function to send notifications for different events
export async function sendOrderStatusNotification(orderId: string, status: string, userId: string) {
  const statusMessages = {
    'pending': 'Your order has been received and is being processed.',
    'paid': 'Payment received! Your order is now being prepared.',
    'processing': 'Your order is being prepared for shipment.',
    'shipped': 'Your order has been shipped! Track your delivery.',
    'delivered': 'Your order has been delivered successfully!',
    'cancelled': 'Your order has been cancelled.'
  }

  const message = statusMessages[status as keyof typeof statusMessages] || `Order status updated to: ${status}`

  await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      title: `Order Status Update`,
      message,
      type: status === 'delivered' ? 'success' : status === 'cancelled' ? 'warning' : 'info',
      actionUrl: `/dashboard`,
      actionText: 'View Order',
      metadata: {
        orderId,
        status,
        timestamp: new Date().toISOString()
      }
    })
  })
}

export async function sendServiceBookingNotification(bookingId: string, status: string, userId: string, partnerName?: string) {
  const statusMessages = {
    'pending': 'Your service request has been received. We are finding the nearest available partner.',
    'assigned': `${partnerName} has been assigned to your service request!`,
    'in_progress': `${partnerName} is on the way to your location.`,
    'completed': 'Service completed successfully! Please rate your experience.',
    'cancelled': 'Service request has been cancelled.'
  }

  const message = statusMessages[status as keyof typeof statusMessages] || `Service status updated to: ${status}`

  await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      title: 'Service Booking Update',
      message,
      type: status === 'completed' ? 'success' : status === 'cancelled' ? 'warning' : 'info',
      actionUrl: '/dashboard',
      actionText: 'View Booking',
      metadata: {
        bookingId,
        status,
        partnerName,
        timestamp: new Date().toISOString()
      }
    })
  })
}

export async function sendPartnerNotification(partnerId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', metadata?: any) {
  await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      partnerId,
      title,
      message,
      type,
      actionUrl: '/partner/dashboard',
      actionText: 'View Dashboard',
      metadata: metadata || {
        timestamp: new Date().toISOString()
      }
    })
  })
}