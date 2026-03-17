import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1-555-0101'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+1-555-0102'
    }
  })

  // Create sample vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      qrCode: 'QR-CAR-001',
      vin: '1HGBH41JXMN109186',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ABC-1234',
      color: 'Silver',
      mileage: 45000,
      ownerId: user1.id,
      insuranceCompany: 'Premium Auto Insurance',
      insurancePolicy: 'POL-001234',
      insuranceExpiry: new Date('2024-12-31')
    }
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      qrCode: 'QR-CAR-002',
      vin: '2FTRX18W1XCA12345',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      licensePlate: 'XYZ-789',
      color: 'Blue',
      mileage: 38000,
      ownerId: user2.id,
      insuranceCompany: 'SafeDrive Insurance',
      insurancePolicy: 'POL-005678',
      insuranceExpiry: new Date('2024-11-30')
    }
  })

  // Create sample garages
  const garage1 = await prisma.garage.create({
    data: {
      name: 'AutoCare Express',
      address: '123 Main St, Downtown',
      phone: '+1-555-0123',
      email: 'info@autocare.com',
      website: 'https://autocare.com',
      latitude: 37.7749,
      longitude: -122.4194,
      services: JSON.stringify(['Oil Change', 'Tire Service', 'Brakes', 'Engine Diagnostics']),
      hours: '7:00 AM - 8:00 PM',
      rating: 4.8
    }
  })

  const garage2 = await prisma.garage.create({
    data: {
      name: 'QuickFix Garage',
      address: '456 Oak Avenue',
      phone: '+1-555-0124',
      email: 'hello@quickfix.com',
      website: 'https://quickfix.com',
      latitude: 37.7849,
      longitude: -122.4094,
      services: JSON.stringify(['Towing', 'Emergency Repair', 'Battery Service']),
      hours: '24/7',
      rating: 4.5
    }
  })

  const garage3 = await prisma.garage.create({
    data: {
      name: 'Premium Motors',
      address: '789 Highway Blvd',
      phone: '+1-555-0125',
      email: 'service@premiummotors.com',
      website: 'https://premiummotors.com',
      latitude: 37.7649,
      longitude: -122.4294,
      services: JSON.stringify(['Full Service', 'Transmission', 'AC Service', 'Electrical']),
      hours: '8:00 AM - 6:00 PM',
      rating: 4.9
    }
  })

  // Create sample mechanics
  const mechanic1 = await prisma.mechanic.create({
    data: {
      name: 'Mike Johnson',
      phone: '+1-555-1001',
      email: 'mike@autocare.com',
      specialties: JSON.stringify(['Engine Repair', 'Diagnostics', 'Transmission']),
      partnerId: garage1.id,
      garageId: garage1.id,
      isOnDuty: true
    }
  })

  const mechanic2 = await prisma.mechanic.create({
    data: {
      name: 'Sarah Davis',
      phone: '+1-555-1002',
      email: 'sarah@quickfix.com',
      specialties: JSON.stringify(['Towing', 'Emergency Services', 'Battery']),
      partnerId: garage2.id,
      garageId: garage2.id,
      isOnDuty: true
    }
  })

  const mechanic3 = await prisma.mechanic.create({
    data: {
      name: 'Tom Wilson',
      phone: '+1-555-1003',
      email: 'tom@premiummotors.com',
      specialties: JSON.stringify(['AC Service', 'Electrical', 'Full Service']),
      partnerId: garage3.id,
      garageId: garage3.id,
      isOnDuty: false
    }
  })

  // Create sample service records
  await prisma.serviceRecord.createMany({
    data: [
      {
        vehicleId: vehicle1.id,
        type: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        mileage: 45000,
        cost: 45.00,
        performedBy: 'AutoCare Express',
        serviceDate: new Date('2024-01-15')
      },
      {
        vehicleId: vehicle1.id,
        type: 'Tire Rotation',
        description: 'Rotated all four tires',
        mileage: 44000,
        cost: 25.00,
        performedBy: 'AutoCare Express',
        serviceDate: new Date('2023-12-01')
      },
      {
        vehicleId: vehicle1.id,
        type: 'Brake Inspection',
        description: 'Front and rear brake inspection',
        mileage: 43000,
        cost: 35.00,
        performedBy: 'AutoCare Express',
        serviceDate: new Date('2023-10-15')
      }
    ]
  })

  // Create sample service bookings
  const booking1 = await prisma.serviceBooking.create({
    data: {
      serviceType: 'towing',
      description: 'Flat tire on highway, need immediate assistance',
      urgency: 'high',
      status: 'pending',
      vehicleId: vehicle2.id,
      userId: user2.id,
      pickupAddress: '123 Highway 101, Mile Marker 45',
      latitude: 37.7749,
      longitude: -122.4194,
      estimatedArrival: '15 minutes'
    }
  })

  const booking2 = await prisma.serviceBooking.create({
    data: {
      serviceType: 'mechanic',
      description: 'Engine won\'t start, battery seems dead',
      urgency: 'medium',
      status: 'assigned',
      vehicleId: vehicle1.id,
      userId: user1.id,
      garageId: garage1.id,
      pickupAddress: '456 Oak Street, Downtown',
      latitude: 37.7849,
      longitude: -122.4094,
      estimatedArrival: '20 minutes'
    }
  })

  const booking3 = await prisma.serviceBooking.create({
    data: {
      serviceType: 'accident',
      description: 'Minor collision at intersection, airbags deployed',
      urgency: 'emergency',
      status: 'in_progress',
      vehicleId: vehicle2.id,
      userId: user2.id,
      garageId: garage2.id,
      pickupAddress: '789 Main St & 1st Ave Intersection',
      latitude: 37.7649,
      longitude: -122.4294,
      estimatedArrival: '5 minutes'
    }
  })

  // Create service assignments
  await prisma.serviceAssignment.createMany({
    data: [
      {
        bookingId: booking2.id,
        mechanicId: mechanic1.id,
        status: 'assigned',
        assignedAt: new Date()
      },
      {
        bookingId: booking3.id,
        mechanicId: mechanic2.id,
        status: 'in_progress',
        assignedAt: new Date()
      }
    ]
  })

  // Create admin user
  await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@carhelpline.com',
      name: 'System Administrator',
      role: 'admin'
    }
  })

  console.log('Database seeded successfully!')
  console.log(`Created ${2} users, ${2} vehicles, ${3} garages, ${3} mechanics, ${3} bookings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })