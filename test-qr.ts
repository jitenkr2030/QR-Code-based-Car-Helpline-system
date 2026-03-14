import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQRCodeAPI() {
  try {
    console.log('🔍 Testing QR Code API Response...');
    
    // First, let's check if the vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ 
      where: { qrCode: 'QR-CAR-ABC1234-1705488000000-A1B2C3' },
      include: {
        owner: true,
        serviceHistory: true
      }
    });
    
    if (vehicle) {
      console.log('✅ Demo vehicle found in database!');
      console.log('🚗 Vehicle:', vehicle.make, vehicle.model, vehicle.year);
      console.log('📱 License Plate:', vehicle.licensePlate);
      console.log('📱 QR Code:', vehicle.qrCode);
      console.log('👤 Owner:', vehicle.owner.name, vehicle.owner.email);
      console.log('🔧 Service Records:', vehicle.serviceHistory.length);
      
      console.log('\n🎯 QR Code scanning should work with:');
      console.log('   QR Code: QR-CAR-ABC1234-1705488000000-A1B2C3');
      console.log('   Manual entry: Enter QR code and click Search');
      console.log('   Scan button: Click "Scan QR Code" button');
      
      console.log('\n🚀 Expected Results:');
      console.log('   ✅ Vehicle dashboard with real data');
      console.log('   ✅ Service history with 3 records');
      console.log('   ✅ Owner information');
      console.log('   ✅ Emergency assistance options');
      console.log('   ✅ Service booking with real garages');
      
    } else {
      console.log('❌ Demo vehicle not found in database');
      console.log('🔧 Please run: bunx tsx prisma/seed-demo-simple.ts');
    }
    
  } catch (error) {
    console.error('❌ Error testing QR code API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQRCodeAPI();