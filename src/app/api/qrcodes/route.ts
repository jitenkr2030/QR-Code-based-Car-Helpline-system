import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    
    if (vehicleId) {
      // Get QR codes for specific vehicle
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          owner: true
        }
      })
      
      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        qrCode: vehicle.qrCode,
        vehicle 
      })
    }
    
    // Get all vehicles with QR codes
    const vehicles = await db.vehicle.findMany({
      include: {
        owner: true
      }
    })
    
    return NextResponse.json({ 
      qrCodes: vehicles.map(v => ({
        id: v.id,
        qrCode: v.qrCode,
        vehicle: v
      }))
    })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vehicleId, regenerate } = body
    
    // Get vehicle
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId }
    })
    
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    
    let newQRCode = vehicle.qrCode
    
    if (regenerate) {
      // Generate new QR code
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      newQRCode = `QR-CAR-${vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, '')}-${timestamp}-${random}`.toUpperCase()
      
      // Update vehicle with new QR code
      await db.vehicle.update({
        where: { id: vehicleId },
        data: { qrCode: newQRCode }
      })
    }
    
    return NextResponse.json({ 
      qrCode: newQRCode,
      vehicle,
      message: regenerate ? 'QR code regenerated successfully' : 'QR code retrieved successfully'
    })
  } catch (error) {
    console.error('Error managing QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}