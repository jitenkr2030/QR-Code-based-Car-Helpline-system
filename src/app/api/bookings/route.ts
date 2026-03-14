import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const vehicleId = searchParams.get('vehicleId')
    
    const whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    if (userId) {
      whereClause.userId = userId
    }
    if (vehicleId) {
      whereClause.vehicleId = vehicleId
    }
    
    const bookings = await db.serviceBooking.findMany({
      where: whereClause,
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        garage: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            latitude: true,
            longitude: true
          }
        },
        assignments: {
          include: {
            mechanic: {
              select: {
                id: true,
                name: true,
                phone: true,
                specialties: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ 
      success: true,
      bookings: bookings.map(booking => ({
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
        vehicle: booking.vehicle,
        user: booking.user,
        garage: booking.garage,
        assignments: booking.assignments.map(assignment => ({
          id: assignment.id,
          status: assignment.status,
          assignedAt: assignment.assignedAt.toISOString(),
          completedAt: assignment.completedAt?.toISOString(),
          notes: assignment.notes,
          mechanic: assignment.mechanic
        }))
      }))
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceType,
      description,
      urgency,
      vehicleId,
      userId,
      pickupAddress,
      latitude,
      longitude,
      preferredDate,
      preferredTime
    } = body
    
    // Validate required fields
    if (!serviceType || !vehicleId || !userId || !pickupAddress || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Missing required fields: serviceType, vehicleId, userId, pickupAddress, latitude, longitude' 
      }, { status: 400 })
    }
    
    // Validate urgency
    const validUrgency = ['normal', 'urgent', 'emergency']
    if (!validUrgency.includes(urgency)) {
      return NextResponse.json({ 
        error: 'Invalid urgency. Must be one of: normal, urgent, emergency' 
      }, { status: 400 })
    }
    
    // Validate service type
    const validServiceTypes = ['towing', 'mechanic', 'fuel', 'accident', 'lockout']
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json({ 
        error: 'Invalid service type. Must be one of: towing, mechanic, fuel, accident, lockout' 
      }, { status: 400 })
    }
    
    // Validate coordinates
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ 
        error: 'Invalid coordinates' 
      }, { status: 400 })
    }
    
    // Create booking
    const booking = await db.serviceBooking.create({
      data: {
        serviceType,
        description: description || '',
        urgency: urgency || 'normal',
        status: 'pending',
        vehicleId,
        userId,
        pickupAddress,
        latitude: lat,
        longitude: lng,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || '',
        estimatedArrival: calculateEstimatedArrival(serviceType, urgency, lat, lng)
      },
      include: {
        vehicle: {
          include: {
            owner: true
          }
        },
        user: true
      }
    })

    // Assign partner to the booking
    try {
      const assignmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/partners/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          serviceType,
          urgency: urgency || 'normal',
          latitude: lat,
          longitude: lng,
          pickupAddress
        })
      })

      const assignmentData = await assignmentResponse.json()

      if (assignmentData.success) {
        // Update booking with partner assignment
        const updatedBooking = await db.serviceBooking.update({
          where: { id: booking.id },
          data: {
            partnerId: assignmentData.assignment.partner.id,
            mechanicId: assignmentData.assignment.mechanic?.id || '',
            assignedAt: new Date(),
            partnerETA: parseInt(assignmentData.assignment.estimatedArrival),
            status: 'assigned',
            estimatedArrival: `${assignmentData.assignment.estimatedArrival}`
          }
        })

        return NextResponse.json({
          success: true,
          booking: updatedBooking,
          assignment: assignmentData.assignment,
          message: `Service assigned successfully! ${assignmentData.assignment.partner.businessName} will arrive in ${assignmentData.assignment.estimatedArrival}`
        })

        // Send notification to user
        try {
          const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              title: 'Service Booking Confirmed',
              message: assignmentData 
                ? `Service assigned successfully! ${assignmentData.partner.businessName} will arrive in ${assignmentData.estimatedArrival}`
                : 'Service booking created successfully. We will find the nearest available partner.',
              type: 'success',
              actionUrl: '/dashboard',
              actionText: 'View Booking',
              metadata: {
                bookingId: booking.id,
                serviceType,
                urgency,
                partnerName: assignmentData.assignment?.partner?.businessName,
                estimatedArrival: assignmentData.assignment?.estimatedArrival
              }
            })
          })
        } catch (error) {
          console.error('Error sending notification:', error)
        }
      }
    } catch (error) {
      console.error('Error assigning partner:', error)
      // Continue with booking creation even if assignment fails
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Service booking created successfully',
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
        vehicle: booking.vehicle,
        user: booking.user
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, estimatedArrival } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }
    
    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: pending, assigned, in_progress, completed, cancelled' 
      }, { status: 400 })
    }
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (notes) updateData.notes = notes
    if (estimatedArrival) updateData.estimatedArrival = estimatedArrival
    
    const booking = await db.serviceBooking.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          include: {
            owner: true
          }
        },
        user: true
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Booking updated successfully',
      booking
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Helper function to calculate estimated arrival time
function calculateEstimatedArrival(serviceType: string, urgency: string, lat: number, lng: number): string {
  // Base times in minutes
  const baseTimes = {
    towing: { normal: 30, urgent: 15, emergency: 10 },
    mechanic: { normal: 45, urgent: 20, emergency: 15 },
    fuel: { normal: 20, urgent: 10, emergency: 5 },
    accident: { normal: 15, urgent: 10, emergency: 5 },
    lockout: { normal: 25, urgent: 15, emergency: 10 }
  }
  
  const baseTime = baseTimes[serviceType]?.[urgency] || 30
  const randomVariation = Math.floor(Math.random() * 10) - 5 // -5 to +5 minutes
  
  const estimatedMinutes = Math.max(5, baseTime + randomVariation)
  const hours = Math.floor(estimatedMinutes / 60)
  const minutes = estimatedMinutes % 60
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
}

// Helper function to find and assign nearest available partner
async function findAndAssignPartner(bookingId: string, serviceType: string, lat: number, lng: number) {
  try {
    // Find nearby garages that offer the required service
    const nearbyGarages = await db.garage.findMany({
      where: {
        isActive: true,
        services: {
          contains: serviceType
        }
      }
    })
    
    if (nearbyGarages.length === 0) {
      return null
    }
    
    // Calculate distances and find nearest
    const garagesWithDistance = nearbyGarages.map(garage => {
      const distance = calculateDistance(lat, lng, garage.latitude, garage.longitude)
      return { ...garage, distance }
    }).sort((a, b) => a.distance - b.distance)
    
    const nearestGarage = garagesWithDistance[0]
    
    if (nearestGarage.distance > 50) { // 50km radius
      return null
    }
    
    // Find available mechanic at the nearest garage
    const availableMechanic = await db.mechanic.findFirst({
      where: {
        garageId: nearestGarage.id,
        isActive: true,
        isOnDuty: true
      }
    })
    
    if (!availableMechanic) {
      return null
    }
    
    // Create service assignment
    const assignment = await db.serviceAssignment.create({
      data: {
        bookingId,
        mechanicId: availableMechanic.id,
        status: 'assigned',
        assignedAt: new Date()
      }
    })
    
    // Update booking status
    await db.serviceBooking.update({
      where: { id: bookingId },
      data: {
        status: 'assigned',
        garageId: nearestGarage.id,
        estimatedArrival: calculateEstimatedArrival(serviceType, 'normal', lat, lng)
      }
    })
    
    return {
      garageId: nearestGarage.id,
      garageName: nearestGarage.name,
      garagePhone: nearestGarage.phone,
      garageAddress: nearestGarage.address,
      mechanicId: availableMechanic.id,
      mechanicName: availableMechanic.name,
      mechanicPhone: availableMechanic.phone,
      distance: nearestGarage.distance,
      estimatedArrival: calculateEstimatedArrival(serviceType, 'normal', lat, lng)
    }
  } catch (error) {
    console.error('Error finding partner:', error)
    return null
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}