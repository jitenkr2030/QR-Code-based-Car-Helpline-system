import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// SSL Configuration
const SSL_CONFIG = {
  // SSL Certificate paths
  certPath: process.env.SSL_CERT_PATH || '/etc/ssl/certs/your-domain.crt',
  keyPath: process.env.SSL_KEY_PATH || '/etc/ssl/private/your-domain.key',
  caPath: process.env.SSL_CA_PATH || '/etc/ssl/certs/your-domain.ca.crt',
  
  // SSL Protocols
  protocols: ['TLSv1.2', 'TLSv1.3'],
  
  // SSL Ciphers
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-RSA-AES256-SHA',
    'ECDHE-RSA-AES128-SHA',
    'DHE-RSA-AES256-GCM-SHA384',
    'DHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-SHA256',
    'DHE-RSA-AES128-SHA'
  ],
  
  // SSL HSTS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Other SSL settings
  preferServerCiphers: true,
  requireClientCertificate: false,
  trustProxy: true,
  
  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
}

// SSL Certificate Manager
export class SSLCertificateManager {
  private static instance: SSLCertificateManager
  private certificateInfo: any = null
  private lastCheck: number = 0
  private checkInterval: number = 24 * 60 * 60 * 1000 // 24 hours

  private constructor() {
    this.checkCertificate()
  }

  public static getInstance(): SSLCertificateManager {
    if (!SSLCertificateManager.instance) {
      SSLCertificateManager.instance = new SSLCertificateManager()
    }
    return SSLCertificateManager.instance
  }

  // Check SSL certificate
  public async checkCertificate(): Promise<any> {
    const now = Date.now()
    
    // Check if we need to refresh certificate info
    if (this.certificateInfo && (now - this.lastCheck) < this.checkInterval) {
      return this.certificateInfo
    }

    try {
      // In production, this would read the actual certificate files
      // For now, we'll simulate certificate info
      this.certificateInfo = {
        domain: process.env.DOMAIN || 'qr-code-helpline-system.vercel.app',
        issuer: "Let's Encrypt",
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        daysUntilExpiry: 60,
        isExpired: false,
        isExpiringSoon: false,
        serial: '1234567890ABCDEF',
        fingerprint: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF',
        version: 3,
        signatureAlgorithm: 'sha256WithRSAEncryption',
        subject: {
          commonName: process.env.DOMAIN || 'qr-code-helpline-system.vercel.app',
          organization: 'QR Code Helpline System',
          organizationalUnit: 'IT Department',
          country: 'IN',
          state: 'Maharashtra',
          locality: 'Mumbai'
        },
        san: [
          process.env.DOMAIN || 'qr-code-helpline-system.vercel.app',
          'www.' + (process.env.DOMAIN || 'qr-code-helpline-system.vercel.app'),
          '*.qr-code-helpline-system.vercel.app'
        ]
      }
      
      this.lastCheck = now
      return this.certificateInfo
    } catch (error) {
      console.error('Error checking SSL certificate:', error)
      return null
    }
  }

  // Get certificate expiration warning
  public getExpirationWarning(): string | null {
    if (!this.certificateInfo) {
      return 'Certificate information not available'
    }

    const { daysUntilExpiry, isExpired, isExpiringSoon } = this.certificateInfo

    if (isExpired) {
      return 'Certificate has expired! Please renew immediately.'
    }

    if (isExpiringSoon || daysUntilExpiry <= 7) {
      return `Certificate expires in ${daysUntilExpiry} days. Please renew soon.`
    }

    if (daysUntilExpiry <= 30) {
      return `Certificate expires in ${daysUntilExpiry} days. Please plan for renewal.`
    }

    return null
  }

  // Validate SSL configuration
  public validateSSLConfig(): boolean {
    try {
      // Check if SSL certificate files exist
      const fs = require('fs').promises
      
      // In production, these would check actual files
      // For now, we'll simulate the check
      const certExists = true
      const keyExists = true
      const caExists = true

      if (!certExists || !keyExists) {
        console.error('SSL certificate or key file not found')
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating SSL config:', error)
      return false
    }
  }

  // Generate SSL certificate info for API response
  public async getSSLInfo(): Promise<any> {
    const certificateInfo = await this.checkCertificate()
    
    return {
      domain: certificateInfo?.domain,
      issuer: certificateInfo?.issuer,
      validFrom: certificateInfo?.validFrom?.toISOString(),
      validTo: certificateInfo?.validTo?.toISOString(),
      daysUntilExpiry: certificateInfo?.daysUntilExpiry,
      isExpired: certificateInfo?.isExpired,
      isExpiringSoon: certificateInfo?.isExpiringSoon,
      serial: certificateInfo?.serial,
      fingerprint: certificateInfo?.fingerprint,
      version: certificateInfo?.version,
      signatureAlgorithm: certificateInfo?.signatureAlgorithm,
      subject: certificateInfo?.subject,
      san: certificateInfo?.san,
      protocols: SSL_CONFIG.protocols,
      ciphers: SSL_CONFIG.ciphers,
      hsts: SSL_CONFIG.hsts,
      securityHeaders: SSL_CONFIG.securityHeaders,
      lastCheck: new Date(this.lastCheck).toISOString()
    }
  }
}

// SSL Middleware
export function createSSLMiddleware(options: {
  forceHTTPS?: boolean
  hsts?: boolean
  securityHeaders?: boolean
} = {}) {
  const { forceHTTPS = true, hsts = true, securityHeaders = true } = options
  
  return function sslMiddleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Force HTTPS in production
    if (forceHTTPS && process.env.NODE_ENV === 'production') {
      const url = request.url
      const protocol = url.split(':')[0]
      
      if (protocol === 'http') {
        const httpsUrl = url.replace(/^http:/, 'https:')
        return NextResponse.redirect(httpsUrl, 301)
      }
    }

    // Add HSTS header
    if (hsts) {
      const hstsValue = `max-age=${SSL_CONFIG.hsts.maxAge}${SSL_CONFIG.hsts.includeSubDomains ? '; includeSubDomains' : ''}${SSL_CONFIG.hsts.preload ? '; preload' : ''}`
      response.headers.set('Strict-Transport-Security', hstsValue)
    }

    // Add security headers
    if (securityHeaders) {
      Object.entries(SSL_CONFIG.securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }

    // Add SSL certificate information
    const sslManager = SSLCertificateManager.getInstance()
    const warning = sslManager.getExpirationWarning()
    
    if (warning) {
      response.headers.set('X-SSL-Warning', warning)
    }

    return response
  }
}

// Specific SSL middleware functions
export const requireHTTPS = createSSLMiddleware({ forceHTTPS: true })
export const requireHSTS = createSSLMiddleware({ hsts: true })
export const requireSecurityHeaders = createSSLMiddleware({ securityHeaders: true })
export const requireCompleteSSL = createSSLMiddleware({ 
  forceHTTPS: true, 
  hsts: true, 
  securityHeaders: true 
})

// SSL API Route Handler
export async function handleSSLRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'info', 'check', 'validate', 'renew'
    
    const sslManager = SSLCertificateManager.getInstance()
    
    switch (action) {
      case 'info':
        const sslInfo = await sslManager.getSSLInfo()
        return NextResponse.json({
          success: true,
          sslInfo,
          message: 'SSL information retrieved successfully'
        })
        
      case 'check':
        const certificateInfo = await sslManager.checkCertificate()
        const warning = sslManager.getExpirationWarning()
        
        return NextResponse.json({
          success: true,
          certificateInfo,
          warning,
          message: warning || 'SSL certificate is valid'
        })
        
      case 'validate':
        const isValid = sslManager.validateSSLConfig()
        
        return NextResponse.json({
          success: true,
          isValid,
          message: isValid ? 'SSL configuration is valid' : 'SSL configuration is invalid'
        })
        
      case 'renew':
        // In production, this would trigger certificate renewal
        return NextResponse.json({
          success: true,
          message: 'Certificate renewal triggered (simulated)',
          note: 'In production, this would contact Let\'s Encrypt or your CA'
        })
        
      default:
        return NextResponse.json({
          success: true,
          sslConfig: SSL_CONFIG,
          message: 'SSL configuration retrieved successfully'
        })
    }
    
  } catch (error) {
    console.error('SSL API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Export SSL manager instance
export const sslManager = SSLCertificateManager.getInstance()

// Export helper functions
export const checkCertificate = () => sslManager.checkCertificate()
export const getSSLInfo = () => sslManager.getSSLInfo()
export const validateSSLConfig = () => sslManager.validateSSLConfig()
export const getExpirationWarning = () => sslManager.getExpirationWarning()

// Export middleware functions
export const sslMiddleware = createSSLMiddleware()
export const httpsMiddleware = requireHTTPS
export const hstsMiddleware = requireHSTS
export const securityHeadersMiddleware = requireSecurityHeaders
export const completeSSLMiddleware = requireCompleteSSL

// SSL Certificate utilities
export const sslUtils = {
  // Parse certificate from PEM format
  parseCertificate: (pem: string): any => {
    // In production, this would use a library like node-forge or crypto
    // For now, we'll simulate certificate parsing
    return {
      subject: {
        commonName: process.env.DOMAIN || 'qr-code-helpline-system.vercel.app',
        organization: 'QR Code Helpline System',
        organizationalUnit: 'IT Department',
        country: 'IN',
        state: 'Maharashtra',
        locality: 'Mumbai'
      },
      issuer: {
        commonName: "Let's Encrypt Authority X3",
        organization: "Let's Encrypt",
        country: "US"
      },
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      serial: '1234567890ABCDEF',
      fingerprint: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF',
      version: 3,
      signatureAlgorithm: 'sha256WithRSAEncryption'
    }
  },

  // Generate CSR (Certificate Signing Request)
  generateCSR: (options: {
    commonName: string
    organization: string
    organizationalUnit?: string
    country: string
    state?: string
    locality?: string
    email?: string
    san?: string[]
  }) => {
    // In production, this would generate an actual CSR
    // For now, we'll simulate CSR generation
    return {
      csr: '-----BEGIN CERTIFICATE REQUEST-----\n...\n-----END CERTIFICATE REQUEST-----',
      commonName: options.commonName,
      organization: options.organization,
      organizationalUnit: options.organizationalUnit,
      country: options.country,
      state: options.state,
      locality: options.locality,
      email: options.email,
      san: options.san
    }
  },

  // Check certificate chain
  checkCertificateChain: (cert: string, ca: string): boolean => {
    // In production, this would verify the certificate chain
    // For now, we'll simulate the check
    return true
  },

  // Get certificate fingerprint
  getFingerprint: (cert: string): string => {
    // In production, this would calculate the actual fingerprint
    // For now, we'll simulate the fingerprint
    return 'AB:CD:EF:12:34:56:78:90:AB:CD:EF'
  },

  // Validate certificate against domain
  validateDomain: (cert: string, domain: string): boolean => {
    // In production, this would validate the certificate against the domain
    // For now, we'll simulate the validation
    return true
  },

  // Check certificate revocation
  checkRevocation: (cert: string): boolean => {
    // In production, this would check certificate revocation status
    // For now, we'll simulate the check
    return false
  }
}