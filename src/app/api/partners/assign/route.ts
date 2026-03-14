import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface PartnerAssignmentRequest {
  bookingId: string
  serviceType: string
  urgency: string
  latitude: number
  longitude: number
  pickupAddress: string
}

interface Partner {
  id: string
  businessName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  services: string[]
  pricing: string
  hours: string
  latitude: number
  longitude: number
  isVerified: boolean
  isActive: boolean
  rating: number
  mechanics: Mechanic[]
}

interface Mechanic {
  id: string
  name: string
  phone: string
  email: string
  specialties: string[]
  experience: number
  rating: number
  isActive: boolean
  isOnDuty: boolean
}

// Calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA based on distance and traffic
function calculateETA(distance: number, urgency: string): number {
  // Base speed in km/h
  let baseSpeed = 30;
  
  // Adjust speed based on urgency
  if (urgency === 'emergency') {
    baseSpeed = 50;
  } else if (urgency === 'urgent') {
    baseSpeed = 40;
  }
  
  // Add traffic factor (1.5 for normal traffic)
  const trafficFactor = urgency === 'emergency' ? 1.2 : 1.5;
  
  // Calculate time in minutes
  const timeInHours = distance / baseSpeed * trafficFactor;
  return Math.ceil(timeInHours * 60);
}

export async function POST(request: NextRequest) {
  try {
    const body: PartnerAssignmentRequest = await request.json()
    const { bookingId, serviceType, urgency, latitude, longitude, pickupAddress } = body

    // Validate required fields
    if (!bookingId || !serviceType || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Missing required fields: bookingId, serviceType, latitude, longitude' 
      }, { status: 400 })
    }

    // Find verified and active partners that offer the required service
    const partners = await db.partner.findMany({
      where: {
        isVerified: true,
        isActive: true,
        latitude: {
          gte: latitude - 0.5, // Approximate 50km radius
          lte: latitude + 0.5
        },
        longitude: {
          gte: longitude - 0.5,
          lte: longitude + 0.5
        }
      },
      include: {
        mechanics: {
          where: {
            isActive: true,
            isOnDuty: true
          }
        }
      }
    })

    // Filter partners by service type
    const availablePartners = partners.filter(partner => {
      try {
        const services = JSON.parse(partner.services)
        return services.includes(serviceType)
      } catch (error) {
        console.error('Error parsing services:', error)
        return false
      }
    })

    if (availablePartners.length === 0) {
      return NextResponse.json({ 
        error: 'No available partners found for this service in your area' 
      }, { status: 404 })
    }

    // Calculate distance and ETA for each partner
    const partnersWithDistance = availablePartners.map(partner => {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        partner.latitude, 
        partner.longitude
      )
      
      const eta = calculateETA(distance, urgency)
      
      return {
        ...partner,
        distance,
        eta,
        services: JSON.parse(partner.services),
        pricing: JSON.parse(partner.pricing)
      }
    })

    // Sort by distance and rating
    const sortedPartners = partnersWithDistance.sort((a, b) => {
      // Prioritize distance for emergency requests
      if (urgency === 'emergency') {
        return a.distance - b.distance
      }
      // For normal requests, consider rating and distance
      const scoreA = a.rating * 0.6 - a.distance * 0.4
      const scoreB = b.rating * 0.6 - b.distance * 0.4
      return scoreB - scoreA
    })

    // Get the best partner
    const bestPartner = sortedPartners[0]

    // Get the best available mechanic for this partner
    const availableMechanics = bestPartner.mechanics.filter(mechanic => {
      try {
        const specialties = JSON.parse(mechanic.specialties)
        return specialties.includes(serviceType)
      } catch (error) {
        console.error('Error parsing specialties:', error)
        return false
      }
    })

    const bestMechanic = availableMechanics.length > 0 
      ? availableMechanics[0] 
      : null

    // Calculate pricing
    let servicePrice = 0
    try {
      const pricing = bestPartner.pricing
      servicePrice = pricing[serviceType] || 0
    } catch (error) {
      console.error('Error parsing pricing:', error)
      servicePrice = 500 // Default price
    }

    // Create service assignment
    const assignment = await db.serviceAssignment.create({
      data: {
        bookingId,
        mechanicId: bestMechanic?.id || '',
        status: 'assigned'
      }
    })

    // Update the booking with partner assignment
    const updatedBooking = await db.serviceBooking.update({
      where: { id: bookingId },
      data: {
        partnerId: bestPartner.id,
        mechanicId: bestMechanic?.id || '',
        assignedAt: new Date(),
        partnerETA: bestPartner.eta,
        status: 'assigned',
        estimatedArrival: `${bestPartner.eta} minutes`
      }
    })

    // Create earning record for the partner
    await db.earning.create({
      data: {
        partnerId: bestPartner.id,
        mechanicId: bestMechanic?.id || '',
        bookingId,
        amount: servicePrice,
        commission: servicePrice * 0.2, // 20% commission
        status: 'pending'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Partner assigned successfully',
      assignment: {
        id: assignment.id,
        partner: {
          id: bestPartner.id,
          businessName: bestPartner.businessName,
          phone: bestPartner.phone,
          address: bestPartner.address,
          distance: Math.round(bestPartner.distance * 100) / 100,
          eta: bestPartner.eta,
          rating: bestPartner.rating,
          services: bestPartner.services
        },
        mechanic: bestMechanic ? {
          id: bestMechanic.id,
          name: bestMechanic.name,
          phone: bestMechanic.phone,
          specialties: JSON.parse(bestMechanic.specialties),
          experience: bestMechanic.experience,
          rating: bestMechanic.rating
        } : null,
        pricing: {
          servicePrice,
          commission: servicePrice * 0.2
        },
        estimatedArrival: `${bestPartner.eta} minutes`
      }
    })

  } catch (error) {
    console.error('Error assigning partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get('lat')
    const longitude = searchParams.get('lng')
    const serviceType = searchParams.get('service')
    const radius = searchParams.get('radius') || '10'

    if (!latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Latitude and longitude are required' 
      }, { status: 400 })
    }

    // Find partners within the specified radius
    const partners = await db.partner.findMany({
      where: {
        isVerified: true,
        isActive: true,
        latitude: {
          gte: parseFloat(latitude) - parseFloat(radius) / 111,
          lte: parseFloat(latitude) + parseFloat(radius) / 111
        },
        longitude: {
          gte: parseFloat(longitude) - parseFloat(radius) / 111,
          lte: parseFloat(longitude) + parseFloat(radius) / 111
        }
      },
      include: {
        mechanics: {
          where: {
            isActive: true,
            isOnDuty: true
          }
        }
      }
    })

    // Filter by service type if specified
    const filteredPartners = serviceType 
      ? partners.filter(partner => {
          try {
            const services = JSON.parse(partner.services)
            return services.includes(serviceType)
          } catch (error) {
            return false
          }
        })
      : partners

    // Calculate distance for each partner
    const partnersWithDistance = filteredPartners.map(partner => {
      const distance = calculateDistance(
        parseFloat(latitude), 
        parseFloat(longitude), 
        partner.latitude, 
        partner.longitude
      )
      
      return {
        ...partner,
        distance: Math.round(distance * 100) / 100,
        services: JSON.parse(partner.services),
        pricing: JSON.parse(partner.pricing)
      }
    })

    // Sort by distance
    const sortedPartners = partnersWithDistance.sort((a, b) => a.distance - b.distance)

    return NextResponse.json({ 
      success: true,
      partners: sortedPartners.map(partner => ({
        id: partner.id,
        businessName: partner.businessName,
        phone: partner.phone,
        address: partner.address,
        city: partner.city,
        state: partner.state,
        rating: partner.rating,
        services: partner.services,
        pricing: partner.pricing,
        hours: partner.hours,
        distance: partner.distance,
        mechanicsCount: partner.mechanics.length
      }))
    })

  } catch (error) {
    console.error('Error finding partners:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}