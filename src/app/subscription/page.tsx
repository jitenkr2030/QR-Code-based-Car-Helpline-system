import SubscriptionPlans from '@/components/SubscriptionPlans'

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">
            Choose the perfect plan for your vehicle assistance needs.
          </p>
        </div>
        
        <SubscriptionPlans 
          showUserSubscription={true}
          onPlanSelect={(plan) => {
            console.log('Plan selected:', plan)
          }}
          onSubscribe={(plan, paymentMethod) => {
            console.log('Subscribed to plan:', plan, 'Payment method:', paymentMethod)
          }}
        />
      </div>
    </div>
  )
}