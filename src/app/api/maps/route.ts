import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface LocationData {
  latitude: number
  longitude: number
  address?: string
  city?: string
  state?: string
  pincode?: string
}

interface RouteData {
  origin: LocationData
  destination: LocationData
  waypoints?: LocationData[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'location', 'nearby', 'route', 'directions'
    const latitude = searchParams.get('lat')
    const longitude = searchParams.get('lng')
    const radius = searchParams.get('radius') || '10' // in km
    const serviceType = searchParams.get('service')
    const originLat = searchParams.get('originLat')
    const originLng = searchParams.get('originLng')
    const destLat = searchParams.get('destLat')
    const destLng = searchParams.get('destLng')

    switch (type) {
      case 'location':
        return await getLocationDetails(latitude, longitude)
      case 'nearby':
        return await getNearbyLocations(latitude, longitude, parseFloat(radius), serviceType)
      case 'route':
        return await getRoute(originLat, originLng, destLat, destLng)
      case 'directions':
        return await getDirections(originLat, originLng, destLat, destLng)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in maps API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

async function getLocationDetails(latitude?: string, longitude?: string) {
  if (!latitude || !longitude) {
    return NextResponse.json({ 
      error: 'Latitude and longitude are required' 
    }, { status: 400 })
  }

  // Get location details from coordinates
  const locationData = await reverseGeocode(parseFloat(latitude), parseFloat(longitude))
  
  return NextResponse.json({
    success: true,
    location: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      ...locationData
    }
  })
}

async function getNearbyLocations(lat: string, lng: string, radius: number, serviceType?: string) {
  if (!lat || !lng) {
    return NextResponse.json({ 
      error: 'Latitude and longitude are required' 
    }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  // Find nearby partners
  const partners = await db.partner.findMany({
    where: {
      isVerified: true,
      isActive: true,
      latitude: {
        gte: latitude - (radius / 111), // Approximate conversion
        lte: latitude + (radius / 111)
      },
      longitude: {
        gte: longitude - (radius / 111),
        lte: longitude + (radius / 111)
      }
    },
    include: {
      mechanics: {
        where: {
          isActive: true,
          isOnDuty: true
        }
      },
      _count: {
        select: {
          serviceBookings: true
        }
      }
    }
  })

  // Filter by service type if specified
  let nearbyPartners = partners
  if (serviceType) {
    nearbyPartners = partners.filter(partner => {
      try {
        const services = JSON.parse(partner.services)
        return services.includes(serviceType)
      } catch (error) {
        return false
      }
    })
  }

  // Calculate distance for each partner
  const partnersWithDistance = nearbyPartners.map(partner => {
    const distance = calculateDistance(
      latitude,
      longitude,
      partner.latitude,
      partner.longitude
    )
    
    return {
      ...partner,
      distance: Math.round(distance * 100) / 100,
      services: JSON.parse(partner.services),
      pricing: JSON.parse(partner.pricing),
      mechanicsCount: partner._count.serviceBookings
    }
  })

  // Sort by distance
  const sortedPartners = partnersWithDistance.sort((a, b) => a.distance - b.distance)

  return NextResponse.json({
    success: true,
    location: {
      latitude,
      longitude,
      radius
    },
    partners: sortedPartners.map(partner => ({
      id: partner.id,
      businessName: partner.businessName,
      phone: partner.phone,
      address: partner.address,
      city: partner.city,
      state: partner.state,
      pincode: partner.pincode,
      rating: partner.rating,
      distance: partner.distance,
      services: partner.services,
      pricing: partner.pricing,
      hours: partner.hours,
      mechanicsCount: partner.mechanics.length,
      isActive: partner.isActive,
      isVerified: partner.isVerified
    }))
  })
}

async function getRoute(originLat?: string, originLng?: string, destLat?: string, destLng?: string) {
  if (!originLat || !originLng || !destLat || !destLng) {
    return NextResponse.json({ 
      error: 'Origin and destination coordinates are required' 
    }, { status: 400 })
  }

  const origin = {
    latitude: parseFloat(originLat),
    longitude: parseFloat(originLng)
  }

  const destination = {
    latitude: parseFloat(destLat),
    longitude: parseFloat(destLng)
  }

  // Calculate route (simplified for demo)
  const routeData = await calculateRoute(origin, destination)

  return NextResponse.json({
    success: true,
    route: routeData
  })
}

async function getDirections(originLat?: string, originLng?: string, destLat?: string, destLng?: string) {
  if (!originLat || !originLng || !destLat || !destLng) {
    return NextResponse.json({ 
      error: 'Origin and destination coordinates are required' 
    }, { status: 400 })
  }

  const origin = {
    latitude: parseFloat(originLat),
    longitude: parseFloat(originLng)
  }

  const destination = {
    latitude: parseFloat(destLat),
    longitude: parseFloat(destLng)
  }

  // Get turn-by-turn directions (simplified for demo)
  const directionsData = await getTurnByTurnDirections(origin, destination)

  return NextResponse.json({
    success: true,
    directions: directionsData
  })
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function reverseGeocode(lat: number, lng: number) {
  // In production, you would use a real geocoding service like Google Maps API
  // For demo purposes, we'll return mock data
  
  const mockLocations = [
    {
      address: '123 Main Street, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    {
      address: '456 Park Avenue, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    {
      address: '789 MG Road, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    }
  ]

  // Return a random location for demo
  return mockLocations[Math.floor(Math.random() * mockLocations.length)]
}

async function calculateRoute(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) {
  const distance = calculateDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude)
  const duration = Math.round(distance * 3) // 3 minutes per km (average speed)
  
  return {
    distance: Math.round(distance * 100) / 100,
    duration: duration,
    origin: {
      latitude: origin.latitude,
      longitude: origin.longitude,
      address: await reverseGeocode(origin.latitude, origin.longitude)
    },
    destination: {
      latitude: destination.latitude,
      longitude: destination.longitude,
      address: await reverseGeocode(destination.latitude, destination.longitude)
    },
    polyline: generateMockPolyline(origin, destination),
    steps: [
      {
        instruction: `Head ${getDirection(origin, destination)} on ${await getStreetName(origin)}`,
        distance: Math.round(distance * 100) / 100,
        duration: Math.round(duration * 0.6),
        start_location: {
          lat: origin.latitude,
          lng: origin.longitude
        },
        end_location: {
          lat: destination.latitude,
          lng: destination.longitude
        }
      }
    ]
  }
}

async function getTurnByTurnDirections(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) {
  const route = await calculateRoute(origin, destination)
  
  return {
    route: {
      distance: route.distance,
      duration: route.duration,
      polyline: route.polyline
    },
    legs: [
      {
        distance: route.distance,
        duration: route.duration,
        steps: route.steps
      }
    ],
    geocoded_waypoints: [],
    status: 'OK'
  }
}

function generateMockPolyline(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }): string {
  // Generate a simple polyline between origin and destination
  const points = []
  const steps = 10
  
  for (let i = 0; i <= steps; i++) {
    const lat = origin.latitude + (destination.latitude - origin.latitude) * (i / steps)
    const lng = origin.longitude + (destination.longitude - origin.longitude) * (i / steps)
    points.push(`${lat},${lng}`)
  }
  
  return points.join('|')
}

function getDirection(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }): string {
  const latDiff = destination.latitude - origin.latitude
  const lngDiff = destination.longitude - origin.longitude
  
  if (Math.abs(latDiff) > Math.abs(lngDiff)) {
    return latDiff > 0 ? 'north' : 'south'
  } else {
    return lngDiff > 0 ? 'east' : 'west'
  }
}

async function getStreetName(location: { latitude: number; longitude: number }): Promise<string> {
  // In production, you would use a real geocoding service
  return 'Main Street'
}