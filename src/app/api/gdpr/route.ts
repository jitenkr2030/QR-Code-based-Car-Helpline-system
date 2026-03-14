import { NextRequest, NextResponse } from 'next/server'
import { 
  gdprManager,
  handleAccessRequest,
  handleRectificationRequest,
  handleErasureRequest,
  handlePortabilityRequest,
  handleConsentWithdrawal,
  generateComplianceReport
} from '@/lib/gdpr'
import { db } from '@/lib/db'

// Handle GDPR requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case 'access-request':
        if (!userId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID is required' },
            { status: 400 }
          )
        }
        
        const accessData = await handleAccessRequest(userId)
        
        return NextResponse.json({
          success: true,
          data: accessData,
          message: 'Access request processed successfully'
        })
        
      case 'rectification-request':
        if (!userId || !data) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID and correction data are required' },
            { status: 400 }
          )
        }
        
        const rectificationData = await handleRectificationRequest(userId, data)
        
        return NextResponse.json({
          success: true,
          data: rectificationData,
          message: 'Rectification request processed successfully'
        })
        
      case 'erasure-request':
        if (!userId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID is required' },
            { status: 400 }
          )
        }
        
        const erasureData = await handleErasureRequest(userId)
        
        return NextResponse.json({
          success: true,
          data: erasureData,
          message: 'Erasure request processed successfully'
        })
        
      case 'portability-request':
        if (!userId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID is required' },
            { status: 400 }
          )
        }
        
        const portabilityData = await handlePortabilityRequest(userId)
        
        return NextResponse.json({
          success: true,
          data: portabilityData,
          message: 'Portability request processed successfully'
        })
        
      case 'consent-withdrawal':
        if (!userId || !data.consentType) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID and consent type are required' },
            { status: 400 }
          )
        }
        
        const consentData = await handleConsentWithdrawal(userId, data.consentType)
        
        return NextResponse.json({
          success: true,
          data: consentData,
          message: 'Consent withdrawal processed successfully'
        })
        
      case 'check-deletion-eligibility':
        if (!userId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID is required' },
            { status: 400 }
          )
        }
        
        const eligibility = await gdprManager.checkDeletionEligibility(userId)
        
        return NextResponse.json({
          success: true,
          eligibility,
          message: eligibility.canDelete ? 'User is eligible for deletion' : 'User is not eligible for deletion'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in GDPR API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get GDPR information and reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action, userId } = Object.fromEntries(searchParams)

    switch (action) {
      case 'privacy-policy':
        const privacyPolicy = await db.privacyPolicy.findFirst({
          orderBy: { effectiveDate: 'desc' }
        })
        
        return NextResponse.json({
          success: true,
          privacyPolicy,
          message: 'Privacy policy retrieved successfully'
        })
        
      case 'cookie-policy':
        const cookiePolicy = await db.cookiePolicy.findFirst({
          orderBy: { effectiveDate: 'desc' }
        })
        
        return NextResponse.json({
          success: true,
          cookiePolicy,
          message: 'Cookie policy retrieved successfully'
        })
        
      case 'data-processing-agreement':
        const dpa = await db.dataProcessingAgreement.findFirst({
          orderBy: { effectiveDate: 'desc' }
        })
        
        return NextResponse.json({
          success: true,
          dpa,
          message: 'Data processing agreement retrieved successfully'
        })
        
      case 'consent-status':
        if (!userId) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID is required' },
            { status: 400 }
          )
        }
        
        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            consentStatus: true,
            consentWithdrawnAt: true,
            consentType: true
          }
        })
        
        if (!user) {
          return NextResponse.json(
            { error: 'Not Found', message: 'User not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          success: true,
          consentStatus: user.consentStatus,
          consentWithdrawnAt: user.consentWithdrawnAt,
          consentType: user.consentType,
          message: 'Consent status retrieved successfully'
        })
        
      case 'data-subject-requests':
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const requests = await db.dataSubjectRequest.findMany({
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        
        return NextResponse.json({
          success: true,
          requests: requests.map(req => ({
            id: req.id,
            userId: req.userId,
            type: req.type,
            status: req.status,
            error: req.error,
            createdAt: req.createdAt.toISOString()
          })),
          message: 'Data subject requests retrieved successfully'
        })
        
      case 'consent-withdrawals':
        const thirtyDaysAgo2 = new Date()
        thirtyDaysAgo2.setDate(thirtyDaysAgo2.getDate() - 30)
        
        const withdrawals = await db.consentWithdrawal.findMany({
          where: {
            withdrawnAt: {
              gte: thirtyDaysAgo2
            }
          },
          orderBy: { withdrawnAt: 'desc' }
        })
        
        return NextResponse.json({
          success: true,
          withdrawals: withdrawals.map(withdrawal => ({
            id: withdrawal.id,
            userId: withdrawal.userId,
            consentType: withdrawal.consentType,
            status: withdrawal.status,
            withdrawnAt: withdrawal.withdrawnAt.toISOString()
          })),
          message: 'Consent withdrawals retrieved successfully'
        })
        
      case 'compliance-report':
        const report = await generateComplianceReport()
        
        return NextResponse.json({
          success: true,
          report,
          message: 'Compliance report generated successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in GDPR API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Update GDPR settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update-privacy-policy':
        if (!data.title || !data.content) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Title and content are required' },
            { status: 400 }
          )
        }
        
        const updatedPolicy = await db.privacyPolicy.create({
          data: {
            title: data.title,
            version: data.version || '1.0',
            effectiveDate: new Date(data.effectiveDate),
            content: data.content,
            dataController: data.dataController || 'QR Code Helpline System',
            contactEmail: data.contactEmail || 'privacy@qr-code-helpline.com',
            retentionPeriods: data.retentionPeriods || {},
            createdAt: new Date()
          }
        })
        
        return NextResponse.json({
          success: true,
          privacyPolicy: updatedPolicy,
          message: 'Privacy policy updated successfully'
        })
        
      case 'update-cookie-policy':
        if (!data.title || !data.content) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Title and content are required' },
            { status: 400 }
          )
        }
        
        const updatedCookiePolicy = await db.cookiePolicy.create({
          data: {
            title: data.title,
            version: data.version || '1.0',
            effectiveDate: new Date(data.effectiveDate),
            content: data.content,
            cookieCategories: data.cookieCategories || {},
            retentionPeriod: data.retentionPeriod || 90,
            createdAt: new Date()
          }
        })
        
        return NextResponse.json({
          success: true,
          cookiePolicy: updatedCookiePolicy,
          message: 'Cookie policy updated successfully'
        })
        
      case 'update-dpa':
        if (!data.title || !data.content) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Title and content are required' },
            { status: 400 }
          )
        }
        
        const updatedDPA = await db.dataProcessingAgreement.create({
          data: {
            title: data.title,
            version: data.version || '1.0',
            effectiveDate: new Date(data.effectiveDate),
            content: data.content,
            dataController: data.dataController || 'QR Code Helpline System',
            dataProcessor: data.dataProcessor || 'QR Code Helpline System',
            purposes: data.purposes || [],
            dataTypes: data.dataTypes || [],
            securityMeasures: data.securityMeasures || [],
            subProcessors: data.subProcessors || [],
            retentionPeriod: data.retentionPeriod || {},
            createdAt: new Date()
          }
        })
        
        return NextResponse.json({
          success: true,
          dpa: updatedDPA,
          message: 'Data processing agreement updated successfully'
        })
        
      case 'update-user-consent':
        if (!data.userId || !data.consentStatus) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'User ID and consent status are required' },
            { status: 400 }
          )
        }
        
        const updatedUser = await db.user.update({
          where: { id: data.userId },
          data: {
            consentStatus: data.consentStatus,
            consentWithdrawnAt: data.consentWithdrawnAt ? new Date(data.consentWithdrawnAt) : null,
            consentType: data.consentType,
            updatedAt: new Date()
          }
        })
        
        return NextResponse.json({
          success: true,
          user: updatedUser,
          message: 'User consent updated successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in GDPR API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Delete GDPR records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action, id } = Object.fromEntries(searchParams)

    switch (action) {
      case 'delete-request':
        if (!id) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Request ID is required' },
            { status: 400 }
          )
        }
        
        await db.dataSubjectRequest.delete({
          where: { id }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Data subject request deleted successfully'
        })
        
      case 'delete-withdrawal':
        if (!id) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Withdrawal ID is required' },
            { status: 400 }
          )
        }
        
        await db.consentWithdrawal.delete({
          where: { id }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Consent withdrawal deleted successfully'
        })
        
      case 'cleanup-old-records':
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const [deletedRequests, deletedWithdrawals] = await Promise.all([
          db.dataSubjectRequest.deleteMany({
            where: {
              createdAt: {
                lt: thirtyDaysAgo
              }
            }
          }),
          db.consentWithdrawal.deleteMany({
            where: {
              withdrawnAt: {
                lt: thirtyDaysAgo
              }
            }
          })
        ])
        
        return NextResponse.json({
          success: true,
          message: 'Old GDPR records cleaned up successfully',
          deletedRequests: deletedRequests.count,
          deletedWithdrawals: deletedWithdrawals.count
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in GDPR API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}