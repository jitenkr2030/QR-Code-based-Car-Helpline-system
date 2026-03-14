import { NextRequest, NextResponse } from 'next/server'
import { validateInput, validateRequest, ValidationError } from '@/lib/validation'
import { rateLimitDefault } from '@/lib/middleware/rateLimit'

// Input validation middleware factory
export function createValidationMiddleware<T>(schema: any, options: {
  sanitize?: boolean
  rateLimit?: boolean
} = {}) {
  const { sanitize = true, rateLimit = true } = options
  
  return async function validationMiddleware(request: NextRequest) {
    // Apply rate limiting if enabled
    if (rateLimit) {
      const rateLimitResult = await rateLimitDefault(request)
      if (rateLimitResult.status !== 200) {
        return rateLimitResult
      }
    }

    try {
      // Validate request
      const validationResult = validateRequest(schema, request)
      
      if (!validationResult.success) {
        return validationResult.response || NextResponse.json(
          { 
            error: 'Validation Error', 
            message: validationResult.error,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Sanitize data if enabled
      let data = validationResult.data
      if (sanitize) {
        data = sanitizeData(data, schema)
      }

      // Add validated data to request headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-validated-data', JSON.stringify(data))
      requestHeaders.set('x-validation-success', 'true')

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
      
    } catch (error) {
      console.error('Validation error:', error)
      
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: error instanceof Error ? error.message : 'Unknown validation error',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }
}

// Body validation middleware
export function validateBody<T>(schema: any, options: { sanitize?: boolean } = {}) {
  const { sanitize = true } = options
  
  return async function validateBodyMiddleware(request: NextRequest) {
    try {
      // Get request body
      const body = await request.json()
      
      // Validate body
      const validationResult = validateInput(schema, body)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: validationResult.error,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Sanitize data if enabled
      let data = validationResult.data
      if (sanitize) {
        data = sanitizeData(data, schema)
      }

      // Add validated data to request headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-validated-data', JSON.stringify(data))
      requestHeaders.set('x-validation-success', 'true')

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
      
    } catch (error) {
      console.error('Body validation error:', error)
      
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: error instanceof Error ? error.message : 'Invalid request body',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }
}

// Query parameter validation middleware
export function validateQuery<T>(schema: any, options: { sanitize?: boolean } = {}) {
  const { sanitize = true } = options
  
  return async function validateQueryMiddleware(request: NextRequest) {
    try {
      // Get query parameters
      const url = new URL(request.url)
      const query = Object.fromEntries(url.searchParams)
      
      // Validate query
      const validationResult = validateInput(schema, query)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: validationResult.error,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Sanitize data if enabled
      let data = validationResult.data
      if (sanitize) {
        data = sanitizeData(data, schema)
      }

      // Add validated data to request headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-validated-data', JSON.stringify(data))
      requestHeaders.set('x-validation-success', 'true')

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
      
    } catch (error) {
      console.error('Query validation error:', error)
      
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: error instanceof Error ? error.message : 'Invalid query parameters',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }
}

// Path parameter validation middleware
export function validatePath<T>(schema: any, paramName: string, options: { sanitize?: boolean } = {}) {
  const { sanitize = true } = options
  
  return async function validatePathMiddleware(request: NextRequest) {
    try {
      // Get path parameter
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/')
      const paramIndex = pathSegments.indexOf(paramName)
      
      if (paramIndex === -1 || paramIndex + 1 >= pathSegments.length) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: `Path parameter '${paramName}' is required`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }
      
      const paramValue = pathSegments[paramIndex + 1]
      
      // Validate parameter
      const validationResult = validateInput(schema, paramValue)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: validationResult.error,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Sanitize data if enabled
      let data = validationResult.data
      if (sanitize) {
        data = sanitizeData(data, schema)
      }

      // Add validated data to request headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set(`x-${paramName}`, JSON.stringify(data))
      requestHeaders.set('x-validation-success', 'true')

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
      
    } catch (error) {
      console.error('Path validation error:', error)
      
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: error instanceof Error ? error.message : `Invalid path parameter '${paramName}'`,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }
}

// File validation middleware
export function validateFile(options: {
  maxSize?: number
  allowedTypes?: string[]
  allowedMimeTypes?: string[]
} = {}) {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedMimeTypes = [] } = options
  
  return async function validateFileMiddleware(request: NextRequest) {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: 'File is required',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (allowedTypes.length > 0 && (!fileExtension || !allowedTypes.includes(fileExtension))) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Validate MIME type
      if (allowedMimeTypes.length > 0 && (!file.type || !allowedMimeTypes.includes(file.type))) {
        return NextResponse.json(
          { 
            error: 'Validation Error', 
            message: `MIME type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        )
      }

      // Add validated file info to request headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-validated-file', JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }))
      requestHeaders.set('x-validation-success', 'true')

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
      
    } catch (error) {
      console.error('File validation error:', error)
      
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: error instanceof Error ? error.message : 'Invalid file',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }
}

// Helper function to sanitize data based on schema
function sanitizeData(data: any, schema: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value
      continue
    }

    // Get field definition from schema
    const fieldDef = getFieldDefinition(schema, key)
    
    if (!fieldDef) {
      sanitized[key] = value
      continue
    }

    // Sanitize based on field type
    if (fieldDef._def.typeName === 'ZodString') {
      sanitized[key] = sanitize.string(String(value))
    } else if (fieldDef._def.typeName === 'ZodNumber') {
      sanitized[key] = sanitize.number(value)
    } else if (fieldDef._def.typeName === 'ZodBoolean') {
      sanitized[key] = sanitize.boolean(value)
    } else if (fieldDef._def.typeName === 'ZodArray') {
      sanitized[key] = sanitize.array(value)
    } else if (fieldDef._def.typeName === 'ZodObject') {
      sanitized[key] = sanitize.object(value)
    } else if (fieldDef._def.typeName === 'ZodEnum') {
      sanitized[key] = String(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// Helper function to get field definition from schema
function getFieldDefinition(schema: any, fieldName: string): any {
  if (schema._def.typeName === 'ZodObject') {
    return schema._def.shape()[fieldName]
  } else if (schema._def.typeName === 'ZodEffects') {
    return getFieldDefinition(schema._def.schema, fieldName)
  } else if (schema._def.typeName === 'ZodOptional') {
    return getFieldDefinition(schema._def.innerType, fieldName)
  } else if (schema._def.typeName === 'ZodDefault') {
    return getFieldDefinition(schema._def.innerType, fieldName)
  }
  
  return null
}

// Export validation error handler
export function handleValidationError(error: any): NextResponse {
  console.error('Validation error:', error)
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { 
        error: 'Validation Error', 
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    )
  }
  
  return NextResponse.json(
    { 
      error: 'Validation Error', 
      message: error instanceof Error ? error.message : 'Unknown validation error',
      timestamp: new Date().toISOString()
    },
    { status: 400 }
  )
}

// Export validation middleware functions
export const validateUserRegister = createValidationMiddleware(userSchemas.register)
export const validateUserLogin = createValidationMiddleware(userSchemas.login)
export const validateUserUpdate = createValidationMiddleware(userSchemas.updateProfile)
export const validatePartnerRegister = createValidationMiddleware(partnerSchemas.register)
export const validatePartnerLogin = createValidationMiddleware(partnerSchemas.login)
export const validateVehicleCreate = createValidationMiddleware(vehicleSchemas.create)
export const validateServiceBookingCreate = createValidationMiddleware(serviceBookingSchemas.create)
export const validatePaymentCreate = createValidationMiddleware(paymentSchemas.create)
export const validateFileUpload = validateFile({
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
})
export const validateContentCreate = createValidationMiddleware(contentSchemas.create)
export const validateSupportTicketCreate = createValidationMiddleware(supportSchemas.create)