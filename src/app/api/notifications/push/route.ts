import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import webpush from 'web-push'

// VAPID keys for web push notifications
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLbZxvWJ7l8fQ4t7k9L2mN3oP6qR1sT2uV3wX4yZ5a6b7c8d9e0f1g2h3',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'xM9n8oP7qR6sT5uV4wX3yZ2a1b0c9d8e7f6g5h4i3j2k1l0m9n8o7p6q5r4s3t2u1v0w'
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number
}

interface PushNotificationData {
  title: string
  message: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  url?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, partnerId, subscription, notification } = body

    switch (type) {
      case 'subscribe':
        return await savePushSubscription(userId, subscription)
      case 'unsubscribe':
        return await removePushSubscription(userId, subscription)
      case 'send':
        return await sendPushNotification(userId, partnerId, notification)
      case 'broadcast':
        return await broadcastNotification(notification)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in push notifications API:', error)
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

    let whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }

    if (partnerId) {
      whereClause.partnerId = partnerId
    }

    const subscriptions = await db.pushSubscription.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        partnerId: sub.partnerId,
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys),
        expirationTime: sub.expirationTime,
        isActive: sub.isActive,
        createdAt: sub.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching push subscriptions:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

async function savePushSubscription(userId: string, subscription: PushSubscription) {
  if (!userId || !subscription) {
    return NextResponse.json({ 
      error: 'User ID and subscription are required' 
    }, { status: 400 })
  }

  // Check if subscription already exists
  const existingSubscription = await db.pushSubscription.findFirst({
    where: {
      userId,
      endpoint: subscription.endpoint
    }
  })

  if (existingSubscription) {
    // Update existing subscription
    const updatedSubscription = await db.pushSubscription.update({
      where: { id: existingSubscription.id },
      data: {
        keys: JSON.stringify(subscription.keys),
        expirationTime: subscription.expirationTime,
        isActive: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        id: updatedSubscription.id,
        endpoint: updatedSubscription.endpoint
      }
    })
  } else {
    // Create new subscription
    const newSubscription = await db.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        keys: JSON.stringify(subscription.keys),
        expirationTime: subscription.expirationTime,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
      subscription: {
        id: newSubscription.id,
        endpoint: newSubscription.endpoint
      }
    })
  }
}

async function removePushSubscription(userId: string, subscription: PushSubscription) {
  if (!userId || !subscription) {
    return NextResponse.json({ 
      error: 'User ID and subscription are required' 
    }, { status: 400 })
  }

  // Find and deactivate subscription
  const existingSubscription = await db.pushSubscription.findFirst({
    where: {
      userId,
      endpoint: subscription.endpoint
    }
  })

  if (existingSubscription) {
    await db.pushSubscription.update({
      where: { id: existingSubscription.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully'
    })
  } else {
    return NextResponse.json({ 
      error: 'Subscription not found' 
    }, { status: 404 })
  }
}

async function sendPushNotification(userId?: string, partnerId?: string, notification?: PushNotificationData) {
  if (!userId && !partnerId) {
    return NextResponse.json({ 
      error: 'User ID or Partner ID is required' 
    }, { status: 400 })
  }

  if (!notification) {
    return NextResponse.json({ 
      error: 'Notification data is required' 
    }, { status: 400 })
  }

  let whereClause: any = {}

  if (userId) {
    whereClause.userId = userId
  }

  if (partnerId) {
    whereClause.partnerId = partnerId
  }

  // Get active subscriptions
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      ...whereClause,
      isActive: true
    }
  })

  const results = []

  for (const sub of subscriptions) {
    try {
      const subscription = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      }

      const payload = {
        title: notification.title,
        message: notification.message,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        tag: notification.tag || 'default',
        data: notification.data || {},
        actions: notification.actions || [],
        url: notification.url,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
        vibrate: notification.vibrate || [200, 100, 200],
        timestamp: Date.now()
      }

      // Send push notification
      await webpush.sendNotification(subscription, payload, {
        vapidDetails: {
          subject: 'mailto:admin@qrhelpline.com',
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey
        }
      })

      results.push({
        subscriptionId: sub.id,
        success: true
      })

    } catch (error) {
      console.error('Error sending push notification:', error)
      
      // If subscription is no longer valid, deactivate it
      if (error.statusCode === 410) {
        await db.pushSubscription.update({
          where: { id: sub.id },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        })
      }

      results.push({
        subscriptionId: sub.id,
        success: false,
        error: error.message
      })
    }
  }

  // Save notification to database
  await db.notification.create({
    data: {
      userId,
      partnerId,
      title: notification.title,
      message: notification.message,
      type: 'push',
      actionUrl: notification.url,
      actionText: 'View',
      metadata: JSON.stringify({
        payload,
        results
      }),
      isRead: false
    }
  })

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  return NextResponse.json({
    success: true,
    message: `Push notification sent to ${successCount} subscribers`,
    results: {
      total: results.length,
      success: successCount,
      failed: failureCount
    }
  })
}

async function broadcastNotification(notification: PushNotificationData) {
  if (!notification) {
    return NextResponse.json({ 
      error: 'Notification data is required' 
    }, { status: 400 })
  }

  // Get all active subscriptions
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      isActive: true
    }
  })

  const results = []

  for (const sub of subscriptions) {
    try {
      const subscription = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      }

      const payload = {
        title: notification.title,
        message: notification.message,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        tag: notification.tag || 'broadcast',
        data: notification.data || {},
        actions: notification.actions || [],
        url: notification.url,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
        vibrate: notification.vibrate || [200, 100, 200],
        timestamp: Date.now()
      }

      // Send push notification
      await webpush.sendNotification(subscription, payload, {
        vapidDetails: {
          subject: 'mailto:admin@qrhelpline.com',
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey
        }
      })

      results.push({
        subscriptionId: sub.id,
        success: true
      })

    } catch (error) {
      console.error('Error sending broadcast notification:', error)
      
      // If subscription is no longer valid, deactivate it
      if (error.statusCode === 410) {
        await db.pushSubscription.update({
          where: { id: sub.id },
          data: {
            isActive: false,
            updatedAt: new Date()
          }
        })
      }

      results.push({
        subscriptionId: sub.id,
        success: false,
        error: error.message
      })
    }
  }

  // Save notification to database
  await db.notification.create({
    data: {
      title: notification.title,
      message: notification.message,
      type: 'push',
      actionUrl: notification.url,
      actionText: 'View',
      metadata: JSON.stringify({
        payload,
        results,
        type: 'broadcast'
      }),
      isRead: false
    }
  })

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  return NextResponse.json({
    success: true,
    message: `Broadcast notification sent to ${successCount} subscribers`,
    results: {
      total: results.length,
      success: successCount,
      failed: failureCount
    }
  })
}

// Helper function to send service booking notifications
export async function sendServiceBookingPushNotification(bookingId: string, status: string, userId: string, partnerName?: string) {
  const statusMessages = {
    'pending': 'Your service request has been received and is being processed.',
    'assigned': `${partnerName} has been assigned to your service request!`,
    'in_progress': `${partnerName} is on the way to your location.`,
    'completed': 'Service completed successfully! Please rate your experience.',
    'cancelled': 'Service request has been cancelled.'
  }

  const message = statusMessages[status as keyof typeof statusMessages] || `Service status updated to: ${status}`

  await fetch('/api/notifications/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'send',
      userId,
      notification: {
        title: 'Service Booking Update',
        message,
        icon: '/icons/service-booking.png',
        tag: 'service-booking',
        data: {
          bookingId,
          status,
          partnerName,
          timestamp: new Date().toISOString()
        },
        actions: [
          {
            action: 'view',
            title: 'View Booking',
            icon: '/icons/view.png'
          }
        ],
        url: '/dashboard',
        requireInteraction: false
      }
    })
  })
}

// Helper function to send payment notifications
export async function sendPaymentPushNotification(userId: string, amount: number, status: string, orderId: string) {
  const statusMessages = {
    'completed': 'Payment received successfully!',
    'failed': 'Payment failed. Please try again.',
    'pending': 'Payment is being processed.'
  }

  const message = statusMessages[status as keyof typeof statusMessages] || `Payment status: ${status}`

  await fetch('/api/notifications/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'send',
      userId,
      notification: {
        title: 'Payment Update',
        message,
        icon: '/icons/payment.png',
        tag: 'payment',
        data: {
          amount,
          status,
          orderId,
          timestamp: new Date().toISOString()
        },
        actions: [
          {
            action: 'view',
            title: 'View Order',
            icon: '/icons/view.png'
          }
        ],
        url: '/dashboard',
        requireInteraction: false
      }
    })
  })
}

// Helper function to send partner notifications
export async function sendPartnerPushNotification(partnerId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', data?: any) {
  await fetch('/api/notifications/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'send',
      partnerId,
      notification: {
        title,
        message,
        icon: '/icons/partner.png',
        tag: 'partner-notification',
        data: data || {
          timestamp: new Date().toISOString()
        },
        actions: [
          {
            action: 'view',
            title: 'View Dashboard',
            icon: '/icons/dashboard.png'
          }
        ],
        url: '/partner/dashboard',
        requireInteraction: false
      }
    })
  })
}