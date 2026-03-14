'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Users, 
  Building, 
  Settings, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Eye,
  Trash2,
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react'

interface PushSubscription {
  id: string
  userId?: string
  partnerId?: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  expirationTime?: number
  isActive: boolean
  createdAt: string
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

interface PushNotificationsProps {
  userId?: string
  partnerId?: string
  onNotificationSent?: (result: any) => void
}

export default function PushNotifications({ 
  userId, 
  partnerId, 
  onNotificationSent 
}: PushNotificationsProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'status' | 'send' | 'subscriptions'>('status')
  const [notificationForm, setNotificationForm] = useState<PushNotificationData>({
    title: '',
    message: '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    silent: false
  })

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
    } else {
      setIsSupported(false)
    }

    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Load existing subscriptions
    if (userId || partnerId) {
      loadSubscriptions()
    }
  }, [userId, partnerId])

  const requestPermission = async () => {
    if (!isSupported) {
      alert('Push notifications are not supported in this browser')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        await subscribeToPush()
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const subscribeToPush = async () => {
    if (!isSupported || permission !== 'granted') {
      await requestPermission()
      return
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLbZxvWJ7l8fQ4t7k9L2mN3oP6qR1sT2uV3wX4yZ5a6b7c8d9e0f1g2h3')
      })

      // Save subscription to database
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscribe',
          userId,
          partnerId,
          subscription: {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: pushSubscription.getKey('p256dh'),
              auth: pushSubscription.getKey('auth')
            },
            expirationTime: pushSubscription.expirationTime
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubscription(pushSubscription as any)
        setIsSubscribed(true)
        loadSubscriptions()
      } else {
        console.error('Error saving subscription:', data.error)
      }
    } catch (error) {
      console.error('Error subscribing to push:', error)
    }
  }

  const unsubscribeFromPush = async () => {
    if (!subscription) return

    try {
      // Unsubscribe from push
      await subscription.unsubscribe()

      // Remove subscription from database
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unsubscribe',
          userId,
          partnerId,
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.getKey('p256dh'),
              auth: subscription.getKey('auth')
            }
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubscription(null)
        setIsSubscribed(false)
        loadSubscriptions()
      } else {
        console.error('Error removing subscription:', data.error)
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
    }
  }

  const loadSubscriptions = async () => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (partnerId) params.append('partnerId', partnerId)

      const response = await fetch(`/api/notifications/push?${params}`)
      const data = await response.json()

      if (data.success) {
        setSubscriptions(data.subscriptions)
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    }
  }

  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert('Title and message are required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'send',
          userId,
          partnerId,
          notification: notificationForm
        })
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setNotificationForm({
          title: '',
          message: '',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'default',
          requireInteraction: false,
          silent: false
        })

        if (onNotificationSent) {
          onNotificationSent(data.results)
        }

        alert(`Notification sent to ${data.results.success} subscribers`)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  const sendBroadcastNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert('Title and message are required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'broadcast',
          notification: notificationForm
        })
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setNotificationForm({
          title: '',
          message: '',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'default',
          requireInteraction: false,
          silent: false
        })

        if (onNotificationSent) {
          onNotificationSent(data.results)
        }

        alert(`Broadcast notification sent to ${data.results.success} subscribers`)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error sending broadcast notification:', error)
      alert('Failed to send broadcast notification')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return
    }

    try {
      // Find the subscription
      const sub = subscriptions.find(s => s.id === subscriptionId)
      if (!sub) return

      // Remove from database
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unsubscribe',
          userId,
          partnerId,
          subscription: {
            endpoint: sub.endpoint,
            keys: JSON.parse(sub.keys)
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        loadSubscriptions()
        alert('Subscription deleted successfully')
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting subscription:', error)
      alert('Failed to delete subscription')
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const getStatusIcon = () => {
    if (!isSupported) {
      return <BellOff className="w-5 h-5 text-gray-400" />
    }
    
    switch (permission) {
      case 'granted':
        return <Bell className="w-5 h-5 text-green-600" />
      case 'denied':
        return <BellOff className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusText = () => {
    if (!isSupported) {
      return 'Not Supported'
    }
    
    switch (permission) {
      case 'granted':
        return 'Granted'
      case 'denied':
        return 'Denied'
      default:
        return 'Not Requested'
    }
  }

  const getStatusColor = () => {
    if (!isSupported) {
      return 'bg-gray-100 text-gray-800'
    }
    
    switch (permission) {
      case 'granted':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Push Notification Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">
                    {isSupported ? 'Supported' : 'Not supported in this browser'}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>

            {isSupported && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Subscription Status</p>
                    <p className="text-sm text-gray-500">
                      {isSubscribed ? 'Subscribed' : 'Not subscribed'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isSubscribed}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          subscribeToPush()
                        } else {
                          unsubscribeFromPush()
                        }
                      }}
                    />
                    {isSubscribed ? (
                      <Wifi className="w-4 h-4 text-green-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {permission === 'default' && (
                  <Button
                    onClick={requestPermission}
                    className="w-full"
                    variant="outline"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                )}

                {permission === 'denied' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        Notifications are blocked. Please enable them in your browser settings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'status' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('status')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Status
        </Button>
        <Button
          variant={activeTab === 'send' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('send')}
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
        <Button
          variant={activeTab === 'subscriptions' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('subscriptions')}
        >
          <Users className="w-4 h-4 mr-2" />
          Subscriptions
        </Button>
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <Card>
          <CardHeader>
            <CardTitle>Send Push Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <Label htmlFor="tag">Tag</Label>
                <Input
                  id="tag"
                  value={notificationForm.tag}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, tag: e.target.value }))}
                  placeholder="Enter notification tag"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter notification message"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icon URL</Label>
                <Input
                  id="icon"
                  value={notificationForm.icon}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Enter icon URL"
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge URL</Label>
                <Input
                  id="badge"
                  value={notificationForm.badge}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="Enter badge URL"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="url">Action URL</Label>
              <Input
                id="url"
                value={notificationForm.url || ''}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Enter action URL (optional)"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireInteraction"
                  checked={notificationForm.requireInteraction}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, requireInteraction: checked }))}
                />
                <Label htmlFor="requireInteraction">Require Interaction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="silent"
                  checked={notificationForm.silent}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, silent: checked }))}
                />
                <Label htmlFor="silent">Silent</Label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={sendNotification}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Send to {userId || partnerId ? 'User/Partner' : 'All'}</span>
                  </div>
                )}
              </Button>
              
              {!userId && !partnerId && (
                <Button
                  onClick={sendBroadcastNotification}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Broadcasting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Volume2 className="w-4 h-4" />
                      <span>Broadcast to All</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Push Subscriptions</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSubscriptions}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Subscription</span>
                        <Badge className={sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">User ID:</span> {sub.userId || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Partner ID:</span> {sub.partnerId || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Created:</span> {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                        {sub.expirationTime && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Expires:</span> {new Date(sub.expirationTime).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(sub.endpoint)
                          alert('Endpoint copied to clipboard')
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSubscription(sub.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No push subscriptions found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Enable notifications and subscribe to start receiving push notifications
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Setup Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">For Users:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Enable notifications in your browser settings</li>
                <li>Click "Enable Notifications" button</li>
                <li>Allow notifications when prompted</li>
                <li>You're all set to receive push notifications!</li>
              </ol>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">For Partners:</h4>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Enable notifications in your browser settings</li>
                <li>Subscribe to push notifications in your dashboard</li>
                <li>Allow notifications when prompted</li>
                <li>Receive real-time service requests and updates!</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting:</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>If notifications are blocked, enable them in browser settings</li>
                <li>If subscription fails, check your browser's notification settings</li>
                <li>Make sure you're using a supported browser (Chrome, Firefox, Safari)</li>
                <li>Some browsers may require HTTPS for push notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}