import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serverJwtManager } from '@/lib/jwt'

// Role permissions
export const PERMISSIONS = {
  // User permissions
  USER: [
    'read:own:profile',
    'update:own:profile',
    'read:own:vehicles',
    'create:own:vehicles',
    'update:own:vehicles',
    'delete:own:vehicles',
    'read:own:bookings',
    'create:own:bookings',
    'update:own:bookings',
    'read:own:subscriptions',
    'create:own:subscriptions',
    'read:own:policies',
    'create:own:policies',
    'read:own:claims',
    'create:own:claims',
    'read:own:support_tickets',
    'create:own:support_tickets',
    'read:own:notifications',
    'update:own:notifications'
  ],
  
  // Partner permissions
  PARTNER: [
    'read:own:profile',
    'update:own:profile',
    'read:own:mechanics',
    'create:own:mechanics',
    'update:own:mechanics',
    'delete:own:mechanics',
    'read:own:bookings',
    'update:own:bookings',
    'read:own:earnings',
    'read:own:subscriptions',
    'create:own:subscriptions',
    'read:own:support_tickets',
    'create:own:support_tickets',
    'read:own:notifications',
    'update:own:notifications',
    'read:own:analytics',
    'read:own:files',
    'create:own:files',
    'update:own:files',
    'delete:own:files'
  ],
  
  // Admin permissions
  ADMIN: [
    // User management
    'read:users',
    'create:users',
    'update:users',
    'delete:users',
    'read:user:analytics',
    
    // Partner management
    'read:partners',
    'create:partners',
    'update:partners',
    'delete:partners',
    'verify:partners',
    'read:partner:analytics',
    
    // Booking management
    'read:bookings',
    'update:bookings',
    'delete:bookings',
    'read:booking:analytics',
    
    // Content management
    'read:content',
    'create:content',
    'update:content',
    'delete:content',
    'publish:content',
    'read:content:analytics',
    
    // Support management
    'read:support_tickets',
    'update:support_tickets',
    'delete:support_tickets',
    'read:support:analytics',
    
    // Analytics and reporting
    'read:analytics',
    'read:reports',
    'create:reports',
    'export:reports',
    
    // System management
    'read:system',
    'update:system',
    'read:logs',
    'read:backups',
    'create:backups',
    'restore:backups',
    
    // File management
    'read:files',
    'create:files',
    'update:files',
    'delete:files',
    'read:file:analytics',
    
    // Notification management
    'read:notifications',
    'create:notifications',
    'update:notifications',
    'delete:notifications',
    'send:notifications',
    'broadcast:notifications',
    
    // Campaign management
    'read:campaigns',
    'create:campaigns',
    'update:campaigns',
    'delete:campaigns',
    'read:campaign:analytics',
    
    // Insurance management
    'read:insurance',
    'create:insurance',
    'update:insurance',
    'delete:insurance',
    'read:insurance:analytics',
    
    // Subscription management
    'read:subscriptions',
    'create:subscriptions',
    'update:subscriptions',
    'delete:subscriptions',
    'read:subscription:analytics',
    
    // General admin permissions
    'read:own:profile',
    'update:own:profile',
    'read:own:notifications',
    'update:own:notifications'
  ],
  
  // Super Admin permissions (includes all admin permissions plus system-level operations)
  SUPER_ADMIN: [
    ...Object.values(PERMISSIONS.ADMIN).flat(),
    'read:system:config',
    'update:system:config',
    'read:system:security',
    'update:system:security',
    'read:system:backups',
    'create:system:backups',
    'restore:system:backups',
    'read:system:logs',
    'read:system:metrics',
    'manage:admins',
    'manage:super_admins',
    'system:maintenance',
    'system:shutdown',
    'system:restart'
  ]
} as const

// Role hierarchy
export const ROLE_HIERARCHY = {
  'user': 1,
  'partner': 2,
  'admin': 3,
  'super_admin': 4
} as const

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// User interface for authentication
interface AuthenticatedUser {
  id: string
  email: string
  role: string
  permissions: string[]
  businessName?: string
  name?: string
}

// Middleware to check if user is authenticated
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = serverJwtManager.verifyToken(token)
    
    if (!decoded || !decoded.id) {
      return null
    }

    // Get user from database
    let user = null
    
    if (decoded.type === 'user') {
      user = await db.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
    } else if (decoded.type === 'partner') {
      user = await db.partner.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          businessName: true,
          role: true
        }
      })
    } else if (decoded.type === 'admin') {
      user = await db.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
    }

    if (!user) {
      return null
    }

    // Get permissions based on role
    const permissions = getPermissionsByRole(user.role)
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions,
      name: user.name || user.businessName,
      businessName: user.businessName
    }
    
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Check if user has required permission
export function hasPermission(user: AuthenticatedUser, permission: string): boolean {
  return user.permissions.includes(permission)
}

// Check if user has any of the required permissions
export function hasAnyPermission(user: AuthenticatedUser, permissions: string[]): boolean {
  return permissions.some(permission => user.permissions.includes(permission))
}

// Check if user has all required permissions
export function hasAllPermissions(user: AuthenticatedUser, permissions: string[]): boolean {
  return permissions.every(permission => user.permissions.includes(permission))
}

// Check if user can access resource
export function canAccessResource(user: AuthenticatedUser, resource: string, action: string): boolean {
  const permission = `${action}:${resource}`
  return hasPermission(user, permission)
}

// Check if user can access own resource
export function canAccessOwnResource(user: AuthenticatedUser, resource: string, action: string, resourceId: string): boolean {
  const permission = `${action}:own:${resource}`
  return hasPermission(user, permission)
}

// Check if user has higher or equal role
export function hasRoleLevel(user: AuthenticatedUser, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0
  return userLevel >= requiredLevel
}

// RBAC middleware factory
export function createRBACMiddleware(requiredPermissions: string[] = [], requireRole?: string) {
  return async function middleware(request: NextRequest, requiredPermissions: string[] = [], requireRole?: string) {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check role requirement
    if (requireRole && !hasRoleLevel(user, requireRole)) {
      return NextResponse.json(
        { error: 'Forbidden', message: `Insufficient privileges. Required role: ${requireRole}` },
        { status: 403 }
      )
    }

    // Check permissions
    if (requiredPermissions.length > 0 && !hasAllPermissions(user, requiredPermissions)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Add user to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.role)
    requestHeaders.set('x-user-permissions', JSON.stringify(user.permissions))

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
}

// Specific RBAC middleware functions
export const requireAuth = createRBACMiddleware()
export const requireAdmin = createRBACMiddleware([], 'admin')
export const requireSuperAdmin = createRBACMiddleware([], 'super_admin')
export const requirePartner = createRBACMiddleware([], 'partner')

// Permission-based middleware functions
export const requirePermission = (permission: string) => 
  createRBACMiddleware([permission])

export const requirePermissions = (permissions: string[]) => 
  createRBACMiddleware(permissions)

export const requireAnyPermission = (permissions: string[]) => 
  createRBACMiddleware(permissions) // This will need to be modified to check any permission

// Resource-based middleware functions
export const requireResourceAccess = (resource: string, action: string) => 
  createRBACMiddleware([`${action}:${resource}`])

export const requireOwnResourceAccess = (resource: string, action: string) => 
  createRBACMiddleware([`${action}:own:${resource}`])

// Role-based middleware functions
export const requireMinimumRole = (role: string) => 
  createRBACMiddleware([], role)

// Helper function to get user from request
export function getUserFromRequest(request: NextRequest): AuthenticatedUser | null {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  const userRole = request.headers.get('x-user-role')
  const userPermissions = request.headers.get('x-user-permissions')
  
  if (!userId || !userEmail || !userRole || !userPermissions) {
    return null
  }

  return {
    id: userId,
    email: userEmail,
    role: userRole,
    permissions: JSON.parse(userPermissions)
  }
}

// Export additional helper functions
export const getPermissionsByRole = (role: string): string[] => {
  // Import permissions from RBAC
  const { PERMISSIONS } = require('./rbac')
  
  switch (role) {
    case 'user':
      return PERMISSIONS.USER
    case 'partner':
      return PERMISSIONS.PARTNER
    case 'admin':
      return PERMISSIONS.ADMIN
    case 'super_admin':
      return PERMISSIONS.SUPER_ADMIN
    default:
      return []
  }
}

export const validatePermission = (permission: string): boolean => {
  const { PERMISSIONS } = require('./rbac')
  return Object.values(PERMISSIONS).flat().includes(permission) || permission === 'all'
}

export const validateRole = (role: string): boolean => {
  const validRoles = ['user', 'partner', 'admin', 'super_admin']
  return validRoles.includes(role)
}

// Export types for use in other files
export type { AuthenticatedUser }