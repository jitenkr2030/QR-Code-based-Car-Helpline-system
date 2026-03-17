import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// WebSocket for real-time updates (in production, use Socket.io or similar)
interface TrackingUpdate {
  bookingId: string
  status: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  estimatedArrival?: string
  partnerInfo?: {
    id: string
    businessName: string
    phone: string
    rating: number
  }
  mechanicInfo?: {
    id: string
    name: string
    phone: string
    specialties: string[]
  }
  timestamp: string
}

// Simulated real-time tracking data
const trackingData = new Map<string, TrackingUpdate>()

// Simulate partner movement
function simulatePartnerMovement(bookingId: string, startLat: number, startLng: number, endLat: number, endLng: number) {
  const steps = 10
  const latStep = (endLat - startLat) / steps
  const lngStep = (endLng - startLng) / steps
  
  let currentStep = 0
  
  const interval = setInterval(() => {
    currentStep++
    
    const currentLat = startLat + (latStep * currentStep)
    const currentLng = startLng + (lngStep * currentStep)
    
    const update: TrackingUpdate = {
      bookingId,
      status: currentStep < steps ? 'in_progress' : 'arrived',
      location: {
        latitude: currentLat,
        longitude: currentLng,
        address: `Location ${currentStep} of ${steps}`
      },
      timestamp: new Date().toISOString()
    }
    
    trackingData.set(bookingId, update)
    
    // Broadcast to connected clients (in production, use WebSocket)
    broadcastTrackingUpdate(bookingId, update)
    
    if (currentStep >= steps) {
      clearInterval(interval)
    }
  }, 3000) // Update every 3 seconds
}

// Broadcast tracking update to connected clients
async function broadcastTrackingUpdate(bookingId: string, update: TrackingUpdate) {
  try {
    // In production, you would use WebSocket to broadcast to connected clients
    console.log('📍 Real-time tracking update:', {
      bookingId,
      status: update.status,
      location: update.location,
      timestamp: update.timestamp
    })
    
    // For demo purposes, we'll just log the update
    return true
  } catch (error) {
    console.error('Error broadcasting tracking update:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    
    if (!bookingId) {
      return NextResponse.json({ 
        error: 'Booking ID is required' 
      }, { status: 400 })
    }
    
    // Get booking details
    const booking = await db.serviceBooking.findUnique({
      where: { id: bookingId },
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
        partner: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            address: true,
            rating: true
          }
        },
        mechanic: {
          select: {
            id: true,
            name: true,
            phone: true,
            specialties: true,
            experience: true,
            rating: true
          }
        }
      }
    })
    
    if (!booking) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 })
    }
    
    // Get latest tracking data or create initial tracking data
    let trackingUpdate = trackingData.get(bookingId)
    
    if (!trackingUpdate) {
      // Create initial tracking data
      trackingUpdate = {
        bookingId,
        status: booking.status,
        location: {
          latitude: booking.latitude,
          longitude: booking.longitude,
          address: booking.pickupAddress
        },
        estimatedArrival: booking.estimatedArrival,
        partnerInfo: booking.partner ? {
          id: booking.partner.id,
          businessName: booking.partner.businessName,
          phone: booking.partner.phone,
          rating: booking.partner.rating
        } : undefined,
        mechanicInfo: booking.mechanic ? {
          id: booking.mechanic.id,
          name: booking.mechanic.name,
          phone: booking.mechanic.phone,
          specialties: JSON.parse(booking.mechanic.specialties),
          rating: booking.mechanic.rating
        } : undefined,
        timestamp: new Date().toISOString()
      }
      
      trackingData.set(bookingId, trackingUpdate)
      
      // Start simulating partner movement if booking is assigned
      if (booking.status === 'assigned' && booking.partner) {
        // Simulate movement from partner location to customer location
        simulatePartnerMovement(
          bookingId,
          booking.partner.latitude || 0,
          booking.partner.longitude || 0,
          booking.latitude,
          booking.longitude
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        serviceType: booking.serviceType,
        description: booking.description,
        urgency: booking.urgency,
        status: booking.status,
        pickupAddress: booking.pickupAddress,
        latitude: booking.latitude,
        longitude: booking.longitude,
        preferredDate: booking.preferredDate?.toISOString(),
        preferredTime: booking.preferredTime,
        estimatedArrival: booking.estimatedArrival,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        user: booking.user,
        vehicle: booking.vehicle,
        partner: booking.partner,
        mechanic: booking.mechanic
      },
      tracking: trackingUpdate
    })
    
  } catch (error) {
    console.error('Error fetching tracking data:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, location, estimatedArrival, partnerInfo, mechanicInfo } = body
    
    if (!bookingId) {
      return NextResponse.json({ 
        error: 'Booking ID is required' 
      }, { status: 400 })
    }
    
    // Validate status
    const validStatuses = ['pending', 'assigned', 'in_progress', 'arrived', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: pending, assigned, in_progress, arrived, completed, cancelled' 
      }, { status: 400 })
    }
    
    // Update booking status if provided
    if (status) {
      await db.serviceBooking.update({
        where: { id: bookingId },
        data: {
          status,
          updatedAt: new Date()
        }
      })
    }
    
    // Create tracking update
    const trackingUpdate: TrackingUpdate = {
      bookingId,
      status: status || 'pending',
      location: location || {
        latitude: 0,
        longitude: 0
      },
      estimatedArrival,
      partnerInfo,
      mechanicInfo,
      timestamp: new Date().toISOString()
    }
    
    // Store tracking data
    trackingData.set(bookingId, trackingUpdate)
    
    // Broadcast update to connected clients
    await broadcastTrackingUpdate(bookingId, trackingUpdate)
    
    return NextResponse.json({
      success: true,
      message: 'Tracking update sent successfully',
      tracking: trackingUpdate
    })
    
  } catch (error) {
    console.error('Error updating tracking data:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, location, estimatedArrival } = body
    
    if (!bookingId) {
      return NextResponse.json({ 
        error: 'Booking ID is required' 
      }, { status: 400 })
    }
    
    // Update booking in database
    const updatedBooking = await db.serviceBooking.update({
      where: { id: bookingId },
      data: {
        status: status,
        updatedAt: new Date()
      }
    })
    
    // Create tracking update
    const trackingUpdate: TrackingUpdate = {
      bookingId,
      status: status,
      location: location,
      estimatedArrival,
      timestamp: new Date().toISOString()
    }
    
    // Store tracking data
    trackingData.set(bookingId, trackingUpdate)
    
    // Broadcast update to connected clients
    await broadcastTrackingUpdate(bookingId, trackingUpdate)
    
    return NextResponse.json({
      success: true,
      message: 'Tracking updated successfully',
      booking: updatedBooking,
      tracking: trackingUpdate
    })
    
  } catch (error) {
    console.error('Error updating tracking:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// WebSocket endpoint for real-time tracking (in production)
export async function WS(request: NextRequest) {
  // This would be implemented with Socket.io or similar WebSocket library
  // For now, we'll return a placeholder response
  return NextResponse.json({
    message: 'WebSocket endpoint for real-time tracking',
    note: 'In production, this would be implemented with Socket.io or similar'
  })
}