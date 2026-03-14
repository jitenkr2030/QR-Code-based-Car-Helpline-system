import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getRateLimitStats, cleanupRateLimitStore } from '@/lib/middleware/rateLimit'

// Get rate limit statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') // 'stats', 'cleanup'
    
    switch (action) {
      case 'stats':
        const stats = getRateLimitStats()
        
        // Get rate limit violations from database
        const violations = await db.rateLimitViolation.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        })
        
        return NextResponse.json({
          success: true,
          stats,
          recentViolations: violations.map(v => ({
            id: v.id,
            ip: v.ip,
            endpoint: v.endpoint,
            count: v.count,
            maxRequests: v.maxRequests,
            createdAt: v.createdAt.toISOString()
          }))
        })
        
      case 'cleanup':
        cleanupRateLimitStore()
        
        // Clean up old violations from database (older than 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        await db.rateLimitViolation.deleteMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Rate limit store cleaned up'
        })
        
      default:
        // Get current rate limit status
        const rateLimitStats = getRateLimitStats()
        
        return NextResponse.json({
          success: true,
          stats: rateLimitStats,
          message: 'Rate limiting is active'
        })
    }
    
  } catch (error) {
    console.error('Error in rate limit API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Reset rate limit for a specific IP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ip, endpoint } = body

    if (!ip) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'IP address is required' },
        { status: 400 }
      )
    }

    // Clean up rate limit store for specific IP
    const { rateLimitStore } = await import('@/lib/middleware/rateLimit')
    const keysToDelete = []
    
    for (const [key] of rateLimitStore.entries()) {
      if (key.startsWith(`${ip}:`)) {
        if (!endpoint || key.includes(`:${endpoint}:`)) {
          keysToDelete.push(key)
        }
      }
    }
    
    keysToDelete.forEach(key => rateLimitStore.delete(key))
    
    return NextResponse.json({
      success: true,
      message: `Rate limit reset for IP: ${ip}${endpoint ? `, Endpoint: ${endpoint}` : ''}`,
      keysDeleted: keysToDelete.length
    })
    
  } catch (error) {
    console.error('Error in rate limit API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Get rate limit violations
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const ip = searchParams.get('ip')
    const endpoint = searchParams.get('endpoint')

    let whereClause: any = {}
    
    if (ip) {
      whereClause.ip = ip
    }
    
    if (endpoint) {
      whereClause.endpoint = endpoint
    }

    const violations = await db.rateLimitViolation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await db.rateLimitViolation.count({
      where: whereClause
    })

    return NextResponse.json({
      success: true,
      violations: violations.map(v => ({
        id: v.id,
        ip: v.ip,
        userAgent: v.userAgent,
        endpoint: v.endpoint,
        count: v.count,
        maxRequests: v.maxRequests,
        windowMs: v.windowMs,
        resetTime: v.resetTime.toISOString(),
        createdAt: v.createdAt.toISOString()
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
    
  } catch (error) {
    console.error('Error in rate limit API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Delete old rate limit violations
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const result = await db.rateLimitViolation.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} rate limit violations older than ${days} days`,
      deletedCount: result.count
    })
    
  } catch (error) {
    console.error('Error in rate limit API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}