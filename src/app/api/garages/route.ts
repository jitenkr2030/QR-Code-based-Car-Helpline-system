import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '10' // default 10km
    const serviceType = searchParams.get('serviceType')
    
    let garages
    
    if (lat && lng) {
      // Find nearby garages with distance calculation
      const allGarages = await db.garage.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              bookings: true,
              mechanics: true
            }
          }
        }
      })
      
      // Calculate distances and filter by radius
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      const maxRadius = parseFloat(radius)
      
      garages = allGarages
        .map(garage => ({
          ...garage,
          distance: calculateDistance(userLat, userLng, garage.latitude, garage.longitude)
        }))
        .filter(garage => garage.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance)
      
      // Filter by service type if specified
      if (serviceType) {
        garages = garages.filter(garage => 
          garage.services && garage.services.includes(serviceType)
        )
      }
    } else {
      // Get all garages
      let whereClause: any = { isActive: true }
      
      if (serviceType) {
        whereClause.services = {
          contains: serviceType
        }
      }
      
      garages = await db.garage.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              bookings: true,
              mechanics: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    }
    
    return NextResponse.json({ 
      success: true,
      garages: garages.map(garage => ({
        id: garage.id,
        name: garage.name,
        address: garage.address,
        phone: garage.phone,
        email: garage.email,
        website: garage.website,
        latitude: garage.latitude,
        longitude: garage.longitude,
        services: garage.services ? JSON.parse(garage.services) : [],
        hours: garage.hours,
        rating: garage.rating || 0,
        isActive: garage.isActive,
        createdAt: garage.createdAt.toISOString(),
        updatedAt: garage.updatedAt.toISOString(),
        bookingsCount: garage._count.bookings,
        mechanicsCount: garage._count.mechanics,
        distance: garage.distance || null
      }))
    })
  } catch (error) {
    console.error('Error fetching garages:', error)
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
      name,
      address,
      phone,
      email,
      website,
      latitude,
      longitude,
      services,
      hours,
      rating
    } = body
    
    // Validate required fields
    if (!name || !address || !phone || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, address, phone, latitude, longitude' 
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
    
    // Validate rating
    const parsedRating = rating ? parseFloat(rating) : 0
    if (parsedRating < 0 || parsedRating > 5) {
      return NextResponse.json({ 
        error: 'Rating must be between 0 and 5' 
      }, { status: 400 })
    }
    
    // Create garage
    const garage = await db.garage.create({
      data: {
        name,
        address,
        phone,
        email: email || null,
        website: website || null,
        latitude: lat,
        longitude: lng,
        services: services ? JSON.stringify(services) : '[]',
        hours: hours || '9:00 AM - 6:00 PM',
        rating: parsedRating,
        isActive: true
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Garage created successfully',
      garage: {
        id: garage.id,
        name: garage.name,
        address: garage.address,
        phone: garage.phone,
        email: garage.email,
        website: garage.website,
        latitude: garage.latitude,
        longitude: garage.longitude,
        services: garage.services ? JSON.parse(garage.services) : [],
        hours: garage.hours,
        rating: garage.rating,
        isActive: garage.isActive,
        createdAt: garage.createdAt.toISOString(),
        updatedAt: garage.updatedAt.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating garage:', error)
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
      return NextResponse.json({ error: 'Garage ID is required' }, { status: 400 })
    }
    
    // Validate coordinates if provided
    if (updateData.latitude || updateData.longitude) {
      const lat = parseFloat(updateData.latitude)
      const lng = parseFloat(updateData.longitude)
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return NextResponse.json({ 
          error: 'Invalid coordinates' 
        }, { status: 400 })
      }
      updateData.latitude = lat
      updateData.longitude = lng
    }
    
    // Validate rating if provided
    if (updateData.rating) {
      const parsedRating = parseFloat(updateData.rating)
      if (parsedRating < 0 || parsedRating > 5) {
        return NextResponse.json({ 
          error: 'Rating must be between 0 and 5' 
        }, { status: 400 })
      }
      updateData.rating = parsedRating
    }
    
    // Convert services to JSON string if provided
    if (updateData.services) {
      updateData.services = JSON.stringify(updateData.services)
    }
    
    const garage = await db.garage.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Garage updated successfully',
      garage: {
        id: garage.id,
        name: garage.name,
        address: garage.address,
        phone: garage.phone,
        email: garage.email,
        website: garage.website,
        latitude: garage.latitude,
        longitude: garage.longitude,
        services: garage.services ? JSON.parse(garage.services) : [],
        hours: garage.hours,
        rating: garage.rating,
        isActive: garage.isActive,
        createdAt: garage.createdAt.toISOString(),
        updatedAt: garage.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating garage:', error)
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
      return NextResponse.json({ error: 'Garage ID is required' }, { status: 400 })
    }
    
    // Check if garage has active bookings
    const activeBookings = await db.serviceBooking.count({
      where: {
        garageId: id,
        status: {
          in: ['pending', 'assigned', 'in_progress']
        }
      }
    })
    
    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete garage with active bookings' 
      }, { status: 400 })
    }
    
    await db.garage.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Garage deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting garage:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
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