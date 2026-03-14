import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessName,
      email,
      phone,
      password,
      confirmPassword,
      address,
      city,
      state,
      pincode,
      gstNumber,
      panNumber,
      website,
      description,
      services,
      serviceArea,
      pricing,
      hours,
      latitude,
      longitude
    } = body

    // Validate required fields
    if (!businessName || !email || !phone || !password) {
      return NextResponse.json({ 
        error: 'Missing required fields: businessName, email, phone, password' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 })
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
      return NextResponse.json({ 
        error: 'Phone number must be 10 digits' 
      }, { status: 400 })
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 })
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json({ 
        error: 'Passwords do not match' 
      }, { status: 400 })
    }

    // Check if partner already exists
    const existingPartner = await db.partner.findUnique({
      where: { email }
    })

    if (existingPartner) {
      return NextResponse.json({ 
        error: 'Partner with this email already exists' 
      }, { status: 400 })
    }

    // Create partner
    const partner = await db.partner.create({
      data: {
        businessName,
        email,
        phone,
        password, // In production, hash this password
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        gstNumber: gstNumber || '',
        panNumber: panNumber || '',
        website: website || '',
        description: description || '',
        services: JSON.stringify(services || []),
        serviceArea: serviceArea || '',
        pricing: JSON.stringify(pricing || {}),
        hours: hours || '',
        latitude: latitude || 0,
        longitude: longitude || 0,
        isActive: false, // Requires admin verification
        isVerified: false
      }
    })

    // Remove password from response
    const { password: _, ...partnerWithoutPassword } = partner

    return NextResponse.json({ 
      success: true,
      message: 'Partner registration successful. Please wait for admin verification.',
      partner: partnerWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Error registering partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (email) {
      whereClause.email = email
    }

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active'
    }

    const partners = await db.partner.findMany({
      where: whereClause,
      include: {
        mechanics: {
          where: { isActive: true }
        },
        _count: {
          select: {
            mechanics: true,
            serviceBookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      partners: partners.map(partner => {
        const { password: _, ...partnerWithoutPassword } = partner
        return {
          ...partnerWithoutPassword,
          mechanicsCount: partner._count.mechanics,
          serviceBookingsCount: partner._count.serviceBookings
        }
      })
    })

  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isVerified, verifiedBy, isActive, rating } = body

    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (isVerified !== undefined) {
      updateData.isVerified = isVerified
      updateData.verificationDate = isVerified ? new Date() : null
      updateData.verifiedBy = verifiedBy || null
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    if (rating !== undefined) {
      updateData.rating = rating
    }

    const partner = await db.partner.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true,
      message: 'Partner updated successfully',
      partner
    })

  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}