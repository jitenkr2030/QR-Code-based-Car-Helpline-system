import { NextRequest, NextResponse } from 'next/server'

// Demo vehicle data for QR code scanning
const DEMO_VEHICLE = {
  id: 'demo-vehicle-1',
  qrCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3',
  vin: '1HGBH41JXMN109186',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  licensePlate: 'ABC-1234',
  color: 'Silver',
  mileage: 45000,
  insuranceCompany: 'SafeAuto Insurance',
  insurancePolicy: 'POL-001234',
  insuranceExpiry: '2025-01-15',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  owner: {
    id: 'demo-user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0101'
  },
  serviceHistory: [
    {
      id: 'service-1',
      type: 'Oil Change',
      description: 'Regular oil change service',
      mileage: 45000,
      cost: 2999,
      performedBy: 'AutoCare Express',
      notes: 'Used synthetic oil',
      serviceDate: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'service-2',
      type: 'Tire Rotation',
      description: 'Rotated all four tires',
      mileage: 44000,
      cost: 1500,
      performedBy: 'Quick Lube Center',
      notes: 'Checked tire pressure',
      serviceDate: '2023-12-01T10:00:00Z',
      createdAt: '2023-12-01T10:00:00Z'
    },
    {
      id: 'service-3',
      type: 'Brake Inspection',
      description: 'Front brake pad replacement',
      mileage: 43000,
      cost: 8500,
      performedBy: 'Brake Masters',
      notes: 'Replaced front brake pads and rotors',
      serviceDate: '2023-10-15T10:00:00Z',
      createdAt: '2023-10-15T10:00:00Z'
    }
  ],
  bookings: []
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qr: string }> }
) {
  try {
    const { qr } = await params
    
    console.log('🔍 QR Code API called with:', qr)
    
    // Check if it's the demo QR code
    if (qr === 'QR-CAR-ABC1234-1705488000000-A1B2C3') {
      console.log('✅ Demo QR code scanned successfully')
      return NextResponse.json({ 
        success: true,
        vehicle: DEMO_VEHICLE
      })
    }
    
    // For other QR codes, return not found
    console.log('❌ QR code not found:', qr)
    return NextResponse.json({ 
      error: 'Vehicle not found',
      message: 'This QR code is not registered in our system.',
      demoQRCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3',
      instructions: 'Please use the demo QR code to test the system'
    }, { status: 404 })
  } catch (error) {
    console.error('❌ Error in QR code API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      demoQRCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3',
      instructions: 'Please use the demo QR code to test the system'
    }, { status: 500 })
  }
}