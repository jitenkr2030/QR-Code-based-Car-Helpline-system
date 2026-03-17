import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      address,
      city,
      state,
      pincode
    } = body

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, phone, password' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 })
    }

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        // Note: User model only has basic fields
        // No password, address, city, state, pincode fields
        // In production, users authenticate through:
        // - QR code scanning
        // - Phone OTP
        // - Email magic link
        // - OAuth providers
      }
    })

    // Return user without sensitive data
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully',
      user: userResponse
    }, { status: 201 })

  } catch (error) {
    console.error('Error registering user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}

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
          _count: {
            select: {
              vehicles: true
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Return user without sensitive data
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        vehiclesCount: user._count.vehicles
      }

      return NextResponse.json({ 
        success: true,
        user: userResponse
      })
    }

    // Get all users (for admin)
    const users = await db.user.findMany({
      include: {
        _count: {
          select: {
            vehicles: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      users: users.map(user => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          vehiclesCount: user._count.vehicles
        }
      })
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}