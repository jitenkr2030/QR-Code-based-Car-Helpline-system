// Service Worker for Push Notifications
const CACHE_NAME = 'qr-helpline-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/notifications',
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Push event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: event.data?.json(),
    actions: event.data?.json()?.actions || [],
    requireInteraction: event.data?.json()?.requireInteraction || false,
    silent: event.data?.json()?.silent || false
  }

  event.waitUntil(
    self.registration.showNotification(event.data?.json()?.title || 'New Notification', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  // Handle notification click
  if (event.action) {
    // Handle action button click
    console.log('Notification action clicked:', event.action)
  } else {
    // Handle notification body click
    console.log('Notification body clicked')
    
    // Open the app or specific URL
    if (event.notification.data && event.notification.data.url) {
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
      )
    } else {
      event.waitUntil(
        clients.openWindow('/')
      )
    }
  }
})

// Background sync event (for offline functionality)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync
      console.log('Background sync triggered')
    )
  }
})

// Message event (for communication with app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})