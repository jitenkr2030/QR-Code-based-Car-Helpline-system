import { NextRequest, NextResponse } from 'next/server'

// QR Code generation service for different stakeholders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, vehicleData, bulkVehicles, stakeholder } = body

    switch (action) {
      case 'generate_single':
        return await generateSingleQR(vehicleData)
      
      case 'generate_bulk':
        return await generateBulkQR(bulkVehicles)
      
      case 'generate_for_stakeholder':
        return await generateForStakeholder(stakeholder)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generate QR code for single vehicle
async function generateSingleQR(vehicleData: any) {
  const qrCode = generateQRCode(vehicleData)
  
  return NextResponse.json({
    success: true,
    qrCode,
    vehicleData,
    instructions: {
      printOptions: ['sticker', 'window_cling', 'metal_plate'],
      placement: ['windshield', 'dashboard', 'door_jam', 'key_fob'],
      size: ['2x2_inches', '3x3_inches', '4x4_inches']
    }
  })
}

// Generate QR codes for bulk vehicles
async function generateBulkQR(vehicles: any[]) {
  const qrCodes = vehicles.map(vehicle => ({
    ...vehicle,
    qrCode: generateQRCode(vehicle),
    generatedAt: new Date().toISOString()
  }))

  return NextResponse.json({
    success: true,
    qrCodes,
    bulkActions: {
      downloadAll: true,
      printLabels: true,
      exportCSV: true
    }
  })
}

// Generate QR codes for specific stakeholder
async function generateForStakeholder(stakeholder: string) {
  const configurations = {
    car_dealership: {
      description: "QR codes for new car inventory",
      placement: "Windshield and dashboard",
      features: ["vehicle_info", "warranty", "service_history"]
    },
    fleet_operator: {
      description: "QR codes for fleet vehicles",
      placement: "Door jam and dashboard",
      features: ["vehicle_tracking", "maintenance_schedule", "driver_info"]
    },
    rental_company: {
      description: "QR codes for rental fleet",
      placement: "Key fob and dashboard",
      features: ["rental_info", "vehicle_status", "damage_report"]
    },
    insurance_company: {
      description: "QR codes for insured vehicles",
      placement: "Windshield",
      features: ["policy_info", "claims_history", "emergency_contacts"]
    }
  }

  const config = configurations[stakeholder as keyof typeof configurations]
  
  if (!config) {
    return NextResponse.json({ error: 'Invalid stakeholder type' }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    stakeholder,
    configuration: config,
    template: generateStakeholderTemplate(stakeholder)
  })
}

// Generate unique QR code
function generateQRCode(vehicle: any): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const cleanPlate = vehicle.licensePlate?.replace(/[^a-zA-Z0-9]/g, '') || 'UNKNOWN'
  return `QR-CAR-${cleanPlate}-${timestamp}-${random}`.toUpperCase()
}

// Generate stakeholder-specific template
function generateStakeholderTemplate(stakeholder: string): any {
  const templates = {
    car_dealership: {
      header: "DEALERSHIP QR CODE",
      fields: ["vin", "make", "model", "year", "stock_number"],
      branding: "dealership_logo"
    },
    fleet_operator: {
      header: "FLEET VEHICLE QR",
      fields: ["fleet_id", "vehicle_id", "department", "driver", "license_plate"],
      branding: "company_logo"
    },
    rental_company: {
      header: "RENTAL VEHICLE QR",
      fields: ["rental_id", "vehicle_id", "category", "rate_code", "return_date"],
      branding: "company_logo"
    },
    insurance_company: {
      header: "INSURED VEHICLE QR",
      fields: ["policy_number", "vin", "insured_name", "coverage_type", "expiry_date"],
      branding: "insurance_logo"
    }
  }

  return templates[stakeholder as keyof typeof templates] || null
}

// GET endpoint for QR code templates and configurations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  switch (type) {
    case 'templates':
      return NextResponse.json({
        templates: {
          standard: {
            name: "Standard Vehicle QR",
            description: "Basic vehicle information QR code",
            size: "2x2 inches",
            data: ["vehicle_info", "owner_info", "emergency_contacts"]
          },
          premium: {
            name: "Premium Vehicle QR",
            description: "Enhanced QR with additional features",
            size: "3x3 inches",
            data: ["vehicle_info", "service_history", "insurance", "warranty"]
          },
          fleet: {
            name: "Fleet Management QR",
            description: "Optimized for fleet operations",
            size: "2x2 inches",
            data: ["fleet_info", "maintenance", "driver", "tracking"]
          }
        }
      })

    case 'placement_guide':
      return NextResponse.json({
        placement_options: {
          windshield: {
            location: "Bottom center of windshield",
            visibility: "High",
            durability: "Medium",
            recommended: true
          },
          dashboard: {
            location: "Left side of dashboard",
            visibility: "Medium",
            durability: "High",
            durability: "High",
            recommended: true
          },
          door_jam: {
            location: "Driver's side door jam",
            visibility: "Low",
            durability: "High",
            recommended: false
          },
          key_fob: {
            location: "Attached to key fob",
            visibility: "Low",
            durability: "Medium",
            recommended: false
          }
        }
      })

    case 'stakeholders':
      return NextResponse.json({
        stakeholders: [
          {
            id: "car_dealership",
            name: "Car Dealership",
            description: "New and used car dealerships",
            use_case: "Inventory management and customer service"
          },
          {
            id: "fleet_operator",
            name: "Fleet Operator",
            description: "Companies with vehicle fleets",
            use_case: "Fleet management and maintenance tracking"
          },
          {
            id: "rental_company",
            name: "Rental Company",
            description: "Vehicle rental services",
            use_case: "Rental management and vehicle tracking"
          },
          {
            id: "insurance_company",
            name: "Insurance Company",
            description: "Auto insurance providers",
            use_case: "Policy management and claims processing"
          }
        ]
      })

    default:
      return NextResponse.json({
        message: "QR Code Generation Service",
        endpoints: {
          "POST /": "Generate QR codes",
          "GET /?type=templates": "Get QR code templates",
          "GET /?type=placement_guide": "Get placement guidelines",
          "GET /?type=stakeholders": "Get stakeholder information"
        }
      })
  }
}