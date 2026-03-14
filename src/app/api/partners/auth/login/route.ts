import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    // Find partner by email
    const partner = await db.partner.findUnique({
      where: { email },
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
      }
    })

    if (!partner) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Check if partner is verified and active
    if (!partner.isVerified) {
      return NextResponse.json({ 
        error: 'Account is not verified. Please wait for admin verification.' 
      }, { status: 401 })
    }

    if (!partner.isActive) {
      return NextResponse.json({ 
        error: 'Account is not active. Please contact support.' 
      }, { status: 401 })
    }

    // In production, hash the password and compare
    // For now, we'll do simple string comparison
    if (partner.password !== password) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...partnerWithoutPassword } = partner

    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      partner: {
        ...partnerWithoutPassword,
        mechanicsCount: partner._count.mechanics,
        serviceBookingsCount: partner._count.serviceBookings
      }
    })

  } catch (error) {
    console.error('Error during partner login:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}