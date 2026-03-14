import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'providers', 'policies', 'claims'
    const userId = searchParams.get('userId')
    const vehicleId = searchParams.get('vehicleId')
    const policyId = searchParams.get('policyId')
    const claimId = searchParams.get('claimId')
    const providerId = searchParams.get('providerId')
    const status = searchParams.get('status')

    switch (type) {
      case 'providers':
        return await getInsuranceProviders()
      case 'policies':
        return await getInsurancePolicies(userId, vehicleId)
      case 'claims':
        return await getInsuranceClaims(userId, policyId, status)
      case 'policy':
        return await getInsurancePolicy(policyId)
      case 'claim':
        return await getInsuranceClaim(claimId)
      default:
        return await getInsuranceProviders()
    }

  } catch (error) {
    console.error('Error in insurance API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, vehicleId, providerId, policyData, claimData } = body

    switch (type) {
      case 'policy':
        return await createInsurancePolicy(userId, vehicleId, providerId, policyData)
      case 'claim':
        return await createInsuranceClaim(policyId, claimData)
      case 'provider':
        return await createInsuranceProvider(body)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in insurance API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, updates } = body

    switch (type) {
      case 'policy':
        return await updateInsurancePolicy(id, updates)
      case 'claim':
        return await updateInsuranceClaim(id, updates)
      case 'provider':
        return await updateInsuranceProvider(id, updates)
      default:
        return NextResponse.json({ 
          error: 'Invalid type specified' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in insurance API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

async function getInsuranceProviders() {
  const providers = await db.insuranceProvider.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json({
    success: true,
    providers: providers.map(provider => ({
      id: provider.id,
      name: provider.name,
      displayName: provider.displayName,
      type: provider.type,
      description: provider.description,
      logo: provider.logo,
      website: provider.website,
      phone: provider.phone,
      email: provider.email,
      address: provider.address,
      city: provider.city,
      state: provider.state,
      pincode: provider.pincode,
      isActive: provider.isActive,
      isVerified: provider.isVerified,
      createdAt: provider.createdAt.toISOString()
    }))
  })
}

async function getInsurancePolicies(userId?: string, vehicleId?: string) {
  let whereClause: any = {}
  
  if (userId) {
    whereClause.userId = userId
  }
  
  if (vehicleId) {
    whereClause.vehicleId = vehicleId
  }

  const policies = await db.insurancePolicy.findMany({
    where: whereClause,
    include: {
      provider: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          licensePlate: true
        }
      },
      claims: {
        where: {
          status: 'approved'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    policies: policies.map(policy => ({
      id: policy.id,
      policyNumber: policy.policyNumber,
      type: policy.type,
      coverage: JSON.parse(policy.coverage),
      premium: policy.premium,
      currency: policy.currency,
      startDate: policy.startDate.toISOString(),
      endDate: policy.endDate.toISOString(),
      status: policy.status,
      sumInsured: policy.sumInsured,
      deductible: policy.deductible,
      terms: policy.terms,
      provider: {
        id: policy.provider.id,
        name: policy.provider.name,
        displayName: policy.provider.displayName,
        type: policy.provider.type,
        logo: policy.provider.logo,
        phone: policy.provider.phone,
        email: policy.provider.email
      },
      user: policy.user,
      vehicle: policy.vehicle,
      claimsCount: policy.claims.length,
      createdAt: policy.createdAt.toISOString()
    }))
  })
}

async function getInsuranceClaims(userId?: string, policyId?: string, status?: string) {
  let whereClause: any = {}
  
  if (userId) {
    whereClause.policy = {
      userId: userId
    }
  }
  
  if (policyId) {
    whereClause.policyId = policyId
  }
  
  if (status && status !== 'all') {
    whereClause.status = status
  }

  const claims = await db.insuranceClaim.findMany({
    where: whereClause,
    include: {
      policy: {
        include: {
          provider: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    success: true,
    claims: claims.map(claim => ({
      id: claim.id,
      claimNumber: claim.claimNumber,
      type: claim.type,
      description: claim.description,
      incidentDate: claim.incidentDate.toISOString(),
      incidentLocation: claim.incidentLocation,
      severity: claim.severity,
      status: claim.status,
      amount: claim.amount,
      currency: claim.currency,
      approvedAmount: claim.approvedAmount,
      settledAmount: claim.settledAmount,
      deductible: claim.deductible,
      documents: claim.documents ? JSON.parse(claim.documents) : [],
      notes: claim.notes,
      reviewedBy: claim.reviewedBy,
      reviewedAt: claim.reviewedAt?.toISOString(),
      approvedBy: claim.approvedBy,
      approvedAt: claim.approvedAt?.toISOString(),
      settledBy: claim.settledBy,
      settledAt: claim.settledAt?.toISOString(),
      policy: {
        id: claim.policy.id,
        policyNumber: claim.policy.policyNumber,
        type: claim.policy.type,
        provider: claim.policy.provider,
        user: claim.policy.user,
        vehicle: claim.policy.vehicle
      },
      createdAt: claim.createdAt.toISOString()
    }))
  })
}

async function getInsurancePolicy(policyId: string) {
  if (!policyId) {
    return NextResponse.json({ 
      error: 'Policy ID is required' 
    }, { status: 400 })
  }

  const policy = await db.insurancePolicy.findUnique({
    where: { id: policyId },
    include: {
      provider: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          licensePlate: true
        }
      },
      claims: true
    }
  })

  if (!policy) {
    return NextResponse.json({ 
      error: 'Policy not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    policy: {
      id: policy.id,
      policyNumber: policy.policyNumber,
      type: policy.type,
      coverage: JSON.parse(policy.coverage),
      premium: policy.premium,
      currency: policy.currency,
      startDate: policy.startDate.toISOString(),
      endDate: policy.endDate.toISOString(),
      status: policy.status,
      sumInsured: policy.sumInsured,
      deductible: policy.deductible,
      terms: policy.terms,
      provider: policy.provider,
      user: policy.user,
      vehicle: policy.vehicle,
      claims: policy.claims.map(claim => ({
        id: claim.id,
        claimNumber: claim.claimNumber,
        type: claim.type,
        status: claim.status,
        amount: claim.amount,
        approvedAmount: claim.approvedAmount,
        settledAmount: claim.settledAmount,
        incidentDate: claim.incidentDate.toISOString(),
        createdAt: claim.createdAt.toISOString()
      })),
      createdAt: policy.createdAt.toISOString()
    }
  })
}

async function getInsuranceClaim(claimId: string) {
  if (!claimId) {
    return NextResponse.json({ 
      error: 'Claim ID is required' 
    }, { status: 400 })
  }

  const claim = await db.insuranceClaim.findUnique({
    where: { id: claimId },
    include: {
      policy: {
        include: {
          provider: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              licensePlate: true
            }
          }
        }
      }
    }
  })

  if (!claim) {
    return NextResponse.json({ 
      error: 'Claim not found' 
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    claim: {
      id: claim.id,
      claimNumber: claim.claimNumber,
      type: claim.type,
      description: claim.description,
      incidentDate: claim.incidentDate.toISOString(),
      incidentLocation: claim.incidentLocation,
      severity: claim.severity,
      status: claim.status,
      amount: claim.amount,
      currency: claim.currency,
      approvedAmount: claim.approvedAmount,
      settledAmount: claim.settledAmount,
      deductible: claim.deductible,
      documents: claim.documents ? JSON.parse(claim.documents) : [],
      notes: claim.notes,
      reviewedBy: claim.reviewedBy,
      reviewedAt: claim.reviewedAt?.toISOString(),
      approvedBy: claim.approvedBy,
      approvedAt: claim.approvedAt?.toISOString(),
      settledBy: claim.settledBy,
      settledAt: claim.settledAt?.toISOString(),
      policy: {
        id: claim.policy.id,
        policyNumber: claim.policy.policyNumber,
        type: claim.policy.type,
        provider: claim.policy.provider,
        user: claim.policy.user,
        vehicle: claim.policy.vehicle
      },
      createdAt: claim.createdAt.toISOString()
    }
  })
}

async function createInsurancePolicy(userId: string, vehicleId: string, providerId: string, policyData: any) {
  if (!userId || !vehicleId || !providerId) {
    return NextResponse.json({ 
      error: 'User ID, Vehicle ID, and Provider ID are required' 
    }, { status: 400 })
  }

  // Generate policy number
  const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // Calculate end date (1 year from start)
  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setFullYear(endDate.getFullYear() + 1)

  const policy = await db.insurancePolicy.create({
    data: {
      policyNumber,
      providerId,
      userId,
      vehicleId,
      type: policyData.type,
      coverage: JSON.stringify(policyData.coverage),
      premium: policyData.premium,
      currency: policyData.currency || 'INR',
      startDate,
      endDate,
      status: 'active',
      sumInsured: policyData.sumInsured,
      deductible: policyData.deductible,
      terms: policyData.terms
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Insurance policy created successfully',
    policy: {
      id: policy.id,
      policyNumber: policy.policyNumber,
      type: policy.type,
      premium: policy.premium,
      currency: policy.currency,
      startDate: policy.startDate.toISOString(),
      endDate: policy.endDate.toISOString(),
      status: policy.status
    }
  })
}

async function createInsuranceClaim(policyId: string, claimData: any) {
  if (!policyId) {
    return NextResponse.json({ 
      error: 'Policy ID is required' 
    }, { status: 400 })
  }

  // Generate claim number
  const claimNumber = `CLAIM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const claim = await db.insuranceClaim.create({
    data: {
      policyId,
      claimNumber,
      type: claimData.type,
      description: claimData.description,
      incidentDate: new Date(claimData.incidentDate),
      incidentLocation: claimData.incidentLocation,
      severity: claimData.severity,
      amount: claimData.amount,
      currency: claimData.currency || 'INR',
      documents: claimData.documents ? JSON.stringify(claimData.documents) : [],
      notes: claimData.notes
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Insurance claim created successfully',
    claim: {
      id: claim.id,
      claimNumber: claim.claimNumber,
      type: claim.type,
      status: claim.status,
      amount: claim.amount,
      incidentDate: claim.incidentDate.toISOString()
    }
  })
}

async function createInsuranceProvider(providerData: any) {
  const provider = await db.insuranceProvider.create({
    data: {
      name: providerData.name,
      displayName: providerData.displayName,
      type: providerData.type,
      description: providerData.description,
      logo: providerData.logo,
      website: providerData.website,
      phone: providerData.phone,
      email: providerData.email,
      address: providerData.address,
      city: providerData.city,
      state: providerData.state,
      pincode: providerData.pincode,
      isActive: providerData.isActive || true,
      isVerified: providerData.isVerified || false
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Insurance provider created successfully',
    provider: {
      id: provider.id,
      name: provider.name,
      displayName: provider.displayName,
      type: provider.type
    }
  })
}

async function updateInsurancePolicy(policyId: string, updates: any) {
  if (!policyId) {
    return NextResponse.json({ 
      error: 'Policy ID is required' 
    }, { status: 400 })
  }

  const policy = await db.insurancePolicy.update({
    where: { id: policyId },
    data: updates
  })

  return NextResponse.json({
    success: true,
    message: 'Insurance policy updated successfully',
    policy
  })
}

async function updateInsuranceClaim(claimId: string, updates: any) {
  if (!claimId) {
    return NextResponse.json({ 
      error: 'Claim ID is required' 
    }, { status: 400 })
  }

  const claim = await db.insuranceClaim.update({
    where: { id: claimId },
    data: updates
  })

  return NextResponse.json({
    success: true,
    message: 'Insurance claim updated successfully',
    claim
  })
}

async function updateInsuranceProvider(providerId: string, updates: any) {
  if (!providerId) {
    return NextResponse.json({ 
      error: 'Provider ID is required' 
    }, { status: 400 })
  }

  const provider = await db.insuranceProvider.update({
    where: { id: providerId },
    data: updates
  })

  return NextResponse.json({
    success: true,
    message: 'Insurance provider updated successfully',
    provider
  })
}