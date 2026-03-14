import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// QR Code pricing in INR
const QR_CODE_PRICING = {
  basic: {
    price: 299,
    name: 'Basic QR Code',
    description: '2x2" vinyl sticker, 1-year durability',
    features: ['Vehicle information', 'Emergency contacts', 'Basic tracking']
  },
  premium: {
    price: 499,
    name: 'Premium QR Code',
    description: '3x3" weather-resistant sticker, 2-year durability',
    features: ['Vehicle information', 'Service history', 'Warranty tracking', 'Priority support']
  },
  fleet: {
    price: 799,
    name: 'Fleet QR Code',
    description: '4x4" heavy-duty metal plate, 3-year durability',
    features: ['Fleet management', 'Maintenance tracking', 'Advanced analytics', 'Dedicated support']
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      vehicleId,
      qrType,
      quantity = 1,
      deliveryMethod,
      deliveryAddress,
      paymentMethod,
      specialInstructions
    } = body

    // Validate required fields
    if (!userId || !vehicleId || !qrType || !deliveryMethod || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, vehicleId, qrType, deliveryMethod, paymentMethod' 
      }, { status: 400 })
    }

    // Validate QR type
    if (!QR_CODE_PRICING[qrType as keyof typeof QR_CODE_PRICING]) {
      return NextResponse.json({ 
        error: 'Invalid QR type. Must be one of: basic, premium, fleet' 
      }, { status: 400 })
    }

    // Get user and vehicle information
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      include: { owner: true }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Check if vehicle belongs to user
    if (vehicle.ownerId !== userId) {
      return NextResponse.json({ error: 'Vehicle does not belong to this user' }, { status: 403 })
    }

    // Calculate pricing
    const qrPricing = QR_CODE_PRICING[qrType as keyof typeof QR_CODE_PRICING]
    const basePrice = qrPricing.price
    const totalPrice = basePrice * quantity

    // Generate unique order ID
    const orderId = `QR-ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create order
    const order = await db.qRCodeOrder.create({
      data: {
        orderId,
        userId,
        vehicleId,
        qrType,
        quantity,
        basePrice,
        totalPrice,
        deliveryMethod,
        deliveryAddress,
        paymentMethod,
        status: 'pending',
        specialInstructions: specialInstructions || '',
        orderDate: new Date()
      }
    })

    // Create QR code records for the order
    const qrCodes = []
    for (let i = 0; i < quantity; i++) {
      const timestamp = Date.now() + i
      const random = Math.random().toString(36).substring(2, 8)
      const cleanPlate = vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, '')
      const qrCode = `QR-CAR-${cleanPlate}-${timestamp}-${random}`.toUpperCase()

      const qrRecord = await db.qRCode.create({
        data: {
          vehicleId,
          qrCode,
          orderId: order.id,
          status: 'pending',
          generatedAt: new Date()
        }
      })

      qrCodes.push(qrRecord)
    }

    return NextResponse.json({ 
      success: true,
      message: 'QR code order created successfully',
      order: {
        id: order.id,
        orderId: order.orderId,
        qrType: order.qrType,
        quantity: order.quantity,
        basePrice: order.basePrice,
        totalPrice: order.totalPrice,
        status: order.status,
        orderDate: order.orderDate.toISOString(),
        deliveryMethod: order.deliveryMethod,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        vehicle: {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color
        },
        qrCodes: qrCodes.map(qr => ({
          id: qr.id,
          qrCode: qr.qrCode,
          status: qr.status
        }))
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating QR code order:', error)
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
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (userId) {
      whereClause.userId = userId
    }

    if (orderId) {
      whereClause.orderId = orderId
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const orders = await db.qRCodeOrder.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            color: true
          }
        },
        qrCodes: {
          select: {
            id: true,
            qrCode: true,
            status: true,
            generatedAt: true,
            deliveredAt: true
          }
        },
        _count: {
          select: {
            qrCodes: true
          }
        }
      },
      orderBy: { orderDate: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        qrType: order.qrType,
        quantity: order.quantity,
        basePrice: order.basePrice,
        totalPrice: order.totalPrice,
        status: order.status,
        orderDate: order.orderDate.toISOString(),
        deliveryMethod: order.deliveryMethod,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        specialInstructions: order.specialInstructions,
        user: order.user,
        vehicle: order.vehicle,
        qrCodes: order.qrCodes,
        qrCodesCount: order._count.qrCodes
      }))
    })

  } catch (error) {
    console.error('Error fetching QR code orders:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, trackingNumber, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: pending, paid, processing, shipped, delivered, cancelled' 
      }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (notes) updateData.notes = notes

    const order = await db.qRCodeOrder.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        vehicle: true,
        qrCodes: true
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Order updated successfully',
      order
    })

  } catch (error) {
    console.error('Error updating QR code order:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}