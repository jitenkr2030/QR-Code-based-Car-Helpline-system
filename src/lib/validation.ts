import { z } from 'zod'

// Common validation schemas
export const commonSchemas = {
  // ID validation
  id: z.string().min(1, 'ID is required').max(100, 'ID is too long'),
  cuid: z.string().cuid('Invalid ID format'),
  
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Phone validation (Indian format)
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number. Must be 10 digits starting with 6-9'),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Name validation
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name is too long'),
  
  // Address validation
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address is too long'),
  city: z.string().min(2, 'City must be at least 2 characters').max(50, 'City is too long'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50, 'State is too long'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode. Must be 6 digits'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  website: z.string().url('Invalid website URL').optional(),
  
  // Number validation
  positiveNumber: z.number().positive('Number must be positive'),
  nonNegativeNumber: z.number().min(0, 'Number must be non-negative'),
  
  // Date validation
  date: z.string().datetime('Invalid date format'),
  futureDate: z.string().datetime('Invalid date format').ref((date) => new Date(date) > new Date(), 'Date must be in the future'),
  
  // File validation
  file: z.object({
    name: z.string().min(1, 'File name is required'),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB
    type: z.string().min(1, 'File type is required'),
    lastModified: z.number().optional()
  }),
  
  // Pagination validation
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
  offset: z.number().min(0, 'Offset must be non-negative').default(0),
  
  // Search validation
  search: z.string().min(1, 'Search term is required').max(100, 'Search term is too long').optional(),
  
  // Status validation
  status: z.enum(['active', 'inactive', 'pending', 'completed', 'cancelled', 'draft', 'published']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  urgency: z.enum(['low', 'medium', 'high', 'urgent', 'emergency']),
  
  // Currency validation
  currency: z.string().min(3, 'Currency must be at least 3 characters').max(3, 'Currency must be 3 characters'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  
  // Vehicle validation
  make: z.string().min(1, 'Vehicle make is required').max(50, 'Vehicle make is too long'),
  model: z.string().min(1, 'Vehicle model is required').max(50, 'Vehicle model is too long'),
  year: z.number().min(1900, 'Vehicle year must be at least 1900').max(new Date().getFullYear() + 1, 'Invalid vehicle year'),
  color: z.string().min(1, 'Vehicle color is required').max(30, 'Vehicle color is too long'),
  mileage: z.number().min(0, 'Mileage must be non-negative'),
  vin: z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format'),
  licensePlate: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, 'Invalid license plate format'),
  
  // Location validation
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  
  // Service type validation
  serviceType: z.enum(['towing', 'mechanic', 'fuel', 'accident', 'lockout', 'battery', 'tire', 'inspection']),
  
  // Description validation
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  
  // Role validation
  role: z.enum(['user', 'partner', 'admin', 'super_admin']),
  
  // Permission validation
  permission: z.string().regex(/^[a-z:_]+$/, 'Invalid permission format'),
  
  // File type validation
  fileType: z.enum(['image', 'video', 'audio', 'document', 'general']),
  
  // MIME type validation
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/, 'Invalid MIME type format'),
  
  // Rating validation
  rating: z.number().min(0, 'Rating must be at least 0').max(5, 'Rating must be at most 5'),
  
  // Percentage validation
  percentage: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage must be at most 100'),
  
  // Boolean validation
  boolean: z.boolean(),
  
  // Array validation
  array: z.array(z.string()),
  
  // Object validation
  object: z.record(z.any()),
  
  // JSON validation
  json: z.string().ref((str) => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }, 'Invalid JSON format'),
  
  // Tags validation
  tags: z.array(z.string().min(1).max(50)).max(10, 'Too many tags'),
  
  // Coordinates validation
  coordinates: z.object({
    latitude: commonSchemas.latitude,
    longitude: commonSchemas.longitude
  }),
  
  // Address validation
  fullAddress: z.object({
    street: commonSchemas.address,
    city: commonSchemas.city,
    state: commonSchemas.state,
    pincode: commonSchemas.pincode,
    country: z.string().min(2, 'Country is required').max(50, 'Country is too long')
  })
}

// User validation schemas
export const userSchemas = {
  // User registration
  register: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password,
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  // User login
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),
  
  // User profile update
  updateProfile: z.object({
    name: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    profileImage: commonSchemas.url.optional()
  }),
  
  // Password change
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  // User search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    role: commonSchemas.role.optional()
  })
}

// Partner validation schemas
export const partnerSchemas = {
  // Partner registration
  register: z.object({
    businessName: commonSchemas.businessName,
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    address: commonSchemas.fullAddress,
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9]{1}$/, 'Invalid GST number format').optional(),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format').optional(),
    website: commonSchemas.website,
    description: z.string().max(500, 'Description is too long').optional(),
    services: commonSchemas.array,
    serviceArea: z.string().min(5, 'Service area is required').max(200, 'Service area is too long'),
    pricing: z.string().min(5, 'Pricing information is required').max(500, 'Pricing information is too long'),
    hours: z.string().min(5, 'Business hours are required').max(100, 'Business hours are too long'),
    coordinates: commonSchemas.coordinates
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  
  // Partner login
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),
  
  // Partner profile update
  updateProfile: z.object({
    businessName: commonSchemas.businessName.optional(),
    phone: commonSchemas.phone.optional(),
    address: commonSchemas.fullAddress.optional(),
    website: commonSchemas.website.optional(),
    description: z.string().max(500, 'Description is too long').optional(),
    services: commonSchemas.array.optional(),
    serviceArea: z.string().min(5, 'Service area is required').max(200, 'Service area is too long').optional(),
    pricing: z.string().min(5, 'Pricing information is required').max(500, 'Pricing information is too long').optional(),
    hours: z.string().min(5, 'Business hours are required').max(100, 'Business hours are too long').optional(),
    coordinates: commonSchemas.coordinates.optional()
  }),
  
  // Partner search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    serviceType: commonSchemas.serviceType.optional(),
    location: commonSchemas.coordinates.optional()
  })
}

// Vehicle validation schemas
export const vehicleSchemas = {
  // Vehicle creation
  create: z.object({
    qrCode: z.string().min(1, 'QR code is required').max(100, 'QR code is too long'),
    vin: commonSchemas.vin,
    make: commonSchemas.make,
    model: commonSchemas.model,
    year: commonSchemas.year,
    licensePlate: commonSchemas.licensePlate,
    color: commonSchemas.color,
    mileage: commonSchemas.mileage,
    insuranceCompany: z.string().max(100, 'Insurance company is too long').optional(),
    insurancePolicy: z.string().max(100, 'Insurance policy is too long').optional(),
    insuranceExpiry: commonSchemas.date.optional()
  }),
  
  // Vehicle update
  update: z.object({
    vin: commonSchemas.vin.optional(),
    make: commonSchemas.make.optional(),
    model: commonSchemas.model.optional(),
    year: commonSchemas.year.optional(),
    licensePlate: commonSchemas.licensePlate.optional(),
    color: commonSchemas.color.optional(),
    mileage: commonSchemas.mileage.optional(),
    insuranceCompany: z.string().max(100, 'Insurance company is too long').optional(),
    insurancePolicy: z.string().max(100, 'Insurance policy is too long').optional(),
    insuranceExpiry: commonSchemas.date.optional()
  }),
  
  // Vehicle search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    make: commonSchemas.make.optional(),
    model: commonSchemas.model.optional(),
    year: commonSchemas.year.optional()
  })
}

// Service booking validation schemas
export const serviceBookingSchemas = {
  // Service booking creation
  create: z.object({
    serviceType: commonSchemas.serviceType,
    description: commonSchemas.description.optional(),
    urgency: commonSchemas.urgency,
    pickupAddress: commonSchemas.address,
    coordinates: commonSchemas.coordinates,
    vehicleId: commonSchemas.id,
    preferredDate: commonSchemas.date.optional(),
    preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    notes: commonSchemas.notes.optional()
  }),
  
  // Service booking update
  update: z.object({
    status: commonSchemas.status.optional(),
    description: commonSchemas.description.optional(),
    urgency: commonSchemas.urgency.optional(),
    preferredDate: commonSchemas.date.optional(),
    preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    notes: commonSchemas.notes.optional()
  }),
  
  // Service booking search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    status: commonSchemas.status.optional(),
    serviceType: commonSchemas.serviceType.optional(),
    urgency: commonSchemas.urgency.optional(),
    userId: commonSchemas.id.optional(),
    partnerId: commonSchemas.id.optional()
  })
}

// Payment validation schemas
export const paymentSchemas = {
  // Payment creation
  create: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: commonSchemas.amount,
    currency: commonSchemas.currency,
    paymentMethod: z.enum(['razorpay', 'stripe', 'paypal', 'cash', 'upi']),
    customerName: commonSchemas.name,
    customerEmail: commonSchemas.email,
    customerPhone: commonSchemas.phone,
    description: commonSchemas.description.optional()
  }),
  
  // Payment verification
  verify: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
    razorpaySignature: z.string().min(1, 'Razorpay signature is required')
  }),
  
  // Payment search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    paymentMethod: z.enum(['razorpay', 'stripe', 'paypal', 'cash', 'upi']).optional(),
    customerId: commonSchemas.id.optional()
  })
}

// File upload validation schemas
export const fileSchemas = {
  // File upload
  upload: z.object({
    file: commonSchemas.file,
    type: commonSchemas.fileType,
    description: z.string().max(500, 'Description is too long').optional(),
    alt: z.string().max(200, 'Alt text is too long').optional(),
    caption: z.string().max(500, 'Caption is too long').optional()
  }),
  
  // File search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    type: commonSchemas.fileType.optional(),
    mimeType: commonSchemas.mimeType.optional()
  })
}

// Content validation schemas
export const contentSchemas = {
  // Content post creation
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    slug: z.string().min(1, 'Slug is required').max(200, 'Slug is too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
    excerpt: z.string().max(500, 'Excerpt is too long').optional(),
    featuredImage: commonSchemas.url.optional(),
    status: z.enum(['draft', 'published', 'archived']),
    type: z.enum(['blog', 'news', 'announcement', 'tutorial']),
    categoryId: commonSchemas.id.optional(),
    tags: commonSchemas.tags,
    seoTitle: z.string().max(200, 'SEO title is too long').optional(),
    seoDescription: z.string().max(500, 'SEO description is too long').optional(),
    seoKeywords: z.string().max(500, 'SEO keywords are too long').optional(),
    publishedAt: commonSchemas.date.optional()
  }),
  
  // Content post update
  update: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
    slug: z.string().min(1, 'Slug is required').max(200, 'Slug is too long').optional(),
    content: z.string().min(1, 'Content is required').max(10000, 'Content is too long').optional(),
    excerpt: z.string().max(500, 'Excerpt is too long').optional(),
    featuredImage: commonSchemas.url.optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    type: z.enum(['blog', 'news', 'announcement', 'tutorial']).optional(),
    categoryId: commonSchemas.id.optional(),
    tags: commonSchemas.tags.optional(),
    seoTitle: z.string().max(200, 'SEO title is too long').optional(),
    seoDescription: z.string().max(500, 'SEO description is too long').optional(),
    seoKeywords: z.string().max(500, 'SEO keywords are too long').optional(),
    publishedAt: commonSchemas.date.optional()
  }),
  
  // Content search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    status: z.enum(['draft', 'published', 'archived']).optional(),
    type: z.enum(['blog', 'news', 'announcement', 'tutorial']).optional(),
    categoryId: commonSchemas.id.optional(),
    authorId: commonSchemas.id.optional()
  })
}

// Support ticket validation schemas
export const supportSchemas = {
  // Support ticket creation
  create: z.object({
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
    priority: commonSchemas.priority,
    type: z.enum(['technical', 'billing', 'general', 'complaint', 'feature_request']),
    categoryId: commonSchemas.id.optional(),
    tags: commonSchemas.tags.optional()
  }),
  
  // Support ticket update
  update: z.object({
    subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long').optional(),
    description: z.string().min(1, 'Description is required').max(2000, 'Description is too long').optional(),
    priority: commonSchemas.priority.optional(),
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    tags: commonSchemas.tags.optional()
  }),
  
  // Support response creation
  createResponse: z.object({
    content: z.string().min(1, 'Response is required').max(2000, 'Response is too long'),
    isInternal: commonSchemas.boolean
  }),
  
  // Support ticket search
  search: z.object({
    query: commonSchemas.search,
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    priority: commonSchemas.priority.optional(),
    type: z.enum(['technical', 'billing', 'general', 'complaint', 'feature_request']).optional(),
    categoryId: commonSchemas.id.optional(),
    userId: commonSchemas.id.optional(),
    partnerId: commonSchemas.id.optional(),
    assignedTo: commonSchemas.id.optional()
  })
}

// Export validation function
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, error: errorMessages.join(', ') }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Export async validation function
export async function validateInputAsync<T>(schema: z.ZodType<T>, data: unknown): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const result = await schema.parseAsync(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, error: errorMessages.join(', ') }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Export middleware validation function
export function validateRequest<T>(schema: z.ZodType<T>, request: Request): { success: true; data: T } | { success: false; error: string; response?: Response } {
  try {
    // Get request body or URL parameters
    let data: unknown
    
    if (request.method === 'GET') {
      const url = new URL(request.url)
      data = Object.fromEntries(url.searchParams)
    } else {
      data = request.json()
    }
    
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { 
        success: false, 
        error: errorMessages.join(', '),
        response: new Response(
          JSON.stringify({ error: 'Validation failed', details: errorMessages }),
          { status: 400 }
        )
      }
    }
    return { 
      success: false, 
      error: 'Validation failed',
      response: new Response(
        JSON.stringify({ error: 'Validation failed' }),
        { status: 400 }
      )
    }
  }
}

// Export sanitization functions
export const sanitize = {
  // Sanitize string
  string: (input: string): string => {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  },
  
  // Sanitize HTML
  html: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
  },
  
  // Sanitize email
  email: (input: string): string => {
    return input.toLowerCase().trim()
  },
  
  // Sanitize phone
  phone: (input: string): string => {
    return input.replace(/\D/g, '')
  },
  
  // Sanitize URL
  url: (input: string): string => {
    try {
      const url = new URL(input)
      return url.toString()
    } catch {
      return ''
    }
  },
  
  // Sanitize number
  number: (input: any): number => {
    const num = parseFloat(input)
    return isNaN(num) ? 0 : num
  },
  
  // Sanitize boolean
  boolean: (input: any): boolean => {
    return Boolean(input)
  },
  
  // Sanitize array
  array: (input: any): string[] => {
    if (Array.isArray(input)) {
      return input.filter(item => item !== null && item !== undefined).map(item => String(item))
    }
    return []
  },
  
  // Sanitize object
  object: (input: any): Record<string, any> => {
    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, any> = {}
      for (const [key, value] of Object.entries(input)) {
        if (value !== null && value !== undefined) {
          sanitized[key] = value
        }
      }
      return sanitized
    }
    return {}
  }
}

// Export validation error class
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}