import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'plans', 'user-subscription', 'payments'
    const userId = searchParams.get('userId')
    const planId = searchParams.get('planId')
    const status = searchParams.get('status')

    switch (type) {
      case 'plans':
        return await getSubscriptionPlans()
      case 'user-subscription':
        return await getUserSubscription(userId || '')
      case 'payments':
        return await getSubscriptionPayments(userId || '')
      default:
        return await getSubscriptionPlans()
    }

  } catch (error) {
    console.error('Error in subscriptions API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, planId, paymentMethod, autoRenew } = body

    switch (type) {
      case 'subscribe':
        return await createSubscription(userId, planId, paymentMethod, autoRenew)
      case 'cancel':
        return await cancelSubscription(userId, body.reason)
      case 'renew':
        return await renewSubscription(userId, paymentMethod)
      case 'upgrade':
        return await upgradeSubscription(userId, planId, paymentMethod)
      case 'payment':
        return await processSubscriptionPayment(body)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in subscriptions API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, subscriptionId, status, autoRenew } = body

    switch (type) {
      case 'update-subscription':
        return await updateSubscription(subscriptionId, { status, autoRenew })
      case 'update-payment':
        return await updateSubscriptionPayment(subscriptionId, body)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in subscriptions API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

async function getSubscriptionPlans() {
  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  })

  return NextResponse.json({
    success: true,
    plans: plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      features: JSON.parse(plan.features),
      isPopular: plan.isPopular,
      maxVehicles: plan.maxVehicles,
      maxServices: plan.maxServices,
      prioritySupport: plan.prioritySupport,
      createdAt: plan.createdAt.toISOString()
    }))
  })
}

async function getUserSubscription(userId: string) {
  if (!userId) {
    return NextResponse.json({ 
      error: 'User ID is required' 
    }, { status: 400 })
  }

  const subscription = await db.userSubscription.findFirst({
    where: { 
      userId,
      status: 'active'
    },
    include: {
      plan: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  if (!subscription) {
    return NextResponse.json({
      success: true,
      subscription: null
    })
  }

  // Get payment history
  const payments = await db.subscriptionPayment.findMany({
    where: { 
      subscriptionId: subscription.id,
      status: 'completed'
    },
    orderBy: { paymentDate: 'desc' },
    take: 5
  })

  return NextResponse.json({
    success: true,
    subscription: {
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate?.toISOString(),
      nextBillingDate: subscription.nextBillingDate?.toISOString(),
      autoRenew: subscription.autoRenew,
      paymentMethod: subscription.paymentMethod,
      lastPaymentAt: subscription.lastPaymentAt?.toISOString(),
      cancelledAt: subscription.cancelledAt?.toISOString(),
      cancelledReason: subscription.cancelledReason,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        description: subscription.plan.description,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        duration: subscription.plan.duration,
        features: JSON.parse(subscription.plan.features),
        isPopular: subscription.plan.isPopular,
        maxVehicles: subscription.plan.maxVehicles,
        maxServices: subscription.plan.maxServices,
        prioritySupport: subscription.plan.prioritySupport
      },
      user: subscription.user,
      paymentHistory: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentDate: payment.paymentDate?.toISOString()
      }))
    }
  })
}

async function createSubscription(userId: string, planId: string, paymentMethod: string, autoRenew: boolean = true) {
  if (!userId || !planId) {
    return NextResponse.json({ 
      error: 'User ID and Plan ID are required' 
    }, { status: 400 })
  }

  // Get plan details
  const plan = await db.subscriptionPlan.findUnique({
    where: { id: planId, isActive: true }
  })

  if (!plan) {
    return NextResponse.json({ 
      error: 'Invalid plan or plan is not active' 
    }, { status: 400 })
  }

  // Check if user already has an active subscription
  const existingSubscription = await db.userSubscription.findFirst({
    where: { 
      userId,
      status: 'active'
    }
  })

  if (existingSubscription) {
    return NextResponse.json({ 
      error: 'User already has an active subscription' 
    }, { status: 400 })
  }

  // Calculate subscription dates
  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + plan.duration)
  const nextBillingDate = new Date(endDate)

  // Create subscription
  const subscription = await db.userSubscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      startDate,
      endDate,
      nextBillingDate,
      autoRenew,
      paymentMethod
    }
  })

  // Create initial payment record
  const payment = await db.subscriptionPayment.create({
    data: {
      subscriptionId: subscription.id,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod,
      status: 'pending',
      nextBillingDate
    }
  })

  // In production, you would process the actual payment here
  // For demo purposes, we'll mark it as completed
  await db.subscriptionPayment.update({
    where: { id: payment.id },
    data: {
      status: 'completed',
      paymentDate: new Date(),
      transactionId: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }
  })

  // Update subscription with last payment date
  await db.userSubscription.update({
    where: { id: subscription.id },
    data: {
      lastPaymentAt: new Date()
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Subscription created successfully',
    subscription: {
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      autoRenew: subscription.autoRenew,
      paymentMethod: subscription.paymentMethod,
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration,
        features: JSON.parse(plan.features)
      }
    }
  })
}

async function cancelSubscription(userId: string, reason: string) {
  if (!userId) {
    return NextResponse.json({ 
      error: 'User ID is required' 
    }, { status: 400 })
  }

  const subscription = await db.userSubscription.findFirst({
    where: { 
      userId,
      status: 'active'
    }
  })

  if (!subscription) {
    return NextResponse.json({ 
      error: 'No active subscription found' 
    }, { status: 404 })
  }

  // Update subscription
  const updatedSubscription = await db.userSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledReason: reason,
      autoRenew: false
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Subscription cancelled successfully',
    subscription: {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      cancelledAt: updatedSubscription.cancelledAt?.toISOString(),
      cancelledReason: updatedSubscription.cancelledReason
    }
  })
}

async function renewSubscription(userId: string, paymentMethod: string) {
  if (!userId) {
    return NextResponse.json({ 
      error: 'User ID is required' 
    }, { status: 400 })
  }

  const subscription = await db.userSubscription.findFirst({
    where: { 
      userId,
      status: 'active'
    },
    include: { plan: true }
  })

  if (!subscription) {
    return NextResponse.json({ 
      error: 'No active subscription found' 
    }, { status: 404 })
  }

  // Calculate new dates
  const currentEndDate = subscription.endDate || new Date()
  const newStartDate = new Date(currentEndDate)
  const newEndDate = new Date(newStartDate)
  newEndDate.setMonth(newEndDate.getMonth() + subscription.plan.duration)
  const nextBillingDate = new Date(newEndDate)

  // Update subscription
  const updatedSubscription = await db.userSubscription.update({
    where: { id: subscription.id },
    data: {
      startDate: newStartDate,
      endDate: newEndDate,
      nextBillingDate,
      status: 'active',
      cancelledAt: null,
      cancelledReason: null,
      autoRenew: true,
      paymentMethod,
      lastPaymentAt: new Date()
    }
  })

  // Create payment record
  const payment = await db.subscriptionPayment.create({
    data: {
      subscriptionId: subscription.id,
      amount: subscription.plan.price,
      currency: subscription.plan.currency,
      paymentMethod,
      status: 'pending',
      nextBillingDate
    }
  })

  // Mark payment as completed
  await db.subscriptionPayment.update({
    where: { id: payment.id },
    data: {
      status: 'completed',
      paymentDate: new Date(),
      transactionId: `RENEW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Subscription renewed successfully',
    subscription: {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
      startDate: updatedSubscription.startDate.toISOString(),
      endDate: updatedSubscription.endDate.toISOString(),
      nextBillingDate: updatedSubscription.nextBillingDate.toISOString(),
      autoRenew: updatedSubscription.autoRenew
    }
  })
}

async function upgradeSubscription(userId: string, newPlanId: string, paymentMethod: string) {
  if (!userId || !newPlanId) {
    return NextResponse.json({ 
      error: 'User ID and Plan ID are required' 
    }, { status: 400 })
  }

  const currentSubscription = await db.userSubscription.findFirst({
    where: { 
      userId,
      status: 'active'
    },
    include: { plan: true }
  })

  if (!currentSubscription) {
    return NextResponse.json({ 
      error: 'No active subscription found' 
    }, { status: 404 })
  }

  const newPlan = await db.subscriptionPlan.findUnique({
    where: { id: newPlanId, isActive: true }
  })

  if (!newPlan) {
    return NextResponse.json({ 
      error: 'Invalid plan or plan is not active' 
    }, { status: 400 })
  }

  // Calculate prorated amount (simplified)
  const daysRemaining = Math.ceil((currentSubscription.endDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const totalDays = currentSubscription.plan.duration * 30
  const remainingValue = (daysRemaining / totalDays) * currentSubscription.plan.price
  const upgradeAmount = newPlan.price - remainingValue

  // Update subscription
  const updatedSubscription = await db.userSubscription.update({
    where: { id: currentSubscription.id },
    data: {
      planId: newPlanId,
      status: 'active',
      paymentMethod,
      lastPaymentAt: new Date()
    }
  })

  // Create payment record
  const payment = await db.subscriptionPayment.create({
    data: {
      subscriptionId: currentSubscription.id,
      amount: Math.max(0, upgradeAmount),
      currency: newPlan.currency,
      paymentMethod,
      status: 'pending',
      nextBillingDate: currentSubscription.nextBillingDate
    }
  })

  // Mark payment as completed
  await db.subscriptionPayment.update({
    where: { id: payment.id },
    data: {
      status: 'completed',
      paymentDate: new Date(),
      transactionId: `UPGRADE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Subscription upgraded successfully',
    subscription: {
      id: updatedSubscription.id,
      plan: {
        id: newPlan.id,
        name: newPlan.name,
        description: newPlan.description,
        price: newPlan.price,
        currency: newPlan.currency,
        duration: newPlan.duration,
        features: JSON.parse(newPlan.features)
      },
      upgradeAmount: Math.max(0, upgradeAmount)
    }
  })
}

async function getSubscriptionPayments(userId: string) {
  if (!userId) {
    return NextResponse.json({ 
      error: 'User ID is required' 
    }, { status: 400 })
  }

  const payments = await db.subscriptionPayment.findMany({
    where: {
      subscription: {
        userId
      }
    },
    include: {
      subscription: {
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { paymentDate: 'desc' }
  })

  return NextResponse.json({
    success: true,
    payments: payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate?.toISOString(),
      nextBillingDate: payment.nextBillingDate?.toISOString(),
      subscription: {
        id: payment.subscription.id,
        status: payment.subscription.status,
        plan: {
          id: payment.subscription.plan.id,
          name: payment.subscription.plan.name,
          price: payment.subscription.plan.price,
          currency: payment.subscription.plan.currency
        },
        user: payment.subscription.user
      }
    }))
  })
}

async function updateSubscription(subscriptionId: string, updates: any) {
  if (!subscriptionId) {
    return NextResponse.json({ 
      error: 'Subscription ID is required' 
    }, { status: 400 })
  }

  const subscription = await db.userSubscription.update({
    where: { id: subscriptionId },
    data: updates
  })

  return NextResponse.json({
    success: true,
    message: 'Subscription updated successfully',
    subscription
  })
}

async function updateSubscriptionPayment(subscriptionId: string, updates: any) {
  if (!subscriptionId) {
    return NextResponse.json({ 
      error: 'Subscription ID is required' 
    }, { status: 400 })
  }

  const payment = await db.subscriptionPayment.update({
    where: { subscriptionId },
    data: updates
  })

  return NextResponse.json({
    success: true,
    message: 'Payment updated successfully',
    payment
  })
}

async function processSubscriptionPayment(paymentData: any) {
  const { subscriptionId, amount, currency, paymentMethod } = paymentData

  if (!subscriptionId) {
    return NextResponse.json({ 
      error: 'Subscription ID is required' 
    }, { status: 400 })
  }

  // Create payment record
  const payment = await db.subscriptionPayment.create({
    data: {
      subscriptionId,
      amount,
      currency,
      paymentMethod,
      status: 'pending'
    }
  })

  // In production, you would process the actual payment here
  // For demo purposes, we'll mark it as completed
  await db.subscriptionPayment.update({
    where: { id: payment.id },
    data: {
      status: 'completed',
      paymentDate: new Date(),
      transactionId: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Payment processed successfully',
    payment: {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: 'completed',
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate?.toISOString()
    }
  })
}