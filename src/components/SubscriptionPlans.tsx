'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Shield, 
  Star, 
  Users, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  icon: React.ReactNode
  recommended?: boolean
  color: string
  duration: string
  maxVehicles: number
  maxServices: number
  prioritySupport: boolean
  apiAccess: boolean
  customBranding: boolean
  analytics: boolean
}

interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  startDate: Date
  endDate: Date
  autoRenew: boolean
  plan: Plan
}

interface SubscriptionPlansProps {
  userId?: string
  onPlanSelect?: (plan: Plan) => void
  showUserSubscription?: boolean
}

export default function SubscriptionPlans({ 
  userId, 
  onPlanSelect, 
  showUserSubscription = false 
}: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Mock plans data
  const mockPlans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      features: [
        'Up to 5 vehicles',
        'Up to 10 services/month',
        'Email support',
        'Basic analytics',
        'Mobile app access'
      ],
      icon: <Shield className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      duration: 'monthly',
      maxVehicles: 5,
      maxServices: 10,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      analytics: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      features: [
        'Up to 20 vehicles',
        'Up to 50 services/month',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom branding',
        'Mobile app access'
      ],
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      recommended: true,
      duration: 'monthly',
      maxVehicles: 20,
      maxServices: 50,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      analytics: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: [
        'Unlimited vehicles',
        'Unlimited services',
        '24/7 phone support',
        'Dedicated account manager',
        'Advanced analytics',
        'Full API access',
        'Custom branding',
        'White-label options',
        'SLA guarantee'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600',
      duration: 'monthly',
      maxVehicles: -1,
      maxServices: -1,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      analytics: true
    }
  ]

  useEffect(() => {
    setPlans(mockPlans)
    
    // Mock user subscription
    if (showUserSubscription && userId) {
      const mockSubscription: UserSubscription = {
        id: 'sub-123',
        userId: userId || 'user-123',
        planId: 'professional',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        autoRenew: true,
        plan: mockPlans[1] // Professional plan
      }
      setUserSubscription(mockSubscription)
    }
  }, [userId, showUserSubscription])

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan.id)
    if (onPlanSelect) {
      onPlanSelect(plan)
    }
  }

  const handleSubscribe = async (plan: Plan) => {
    setIsLoading(true)
    try {
      // Mock subscription creation
      const newSubscription: UserSubscription = {
        id: 'sub-' + Date.now(),
        userId: userId || 'user-123',
        planId: plan.id,
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        plan: plan
      }
      
      setUserSubscription(newSubscription)
      
      // In production, this would call your API
      console.log('Subscription created:', newSubscription)
    } catch (error) {
      console.error('Error creating subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!userSubscription) return
    
    try {
      // Mock cancellation
      const cancelledSubscription: UserSubscription = {
        ...userSubscription,
        status: 'cancelled',
        endDate: new Date()
      }
      
      setUserSubscription(cancelledSubscription)
      
      // In production, this would call your API
      console.log('Subscription cancelled:', cancelledSubscription)
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    }
  }

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.floor(monthlyPrice * 10 * 0.8) // 20% discount for annual
  }

  const getDisplayPrice = (plan: Plan) => {
    if (billingCycle === 'annual') {
      return getAnnualPrice(plan.price)
    }
    return plan.price
  }

  return (
    <div className="space-y-6">
      {/* User Subscription Status */}
      {showUserSubscription && userSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span>Active Subscription</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  {userSubscription.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                >
                  Cancel
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm font-semibold">{userSubscription.plan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={userSubscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {userSubscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Billing Cycle</span>
                <span className="text-sm font-semibold">{userSubscription.plan.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Billing</span>
                <span className="text-sm font-semibold">
                  {userSubscription.endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto Renew</span>
                <Switch
                  checked={userSubscription.autoRenew}
                  onCheckedChange={(checked) => {
                    // Mock auto-renewal toggle
                    const updatedSubscription = {
                      ...userSubscription,
                      autoRenew: checked
                    }
                    setUserSubscription(updatedSubscription)
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annual')}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">
              Annual
              <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                Save 20%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.recommended ? 'border-2 border-blue-500' : ''}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className={`inline-flex p-3 rounded-full ${plan.color}`}>
                {plan.icon}
              </div>
              <CardTitle className="mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold">{plan.name}</span>
                </div>
              </CardTitle>
              <div className="mt-2">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-3xl font-bold">
                    ${billingCycle === 'annual' ? getAnnualPrice(plan.price) : plan.price}
                  </span>
                  <span className="text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6">
                <Button 
                  className={`w-full ${plan.recommended ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 animate-spin rounded-full" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      {showUserSubscription ? (
                        userSubscription?.planId === plan.id ? (
                          'Current Plan'
                        ) : (
                          'Switch Plan'
                        )
                      ) : (
                        'Get Started'
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Can I change plans anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">What happens if I exceed my plan limits?</h4>
              <p className="text-sm text-gray-600">
                You'll receive notifications when approaching your limits. You can upgrade your plan at any time to accommodate your needs.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Is there a free trial?</h4>
              <p className="text-sm text-gray-600">
                Yes, we offer a 14-day free trial for all plans. No credit card required.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription at any time. Your service will continue until the end of your billing period.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Do you offer refunds?</h4>
              <p className="text-sm text-gray-600">
                We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied, we'll provide a full refund.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}