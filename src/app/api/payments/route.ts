import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  paymentMethod: string
  customerName: string
  customerEmail: string
  customerPhone: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()
    const {
      orderId,
      amount,
      currency = 'INR',
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      description
    } = body

    // Validate required fields
    if (!orderId || !amount || !paymentMethod || !customerName || !customerEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: orderId, amount, paymentMethod, customerName, customerEmail' 
      }, { status: 400 })
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be greater than 0' 
      }, { status: 400 })
    }

    // Validate payment method
    const validPaymentMethods = ['upi', 'card', 'netbanking', 'cash']
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ 
        error: 'Invalid payment method. Must be one of: upi, card, netbanking, cash' 
      }, { status: 400 })
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        orderId,
        amount,
        currency,
        paymentMethod,
        status: 'pending',
        customerName,
        customerEmail,
        customerPhone,
        description: description || ''
      }
    })

    // For demo purposes, we'll simulate payment processing
    // In production, you would integrate with actual payment gateways
    let paymentResponse = null
    let transactionId = null

    if (paymentMethod === 'upi') {
      // Simulate UPI payment
      transactionId = `UPI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      paymentResponse = {
        upiId: 'carhelpline@ybl',
        amount: amount,
        currency: currency,
        transactionId: transactionId
      }
    } else if (paymentMethod === 'card') {
      // Simulate card payment
      transactionId = `CARD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      paymentResponse = {
        cardNumber: '****-****-****-4242',
        amount: amount,
        currency: currency,
        transactionId: transactionId
      }
    } else if (paymentMethod === 'netbanking') {
      // Simulate net banking payment
      transactionId = `NB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      paymentResponse = {
        bankName: 'Demo Bank',
        amount: amount,
        currency: currency,
        transactionId: transactionId
      }
    } else if (paymentMethod === 'cash') {
      // Cash payment - mark as pending collection
      transactionId = `CASH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      paymentResponse = {
        amount: amount,
        currency: currency,
        transactionId: transactionId,
        collectionStatus: 'pending'
      }
    }

    // Update payment with transaction details
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: transactionId,
        gateway: paymentMethod.toUpperCase(),
        status: 'processing'
      }
    })

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            paidAt: new Date()
          }
        })
      } catch (error) {
        console.error('Error updating payment status:', error)
      }
    }, 3000) // 3 seconds delay for demo

    return NextResponse.json({ 
      success: true,
      message: 'Payment initiated successfully',
      payment: {
        id: updatedPayment.id,
        orderId: updatedPayment.orderId,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        paymentMethod: updatedPayment.paymentMethod,
        status: updatedPayment.status,
        transactionId: transactionId,
        paymentResponse: paymentResponse
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')

    let whereClause: any = {}

    if (orderId) {
      whereClause.orderId = orderId
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (paymentMethod && paymentMethod !== 'all') {
      whereClause.paymentMethod = paymentMethod
    }

    const payments = await db.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      payments: payments.map(payment => ({
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId,
        gateway: payment.gateway,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        customerPhone: payment.customerPhone,
        description: payment.description,
        createdAt: payment.createdAt.toISOString(),
        paidAt: payment.paidAt?.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, gateway, transactionId } = body

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: pending, processing, completed, failed, refunded' 
      }, { status: 400 })
    }

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'completed') {
        updateData.paidAt = new Date()
      }
    }
    if (gateway) updateData.gateway = gateway
    if (transactionId) updateData.transactionId = transactionId

    const payment = await db.payment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true,
      message: 'Payment updated successfully',
      payment
    })

  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}