import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (email) {
      // Get user by email
      const user = await db.user.findUnique({
        where: { email },
        include: {
          vehicles: {
            orderBy: { createdAt: 'desc' }
          },
          bookings: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          vehicles: user.vehicles.map(vehicle => ({
            id: vehicle.id,
            qrCode: vehicle.qrCode,
            vin: vehicle.vin,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            licensePlate: vehicle.licensePlate,
            color: vehicle.color,
            mileage: vehicle.mileage,
            insuranceCompany: vehicle.insuranceCompany,
            insurancePolicy: vehicle.insurancePolicy,
            insuranceExpiry: vehicle.insuranceExpiry?.toISOString(),
            createdAt: vehicle.createdAt.toISOString(),
            updatedAt: vehicle.updatedAt.toISOString()
          })),
          bookings: user.bookings.map(booking => ({
            id: booking.id,
            serviceType: booking.serviceType,
            description: booking.description,
            urgency: booking.urgency,
            status: booking.status,
            pickupAddress: booking.pickupAddress,
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString()
          }))
        }
      })
    }
    
    // Get all users
    const users = await db.user.findMany({
      include: {
        _count: {
          select: {
            vehicles: true,
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ 
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        vehiclesCount: user._count.vehicles,
        bookingsCount: user._count.bookings
      }))
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone } = body
    
    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }
    
    // Create user
    const user = await db.user.create({
      data: {
        email,
        name: name || '',
        phone: phone || ''
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // If email is being updated, check if it's already taken by another user
    if (updateData.email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: id }
        }
      })
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Email is already taken by another user' 
        }, { status: 400 })
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json({ 
          error: 'Invalid email format' 
        }, { status: 400 })
      }
    }
    
    const user = await db.user.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Check if user has active vehicles or bookings
    const activeVehicles = await db.vehicle.count({
      where: { ownerId: id }
    })
    
    const activeBookings = await db.serviceBooking.count({
      where: { userId: id }
    })
    
    if (activeVehicles > 0 || activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with active vehicles or bookings' 
      }, { status: 400 })
    }
    
    await db.user.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}