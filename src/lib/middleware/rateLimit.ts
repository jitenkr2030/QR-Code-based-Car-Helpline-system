import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Rate limiting configuration
export const RATE_LIMIT_CONFIGS = {
  // General API limits
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // Limit each IP to 10 upload requests per hour
    message: 'Too many upload requests, please try again later.'
  },
  
  // API endpoints for authenticated users
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // Limit each user to 200 requests per windowMs
    message: 'Too many requests, please try again later.'
  },
  
  // Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500, // Limit each admin to 500 requests per windowMs
    message: 'Too many requests, please try again later.'
  },
  
  // Public endpoints
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests, please try again later.'
  },
  
  // Sensitive endpoints
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Limit each IP to 3 sensitive requests per hour
    message: 'Too many sensitive requests, please try again later.'
  }
} as const

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, {
  count: number
  resetTime: number
  lastRequest: number
}>()

// Rate limiting middleware factory
export function createRateLimitMiddleware(config: keyof typeof RATE_LIMIT_CONFIGS = 'default') {
  const rateLimitConfig = RATE_LIMIT_CONFIGS[config]
  
  return async function rateLimitMiddleware(request: NextRequest) {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const endpoint = getEndpoint(request)
    
    if (!clientIP) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Unable to determine client IP' },
        { status: 400 }
      )
    }

    const key = `${clientIP}:${endpoint}:${userAgent}`
    const now = Date.now()
    
    // Get or create rate limit record
    let record = rateLimitStore.get(key)
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + rateLimitConfig.windowMs,
        lastRequest: now
      }
      rateLimitStore.set(key, record)
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + rateLimitConfig.windowMs
    }

    // Increment request count
    record.count++
    record.lastRequest = now

    // Check if rate limit is exceeded
    if (record.count > rateLimitConfig.maxRequests) {
      // Log rate limit violation
      console.warn(`Rate limit exceeded for IP: ${clientIP}, Endpoint: ${endpoint}, Count: ${record.count}`)
      
      // Store rate limit violation in database for analytics
      try {
        await db.rateLimitViolation.create({
          data: {
            ip: clientIP,
            userAgent,
            endpoint,
            count: record.count,
            maxRequests: rateLimitConfig.maxRequests,
            windowMs: rateLimitConfig.windowMs,
            resetTime: new Date(record.resetTime),
            createdAt: new Date()
          }
        })
      } catch (error) {
        console.error('Error storing rate limit violation:', error)
      }

      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          message: rateLimitConfig.message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
          limit: rateLimitConfig.maxRequests,
          windowMs: rateLimitConfig.windowMs
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, rateLimitConfig.maxRequests - record.count).toString(),
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // Add rate limit headers to successful response
    const headers = {
      'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, rateLimitConfig.maxRequests - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    }

    return NextResponse.next({
      request: {
        headers
      }
    })
  }
}

// Specific rate limit middleware functions
export const rateLimitDefault = createRateLimitMiddleware('default')
export const rateLimitAuth = createRateLimitMiddleware('auth')
export const rateLimitUpload = createRateLimitMiddleware('upload')
export const rateLimitUser = createRateLimitMiddleware('user')
export const rateLimitAdmin = createRateLimitMiddleware('admin')
export const rateLimitPublic = createRateLimitMiddleware('public')
export const rateLimitSensitive = createRateLimitMiddleware('sensitive')

// Advanced rate limiting with user-based limits
export function createUserRateLimitMiddleware(baseLimit: number = 200, windowMs: number = 15 * 60 * 1000) {
  return async function userRateLimitMiddleware(request: NextRequest) {
    const clientIP = getClientIP(request)
    const userId = getUserIdFromRequest(request)
    const endpoint = getEndpoint(request)
    
    if (!clientIP) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Unable to determine client IP' },
        { status: 400 }
      )
    }

    const key = userId ? `user:${userId}:${endpoint}` : `ip:${clientIP}:${endpoint}`
    const now = Date.now()
    
    // Get or create rate limit record
    let record = rateLimitStore.get(key)
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
        lastRequest: now
      }
      rateLimitStore.set(key, record)
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }

    // Increment request count
    record.count++
    record.lastRequest = now

    // Check if rate limit is exceeded
    if (record.count > baseLimit) {
      console.warn(`Rate limit exceeded for ${userId ? 'User' : 'IP'}: ${userId || clientIP}, Endpoint: ${endpoint}, Count: ${record.count}`)
      
      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
          limit: baseLimit,
          windowMs
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': baseLimit.toString(),
            'X-RateLimit-Remaining': Math.max(0, baseLimit - record.count).toString(),
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // Add rate limit headers to successful response
    const headers = {
      'X-RateLimit-Limit': baseLimit.toString(),
      'X-RateLimit-Remaining': Math.max(0, baseLimit - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    }

    return NextResponse.next({
      request: {
        headers
      }
    })
  }
}

// Rate limiting for specific endpoints
export function createEndpointRateLimit(endpoint: string, maxRequests: number, windowMs: number = 15 * 60 * 1000) {
  return async function endpointRateLimitMiddleware(request: NextRequest) {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    if (!clientIP) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Unable to determine client IP' },
        { status: 400 }
      )
    }

    const key = `${clientIP}:${endpoint}:${userAgent}`
    const now = Date.now()
    
    // Get or create rate limit record
    let record = rateLimitStore.get(key)
    
    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
        lastRequest: now
      }
      rateLimitStore.set(key, record)
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }

    // Increment request count
    record.count++
    record.lastRequest = now

    // Check if rate limit is exceeded
    if (record.count > maxRequests) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}, Endpoint: ${endpoint}, Count: ${record.count}`)
      
      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          message: `Too many requests to ${endpoint}, please try again later.`,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
          limit: maxRequests,
          windowMs
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // Add rate limit headers to successful response
    const headers = {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    }

    return NextResponse.next({
      request: {
        headers
      }
    })
  }
}

// Helper functions
function getClientIP(request: NextRequest): string | null {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (clientIP) {
    return clientIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to request socket address
  return request.ip || null
}

function getEndpoint(request: NextRequest): string {
  const url = new URL(request.url)
  return url.pathname
}

function getUserIdFromRequest(request: NextRequest): string | null {
  // Try to get user ID from various sources
  const userId = request.headers.get('x-user-id')
  const authorization = request.headers.get('authorization')
  
  if (userId) {
    return userId
  }
  
  if (authorization) {
    // Extract user ID from JWT token (simplified)
    try {
      const token = authorization.replace('Bearer ', '')
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.id || null
    } catch (error) {
      return null
    }
  }
  
  return null
}

// Clean up old rate limit records
export function cleanupRateLimitStore() {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.lastRequest < oneHourAgo) {
      rateLimitStore.delete(key)
    }
  }
}

// Get rate limit statistics
export function getRateLimitStats() {
  const stats = {
    totalRecords: rateLimitStore.size,
    recordsByEndpoint: {} as Record<string, number>,
    topViolators: [] as Array<{ ip: string; count: number; endpoint: string }>
  }
  
  for (const [key, record] of rateLimitStore.entries()) {
    const [ip, endpoint] = key.split(':')
    
    // Count by endpoint
    stats.recordsByEndpoint[endpoint] = (stats.recordsByEndpoint[endpoint] || 0) + 1
    
    // Track top violators
    if (record.count > 50) {
      stats.topViolators.push({
        ip,
        count: record.count,
        endpoint
      })
    }
  }
  
  // Sort top violators
  stats.topViolators.sort((a, b) => b.count - a.count)
  stats.topViolators = stats.topViolators.slice(0, 10)
  
  return stats
}

// Database model for rate limit violations
export const RateLimitViolation = {
  id: String,
  ip: String,
  userAgent: String,
  endpoint: String,
  count: Number,
  maxRequests: Number,
  windowMs: Number,
  resetTime: DateTime,
  createdAt: DateTime
}