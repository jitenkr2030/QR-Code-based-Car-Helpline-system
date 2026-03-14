import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const qrCode = searchParams.get('qr')
    const vehicleId = searchParams.get('vehicleId')
    
    if (qrCode) {
      // Get vehicle by QR code
      const vehicle = await db.vehicle.findUnique({
        where: { qrCode },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          serviceHistory: {
            orderBy: { serviceDate: 'desc' },
            take: 10
          },
          bookings: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              garage: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  address: true
                }
              }
            }
          }
        }
      })
      
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        vehicle: {
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
          insuranceExpiry: vehicle.insuranceExpiry,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
          owner: vehicle.owner,
          serviceHistory: vehicle.serviceHistory.map(record => ({
            id: record.id,
            type: record.type,
            description: record.description,
            mileage: record.mileage,
            cost: record.cost ? parseFloat(record.cost.toString()) : null,
            performedBy: record.performedBy,
            notes: record.notes,
            serviceDate: record.serviceDate.toISOString(),
            createdAt: record.createdAt.toISOString()
          })),
          bookings: vehicle.bookings.map(booking => ({
            id: booking.id,
            serviceType: booking.serviceType,
            description: booking.description,
            urgency: booking.urgency,
            status: booking.status,
            pickupAddress: booking.pickupAddress,
            latitude: booking.latitude,
            longitude: booking.longitude,
            estimatedArrival: booking.estimatedArrival,
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
            garage: booking.garage
          }))
        }
      })
    }
    
    if (vehicleId) {
      // Get vehicle by ID
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          owner: true,
          serviceHistory: {
            orderBy: { serviceDate: 'desc' },
            take: 10
          }
        }
      })
      
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        vehicle
      })
    }
    
    // Get all vehicles
    const vehicles = await db.vehicle.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            serviceHistory: true,
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return Next.json({ 
      success: true,
      vehicles: vehicles.map(vehicle => ({
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
        insuranceExpiry: vehicle.insuranceExpiry,
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
        owner: vehicle.owner,
        serviceHistoryCount: vehicle._count.serviceHistory,
        bookingsCount: vehicle._count.bookings
      }))
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
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
      qrCode, 
      vin, 
      make, 
      model, 
      year, 
      licensePlate, 
      color, 
      mileage, 
      ownerId, 
      insuranceCompany, 
      insurancePolicy, 
      insuranceExpiry 
    } = body
    
    // Validate required fields
    if (!vin || !make || !model || !year || !licensePlate || !ownerId) {
      return NextResponse.json({ 
        error: 'Missing required fields: vin, make, model, year, licensePlate, ownerId' 
      }, { status: 400 })
    }
    
    // Check if VIN already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { vin }
    })
    
    if (existingVehicle) {
      return NextResponse.json({ 
        error: 'Vehicle with this VIN already exists' 
      }, { status: 400 })
    }
    
    // Check if license plate already exists
    const existingPlate = await db.vehicle.findUnique({
      where: { licensePlate }
    })
    
    if (existingPlate) {
      return NextResponse.json({ 
        error: 'Vehicle with this license plate already exists' 
      }, { status: 400 })
    }
    
    // Generate unique QR code if not provided
    let finalQrCode = qrCode
    if (!finalQrCode) {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const cleanPlate = licensePlate.replace(/[^a-zA-Z0-9]/g, '')
      finalQrCode = `QR-CAR-${cleanPlate}-${timestamp}-${random}`.toUpperCase()
    }
    
    // Create vehicle
    const vehicle = await db.vehicle.create({
      data: {
        qrCode: finalQrCode,
        vin,
        make,
        model,
        year: parseInt(year),
        licensePlate,
        color: color || null,
        mileage: mileage ? parseInt(mileage) : null,
        ownerId,
        insuranceCompany: insuranceCompany || null,
        insurancePolicy: insurancePolicy || null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null
      },
      include: {
        owner: true
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Vehicle created successfully',
      vehicle: {
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
        insuranceExpiry: vehicle.insuranceExpiry,
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
        owner: vehicle.owner
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
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
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }
    
    // Validate year if provided
    if (updateData.year) {
      updateData.year = parseInt(updateData.year)
    }
    
    // Validate mileage if provided
    if (updateData.mileage) {
      updateData.mileage = parseInt(updateData.mileage)
    }
    
    // Validate insuranceExpiry if provided
    if (updateData.insuranceExpiry) {
      updateData.insuranceExpiry = new Date(updateData.insuranceExpiry)
    }
    
    const vehicle = await db.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        owner: true
      }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Vehicle updated successfully',
      vehicle
    })
  } catch (error) {
    console.error('Error updating vehicle:', error)
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
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 })
    }
    
    // Check if vehicle has active bookings
    const activeBookings = await db.serviceBooking.count({
      where: {
        vehicleId: id,
        status: {
          in: ['pending', 'assigned', 'in_progress']
        }
      }
    })
    
    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete vehicle with active bookings' 
      }, { status: 400 })
    }
    
    await db.vehicle.delete({
      where: { id }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Vehicle deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}