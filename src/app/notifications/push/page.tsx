import PushNotifications from '@/components/PushNotifications'

export default function PushNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Push Notifications</h1>
          <p className="text-gray-600 mt-2">
            Manage push notifications for real-time mobile engagement.
          </p>
        </div>
        
        <PushNotifications 
          onNotificationSent={(result) => {
            console.log('Notification sent:', result)
          }}
        />
      </div>
    </div>
  )
}