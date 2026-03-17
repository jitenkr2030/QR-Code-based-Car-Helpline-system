import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { ownerName: { contains: search } },
        { licensePlate: { contains: search } },
        { vin: { contains: search } }
      ]
    }
    
    const registrations = await db.vehicle.findMany({
      where: whereClause,
      include: {
        owner: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Transform to match the expected format
    const formattedRegistrations = registrations.map(reg => ({
      id: reg.id,
      ownerName: reg.owner?.name || '',
      ownerEmail: reg.owner?.email || '',
      ownerPhone: reg.owner?.phone || '',
      vin: reg.vin,
      make: reg.make,
      model: reg.model,
      year: reg.year,
      licensePlate: reg.licensePlate,
      color: reg.color || '',
      insuranceCompany: reg.insuranceCompany || '',
      insurancePolicy: reg.insurancePolicy || '',
      registrationDate: reg.createdAt.toISOString().split('T')[0],
      mileage: reg.mileage || 0,
      status: 'approved', // Default status
      qrRequestDate: reg.createdAt.toISOString().split('T')[0],
      notes: ''
    }))
    
    return NextResponse.json({ registrations: formattedRegistrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, registrationId, status, notes } = body

    switch (action) {
      case 'approve':
        return await approveRegistration(registrationId)
      
      case 'reject':
        return await rejectRegistration(registrationId, notes)
      
      case 'update_status':
        return await updateRegistrationStatus(registrationId, status)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error managing registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function approveRegistration(registrationId: string) {
  // In a real application, you would update the database
  // For now, we'll just return success
  return NextResponse.json({
    success: true,
    message: 'Registration approved successfully',
    registrationId
  })
}

async function rejectRegistration(registrationId: string, reason: string) {
  // In a real application, you would update the database
  return NextResponse.json({
    success: true,
    message: 'Registration rejected',
    registrationId,
    reason
  })
}

async function updateRegistrationStatus(registrationId: string, status: string) {
  // In a real application, you would update the database
  return NextResponse.json({
    success: true,
    message: `Registration status updated to ${status}`,
    registrationId,
    status
  })
}