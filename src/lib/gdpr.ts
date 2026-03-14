import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataEncryption } from '@/lib/encryption'

// GDPR Configuration
const GDPR_CONFIG = {
  // Data retention periods (in days)
  retentionPeriods: {
    userAccounts: 365 * 7, // 7 years
    userActivity: 365 * 2, // 2 years
    supportTickets: 365 * 3, // 3 years
    paymentRecords: 365 * 7, // 7 years
    analytics: 365 * 2, // 2 years
    documents: 365 * 1, // 1 year
    cookies: 90, // 90 days
    sessionData: 30 // 30 days
  },
  
  // Consent requirements
  consent: {
    minimumAge: 18,
    explicitConsent: true,
    granularConsent: true,
    withdrawalPeriod: 30, // days
    recordKeepingPeriod: 365 * 5 // 5 years
  },
  
  // Data subject rights
  rights: {
    access: true,
    rectification: true,
    erasure: true,
    portability: true,
    objection: true,
    restriction: true,
    automatedDecisionMaking: false,
    profiling: false
  },
  
  // Security requirements
  security: {
    encryptionAtRest: true,
    encryptionInTransit: true,
    accessControl: true,
    auditLogging: true,
    dataBreachNotification: 72 // hours
  },
  
  // Cookie requirements
  cookies: {
    consentRequired: true,
    essentialOnly: false,
    analytics: true,
    marketing: true,
    personalization: true,
    retentionPeriod: 90 // days
  }
}

// GDPR Manager Class
export class GDPRManager {
  private static instance: GDPRManager
  
  private constructor() {
    this.initializeCompliance()
  }

  public static getInstance(): GDPRManager {
    if (!GDPRManager.instance) {
      GDPRManager.instance = new GDPRManager()
    }
    return GDPRManager.instance
  }

  // Initialize GDPR compliance
  private async initializeCompliance(): Promise<void> {
    try {
      // Create default privacy policy
      await this.createDefaultPrivacyPolicy()
      
      // Create default cookie policy
      await this.createDefaultCookiePolicy()
      
      // Create default data processing agreement
      await this.createDefaultDataProcessingAgreement()
      
      // Set up automated data retention cleanup
      this.setupAutomatedCleanup()
      
      console.log('GDPR compliance initialized successfully')
    } catch (error) {
      console.error('Error initializing GDPR compliance:', error)
    }
  }

  // Handle data subject access request
  public async handleAccessRequest(userId: string): Promise<any> {
    try {
      const userData = await db.user.findUnique({
        where: { id: userId },
        include: {
          vehicles: true,
          serviceBookings: true,
          policies: true,
          claims: true,
          supportTickets: true,
          subscriptions: true
        }
      })

      if (!userData) {
        throw new Error('User not found')
      }

      // Sanitize and prepare data for export
      const exportData = {
        personalData: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          profileImage: userData.profileImage,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        },
        vehicles: userData.vehicles.map(vehicle => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt
        })),
        serviceBookings: userData.serviceBookings.map(booking => ({
          id: booking.id,
          serviceType: booking.serviceType,
          status: booking.status,
          urgency: booking.urgency,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        })),
        insurance: userData.policies.map(policy => ({
          id: policy.id,
          policyNumber: policy.policyNumber,
          provider: policy.insuranceProvider,
          type: policy.type,
          status: policy.status,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt
        })),
        claims: userData.claims.map(claim => ({
          id: claim.id,
          claimNumber: claim.claimNumber,
          type: claim.type,
          status: claim.status,
          amount: claim.amount,
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt
        })),
        support: userData.supportTickets.map(ticket => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt
        })),
        subscriptions: userData.subscriptions.map(subscription => ({
          id: subscription.id,
          status: subscription.status,
          planId: subscription.planId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt
        }))
      }

      // Log access request
      await this.logDataSubjectRequest(userId, 'access', 'completed')

      return exportData
    } catch (error) {
      console.error('Error handling access request:', error)
      await this.logDataSubjectRequest(userId, 'access', 'failed', error.message)
      throw error
    }
  }

  // Handle data subject rectification request
  public async handleRectificationRequest(userId: string, corrections: any): Promise<any> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Apply corrections
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          ...corrections,
          updatedAt: new Date()
        }
      })

      // Log rectification request
      await this.logDataSubjectRequest(userId, 'rectification', 'completed')

      return {
        success: true,
        correctedData: updatedUser,
        message: 'Data rectified successfully'
      }
    } catch (error) {
      console.error('Error handling rectification request:', error)
      await this.logDataSubjectRequest(userId, 'rectification', 'failed', error.message)
      throw error
    }
  }

  // Handle data subject erasure request
  public async handleErasureRequest(userId: string): Promise<any> {
    try {
      // Check for legal holds or other retention requirements
      const canDelete = await this.checkDeletionEligibility(userId)
      
      if (!canDelete.canDelete) {
        return {
          success: false,
          message: 'Cannot delete user data due to legal or retention requirements',
          reasons: canDelete.reasons
        }
      }

      // Begin transactional deletion
      const result = await db.$transaction(async (tx) => {
        // Delete related records
        await tx.supportTicket.deleteMany({
          where: { userId }
        })

        await tx.subscription.deleteMany({
          where: { userId }
        })

        await tx.insuranceClaim.deleteMany({
          where: { userId }
        })

        await tx.insurancePolicy.deleteMany({
          where: { userId }
        })

        await tx.serviceBooking.deleteMany({
          where: { userId }
        })

        await tx.vehicle.deleteMany({
          where: { ownerId: userId }
        })

        // Delete user
        const deletedUser = await tx.user.delete({
          where: { id: userId }
        })

        return deletedUser
      })

      // Log erasure request
      await this.logDataSubjectRequest(userId, 'erasure', 'completed')

      return {
        success: true,
        message: 'User data deleted successfully',
        deletedData: result
      }
    } catch (error) {
      console.error('Error handling erasure request:', error)
      await this.logDataSubjectRequest(userId, 'erasure', 'failed', error.message)
      throw error
    }
  }

  // Handle data subject portability request
  public async handlePortabilityRequest(userId: string): Promise<any> {
    try {
      const userData = await this.handleAccessRequest(userId)
      
      // Create portable format (JSON)
      const portableData = {
        exportDate: new Date().toISOString(),
        format: 'JSON',
        version: '1.0',
        data: userData
      }

      // Log portability request
      await this.logDataSubjectRequest(userId, 'portability', 'completed')

      return {
        success: true,
        portableData,
        message: 'Portable data created successfully'
      }
    } catch (error) {
      console.error('Error handling portability request:', error)
      await this.logDataSubjectRequest(userId, 'portability', 'failed', error.message)
      throw error
    }
  }

  // Handle consent withdrawal
  public async handleConsentWithdrawal(userId: string, consentType: string): Promise<any> {
    try {
      // Update user consent status
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          consentStatus: 'withdrawn',
          consentWithdrawnAt: new Date(),
          consentType: consentType
        }
      })

      // Log consent withdrawal
      await this.logConsentWithdrawal(userId, consentType, 'completed')

      return {
        success: true,
        message: 'Consent withdrawn successfully',
        consentStatus: updatedUser.consentStatus
      }
    } catch (error) {
      console.error('Error handling consent withdrawal:', error)
      await this.logConsentWithdrawal(userId, consentType, 'failed', error.message)
      throw error
    }
  }

  // Check deletion eligibility
  private async checkDeletionEligibility(userId: string): Promise<{ canDelete: boolean; reasons?: string[] }> {
    const reasons: string[] = []

    // Check for active subscriptions
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        userId,
        status: 'active',
        endDate: {
          gt: new Date()
        }
      }
    })

    if (activeSubscriptions.length > 0) {
      reasons.push('User has active subscriptions')
    }

    // Check for pending claims
    const pendingClaims = await db.insuranceClaim.findMany({
      where: {
        userId,
        status: {
          in: ['pending', 'in_progress', 'under_review']
        }
      }
    })

    if (pendingClaims.length > 0) {
      reasons.push('User has pending insurance claims')
    }

    // Check for open support tickets
    const openTickets = await db.supportTicket.findMany({
      where: {
        userId,
        status: {
          in: ['open', 'in_progress']
        }
      }
    })

    if (openTickets.length > 0) {
      reasons.push('User has open support tickets')
    }

    // Check for recent transactions (within last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const recentTransactions = await db.payment.findMany({
      where: {
        userId,
        createdAt: {
          gt: ninetyDaysAgo
        }
      }
    })

    if (recentTransactions.length > 0) {
      reasons.push('User has recent transactions')
    }

    return {
      canDelete: reasons.length === 0,
      reasons: reasons.length > 0 ? reasons : undefined
    }
  }

  // Create default privacy policy
  private async createDefaultPrivacyPolicy(): Promise<void> {
    const existingPolicy = await db.privacyPolicy.findFirst()
    
    if (!existingPolicy) {
      await db.privacyPolicy.create({
        data: {
          title: 'Privacy Policy',
          version: '1.0',
          effectiveDate: new Date(),
          content: this.generateDefaultPrivacyPolicyContent(),
          dataController: 'QR Code Helpline System',
          contactEmail: 'privacy@qr-code-helpline.com',
          retentionPeriods: GDPR_CONFIG.retentionPeriods,
          createdAt: new Date()
        }
      })
    }
  }

  // Create default cookie policy
  private async createDefaultCookiePolicy(): Promise<void> {
    const existingPolicy = await db.cookiePolicy.findFirst()
    
    if (!existingPolicy) {
      await db.cookiePolicy.create({
        data: {
          title: 'Cookie Policy',
          version: '1.0',
          effectiveDate: new Date(),
          content: this.generateDefaultCookiePolicyContent(),
          cookieCategories: {
            essential: true,
            analytics: true,
            marketing: true,
            personalization: true
          },
          retentionPeriod: GDPR_CONFIG.cookies.retentionPeriod,
          createdAt: new Date()
        }
      })
    }
  }

  // Create default data processing agreement
  private async createDefaultDataProcessingAgreement(): Promise<void> {
    const existingDPA = await db.dataProcessingAgreement.findFirst()
    
    if (!existingDPA) {
      await db.dataProcessingAgreement.create({
        data: {
          title: 'Data Processing Agreement',
          version: '1.0',
          effectiveDate: new Date(),
          content: this.generateDefaultDPAContent(),
          dataController: 'QR Code Helpline System',
          dataProcessor: 'QR Code Helpline System',
          purposes: ['service_provision', 'user_support', 'analytics', 'marketing'],
          dataTypes: ['personal', 'contact', 'vehicle', 'service', 'payment'],
          securityMeasures: ['encryption', 'access_control', 'audit_logging'],
          subProcessors: [],
          retentionPeriod: GDPR_CONFIG.retentionPeriods,
          createdAt: new Date()
        }
      })
    }
  }

  // Generate default privacy policy content
  private generateDefaultPrivacyPolicyContent(): string {
    return `
# Privacy Policy for QR Code Helpline System

## 1. Introduction
This Privacy Policy explains how QR Code Helpline System collects, uses, stores, and protects your personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.

## 2. Data Controller
QR Code Helpline System is the data controller responsible for your personal data.

## 3. Data We Collect
We collect the following types of personal data:
- Personal information (name, email, phone number)
- Vehicle information (make, model, year, license plate)
- Service information (booking details, service history)
- Payment information (payment details, transaction history)
- Technical information (IP address, device information)

## 4. How We Use Your Data
We use your personal data for:
- Providing our services
- Processing payments
- Communicating with you
- Improving our services
- Legal and regulatory compliance

## 5. Data Retention
We retain your personal data for the following periods:
- User accounts: 7 years
- Service records: 2 years
- Payment records: 7 years
- Support tickets: 3 years
- Analytics data: 2 years

## 6. Your Rights
You have the right to:
- Access your personal data
- Rectify inaccurate personal data
- Erase your personal data
- Restrict processing of your personal data
- Data portability
- Object to processing
- Not be subject to automated decision-making

## 7. Security Measures
We implement appropriate technical and organizational measures to protect your personal data, including:
- Encryption at rest and in transit
- Access controls
- Audit logging
- Regular security assessments

## 8. Data Breaches
In the event of a personal data breach, we will notify affected individuals and relevant authorities within 72 hours.

## 9. International Data Transfers
We do not transfer your personal data outside the European Economic Area without adequate protection.

## 10. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any significant changes.

## 11. Contact Us
If you have any questions about this privacy policy or your data protection rights, please contact us at:
Email: privacy@qr-code-helpline.com
Address: [Your Address]

Last updated: ${new Date().toLocaleDateString()}
    `
  }

  // Generate default cookie policy content
  private generateDefaultCookiePolicyContent(): string {
    return `
# Cookie Policy for QR Code Helpline System

## 1. What Are Cookies?
Cookies are small text files that are stored on your device when you visit our website.

## 2. How We Use Cookies
We use cookies to:
- Remember your preferences
- Analyze website usage
- Provide personalized content
- Ensure website security

## 3. Types of Cookies We Use
- Essential cookies: Required for the website to function
- Analytics cookies: Help us understand how our website is used
- Marketing cookies: Used for advertising purposes
- Personalization cookies: Used to provide personalized content

## 4. Your Choices
You can:
- Accept or reject non-essential cookies
- Manage your cookie preferences
- Delete cookies from your device

## 5. Cookie Duration
- Session cookies: Deleted when you close your browser
- Persistent cookies: Typically expire after 90 days

## 6. Third-Party Cookies
We may use third-party services that set their own cookies. These include:
- Analytics providers (Google Analytics)
- Payment processors
- Social media platforms

## 7. Managing Cookies
You can manage your cookie preferences through:
- Your browser settings
- Our cookie consent banner
- Your account settings

## 8. Updates to This Policy
We may update this cookie policy from time to time.

Last updated: ${new Date().toLocaleDateString()}
    `
  }

  // Generate default DPA content
  private generateDefaultDPAContent(): string {
    return `
# Data Processing Agreement

## 1. Parties
- Data Controller: QR Code Helpline System
- Data Processor: QR Code Helpline System

## 2. Subject Matter
Processing of personal data in connection with the provision of QR Code Helpline System services.

## 3. Duration
This agreement remains in effect for the duration of the data processing activities.

## 4. Nature and Purpose of Processing
- Service provision
- User support
- Analytics
- Marketing

## 5. Types of Personal Data
- Personal information
- Contact information
- Vehicle information
- Service information
- Payment information

## 6. Obligations and Rights of Data Subjects
- Right to access
- Right to rectification
- Right to erasure
- Right to restriction of processing
- Right to data portability
- Right to object

## 7. Security Measures
- Encryption at rest and in transit
- Access controls
- Audit logging
- Regular security assessments

## 8. Sub-processing
No sub-processors are engaged without prior written authorization from the data controller.

## 9. Return of Data
All personal data will be securely deleted or returned at the end of the agreement.

## 10. International Data Transfers
No international data transfers are permitted without adequate protection.

Last updated: ${new Date().toLocaleDateString()}
    `
  }

  // Setup automated cleanup
  private setupAutomatedCleanup(): void {
    // Schedule cleanup tasks
    setInterval(async () => {
      try {
        await this.performAutomatedCleanup()
      } catch (error) {
        console.error('Error in automated cleanup:', error)
      }
    }, 24 * 60 * 60 * 1000) // Run daily
  }

  // Perform automated cleanup
  private async performAutomatedCleanup(): Promise<void> {
    try {
      const now = new Date()
      
      // Clean up expired session data
      const sessionExpiry = new Date(now.getTime() - GDPR_CONFIG.retentionPeriods.sessionData * 24 * 60 * 60 * 1000)
      
      await db.session.deleteMany({
        where: {
          expiresAt: {
            lt: sessionExpiry
          }
        }
      })

      // Clean up old analytics data
      const analyticsExpiry = new Date(now.getTime() - GDPR_CONFIG.retentionPeriods.analytics * 24 * 60 * 60 * 1000)
      
      // This would clean up analytics data based on your schema
      // Implementation depends on your analytics tables

      console.log('Automated cleanup completed successfully')
    } catch (error) {
      console.error('Error in automated cleanup:', error)
    }
  }

  // Log data subject request
  private async logDataSubjectRequest(userId: string, type: string, status: string, error?: string): Promise<void> {
    try {
      await db.dataSubjectRequest.create({
        data: {
          userId,
          type,
          status,
          error,
          createdAt: new Date()
        }
      })
    } catch (logError) {
      console.error('Error logging data subject request:', logError)
    }
  }

  // Log consent withdrawal
  private async logConsentWithdrawal(userId: string, consentType: string, status: string, error?: string): Promise<void> {
    try {
      await db.consentWithdrawal.create({
        data: {
          userId,
          consentType,
          status,
          error,
          withdrawnAt: new Date()
        }
      })
    } catch (logError) {
      console.error('Error logging consent withdrawal:', logError)
    }
  }

  // Generate GDPR compliance report
  public async generateComplianceReport(): Promise<any> {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Get data subject requests
      const requests = await db.dataSubjectRequest.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })

      // Get consent withdrawals
      const withdrawals = await db.consentWithdrawal.findMany({
        where: {
          withdrawnAt: {
            gte: thirtyDaysAgo
          }
        }
      })

      // Calculate statistics
      const stats = {
        totalRequests: requests.length,
        requestsByType: this.groupByType(requests),
        requestsByStatus: this.groupByStatus(requests),
        averageProcessingTime: this.calculateAverageProcessingTime(requests),
        totalWithdrawals: withdrawals.length,
        withdrawalsByType: this.groupByType(withdrawals),
        complianceScore: this.calculateComplianceScore(requests, withdrawals)
      }

      return {
        reportDate: now.toISOString(),
        period: 'last-30-days',
        stats,
        recommendations: this.generateRecommendations(requests, withdrawals)
      }
    } catch (error) {
      console.error('Error generating compliance report:', error)
      throw error
    }
  }

  // Helper methods
  private groupByType(items: any[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private groupByStatus(items: any[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private calculateAverageProcessingTime(requests: any[]): number {
    if (requests.length === 0) return 0
    
    const completedRequests = requests.filter(req => req.status === 'completed')
    if (completedRequests.length === 0) return 0
    
    const totalTime = completedRequests.reduce((sum, req) => {
      const processingTime = new Date(req.createdAt).getTime()
      return sum + processingTime
    }, 0)
    
    return totalTime / completedRequests.length
  }

  private calculateComplianceScore(requests: any[], withdrawals: any[]): number {
    let score = 100
    
    // Deduct points for failed requests
    const failedRequests = requests.filter(req => req.status === 'failed')
    score -= failedRequests.length * 5
    
    // Deduct points for late responses (more than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const lateRequests = requests.filter(req => 
      req.status === 'completed' && 
      new Date(req.createdAt) < thirtyDaysAgo
    )
    score -= lateRequests.length * 3
    
    // Bonus points for quick responses
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const quickRequests = requests.filter(req => 
      req.status === 'completed' && 
      new Date(req.createdAt) > sevenDaysAgo
    )
    score += quickRequests.length * 2
    
    return Math.max(0, Math.min(100, score))
  }

  private generateRecommendations(requests: any[], withdrawals: any[]): string[] {
    const recommendations: string[] = []
    
    // Check for high failure rate
    const failureRate = requests.filter(req => req.status === 'failed').length / requests.length
    if (failureRate > 0.1) {
      recommendations.push('Consider reviewing and improving request handling processes to reduce failure rate')
    }
    
    // Check for slow processing
    const avgTime = this.calculateAverageProcessingTime(requests)
    if (avgTime > 7 * 24 * 60 * 60 * 1000) { // 7 days in milliseconds
      recommendations.push('Consider implementing more efficient processes to reduce request processing time')
    }
    
    // Check for high withdrawal rate
    const withdrawalRate = withdrawals.length / requests.length
    if (withdrawalRate > 0.2) {
      recommendations.push('Consider reviewing consent practices and improving user communication')
    }
    
    return recommendations
  }
}

// GDPR Middleware
export function createGDPRMiddleware(options: {
  requireConsent?: boolean
  cookieConsent?: boolean
  dataProcessingConsent?: boolean
} = {}) {
  const { requireConsent = true, cookieConsent = true, dataProcessingConsent = true } = options
  
  return function gdprMiddleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Add GDPR headers
    response.headers.set('X-GDPR-Compliant', 'true')
    response.headers.set('X-Data-Protection', 'GDPR')
    response.headers.set('X-Consent-Required', requireConsent.toString())
    response.headers.set('X-Cookie-Consent', cookieConsent.toString())
    response.headers.set('X-Data-Processing-Consent', dataProcessingConsent.toString())
    
    return response
  }
}

// Export GDPR manager instance
export const gdprManager = GDPRManager.getInstance()

// Export helper functions
export const handleAccessRequest = (userId: string) => 
  gdprManager.handleAccessRequest(userId)

export const handleRectificationRequest = (userId: string, corrections: any) => 
  gdprManager.handleRectificationRequest(userId, corrections)

export const handleErasureRequest = (userId: string) => 
  gdprManager.handleErasureRequest(userId)

export const handlePortabilityRequest = (userId: string) => 
  gdprManager.handlePortabilityRequest(userId)

export const handleConsentWithdrawal = (userId: string, consentType: string) => 
  gdprManager.handleConsentWithdrawal(userId, consentType)

export const generateComplianceReport = () => 
  gdprManager.generateComplianceReport()