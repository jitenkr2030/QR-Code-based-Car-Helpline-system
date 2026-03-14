// RBAC Permissions Configuration
export const PERMISSIONS = {
  // User permissions
  USER: [
    'view_profile',
    'edit_profile',
    'view_vehicles',
    'add_vehicle',
    'edit_vehicle',
    'delete_vehicle',
    'view_service_bookings',
    'create_service_booking',
    'cancel_service_booking',
    'view_insurance_policies',
    'add_insurance_policy',
    'edit_insurance_policy',
    'view_claims',
    'create_claim',
    'edit_claim',
    'view_support_tickets',
    'create_support_ticket',
    'view_subscriptions',
    'create_subscription',
    'edit_subscription'
  ],
  
  // Partner permissions
  PARTNER: [
    'view_profile',
    'edit_profile',
    'view_business_info',
    'edit_business_info',
    'view_services',
    'add_service',
    'edit_service',
    'delete_service',
    'view_service_requests',
    'accept_service_request',
    'reject_service_request',
    'view_service_history',
    'view_analytics',
    'view_reviews',
    'respond_to_reviews',
    'view_earnings',
    'view_payouts',
    'request_payout',
    'view_subscription',
    'edit_subscription',
    'view_staff',
    'add_staff',
    'edit_staff',
    'delete_staff',
    'manage_schedule',
    'view_notifications',
    'send_notification'
  ],
  
  // Admin permissions
  ADMIN: [
    'view_dashboard',
    'view_analytics',
    'view_reports',
    'generate_reports',
    'view_users',
    'manage_users',
    'view_partners',
    'manage_partners',
    'view_service_requests',
    'manage_service_requests',
    'view_insurance_policies',
    'manage_insurance_policies',
    'view_claims',
    'manage_claims',
    'view_support_tickets',
    'manage_support_tickets',
    'view_subscriptions',
    'manage_subscriptions',
    'view_payments',
    'manage_payments',
    'view_notifications',
    'send_notifications',
    'view_system_settings',
    'manage_system_settings',
    'view_audit_logs',
    'manage_security_settings',
    'view_integrations',
    'manage_integrations'
  ],
  
  // Super Admin permissions
  SUPER_ADMIN: [
    'all' // Full access to everything
  ]
}

// Role hierarchy
export const ROLE_HIERARCHY = {
  'user': 1,
  'partner': 2,
  'admin': 3,
  'super_admin': 4
}

// Permission categories
export const PERMISSION_CATEGORIES = {
  PROFILE: ['view_profile', 'edit_profile'],
  VEHICLES: ['view_vehicles', 'add_vehicle', 'edit_vehicle', 'delete_vehicle'],
  SERVICES: ['view_service_bookings', 'create_service_booking', 'cancel_service_booking'],
  INSURANCE: ['view_insurance_policies', 'add_insurance_policy', 'edit_insurance_policy'],
  CLAIMS: ['view_claims', 'create_claim', 'edit_claim'],
  SUPPORT: ['view_support_tickets', 'create_support_ticket'],
  SUBSCRIPTIONS: ['view_subscriptions', 'create_subscription', 'edit_subscription'],
  ANALYTICS: ['view_analytics', 'view_reports', 'generate_reports'],
  USERS: ['view_users', 'manage_users'],
  PARTNERS: ['view_partners', 'manage_partners'],
  ADMIN: ['view_dashboard', 'view_system_settings', 'manage_system_settings'],
  SECURITY: ['view_audit_logs', 'manage_security_settings']
}

// Helper functions
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('all')
}

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission) || userPermissions.includes('all')
  )
}

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission) || userPermissions.includes('all')
  )
}

export const canAccessResource = (userRole: string, resource: string): boolean => {
  const rolePermissions = PERMISSIONS[userRole.toUpperCase()]
  return rolePermissions.includes(resource) || rolePermissions.includes('all')
}

export const getRoleLevel = (role: string): number => {
  return ROLE_HIERARCHY[role.toLowerCase()] || 0
}

export const canPromote = (currentRole: string, targetRole: string): boolean => {
  return getRoleLevel(currentRole) > getRoleLevel(targetRole)
}

export const canDemote = (currentRole: string, targetRole: string): boolean => {
  return getRoleLevel(currentRole) > getRoleLevel(targetRole)
}

export const validatePermission = (permission: string): boolean => {
  return Object.values(PERMISSIONS).flat().includes(permission) || permission === 'all'
}

export const validateRole = (role: string): boolean => {
  return Object.keys(PERMISSIONS).includes(role.toLowerCase())
}