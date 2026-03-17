import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...')
  await prisma.serviceAssignment.deleteMany()
  await prisma.serviceBooking.deleteMany()
  await prisma.serviceRecord.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.mechanic.deleteMany()
  await prisma.garage.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1-555-0101'
    }
  })

  console.log('✅ Created demo user:', demoUser.name)

  // Create demo vehicle
  const demoVehicle = await prisma.vehicle.create({
    data: {
      qrCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3',
      vin: '1HGCM82633A004352',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      licensePlate: 'ABC-1234',
      color: 'Silver',
      mileage: 15000,
      insuranceCompany: 'SafeAuto Insurance',
      insurancePolicy: 'POL-123456',
      insuranceExpiry: new Date('2025-01-01'),
      ownerId: demoUser.id
    }
  })

  console.log('✅ Created demo vehicle:', demoVehicle.make, demoVehicle.model)

  // Create demo service records
  const demoServiceRecords = [
    {
      vehicleId: demoVehicle.id,
      type: 'maintenance',
      serviceType: 'Oil Change',
      description: 'Regular oil change service',
      date: new Date('2024-01-10'),
      mileage: 14500,
      cost: 45.99,
      provider: 'Quick Lube Center',
      notes: 'Used synthetic oil'
    },
    {
      vehicleId: demoVehicle.id,
      type: 'maintenance',
      serviceType: 'Tire Rotation',
      description: 'Rotated all four tires',
      date: new Date('2024-01-15'),
      mileage: 14800,
      cost: 25.99,
      provider: 'Tire Plus',
      notes: 'Checked tire pressure'
    },
    {
      vehicleId: demoVehicle.id,
      type: 'repair',
      serviceType: 'Brake Inspection',
      description: 'Front brake pad replacement',
      date: new Date('2024-01-20'),
      mileage: 15000,
      cost: 299.99,
      provider: 'Brake Masters',
      notes: 'Replaced front pads only'
    }
  ]

  for (const serviceRecord of demoServiceRecords) {
    await prisma.serviceRecord.create({
      data: serviceRecord
    })
  }

  console.log('✅ Created demo service records:', demoServiceRecords.length)

  // Create demo garages
  const garages: any[] = []
  const demoGarages = [
    {
      name: 'AutoCare Express',
      address: '123 Main St, Delhi',
      phone: '+91-11-23456789',
      email: 'info@autocare.com',
      website: 'https://autocare.com',
      latitude: 28.6139,
      longitude: 77.2090,
      services: JSON.stringify(['Oil Change', 'Tire Service', 'Brakes', 'Engine Repair']),
      hours: '9:00 AM - 7:00 PM',
      rating: 4.7,
      isActive: true
    },
    {
      name: 'Quick Lube Center',
      address: '456 Park Ave, Mumbai',
      phone: '+91-22-34567890',
      email: 'contact@quicklube.com',
      website: 'https://quicklube.com',
      latitude: 19.0760,
      longitude: 72.8777,
      services: JSON.stringify(['Oil Change', 'Tire Service', 'Transmission']),
      hours: '8:00 AM - 8:00 PM',
      rating: 4.2,
      isActive: true
    },
    {
      name: 'Brake Masters',
      address: '789 MG Road, Bangalore',
      phone: '+91-80-34567890',
      email: 'service@brakemasters.com',
      website: 'https://brakemasters.com',
      latitude: 12.9716,
      longitude: 77.5946,
      services: JSON.stringify(['Brakes', 'Suspension', 'Wheel Alignment']),
      hours: '9:00 AM - 6:00 PM',
      rating: 4.8,
      isActive: true
    }
  ]

  for (const garage of demoGarages) {
    const createdGarage = await prisma.garage.create({
      data: garage
    })
    garages.push(createdGarage)
  }

  console.log('✅ Created demo garages:', garages.length)

  // Create demo mechanics
  const demoMechanics = [
    {
      name: 'Raj Kumar',
      phone: '+91-98765-43210',
      email: 'raj.kumar@autocare.com',
      specialties: JSON.stringify(['Engine Repair', 'Diagnostics']),
      experience: 8,
      rating: 4.6,
      isActive: true,
      isOnDuty: true,
      garageId: garages[0].id // AutoCare Express
    },
    {
      name: 'Amit Singh',
      phone: '+91-98765-43211',
      email: 'amit.singh@quicklube.com',
      specialties: JSON.stringify(['Oil Change', 'Tire Service']),
      experience: 5,
      rating: 4.3,
      isActive: true,
      isOnDuty: true,
      garageId: garages[1].id // Quick Lube Center
    },
    {
      name: 'Vijay Sharma',
      phone: '+91-98765-43212',
      email: 'vijay.sharma@brakemasters.com',
      specialties: JSON.stringify(['Brakes', 'Suspension']),
      experience: 10,
      rating: 4.9,
      isActive: true,
      isOnDuty: true,
      garageId: garages[2].id // Brake Masters
    }
  ]

  for (const mechanic of demoMechanics) {
    await prisma.mechanic.create({
      data: {
        ...mechanic,
        partner: {
          connect: { id: mechanic.garageId }
        }
      }
    })
  }

  console.log('✅ Created demo mechanics:', demoMechanics.length)

  // Create demo admin
  const demoAdmin = await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@carhelpline.com',
      name: 'System Administrator',
      role: 'super_admin',
      isActive: true
    }
  })

  console.log('✅ Created demo admin:', demoAdmin.name)

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Demo Data Created:')
  console.log('👤 User: John Doe (john.doe@example.com)')
  console.log('🚗 Vehicle: Toyota Camry 2022 (ABC-1234)')
  console.log('📱 QR Code: QR-CAR-ABC1234-1705488000000-A1B2C3')
  console.log('🔧 Service Records: 3 records')
  console.log('🏪 Garages: 3 garages')
  console.log('👨‍🔧 Mechanics: 3 mechanics')
  console.log('👑 Admin: admin@carhelpline.com')
  console.log('\n🎯 You can now test the QR code scanning with:')
  console.log('   QR Code: QR-CAR-ABC1234-1705488000000-A1B2C3')
  console.log('   Or scan the demo QR code in the app!')
  console.log('\n🔧 Admin Login:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('\n🚗 Demo Vehicle QR Code:')
  console.log('   QR-CAR-ABC1234-1705488000000-A1B2C3')
}

main()
  .catch((e) => {
    console.error('❌ Error in main function:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })