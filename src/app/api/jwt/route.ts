import { NextRequest, NextResponse } from 'next/server'
import { jwtManager, generateAccessToken, generateRefreshToken, generateTokenPair, verifyAccessToken, verifyRefreshToken, blacklistToken, isTokenExpired } from '@/lib/jwt'
import { db } from '@/lib/db'

// Generate tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload, type } = body

    switch (action) {
      case 'access':
        if (!payload) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Payload is required' },
            { status: 400 }
          )
        }
        
        const accessToken = generateAccessToken(payload)
        return NextResponse.json({
          success: true,
          accessToken,
          expiresIn: jwtManager.parseTime(process.env.JWT_EXPIRES_IN || '7d'),
          type: 'access'
        })
        
      case 'refresh':
        if (!payload) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Payload is required' },
            { status: 400 }
          )
        }
        
        const refreshToken = generateRefreshToken(payload)
        return NextResponse.json({
          success: true,
          refreshToken,
          expiresIn: jwtManager.parseTime(process.env.JWT_REFRESH_EXPIRES_IN || '30d'),
          type: 'refresh'
        })
        
      case 'pair':
        if (!payload) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Payload is required' },
            { status: 400 }
          )
        }
        
        const tokenPair = generateTokenPair(payload)
        return NextResponse.json({
          success: true,
          ...tokenPair
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in JWT API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Verify tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action, token } = Object.fromEntries(searchParams)

    switch (action) {
      case 'verify-access':
        if (!token) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Token is required' },
            { status: 400 }
          )
        }
        
        const decoded = verifyAccessToken(token)
        return NextResponse.json({
          success: true,
          decoded,
          message: 'Access token is valid',
          expiresIn: jwtManager.getTokenTTL(token)
        })
        
      case 'verify-refresh':
        if (!token) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Token is required' },
            { status: 400 }
          )
        }
        
        const refreshDecoded = verifyRefreshToken(token)
        return NextResponse.json({
          success: true,
          decoded: refreshDecoded,
          message: 'Refresh token is valid',
          expiresIn: jwtManager.getTokenTTL(token)
        })
        
      case 'check-expired':
        if (!token) {
          return NextResponse.json(
            { error: 'Bad Request', message: 'Token is required' },
            { status: 400 }
          )
        }
        
        const isExpired = isTokenExpired(token)
        const expiration = jwtManager.getTokenExpiration(token)
        const ttl = jwtManager.getTokenTTL(token)
        
        return NextResponse.json({
          success: true,
          isExpired,
          expiration: expiration?.toISOString(),
          ttl,
          message: isExpired ? 'Token is expired' : 'Token is valid'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in JWT API:', error)
    
    if (error instanceof Error) {
      const message = error.message
      
      if (message.includes('expired')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Token expired' },
          { status: 401 }
        )
      } else if (message.includes('blacklisted')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Token is blacklisted' },
          { status: 401 }
        )
      } else if (message.includes('invalid')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid token' },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Refresh tokens
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const tokenPair = await jwtManager.refreshAccessToken(refreshToken)
    
    return NextResponse.json({
      success: true,
      ...tokenPair,
      message: 'Tokens refreshed successfully'
    })
    
  } catch (error) {
    console.error('Error in JWT API:', error)
    
    if (error instanceof Error) {
      const message = error.message
      
      if (message.includes('expired')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Refresh token expired' },
          { status: 401 }
        )
      } else if (message.includes('blacklisted')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Refresh token is blacklisted' },
          { status: 401 }
        )
      } else if (message.includes('not found')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'User not found' },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Blacklist tokens
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, reason = 'Manual blacklist' } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Token is required' },
        { status: 400 }
      )
    }

    await blacklistToken(token)
    
    return NextResponse.json({
      success: true,
      message: 'Token blacklisted successfully',
      reason
    })
    
  } catch (error) {
    console.error('Error in JWT API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get token statistics and cleanup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { action } = Object.fromEntries(searchParams)

    switch (action) {
      case 'cleanup':
        jwtManager.cleanupBlacklistedTokens()
        
        // Clean up expired tokens from database
        const result = await db.blacklistedToken.deleteMany({
          where: {
            OR: [
              { exp: { lt: new Date() } },
              { blacklistedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
            ]
          }
        })
        
        return NextResponse.json({
          success: true,
          message: 'Token cleanup completed',
          deletedCount: result.count
        })
        
      case 'stats':
        const stats = {
          blacklistedTokens: jwtManager.isTokenBlacklisted.length,
          totalTokens: 0,
          expiredTokens: 0,
          validTokens: 0,
          tokenTypes: {
            access: 0,
            refresh: 0
          }
        }
        
        // Get statistics from database
        try {
          const blacklistedTokens = await db.blacklistedToken.findMany()
          stats.totalTokens = blacklistedTokens.length
          
          const now = new Date()
          stats.expiredTokens = blacklistedTokens.filter(token => 
            token.exp && token.exp < now
          ).length
          
          stats.validTokens = blacklistedTokens.filter(token => 
            !token.exp || token.exp >= now
          ).length
          
          // Count by token type (if stored in jti)
          blacklistedTokens.forEach(token => {
            if (token.jti?.includes('access')) {
              stats.tokenTypes.access++
            } else if (token.jti?.includes('refresh')) {
              stats.tokenTypes.refresh++
            }
          })
        } catch (error) {
          console.error('Error getting token statistics:', error)
        }
        
        return NextResponse.json({
          success: true,
          stats,
          message: 'Token statistics retrieved successfully'
        })
        
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in JWT API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}