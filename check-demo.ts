import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDemoData() {
  try {
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { qrCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3' },
      include: {
        owner: true,
        serviceHistory: true
      }
    });
    
    if (vehicle) {
      console.log('✅ Demo vehicle with QR code exists!');
      console.log('🚗 Vehicle:', vehicle.make, vehicle.model, vehicle.year);
      console.log('📱 License Plate:', vehicle.licensePlate);
      console.log('📱 QR Code:', vehicle.qrCode);
      console.log('👤 Owner:', vehicle.owner.name, vehicle.owner.email);
      console.log('🔧 Service Records:', vehicle.serviceHistory.length);
      console.log('\n🎯 You can now test the QR code scanning with:');
      console.log('   QR Code: QR-CAR-ABC1234-1705488000000-A1B2C3');
      console.log('   Or scan the demo QR code in the app!');
    } else {
      console.log('❌ Demo vehicle with QR code not found');
      console.log('🔧 Please run the seed script to create demo data');
    }
  } catch (error) {
    console.error('❌ Error checking demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDemoData();