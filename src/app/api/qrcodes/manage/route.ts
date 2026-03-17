import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vehicleId, action, deliveryMethod, trackingNumber } = body

    if (action === 'generate') {
      // Generate QR code for vehicle
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          owner: true
        }
      })

      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
      }

      // Generate unique QR code
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const cleanPlate = vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, '')
      const qrCode = `QR-CAR-${cleanPlate}-${timestamp}-${random}`.toUpperCase()

      // Update vehicle with new QR code
      const updatedVehicle = await db.vehicle.update({
        where: { id: vehicleId },
        data: { qrCode }
      })

      // Create QR code record
      const qrRecord = await db.qRCode.create({
        data: {
          vehicleId,
          qrCode,
          status: 'generated',
          generatedAt: new Date(),
          deliveryMethod: deliveryMethod || 'pickup'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'QR code generated successfully',
        qrCode,
        vehicle: updatedVehicle,
        qrRecord
      })
    }

    if (action === 'regenerate') {
      // Regenerate QR code for vehicle
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId }
      })

      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
      }

      // Generate new QR code
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const cleanPlate = vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, '')
      const newQrCode = `QR-CAR-${cleanPlate}-${timestamp}-${random}`.toUpperCase()

      // Update vehicle with new QR code
      const updatedVehicle = await db.vehicle.update({
        where: { id: vehicleId },
        data: { qrCode: newQrCode }
      })

      // Create new QR code record
      const qrRecord = await db.qRCode.create({
        data: {
          vehicleId,
          qrCode: newQrCode,
          status: 'generated',
          generatedAt: new Date(),
          deliveryMethod: deliveryMethod || 'pickup'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'QR code regenerated successfully',
        qrCode: newQrCode,
        vehicle: updatedVehicle,
        qrRecord
      })
    }

    if (action === 'deliver') {
      // Mark QR code as delivered
      const qrRecord = await db.qRCode.findFirst({
        where: { vehicleId },
        orderBy: { generatedAt: 'desc' }
      })

      if (!qrRecord) {
        return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
      }

      // Update QR code record
      const updatedRecord = await db.qRCode.update({
        where: { id: qrRecord.id },
        data: {
          status: 'delivered',
          deliveredAt: new Date(),
          deliveryMethod: deliveryMethod || 'pickup',
          trackingNumber: trackingNumber || null
        }
      })

      return NextResponse.json({
        success: true,
        message: 'QR code marked as delivered',
        qrRecord: updatedRecord
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing QR code:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicleId')
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (vehicleId) {
      whereClause.vehicleId = vehicleId
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    const qrCodes = await db.qRCode.findMany({
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
        }
      },
      orderBy: { generatedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      qrCodes: qrCodes.map(qr => ({
        id: qr.id,
        qrCode: qr.qrCode,
        status: qr.status,
        generatedAt: qr.generatedAt.toISOString(),
        deliveredAt: qr.deliveredAt?.toISOString(),
        deliveryMethod: qr.deliveryMethod,
        trackingNumber: qr.trackingNumber,
        vehicle: qr.vehicle
      }))
    })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}