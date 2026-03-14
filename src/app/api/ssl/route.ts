import { NextRequest, NextResponse } from 'next/server'
import { sslManager, getSSLInfo, checkCertificate, validateSSLConfig, getExpirationWarning } from '@/lib/ssl'
import { db } from '@/lib/db'

// Get SSL information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'info', 'check', 'validate', 'renew'

    switch (action) {
      case 'info':
        const sslInfo = await getSSLInfo()
        return NextResponse.json({
          success: true,
          sslInfo,
          message: 'SSL information retrieved successfully'
        })
        
      case 'check':
        const certificateInfo = await checkCertificate()
        const warning = getExpirationWarning()
        
        return NextResponse.json({
          success: true,
          certificateInfo,
          warning,
          message: warning || 'SSL certificate is valid'
        })
        
      case 'validate':
        const isValid = validateSSLConfig()
        
        return NextResponse.json({
          success: true,
          isValid,
          message: isValid ? 'SSL configuration is valid' : 'SSL configuration is invalid'
        })
        
      case 'monitoring':
        // Get SSL monitoring data
        const monitoringData = await getSSLMonitoringData()
        
        return NextResponse.json({
          success: true,
          monitoringData,
          message: 'SSL monitoring data retrieved successfully'
        })
        
      default:
        const sslConfig = {
          protocols: ['TLSv1.2', 'TLSv1.3'],
          ciphers: [
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-SHA384',
            'ECDHE-RSA-AES128-SHA256',
            'ECDHE-RSA-CHACHA20-POLY1305'
          ],
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
          },
          securityHeaders: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        }
        
        return NextResponse.json({
          success: true,
          sslConfig,
          message: 'SSL configuration retrieved successfully'
        })
    }
    
  } catch (error) {
    console.error('Error in SSL API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Update SSL configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'update-config':
        // Update SSL configuration (in production, this would update actual config files)
        const updatedConfig = {
          protocols: config.protocols || ['TLSv1.2', 'TLSv1.3'],
          ciphers: config.ciphers || [
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256'
          ],
          hsts: {
            maxAge: config.hsts?.maxAge || 31536000,
            includeSubDomains: config.hsts?.includeSubDomains !== false,
            preload: config.hsts?.preload !== false
          },
          securityHeaders: config.securityHeaders || {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        }
        
        return NextResponse.json({
          success: true,
          config: updatedConfig,
          message: 'SSL configuration updated successfully'
        })
        
      case 'renew-certificate':
        // Trigger certificate renewal (in production, this would contact Let's Encrypt)
        const renewalResult = await triggerCertificateRenewal()
        
        return NextResponse.json({
          success: true,
          renewalResult,
          message: 'Certificate renewal triggered successfully'
        })
        
      case 'install-certificate':
        // Install SSL certificate (in production, this would install actual certificates)
        const installResult = await installSSLCertificate(config)
        
        return NextResponse.json({
          success: true,
          installResult,
          message: 'SSL certificate installed successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in SSL API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Renew SSL certificate
async function triggerCertificateRenewal(): Promise<any> {
  try {
    // In production, this would contact Let's Encrypt or your CA
    // For now, we'll simulate the renewal process
    
    const renewalResult = {
      orderId: 'ord_' + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      estimatedTime: 300, // 5 minutes in seconds
      renewalDate: new Date().toISOString()
    }
    
    // Store renewal request in database
    await db.sSLRenewal.create({
      data: {
        orderId: renewalResult.orderId,
        status: renewalResult.status,
        estimatedTime: renewalResult.estimatedTime,
        renewalDate: new Date(renewalResult.renewalDate),
        createdAt: new Date()
      }
    })
    
    return renewalResult
  } catch (error) {
    console.error('Error triggering certificate renewal:', error)
    throw error
  }
}

// Install SSL certificate
async function installSSLCertificate(config: any): Promise<any> {
  try {
    // In production, this would install actual SSL certificates
    // For now, we'll simulate the installation process
    
    const installResult = {
      certificateId: 'cert_' + Math.random().toString(36).substr(2, 9),
      status: 'installed',
      installDate: new Date().toISOString(),
      domain: config.domain || process.env.DOMAIN,
      issuer: "Let's Encrypt",
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      fingerprint: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF'
    }
    
    // Store installation in database
    await db.sSLCertificate.create({
      data: {
        certificateId: installResult.certificateId,
        domain: installResult.domain,
        issuer: installResult.issuer,
        validFrom: new Date(installResult.validFrom),
        validTo: new Date(installResult.validTo),
        fingerprint: installResult.fingerprint,
        status: installResult.status,
        installDate: new Date(installResult.installDate),
        createdAt: new Date()
      }
    })
    
    return installResult
  } catch (error) {
    console.error('Error installing SSL certificate:', error)
    throw error
  }
}

// Get SSL monitoring data
async function getSSLMonitoringData(): Promise<any> {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Get recent SSL certificates
    const certificates = await db.sSLCertificate.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    // Get recent SSL renewals
    const renewals = await db.sSLRenewal.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    // Calculate statistics
    const stats = {
      totalCertificates: certificates.length,
      activeCertificates: certificates.filter(cert => cert.status === 'installed').length,
      expiringCertificates: certificates.filter(cert => {
        const validTo = new Date(cert.validTo)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        return validTo < thirtyDaysFromNow
      }).length,
      expiredCertificates: certificates.filter(cert => {
        const validTo = new Date(cert.validTo)
        return validTo < now
      }).length,
      totalRenewals: renewals.length,
      successfulRenewals: renewals.filter(renewal => renewal.status === 'completed').length,
      pendingRenewals: renewals.filter(renewal => renewal.status === 'pending').length,
      failedRenewals: renewals.filter(renewal => renewal.status === 'failed').length
    }
    
    return {
      stats,
      certificates: certificates.map(cert => ({
        id: cert.id,
        certificateId: cert.certificateId,
        domain: cert.domain,
        issuer: cert.issuer,
        validFrom: cert.validFrom.toISOString(),
        validTo: cert.validTo.toISOString(),
        fingerprint: cert.fingerprint,
        status: cert.status,
        installDate: cert.installDate.toISOString(),
        daysUntilExpiry: Math.ceil((new Date(cert.validTo).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      })),
      renewals: renewals.map(renewal => ({
        id: renewal.id,
        orderId: renewal.orderId,
        status: renewal.status,
        estimatedTime: renewal.estimatedTime,
        renewalDate: renewal.renewalDate.toISOString(),
        createdAt: renewal.createdAt.toISOString()
      })),
      lastChecked: now.toISOString()
    }
  } catch (error) {
    console.error('Error getting SSL monitoring data:', error)
    throw error
  }
}

// Delete SSL records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action, id } = Object.fromEntries(searchParams)

    switch (action) {
      case 'certificate':
        if (!id) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Certificate ID is required' },
            { status: 400 }
          )
        }
        
        // Delete SSL certificate
        await db.sSLCertificate.delete({
          where: { id }
        })
        
        return NextResponse.json({
          success: true,
          message: 'SSL certificate deleted successfully'
        })
        
      case 'renewal':
        if (!id) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Renewal ID is required' },
            { status: 400 }
          )
        }
        
        // Delete SSL renewal
        await db.sSLRenewal.delete({
          where: { id }
        })
        
        return NextResponse.json({
          success: true,
          message: 'SSL renewal deleted successfully'
        })
        
      case 'cleanup':
        // Clean up old SSL records
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const [deletedCertificates, deletedRenewals] = await Promise.all([
          db.sSLCertificate.deleteMany({
            where: {
              createdAt: {
                lt: thirtyDaysAgo
              }
            }
          }),
          db.sSLRenewal.deleteMany({
            where: {
              createdAt: {
                lt: thirtyDaysAgo
              }
            }
          })
        ])
        
        return NextResponse.json({
          success: true,
          message: 'SSL records cleaned up successfully',
          deletedCertificates: deletedCertificates.count,
          deletedRenewals: deletedRenewals.count
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in SSL API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}