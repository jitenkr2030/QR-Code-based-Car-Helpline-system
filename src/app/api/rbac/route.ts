import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateUser, hasPermission, hasRoleLevel, getPermissionsByRole } from '@/lib/middleware/rbac'

// Get user permissions
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        businessName: user.businessName
      },
      permissions: user.permissions,
      roleHierarchy: {
        user: user.role,
        level: user.role
      }
    })
    
  } catch (error) {
    console.error('Error in RBAC API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Update user role
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin or super_admin can update roles
    if (!hasRoleLevel(user, 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient privileges' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId: targetUserId, newRole } = body

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'userId and newRole are required' },
        { status: 400 }
      )
    }

    // Check if the new role is valid
    const validRoles = ['user', 'partner', 'admin', 'super_admin']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid role' },
        { status: 400 }
      )
    }

    // Only super_admin can assign admin or super_admin roles
    if ((newRole === 'admin' || newRole === 'super_admin') && !hasRoleLevel(user, 'super_admin')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Only super_admin can assign admin or super_admin roles' },
        { status: 403 }
      )
    }

    // Update user role
    let updatedUser = null
    
    // Try to update user
    try {
      updatedUser = await db.user.update({
        where: { id: targetUserId },
        data: { role: newRole }
      })
    } catch (error) {
      // If not a user, try partner
      try {
        updatedUser = await db.partner.update({
          where: { id: targetUserId },
          data: { role: newRole }
        })
      } catch (partnerError) {
        // If not a partner, try admin
        try {
          updatedUser = await db.admin.update({
            where: { id: targetUserId },
            data: { role: newRole }
          })
        } catch (adminError) {
          console.error('Error updating user role:', adminError)
          return NextResponse.json(
            { error: 'Not Found', message: 'User not found' },
            { status: 404 }
          )
        }
      }
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Error in RBAC API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Get role permissions
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Role is required' },
        { status: 400 }
      )
    }

    const permissions = getPermissionsByRole(role)

    return NextResponse.json({
      success: true,
      role,
      permissions,
      count: permissions.length
    })
    
  } catch (error) {
    console.error('Error in RBAC API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Check user permission
export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId: targetUserId, permission } = body

    if (!targetUserId || !permission) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'userId and permission are required' },
        { status: 400 }
      )
    }

    // Get target user
    let targetUser = null
    
    try {
      targetUser = await db.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, role: true }
      })
    } catch (error) {
      // If not a user, try partner
      try {
        targetUser = await db.partner.findUnique({
          where: { id: targetUserId },
          select: { id: true, email: true, role: true }
        })
      } catch (partnerError) {
        // If not a partner, try admin
        try {
          targetUser = await db.admin.findUnique({
            where: { id: targetUserId },
            select: { id: true, email: true, role: true }
          })
        } catch (adminError) {
          console.error('Error finding user:', adminError)
          return NextResponse.json(
            { error: 'Not Found', message: 'User not found' },
            { status: 404 }
          )
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has the permission
    const targetPermissions = getPermissionsByRole(targetUser.role)
    const hasPermission = targetPermissions.includes(permission)

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role
      },
      permission,
      hasPermission,
      permissions: targetPermissions
    })
    
  } catch (error) {
    console.error('Error in RBAC API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// Get all roles and their permissions
export async function OPTIONS(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admin can view all roles
    if (!hasRoleLevel(user, 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient privileges' },
        { status: 403 }
      )
    }

    const roles = ['user', 'partner', 'admin', 'super_admin']
    const rolePermissions = {}

    for (const role of roles) {
      rolePermissions[role] = getPermissionsByRole(role)
    }

    return NextResponse.json({
      success: true,
      roles,
      rolePermissions,
      hierarchy: {
        user: 1,
        partner: 2,
        admin: 3,
        super_admin: 4
      }
    })
    
  } catch (error) {
    console.error('Error in RBAC API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}